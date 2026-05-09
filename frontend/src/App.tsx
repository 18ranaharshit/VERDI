// Performance: All routes lazy-loaded with Suspense skeleton fallbacks
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ui/ToastContainer';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import MobileTabBar from '@/components/layout/MobileTabBar';

// Custom lazy import with retry to fix chunk load errors on deployment updates
const lazyWithRetry = (componentImport: () => Promise<any>) => {
  return lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.localStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.localStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.localStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
      }
      throw error;
    }
  });
};

// Lazy-loaded pages
const LoginPage = lazyWithRetry(() => import('@/pages/LoginPage'));
const DashboardPage = lazyWithRetry(() => import('@/pages/DashboardPage'));
const CalculatorPage = lazyWithRetry(() => import('@/pages/CalculatorPage'));
const HistoryPage = lazyWithRetry(() => import('@/pages/HistoryPage'));
const LeaderboardPage = lazyWithRetry(() => import('@/pages/LeaderboardPage'));
const ProfilePage = lazyWithRetry(() => import('@/pages/ProfilePage'));
const WalletPage = lazyWithRetry(() => import('@/pages/WalletPage'));
const RewardsPage = lazyWithRetry(() => import('@/pages/RewardsPage'));
const VouchersPage = lazyWithRetry(() => import('@/pages/VouchersPage'));
const NotFoundPage = lazyWithRetry(() => import('@/pages/NotFoundPage'));
const RoutePlannerPage = lazyWithRetry(() => import('@/pages/RoutePlannerPage'));
const ImpactSimulatorPage = lazyWithRetry(() => import('@/pages/ImpactSimulatorPage'));
const CarbonPassportPage = lazyWithRetry(() => import('@/pages/CarbonPassportPage'));

// Lazy-loaded skeletons
import DashboardSkeleton from '@/skeletons/DashboardSkeleton';
import CalculatorSkeleton from '@/skeletons/CalculatorSkeleton';
import HistorySkeleton from '@/skeletons/HistorySkeleton';
import LeaderboardSkeleton from '@/skeletons/LeaderboardSkeleton';
import PlannerSkeleton from '@/skeletons/PlannerSkeleton';
import PassportSkeleton from '@/skeletons/PassportSkeleton';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <MobileTabBar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                {/* Public */}
                <Route
                  path="/login"
                  element={
                    <Suspense fallback={<div className="page-bg min-h-screen" />}>
                      <LoginPage />
                    </Suspense>
                  }
                />

                {/* Protected */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Suspense fallback={<DashboardSkeleton />}>
                          <DashboardPage />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calculator"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Suspense fallback={<CalculatorSkeleton />}>
                          <CalculatorPage />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Suspense fallback={<HistorySkeleton />}>
                          <HistoryPage />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leaderboard"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Suspense fallback={<LeaderboardSkeleton />}>
                          <LeaderboardPage />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Suspense fallback={<div className="page-bg min-h-screen" />}>
                          <ProfilePage />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wallet"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Suspense fallback={<div className="page-bg min-h-screen" />}>
                          <WalletPage />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rewards"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Suspense fallback={<div className="page-bg min-h-screen" />}>
                          <RewardsPage />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vouchers"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Suspense fallback={<div className="page-bg min-h-screen" />}>
                          <VouchersPage />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Insights Suite */}
                <Route
                  path="/planner"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Suspense fallback={<PlannerSkeleton />}>
                          <RoutePlannerPage />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/simulator"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Suspense fallback={<div className="page-bg min-h-screen" />}>
                          <ImpactSimulatorPage />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/passport"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Suspense fallback={<PassportSkeleton />}>
                          <CarbonPassportPage />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Redirects */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* 404 */}
                <Route
                  path="*"
                  element={
                    <Suspense fallback={<div className="page-bg min-h-screen" />}>
                      <NotFoundPage />
                    </Suspense>
                  }
                />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
