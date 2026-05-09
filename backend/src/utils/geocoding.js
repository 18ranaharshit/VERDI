// Performance: Nominatim geocoding with User-Agent header - 1 req/sec rate limit enforced by caller
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'Verdi-EcoCommuter/1.0';

async function geocodeAddress(query) {
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  });
  const data = await response.json();
  if (!data.length) throw new Error(`Location not found: "${query}"`);
  const { lat, lon, display_name } = data[0];
  return {
    lat: parseFloat(lat),
    lng: parseFloat(lon),
    displayName: display_name,
  };
}

async function autocompleteAddress(query) {
  // Returns top 5 suggestions for frontend autocomplete
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=5`;
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  });
  const data = await response.json();
  return data.map((r) => ({
    displayName: r.display_name,
    shortName: r.name || r.display_name.split(',')[0],
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
  }));
}

module.exports = { geocodeAddress, autocompleteAddress };
