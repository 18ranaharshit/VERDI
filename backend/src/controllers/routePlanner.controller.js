const { geocodeAddress, autocompleteAddress } = require('../utils/geocoding');
const { planAllRoutes } = require('../utils/routing');
const SavedRoute = require('../models/SavedRoute');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Emission factors: grams CO2 per km per passenger
const FACTORS = { car: 170, motorcycle: 103, bus: 89, electric_car: 50, cycling: 0, walking: 0 };
const CAR_BASELINE = 170;

// Average speed km/h for duration estimates
const SPEEDS = { car: 40, motorcycle: 45, bus: 25, electric_car: 40, cycling: 15, walking: 5 };

// Road distance multiplier: straight-line × 1.3 ≈ actual road distance
const ROAD_FACTOR = 1.3;

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildFallbackRoutes(origin, dest) {
  const straightKm = haversineKm(origin.lat, origin.lng, dest.lat, dest.lng);
  const result = {};
  for (const mode of Object.keys(FACTORS)) {
    const distKm = parseFloat((straightKm * ROAD_FACTOR).toFixed(2));
    const emitted = distKm * FACTORS[mode];
    const saved = Math.max(0, distKm * CAR_BASELINE - emitted);
    const durationMin = Math.round((distKm / SPEEDS[mode]) * 60);
    result[mode] = {
      geometry: null, // no route line - frontend handles gracefully
      distanceKm: distKm,
      durationMin,
      carbonEmitted: Math.round(emitted),
      carbonSaved: Math.round(saved),
      creditsIfLogged: Math.floor(saved / 10),
    };
  }
  return result;
}

exports.plan = async (req, res) => {
  try {
    const { originText, destText } = req.body;

    // Validate inputs
    if (!originText || !destText) {
      return res.status(400).json({
        success: false,
        error: 'Both origin and destination are required.',
      });
    }
    if (originText.length > 200 || destText.length > 200) {
      return res.status(400).json({
        success: false,
        error: 'Address too long (max 200 characters).',
      });
    }

    // Geocode origin
    let originCoords;
    try {
      originCoords = await geocodeAddress(originText);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Origin location not found. Try a more specific address.',
      });
    }

    // Respect Nominatim rate limit: 1 request per second
    await delay(1100);

    // Geocode destination
    let destCoords;
    try {
      destCoords = await geocodeAddress(destText);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Destination location not found. Try a more specific address.',
      });
    }

    // Plan all routes via ORS
    let routes;
    try {
      routes = await planAllRoutes(originCoords, destCoords);
    } catch (err) {
      console.error('[RoutePlanner] ORS error, using fallback estimates:', err.message);
      // FALLBACK: haversine straight-line distance estimates (no geometry/route lines)
      routes = buildFallbackRoutes(originCoords, destCoords);
    }

    return res.json({
      success: true,
      data: {
        origin: { text: originText, coords: originCoords },
        dest: { text: destText, coords: destCoords },
        routes,
      },
    });
  } catch (err) {
    console.error('[RoutePlanner] Plan error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

exports.autocomplete = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Query must be at least 3 characters.',
      });
    }

    // Client-side should enforce 400ms debounce before calling this endpoint
    const suggestions = await autocompleteAddress(q);
    return res.json({ success: true, data: suggestions });
  } catch (err) {
    console.error('[RoutePlanner] Autocomplete error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

exports.getSaved = async (req, res) => {
  try {
    const userId = req.user._id;
    // INDEX: { userId: 1, createdAt: -1 }
    const routes = await SavedRoute.find({ userId })
      .select('name originText destText originCoords destCoords createdAt')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, data: routes });
  } catch (err) {
    console.error('[RoutePlanner] GetSaved error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

exports.saveRoute = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, originText, destText, originCoords, destCoords } = req.body;

    // Validate
    if (!name || !originText || !destText || !originCoords || !destCoords) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required: name, originText, destText, originCoords, destCoords.',
      });
    }
    if (name.length > 60) {
      return res.status(400).json({ success: false, error: 'Route name too long (max 60 characters).' });
    }

    // Check count: max 5 saved routes per user
    const count = await SavedRoute.countDocuments({ userId });
    if (count >= 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 5 saved routes. Delete one to save a new route.',
      });
    }

    const route = await SavedRoute.create({
      userId,
      name,
      originText,
      destText,
      originCoords,
      destCoords,
    });

    return res.status(201).json({ success: true, data: route });
  } catch (err) {
    console.error('[RoutePlanner] SaveRoute error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // User can only delete their own routes
    const result = await SavedRoute.findOneAndDelete({ _id: id, userId });
    if (!result) {
      return res.status(404).json({ success: false, error: 'Route not found.' });
    }

    return res.json({ success: true, message: 'Route deleted.' });
  } catch (err) {
    console.error('[RoutePlanner] DeleteRoute error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
