// Performance: Infinite scroll with Intersection Observer - useInfiniteQuery for paginated trips
import { useRef, useEffect, useState, useCallback } from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Trash2, Leaf, SlidersHorizontal } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import GlassCard from '@/components/ui/GlassCard';
import { useInfiniteTrips, useDeleteTrip } from '@/hooks/useTrips';
import { useToast } from '@/components/ui/ToastContainer';
import { getModeInfo, MODES } from '@/utils/carbon';
import type { TransportMode } from '@/types';

const container = { animate: { transition: { staggerChildren: 0.05 } } };
const item = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export default function HistoryPage() {
  const [modeFilter, setModeFilter] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteTrips(10, modeFilter, sortBy);

  const deleteTrip = useDeleteTrip();
  const { addToast } = useToast();
  const loaderRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleDelete = useCallback(async (tripId: string) => {
    try {
      await deleteTrip.mutateAsync(tripId);
      addToast({ type: 'success', title: 'Trip deleted' });
    } catch {
      addToast({ type: 'error', title: 'Failed to delete trip' });
    }
    setDeleteConfirm(null);
  }, [deleteTrip, addToast]);

  const allTrips = data?.pages.flatMap((p) => p.trips) || [];

  return (
    <PageWrapper>
      <LazyMotion features={domAnimation}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-verdi-primary tracking-tight">
            Trip History
          </h1>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="glass-button px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-display font-semibold text-verdi-secondary hover:text-verdi-primary transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        {/* Filter Bar */}
        {filtersOpen && (
          <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <GlassCard className="p-4 mb-6">
              <div className="flex flex-wrap gap-4 items-end">
                {/* Mode filter chips */}
                <div>
                  <label className="text-xs font-display font-semibold text-verdi-muted mb-1.5 block uppercase tracking-wider">Mode</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setModeFilter(undefined)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all
                        ${!modeFilter ? 'bg-verdi-accent text-white' : 'bg-verdi-card text-verdi-secondary hover:bg-verdi-input'}`}
                    >
                      All
                    </button>
                    {MODES.map((m) => (
                      <button
                        key={m.key}
                        onClick={() => setModeFilter(modeFilter === m.key ? undefined : m.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all
                          ${modeFilter === m.key
                            ? 'text-white'
                            : 'bg-verdi-card text-verdi-secondary hover:bg-verdi-input'
                          }`}
                        style={modeFilter === m.key ? { backgroundColor: m.color } : {}}
                      >
                        {m.icon} {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-xs font-display font-semibold text-verdi-muted mb-1.5 block uppercase tracking-wider">Sort</label>
                  <div className="flex gap-2">
                    {[
                      { key: 'newest', label: 'Newest' },
                      { key: 'savings', label: 'Top Savings' },
                      { key: 'distance', label: 'Longest' },
                    ].map((s) => (
                      <button
                        key={s.key}
                        onClick={() => setSortBy(sortBy === s.key ? undefined : s.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all
                          ${sortBy === s.key ? 'bg-verdi-accent text-white' : 'bg-verdi-card text-verdi-secondary hover:bg-verdi-input'}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </m.div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="glass-card h-20 skeleton-shimmer rounded-2xl" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && allTrips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <m.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Leaf className="w-16 h-16 text-verdi-accent/40 mb-4" />
            </m.div>
            <h3 className="font-display font-bold text-lg text-verdi-primary mb-2">No trips logged yet</h3>
            <p className="text-verdi-muted text-sm">Log your first eco commute from the Calculator!</p>
          </div>
        )}

        {/* Trip list */}
        {!isLoading && allTrips.length > 0 && (
          <m.div variants={container} initial="initial" animate="animate" className="space-y-3">
            {allTrips.map((trip) => {
              const modeInfo = getModeInfo(trip.transportMode);
              return (
                <m.div key={trip._id} variants={item}>
                  <GlassCard className="p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `color-mix(in srgb, ${modeInfo.color} 20%, transparent)` }}>
                        <span className="text-xl">{modeInfo.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-display font-semibold text-verdi-primary truncate">
                          {trip.origin} → {trip.destination}
                        </p>
                        <p className="text-xs text-verdi-muted">
                          {new Date(trip.date).toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric',
                            hour: 'numeric', minute: '2-digit',
                          })}
                          <span className="mx-1">·</span>
                          {trip.distance} km
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-mono font-medium text-verdi-primary">{trip.carbonEmitted} g</p>
                        {trip.carbonSaved > 0 && (
                          <p className="text-xs font-mono text-verdi-accent">+{trip.carbonSaved} g saved</p>
                        )}
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setDeleteConfirm(deleteConfirm === trip._id ? null : trip._id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-verdi-muted hover:text-[var(--danger)] hover:bg-red-500/10 transition-colors"
                          aria-label="Delete trip"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {deleteConfirm === trip._id && (
                          <div className="absolute right-0 top-10 z-20 glass-card-strong p-3 w-48">
                            <p className="text-xs text-verdi-primary mb-2">Delete this trip?</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-1.5 rounded-lg text-xs bg-verdi-card text-verdi-secondary hover:bg-verdi-input transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDelete(trip._id)}
                                className="flex-1 py-1.5 rounded-lg text-xs bg-[var(--danger)] text-white hover:opacity-90 transition-opacity"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </m.div>
              );
            })}

            {/* Infinite scroll trigger */}
            <div ref={loaderRef} className="py-4 flex justify-center">
              {isFetchingNextPage && (
                <div className="w-8 h-8 rounded-full border-2 border-verdi-accent border-t-transparent animate-spin" />
              )}
              {!hasNextPage && allTrips.length > 0 && (
                <p className="text-xs text-verdi-muted font-display">All trips loaded</p>
              )}
            </div>
          </m.div>
        )}
      </LazyMotion>
    </PageWrapper>
  );
}
