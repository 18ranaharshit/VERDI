// Performance: Client-side calculations update instantly - POST only on "Log This Trip"
import { useState, Suspense, lazy, useEffect } from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import GlassCard from '@/components/ui/GlassCard';
import RouteInputForm from '@/components/calculator/RouteInputForm';
import CarbonMeter from '@/components/calculator/CarbonMeter';
import ComparisonBars from '@/components/charts/ComparisonBars';
import HumanEquivalents from '@/components/calculator/HumanEquivalents';
import SavingsCallout from '@/components/calculator/SavingsCallout';
import { useCreateTrip } from '@/hooks/useTrips';
import { useToast } from '@/components/ui/ToastContainer';
import { calculateCarbon } from '@/utils/carbon';
import type { TransportMode } from '@/types';

const RouteMap = lazy(() => import('@/components/map/RouteMap'));

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function CalculatorPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  
  const [distance, setDistance] = useState(0);
  const [mode, setMode] = useState<TransportMode | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const createTrip = useCreateTrip();
  const { addToast } = useToast();

  const emission = mode ? calculateCarbon(distance, mode) : 0;
  const canSave = mode && distance > 0 && origin.trim() && destination.trim();

  // Auto-calculate distance when coords change
  useEffect(() => {
    if (originCoords && destCoords) {
      setDistance(haversineDistance(originCoords[0], originCoords[1], destCoords[0], destCoords[1]));
    }
  }, [originCoords, destCoords]);

  // Pre-fill from Route Planner's "Plan This Trip" action
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('plannerRoute');
      if (stored) {
        const data = JSON.parse(stored) as {
          origin: string; dest: string; distance: number; mode: TransportMode;
        };
        setOrigin(data.origin || '');
        setDestination(data.dest || '');
        setDistance(data.distance || 0);
        setMode(data.mode || null);
        sessionStorage.removeItem('plannerRoute');
        addToast({ type: 'success', title: 'Pre-filled from Route Planner!' });
      }
    } catch { /* ignore parse errors */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      return data.display_name?.split(',').slice(0, 3).join(',') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const forwardGeocode = async (query: string) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)] as [number, number];
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleMapClick = async (lat: number, lng: number) => {
    setIsSearching(true);
    const address = await reverseGeocode(lat, lng);
    setIsSearching(false);

    if (!originCoords || (originCoords && destCoords)) {
      setOriginCoords([lat, lng]);
      setOrigin(address);
      setDestCoords(null);
      setDestination('');
    } else {
      setDestCoords([lat, lng]);
      setDestination(address);
    }
  };

  const handleSearchOrigin = async () => {
    if (!origin.trim()) return;
    setIsSearching(true);
    const coords = await forwardGeocode(origin);
    setIsSearching(false);
    if (coords) {
      setOriginCoords(coords);
    } else {
      addToast({ type: 'error', title: 'Location not found', message: 'Try being more specific.' });
    }
  };

  const handleSearchDestination = async () => {
    if (!destination.trim()) return;
    setIsSearching(true);
    const coords = await forwardGeocode(destination);
    setIsSearching(false);
    if (coords) {
      setDestCoords(coords);
    } else {
      addToast({ type: 'error', title: 'Location not found', message: 'Try being more specific.' });
    }
  };

  const handleSave = async () => {
    if (!canSave || !mode) return;

    try {
      const result = await createTrip.mutateAsync({
        distance,
        transportMode: mode,
        origin: origin.trim(),
        destination: destination.trim(),
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);

      let toastMessage = '';
      if (result.data?.creditsEarned > 0) {
        toastMessage += `💰 +${result.data.creditsEarned} pts earned!\n`;
      }
      if (result.data?.newBadges?.length) {
        toastMessage += `🎉 New badge: ${result.data.newBadges[0].label}`;
      }

      addToast({
        type: 'success',
        title: result.message || 'Trip logged!',
        message: toastMessage.trim() || undefined,
      });

      setOrigin('');
      setDestination('');
      setOriginCoords(null);
      setDestCoords(null);
      setDistance(0);
      setMode(null);
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to log trip',
        message: 'Please try again.',
      });
    }
  };

  const currentMarkers = [originCoords, destCoords].filter(Boolean) as [number, number][];

  return (
    <PageWrapper>
      <LazyMotion features={domAnimation}>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-verdi-primary mb-6 tracking-tight">
          Trip Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="space-y-6">
            <GlassCard className="p-5 sm:p-6">
              <RouteInputForm
                origin={origin}
                destination={destination}
                distance={distance}
                mode={mode}
                onOriginChange={setOrigin}
                onDestinationChange={setDestination}
                onDistanceChange={setDistance}
                onModeChange={setMode}
                onSearchOrigin={handleSearchOrigin}
                onSearchDestination={handleSearchDestination}
                isSearching={isSearching}
              />
            </GlassCard>



            {/* Calculate / Save Button */}
            <m.button
              onClick={handleSave}
              disabled={!canSave || createTrip.isPending}
              whileHover={canSave ? { scale: 1.02 } : {}}
              whileTap={canSave ? { scale: 0.98 } : {}}
              className={`w-full h-[52px] rounded-xl font-display font-semibold text-white
                         flex items-center justify-center gap-2 transition-all duration-200
                         ${canSave
                  ? 'bg-verdi-accent hover:shadow-glow cursor-pointer'
                  : 'bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
            >
              {createTrip.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : showSuccess ? (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="24"
                      strokeDashoffset="0"
                      style={{ animation: 'stroke-draw 0.5s ease-out' }}
                    />
                  </svg>
                  Logged!
                </>
              ) : (
                'Log This Trip to My Journey'
              )}
            </m.button>
          </div>

          {/* Right: Live Results */}
          <div className="space-y-5">
            {/* Carbon Meter */}
            <GlassCard className="p-5 sm:p-6 flex flex-col items-center">
              <h3 className="font-display font-bold text-base text-verdi-primary mb-2 self-start">Carbon Meter</h3>
              <CarbonMeter emission={emission} distance={distance} mode={mode} />
            </GlassCard>

            {/* Comparison Bars */}
            {distance > 0 && (
              <m.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="p-5 sm:p-6">
                  <ComparisonBars distance={distance} selectedMode={mode} />
                </GlassCard>
              </m.div>
            )}

            {/* Human Equivalents */}
            {emission > 0 && (
              <m.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h4 className="font-display font-bold text-sm text-verdi-primary mb-3">
                  That's equivalent to...
                </h4>
                <HumanEquivalents grams={emission} />
              </m.div>
            )}

            {/* Savings Callout */}
            <SavingsCallout distance={distance} mode={mode} />
          </div>
        </div>

        {/* Full Width Map */}
        <div className="mt-6">
          <GlassCard className="p-4 overflow-hidden relative">
            <h3 className="font-display font-bold text-sm text-verdi-primary mb-3">
              Or pick on map
            </h3>
            {isSearching && (
              <div className="absolute top-12 right-6 z-[1000] bg-verdi-bg/80 backdrop-blur-sm p-2 rounded-full shadow-lg">
                <Loader2 className="w-5 h-5 text-verdi-accent animate-spin" />
              </div>
            )}
            <Suspense fallback={<div className="h-[500px] skeleton-shimmer rounded-xl" />}>
              <RouteMap markers={currentMarkers} onMapClick={handleMapClick} distance={distance} />
            </Suspense>
          </GlassCard>
        </div>
      </LazyMotion>
    </PageWrapper>
  );
}
