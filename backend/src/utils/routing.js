// Performance: 3 concurrent ORS API calls per plan request - bus/motorcycle/electric reuse driving-car geometry
const ORS_BASE = 'https://api.openrouteservice.org/v2/directions';

// Emission factors: grams CO2 per km per passenger
const FACTORS = { car: 170, motorcycle: 103, bus: 89, electric_car: 50, cycling: 0, walking: 0 };
const CAR_BASELINE = 170;

async function fetchRoute(profile, originCoords, destCoords) {
  // originCoords and destCoords are { lat, lng }
  const body = {
    coordinates: [
      [originCoords.lng, originCoords.lat], // ORS uses [lon, lat] order
      [destCoords.lng, destCoords.lat],
    ],
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch(`${ORS_BASE}/${profile}/geojson`, {
      method: 'POST',
      headers: {
        Authorization: process.env.ORS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json, application/geo+json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`ORS error for profile ${profile}: ${err}`);
    }

    const geojson = await response.json();
    const feature = geojson.features[0];
    return {
      geometry: feature.geometry, // GeoJSON LineString - pass to frontend as-is
      distanceMeters: feature.properties.summary.distance,
      durationSeconds: feature.properties.summary.duration,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function buildMode(route, modeKey) {
  const distKm = route.distanceMeters / 1000;
  const emitted = distKm * FACTORS[modeKey];
  const saved = Math.max(0, distKm * CAR_BASELINE - emitted);
  const durationMin = Math.round(route.durationSeconds / 60);
  return {
    geometry: route.geometry,
    distanceKm: parseFloat(distKm.toFixed(2)),
    durationMin,
    carbonEmitted: Math.round(emitted),
    carbonSaved: Math.round(saved),
    creditsIfLogged: Math.floor(saved / 10),
  };
}

async function planAllRoutes(originCoords, destCoords) {
  // Fetch 3 ORS routes concurrently
  const [carRoute, cyclingRoute, walkingRoute] = await Promise.all([
    fetchRoute('driving-car', originCoords, destCoords),
    fetchRoute('cycling-regular', originCoords, destCoords),
    fetchRoute('foot-walking', originCoords, destCoords),
  ]);

  return {
    car: buildMode(carRoute, 'car'),
    motorcycle: buildMode(carRoute, 'motorcycle'), // same geometry as car
    bus: buildMode(carRoute, 'bus'), // same geometry as car
    electric_car: buildMode(carRoute, 'electric_car'), // same geometry as car
    cycling: buildMode(cyclingRoute, 'cycling'),
    walking: buildMode(walkingRoute, 'walking'),
  };
}

module.exports = { planAllRoutes };
