// Performance: Type definitions only - zero runtime impact

export type TransportMode = 'car' | 'motorcycle' | 'bus' | 'cycling' | 'walking' | 'electric_car';

export interface User {
  id: string;
  googleId: string;
  email: string;
  displayName: string;
  avatar: string;
  institution: string;
  createdAt: string;
  lastLogin: string;
}

export interface Trip {
  _id: string;
  userId: string;
  distance: number;
  transportMode: TransportMode;
  carbonEmitted: number;
  carbonSaved: number;
  origin: string;
  destination: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TripInput {
  distance: number;
  transportMode: TransportMode;
  origin: string;
  destination: string;
}

export interface TripStats {
  totalTrips: number;
  totalCarbonSaved: number;
  totalCarbonEmitted: number;
  totalDistanceGreen: number;
  streakDays: number;
  favoriteMode: TransportMode | null;
  co2ByMode: Record<string, number>;
  tripsOverTime: DayData[];
}

export interface DayData {
  date: string;
  carbonSaved: number;
  carbonEmitted: number;
  tripCount: number;
}

export interface Badge {
  key: string;
  label: string;
  icon: string;
  desc: string;
  earned: boolean;
  earnedAt: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatar: string;
  institution: string;
  totalCarbonSaved: number;
  totalCarbonSavedGrams: number;
  totalTrips: number;
  isCurrentUser: boolean;
}

export interface PaginatedTrips {
  trips: Trip[];
  totalPages: number;
  totalTrips: number;
  currentPage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  code?: number;
}

export interface Equivalents {
  phonesCharged: number;
  treeHours: number;
  drivingMeters: number;
  kettleBoils: number;
}

export interface ModeInfo {
  key: TransportMode;
  label: string;
  icon: string;
  factor: number;
  color: string;
}

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface CreditBalance {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

export interface CreditTransaction {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  balance: number;
  reason: string;
  tripId?: string;
  redemptionId?: string;
  createdAt: string;
}

export interface Reward {
  _id: string;
  key: string;
  title: string;
  description: string;
  howToUse: string;
  category: 'food' | 'study' | 'transport' | 'store';
  creditCost: number;
  icon: string;
  validityHours: number;
  isBikeUnlock: boolean;
}

export interface Redemption {
  _id: string;
  rewardId: string;
  voucherCode: string;
  status: 'active' | 'expired';
  redeemedAt: string;
  expiresAt: string;
  creditsCost: number;
  rewardSnapshot: {
    title: string;
    description: string;
    howToUse: string;
    icon: string;
    isBikeUnlock: boolean;
  };
}

// ===== Route Planner Types =====

export interface RouteResult {
  distanceKm: number;
  durationMin: number;
  carbonEmitted: number;  // grams
  carbonSaved: number;    // grams vs car
  creditsIfLogged: number;
  geometry: { type: string; coordinates: number[][] };
}

export interface PlanResult {
  origin: { text: string; coords: { lat: number; lng: number } };
  dest: { text: string; coords: { lat: number; lng: number } };
  routes: {
    car: RouteResult;
    motorcycle: RouteResult;
    bus: RouteResult;
    electric_car: RouteResult;
    cycling: RouteResult;
    walking: RouteResult;
  };
}

export interface SavedRoute {
  _id: string;
  name: string;
  originText: string;
  destText: string;
  originCoords: { lat: number; lng: number };
  destCoords: { lat: number; lng: number };
  createdAt: string;
}

export interface AutocompleteSuggestion {
  displayName: string;
  shortName: string;
  lat: number;
  lng: number;
}

// ===== Passport Types =====

export interface ActivityDay {
  date: string;  // "YYYY-MM-DD"
  carbonSaved: number;  // grams
}

export interface WeeklyTotal {
  week: string;  // "YYYY-WW"
  carbonSaved: number;
  trips: number;
}

export interface PassportData {
  activityGrid: ActivityDay[];
  weeklyTotals: WeeklyTotal[];
  modeBreakdown: Array<{ mode: string; totalCarbonSaved: number; tripCount: number }>;
  streaks: { currentStreak: number; longestStreak: number };
  projection: {
    avgDailySavings: number;
    projectedYearlySavings: number;
    milestones: Array<{ label: string; targetGrams: number; daysAway: number | null }>;
  };
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  percentile: number | null;
  institutionAvg: number | null;
  summary: {
    totalTrips: number;
    totalGreenTrips: number;
    totalCarbonSaved: number;
    totalCarbonEmitted: number;
    totalDistance: number;
    totalCreditsEarned: number;
    memberSinceDate: string;
  };
}

// ===== Simulator Types =====

export interface SimulatorInputs {
  students: number;
  distKm: number;
  pctCycling: number;
  pctWalking: number;
  pctBus: number;
  pctElectric: number;
}

export interface SimulatorResult {
  currentDailyKg: number;
  newDailyKg: number;
  savedDailyKg: number;
  savedYearlyKg: number;
  savedYearlyTons: number;
  treesEquivalent: number;
  carsRemoved: number;
  flightsSaved: number;
  co2PctReduction: number;
}
