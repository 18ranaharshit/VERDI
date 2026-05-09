// Performance: Pure computation - no I/O. Keep in sync with backend/src/utils/carbon.js
import type { TransportMode, Equivalents, ModeInfo } from '@/types';

export const EMISSION_FACTORS: Record<TransportMode, number> = {
  car: 170,
  motorcycle: 103,
  bus: 89,
  electric_car: 50,
  cycling: 0,
  walking: 0,
};

export const CAR_BASELINE = 170;

export function calculateCarbon(distanceKm: number, mode: TransportMode): number {
  return Math.round(distanceKm * EMISSION_FACTORS[mode]);
}

export function calculateSaved(distanceKm: number, mode: TransportMode): number {
  const carEmission = distanceKm * CAR_BASELINE;
  const actualEmission = distanceKm * EMISSION_FACTORS[mode];
  return Math.round(Math.max(0, carEmission - actualEmission));
}

export function getEquivalents(grams: number): Equivalents {
  return {
    phonesCharged: Math.round(grams / 8.22),
    treeHours: Math.round(grams / 21.77),
    drivingMeters: Math.round((grams / 170) * 1000),
    kettleBoils: Math.round(grams / 71),
  };
}

export const MODES: ModeInfo[] = [
  { key: 'car', label: 'Car', icon: '🚗', factor: 170, color: 'var(--mode-car)' },
  { key: 'motorcycle', label: 'Motorcycle', icon: '🏍️', factor: 103, color: 'var(--mode-motorcycle)' },
  { key: 'bus', label: 'Bus', icon: '🚌', factor: 89, color: 'var(--mode-bus)' },
  { key: 'electric_car', label: 'Electric Car', icon: '⚡', factor: 50, color: 'var(--mode-electric)' },
  { key: 'cycling', label: 'Cycling', icon: '🚴', factor: 0, color: 'var(--mode-cycling)' },
  { key: 'walking', label: 'Walking', icon: '🚶', factor: 0, color: 'var(--mode-walking)' },
];

export function getModeInfo(mode: TransportMode): ModeInfo {
  return MODES.find((m) => m.key === mode) ?? MODES[0];
}

export function getMaxEmission(distanceKm: number): number {
  return distanceKm * CAR_BASELINE;
}
