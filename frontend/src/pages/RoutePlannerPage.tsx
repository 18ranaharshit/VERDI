// Performance: Lazy-loaded page - map click-to-set + autocomplete search, full-width map
import { useState, useCallback } from 'react';
import { MapPin, Bookmark, Search, Loader2, AlertTriangle, ChevronRight, MousePointerClick } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import GlassCard from '@/components/ui/GlassCard';
import AddressSearchInput from '@/components/planner/AddressSearchInput';
import SavedRouteChip from '@/components/planner/SavedRouteChip';
import PlannerMap from '@/components/planner/PlannerMap';
import RouteComparisonPanel from '@/components/planner/RouteComparisonPanel';
import { usePlanRoute, useSavedRoutes, useSaveRoute, useDeleteRoute } from '@/hooks/useRoutePlanner';
import type { PlanResult, AutocompleteSuggestion } from '@/types';

const container = { animate: { transition: { staggerChildren: 0.05 } } };
const item = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

// Reverse-geocode a lat/lng to a human-readable address
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'User-Agent': 'VerdiEcoCommuter/1.0' } }
    );
    const data = await res.json();
    return data.display_name?.split(',').slice(0, 3).join(',').trim() || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

export default function RoutePlannerPage() {
  const [originText, setOriginText] = useState('');
  const [destText, setDestText] = useState('');
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<string | null>('cycling');
  const [saveName, setSaveName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  // Map click state
  const [settingPoint, setSettingPoint] = useState<'origin' | 'dest'>('origin');
  const [clickedOrigin, setClickedOrigin] = useState<[number, number] | null>(null);
  const [clickedDest, setClickedDest] = useState<[number, number] | null>(null);

  const planMutation = usePlanRoute();
  const { data: savedRoutes } = useSavedRoutes();
  const saveMutation = useSaveRoute();
  const deleteMutation = useDeleteRoute();

  const handlePlan = useCallback(() => {
    if (!originText || !destText) return;
    planMutation.mutate({ originText, destText }, {
      onSuccess: (data) => {
        setPlan(data);
        setSelectedMode('cycling');
      },
    });
  }, [originText, destText, planMutation]);

  const handleOriginSelect = (s: AutocompleteSuggestion) => {
    setOriginText(s.shortName);
  };

  const handleDestSelect = (s: AutocompleteSuggestion) => {
    setDestText(s.shortName);
  };

  // Map click handler - alternates between origin and dest
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    const name = await reverseGeocode(lat, lng);
    if (settingPoint === 'origin') {
      setClickedOrigin([lat, lng]);
      setOriginText(name);
      setSettingPoint('dest');
    } else {
      setClickedDest([lat, lng]);
      setDestText(name);
      setSettingPoint('origin');
    }
    // Clear old plan when changing points
    setPlan(null);
  }, [settingPoint]);

  const handleSavedRouteClick = (route: typeof savedRoutes extends (infer T)[] | undefined ? T : never) => {
    setOriginText(route.originText);
    setDestText(route.destText);
    planMutation.mutate(
      { originText: route.originText, destText: route.destText },
      {
        onSuccess: (data) => {
          setPlan(data);
          setSelectedMode('cycling');
        },
      }
    );
  };

  const handleSave = () => {
    if (!plan || !saveName.trim()) return;
    saveMutation.mutate({
      name: saveName.trim(),
      originText: plan.origin.text,
      destText: plan.dest.text,
      originCoords: plan.origin.coords,
      destCoords: plan.dest.coords,
    }, {
      onSuccess: () => {
        setSaveName('');
        setShowSaveForm(false);
      },
    });
  };

  return (
    <PageWrapper>
      <LazyMotion features={domAnimation}>
        <m.div variants={container} initial="initial" animate="animate" className="space-y-6">

          {/* Header */}
          <m.div variants={item}>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-verdi-primary tracking-tight">
              🗺️ Green Route Planner
            </h1>
            <p className="text-verdi-muted text-sm mt-1 font-medium">
              Compare routes across 6 transport modes - click the map or search to get started
            </p>
          </m.div>

          {/* Saved routes */}
          {savedRoutes && savedRoutes.length > 0 && (
            <m.div variants={item} className="flex flex-wrap gap-2">
              {savedRoutes.map((r) => (
                <SavedRouteChip
                  key={r._id}
                  route={r}
                  onClick={() => handleSavedRouteClick(r)}
                  onDelete={() => deleteMutation.mutate(r._id)}
                />
              ))}
            </m.div>
          )}

          {/* Full-width Map - the hero element */}
          <m.div variants={item}>
            <PlannerMap
              plan={plan}
              selectedMode={selectedMode}
              onModeClick={setSelectedMode}
              onMapClick={handleMapClick}
              clickedOrigin={clickedOrigin}
              clickedDest={clickedDest}
              settingPoint={settingPoint}
            />
          </m.div>

          {/* Search + Controls row below map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative items-start">
            {/* Left: Form */}
            <m.div variants={item} className="space-y-4 sticky top-6">
              <GlassCard className="p-4 sm:p-6 space-y-4">
                {/* Toggle which point the map sets */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSettingPoint('origin')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-display font-bold transition-all flex items-center justify-center gap-2
                      ${settingPoint === 'origin'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'glass-button text-verdi-muted'
                      }`}
                  >
                    <MousePointerClick className="w-3.5 h-3.5" />
                    Setting Origin (A)
                  </button>
                  <button
                    onClick={() => setSettingPoint('dest')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-display font-bold transition-all flex items-center justify-center gap-2
                      ${settingPoint === 'dest'
                        ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30'
                        : 'glass-button text-verdi-muted'
                      }`}
                  >
                    <MousePointerClick className="w-3.5 h-3.5" />
                    Setting Dest (B)
                  </button>
                </div>

                <AddressSearchInput
                  label="Origin"
                  value={originText}
                  onChange={setOriginText}
                  onSelect={handleOriginSelect}
                  placeholder="e.g. Mumbai Central Station"
                />
                <AddressSearchInput
                  label="Destination"
                  value={destText}
                  onChange={setDestText}
                  onSelect={handleDestSelect}
                  placeholder="e.g. IIT Bombay"
                />

                <button
                  onClick={handlePlan}
                  disabled={!originText || !destText || planMutation.isPending}
                  className="w-full py-3.5 rounded-xl font-display font-bold text-sm text-white
                             bg-gradient-to-r from-emerald-600 to-emerald-500
                             shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all flex items-center justify-center gap-2"
                >
                  {planMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Planning routes...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Compare Routes
                    </>
                  )}
                </button>

                {/* Error */}
                {planMutation.isError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <p>{(planMutation.error as Error)?.message || 'Route planning failed. Try again.'}</p>
                  </div>
                )}
              </GlassCard>

              {/* Save route button */}
              {plan && (
                <GlassCard className="p-4">
                  {showSaveForm ? (
                    <div className="flex gap-2">
                      <input
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        placeholder="Route name (e.g. Home → Office)"
                        maxLength={60}
                        className="flex-1 px-3 py-2 rounded-lg bg-white/90 dark:bg-[#022c22]/90 border border-verdi-border
                                   text-sm text-verdi-primary placeholder:text-verdi-muted/50
                                   focus:outline-none focus:border-verdi-accent transition-colors"
                      />
                      <button
                        onClick={handleSave}
                        disabled={!saveName.trim() || saveMutation.isPending}
                        className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold
                                   disabled:opacity-50 transition-opacity"
                      >
                        {saveMutation.isPending ? '...' : 'Save'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowSaveForm(true)}
                      className="flex items-center gap-2 text-sm text-verdi-accent hover:text-emerald-600 font-display font-semibold transition-colors"
                    >
                      <Bookmark className="w-4 h-4" />
                      Save this route
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                  {saveMutation.isError && (
                    <p className="text-xs text-red-500 mt-2">
                      {(saveMutation.error as Error)?.message || 'Failed to save. Max 5 routes.'}
                    </p>
                  )}
                </GlassCard>
              )}
            </m.div>

            {/* Right: Route results */}
            <m.div variants={item}>
              {plan ? (
                <RouteComparisonPanel
                  plan={plan}
                  selectedMode={selectedMode}
                  onModeSelect={setSelectedMode}
                />
              ) : (
                <GlassCard className="p-6 sm:p-8 text-center h-full flex flex-col items-center justify-center min-h-[200px]">
                  <MousePointerClick className="w-10 h-10 text-verdi-muted/40 mb-3" />
                  <p className="font-display font-semibold text-sm text-verdi-primary">
                    How to use
                  </p>
                  <ol className="text-xs text-verdi-muted mt-3 space-y-2 text-left max-w-xs">
                    <li className="flex gap-2">
                      <span className="font-bold text-emerald-600">1.</span>
                      Click the map to set <strong>Origin (A)</strong> - or type an address
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-violet-600">2.</span>
                      Click again for <strong>Destination (B)</strong>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-cyan-600">3.</span>
                      Hit <strong>"Compare Routes"</strong> to see all 6 modes
                    </li>
                  </ol>
                </GlassCard>
              )}
            </m.div>
          </div>
        </m.div>
      </LazyMotion>
    </PageWrapper>
  );
}
