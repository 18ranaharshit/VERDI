import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Loader2 } from 'lucide-react';

// Fix default marker icons
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface RouteMapProps {
  markers: [number, number][];
  onMapClick: (lat: number, lng: number) => void;
  distance?: number;
}

function MapClickHandler({ onMarkerAdd }: { onMarkerAdd: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMarkerAdd(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Automatically adjusts map bounds when markers change
function MapBoundsUpdater({ markers }: { markers: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    if (markers.length === 1) {
      map.flyTo(markers[0], 13, { duration: 1.5 });
    } else if (markers.length === 2) {
      const bounds = L.latLngBounds(markers[0], markers[1]);
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [markers, map]);
  return null;
}

export default function RouteMap({ markers, onMapClick, distance }: RouteMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{lat: string, lon: string, display_name: string}[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`);
      const data = await res.json();
      setSearchResults(data);
    } catch {
      // ignore
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (lat: string, lng: string) => {
    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);
    onMapClick(numLat, numLng);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="relative rounded-xl overflow-hidden shadow-inner border border-verdi-border" style={{ height: '500px' }}>
      
      {/* Map Search Overlay */}
      <div className="absolute top-3 left-12 right-3 sm:left-auto sm:w-80 z-[1000]">
        <form onSubmit={handleSearch} className="relative flex items-center bg-white dark:bg-[#022c22] rounded-xl shadow-lg border border-verdi-border/50">
          <input 
            type="text"
            placeholder="Search map to add to route..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent pl-4 pr-10 py-2.5 text-sm text-verdi-primary placeholder:text-gray-400 focus:outline-none"
          />
          <button type="submit" className="absolute right-2 p-1.5 text-verdi-muted hover:text-verdi-accent">
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="mt-2 bg-white dark:bg-[#022c22] rounded-xl shadow-xl border border-verdi-border max-h-60 overflow-y-auto">
            {searchResults.map((result, i) => (
              <button
                key={i}
                onClick={() => handleResultClick(result.lat, result.lon)}
                className="w-full text-left px-4 py-3 text-xs sm:text-sm text-verdi-primary hover:bg-verdi-subtle border-b border-verdi-border last:border-0 transition-colors"
              >
                {result.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom={true}
        dragging={true}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMarkerAdd={onMapClick} />
        <MapBoundsUpdater markers={markers} />
        {markers.map((pos, i) => (
          <Marker key={i} position={pos} />
        ))}
      </MapContainer>
      {distance !== undefined && distance > 0 && markers.length === 2 && (
        <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 dark:bg-[#022c22]/90 backdrop-blur-md px-3 py-1.5 text-xs font-mono text-verdi-primary font-bold shadow-md rounded-lg border border-verdi-border/50">
          Distance: {distance} km
        </div>
      )}
    </div>
  );
}
