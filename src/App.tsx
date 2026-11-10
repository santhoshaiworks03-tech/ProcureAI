import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { BuyerDashboard } from './pages/dashboard/BuyerDashboard';
import { SupplierDashboard } from './pages/dashboard/SupplierDashboard';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { RoleProtectedRoute } from './components/auth/RoleProtectedRoute';
import { AIAgentPage } from './pages/procurement/AIAgentPage';
import { CataloguePage } from './pages/catalogue/CataloguePage';
import { SuppliersPage } from './pages/suppliers/SuppliersPage';
import { SupplierIntelligencePage } from './pages/suppliers/SupplierIntelligencePage';
import { DemandForecastingPage } from './pages/forecasting/DemandForecastingPage';
import { PurchaseOrdersPage } from './pages/orders/PurchaseOrdersPage';
import { ApprovalsPage } from './pages/approvals/ApprovalsPage';
import { PaymentsPage } from './pages/payments/PaymentsPage';
import { ProvenanceLedgerPage } from './pages/provenance/ProvenanceLedgerPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { AdminPage } from './pages/admin/AdminPage';
import { store } from './lib/store';

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
      <Outlet />
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
                <RoleProtectedRoute allowedRoles={['buyer', 'admin']}>
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

            {/* Buyer & Admin Enterprise Purchasing Workflows */}
            <Route
              path="/agent"
              element={
                <RoleProtectedRoute allowedRoles={['buyer', 'admin']}>
                  <AIAgentPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/catalogue"
              element={
                <RoleProtectedRoute allowedRoles={['buyer', 'admin']}>
                  <CataloguePage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/suppliers"
              element={
                <RoleProtectedRoute allowedRoles={['buyer', 'admin']}>
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
                <RoleProtectedRoute allowedRoles={['buyer', 'admin']}>
                  <PurchaseOrdersPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/approvals"
              element={
                <RoleProtectedRoute allowedRoles={['buyer', 'admin']}>
                  <ApprovalsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <RoleProtectedRoute allowedRoles={['buyer', 'admin']}>
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
