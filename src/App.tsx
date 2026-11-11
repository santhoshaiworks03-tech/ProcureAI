import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RoleProtectedRoute } from './components/auth/RoleProtectedRoute';
import { store } from './lib/store';

// Lazy loaded page components for fast initial bundle and instant page transitions
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const BuyerDashboard = lazy(() => import('./pages/dashboard/BuyerDashboard').then(m => ({ default: m.BuyerDashboard })));
const SupplierDashboard = lazy(() => import('./pages/dashboard/SupplierDashboard').then(m => ({ default: m.SupplierDashboard })));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AIAgentPage = lazy(() => import('./pages/procurement/AIAgentPage').then(m => ({ default: m.AIAgentPage })));
const CataloguePage = lazy(() => import('./pages/catalogue/CataloguePage').then(m => ({ default: m.CataloguePage })));
const SuppliersPage = lazy(() => import('./pages/suppliers/SuppliersPage').then(m => ({ default: m.SuppliersPage })));
const SupplierIntelligencePage = lazy(() => import('./pages/suppliers/SupplierIntelligencePage').then(m => ({ default: m.SupplierIntelligencePage })));
const DemandForecastingPage = lazy(() => import('./pages/forecasting/DemandForecastingPage').then(m => ({ default: m.DemandForecastingPage })));
const PurchaseOrdersPage = lazy(() => import('./pages/orders/PurchaseOrdersPage').then(m => ({ default: m.PurchaseOrdersPage })));
const ApprovalsPage = lazy(() => import('./pages/approvals/ApprovalsPage').then(m => ({ default: m.ApprovalsPage })));
const PaymentsPage = lazy(() => import('./pages/payments/PaymentsPage').then(m => ({ default: m.PaymentsPage })));
const ProvenanceLedgerPage = lazy(() => import('./pages/provenance/ProvenanceLedgerPage').then(m => ({ default: m.ProvenanceLedgerPage })));
const AnalyticsPage = lazy(() => import('./pages/analytics/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const AdminPage = lazy(() => import('./pages/admin/AdminPage').then(m => ({ default: m.AdminPage })));

/**
 * Persistent Protected Layout with React Router <Outlet />
 * Keeps AppLayout permanently mounted across all authenticated routes
 * ensuring Framer Motion layoutId="activeSideNavPill" animates smoothly with true flow motion!
 */
const ProtectedLayout: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean>(store.isAuthenticated());
  const location = useLocation();

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setAuthenticated(store.isAuthenticated());
    });
    return unsub;
  }, []);

  if (!authenticated) {
    if (location.pathname === '/') {
      return <LandingPage />;
    }
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return (
    <AppLayout>
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-7 h-7 rounded-full border-2 border-[#13110F]/20 border-t-[#13110F] animate-spin" />
              <span className="text-[11px] font-mono text-[#8C847D]">Loading view...</span>
            </div>
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </AppLayout>
  );
};

export function App() {
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test';

  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalClientId,
        currency: 'USD',
        intent: 'capture',
        components: 'buttons'
      }}
    >
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Multi-Portal Authentication Gateway */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signin" element={<Navigate to="/login" replace />} />

          {/* Protected Application Workspace with Persistent Shared AppLayout */}
          <Route element={<ProtectedLayout />}>
            {/* Central role router: evaluates user role and renders corresponding dashboard */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Role-Specific Protected Dedicated Dashboard Routes */}
            <Route
              path="/buyer/dashboard"
              element={
                <RoleProtectedRoute allowedRoles={['buyer']}>
                  <BuyerDashboard />
                </RoleProtectedRoute>
              }
            />
            <Route path="/buyer" element={<Navigate to="/buyer/dashboard" replace />} />

            <Route
              path="/supplier/dashboard"
              element={
                <RoleProtectedRoute allowedRoles={['supplier']}>
                  <SupplierDashboard />
                </RoleProtectedRoute>
              }
            />
            <Route path="/supplier" element={<Navigate to="/supplier/dashboard" replace />} />

            <Route
              path="/admin/dashboard"
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleProtectedRoute>
              }
            />

            {/* Buyer Purchasing Workflows (Rule 10: Strict Buyer Role Isolation) */}
            <Route
              path="/agent"
              element={
                <RoleProtectedRoute allowedRoles={['buyer']}>
                  <AIAgentPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/catalogue"
              element={
                <RoleProtectedRoute allowedRoles={['buyer']}>
                  <CataloguePage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/suppliers"
              element={
                <RoleProtectedRoute allowedRoles={['buyer']}>
                  <SuppliersPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/intelligence"
              element={
                <RoleProtectedRoute allowedRoles={['buyer', 'admin']}>
                  <SupplierIntelligencePage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/forecasting"
              element={
                <RoleProtectedRoute allowedRoles={['buyer', 'admin']}>
                  <DemandForecastingPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <RoleProtectedRoute allowedRoles={['buyer']}>
                  <PurchaseOrdersPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/approvals"
              element={
                <RoleProtectedRoute allowedRoles={['buyer']}>
                  <ApprovalsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <RoleProtectedRoute allowedRoles={['buyer']}>
                  <PaymentsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/provenance"
              element={
                <RoleProtectedRoute allowedRoles={['buyer', 'admin']}>
                  <ProvenanceLedgerPage />
                </RoleProtectedRoute>
              }
            />
            <Route path="/ledger" element={<Navigate to="/provenance" replace />} />
            <Route path="/ai-agents" element={<Navigate to="/agent" replace />} />
            <Route
              path="/analytics"
              element={
                <RoleProtectedRoute allowedRoles={['buyer', 'admin']}>
                  <AnalyticsPage />
                </RoleProtectedRoute>
              }
            />

            {/* Shared Notifications */}
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Admin Platform Settings */}
            <Route
              path="/admin"
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminPage />
                </RoleProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PayPalScriptProvider>
  );
}

export default App;
