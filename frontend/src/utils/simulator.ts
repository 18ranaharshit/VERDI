// Performance: Pure deterministic math - no API calls, used in useMemo for instant slider response
import type { SimulatorInputs, SimulatorResult } from '@/types';

const FACTORS = { car: 170, motorcycle: 103, bus: 89, electric: 50, cycling: 0, walking: 0 };

export function calculateImpact(inputs: SimulatorInputs): SimulatorResult {
  const { students, distKm, pctCycling, pctWalking, pctBus, pctElectric } = inputs;
  const pctCar = Math.max(0, 100 - pctCycling - pctWalking - pctBus - pctElectric);

  // Current state: assume everyone drives car
  const currentDailyKg = (students * distKm * FACTORS.car) / 1000;

  // Proposed state
  const newDailyGrams =
    students *
    distKm *
    ((pctCar / 100) * FACTORS.car +
      (pctCycling / 100) * FACTORS.cycling +
      (pctWalking / 100) * FACTORS.walking +
      (pctBus / 100) * FACTORS.bus +
      (pctElectric / 100) * FACTORS.electric);
  const newDailyKg = newDailyGrams / 1000;

  const savedDailyKg = currentDailyKg - newDailyKg;
  const savedYearlyKg = savedDailyKg * 260; // working days
  const savedYearlyTons = savedYearlyKg / 1000;

  return {
    currentDailyKg: Math.round(currentDailyKg * 10) / 10,
    newDailyKg: Math.round(newDailyKg * 10) / 10,
    savedDailyKg: Math.round(savedDailyKg * 10) / 10,
    savedYearlyKg: Math.round(savedYearlyKg),
    savedYearlyTons: Math.round(savedYearlyTons * 100) / 100,
    treesEquivalent: Math.round(savedYearlyKg / 21),       // 21 kg per tree/year
    carsRemoved: Math.round(savedYearlyKg / 4600),          // 4.6 tons per car/year
    flightsSaved: Math.round(savedYearlyKg / 382),           // short domestic flight
    co2PctReduction: currentDailyKg > 0 ? Math.round((savedDailyKg / currentDailyKg) * 100) : 0,
  };
}
