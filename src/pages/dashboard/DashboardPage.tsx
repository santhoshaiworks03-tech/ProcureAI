import React, { useState, useEffect } from 'react';
import { store } from '../../lib/store';
import { UserRole } from '../../types';
import { BuyerDashboard } from './BuyerDashboard';
import { SupplierDashboard } from './SupplierDashboard';
import { AdminDashboard } from './AdminDashboard';

export { BuyerDashboard } from './BuyerDashboard';
export { SupplierDashboard } from './SupplierDashboard';
export { AdminDashboard } from './AdminDashboard';

export const DashboardPage: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(store.getCurrentUser().role);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setCurrentRole(store.getCurrentUser().role);
    });
    return unsub;
  }, []);

  if (currentRole === 'supplier') {
    return <SupplierDashboard />;
  }

  if (currentRole === 'admin') {
    return <AdminDashboard />;
  }

  return <BuyerDashboard />;
};

export default DashboardPage;
