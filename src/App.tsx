import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
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
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/agent" element={<AIAgentPage />} />
            <Route path="/catalogue" element={<CataloguePage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/intelligence" element={<SupplierIntelligencePage />} />
            <Route path="/forecasting" element={<DemandForecastingPage />} />
            <Route path="/orders" element={<PurchaseOrdersPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/provenance" element={<ProvenanceLedgerPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </PayPalScriptProvider>
  );
}

export default App;
