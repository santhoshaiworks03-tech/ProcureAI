import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Link, Outlet } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, KeyRound } from 'lucide-react';
import { store } from '../../lib/store';
import { UserRole } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ allowedRoles, children }) => {
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(store.isAuthenticated());
  const location = useLocation();

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
      setIsAuthenticated(store.isAuthenticated());
    });
    return unsub;
  }, []);

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const isRoleAuthorized = allowedRoles.includes(currentUser.role);

  if (!isRoleAuthorized) {
    const authorizedDashboard = store.getDashboardPath(currentUser.role);

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <Card className="max-w-lg w-full p-8 text-center space-y-6 border border-rose-200 bg-white shadow-xl rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              403 FORBIDDEN · ACCESS RESTRICTED
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#13110F]">
              Role Authorization Required
            </h2>
            <p className="text-xs text-[#6B6560] leading-relaxed">
              You are currently authenticated as{' '}
              <strong className="text-[#13110F]">{currentUser.full_name}</strong> with the{' '}
              <span className="capitalize font-mono px-2 py-0.5 rounded bg-[#EDE6DC] text-[#13110F] text-[11px]">
                {currentUser.role}
              </span>{' '}
              role. This terminal section requires{' '}
              <strong className="text-[#13110F] uppercase tracking-wide">
                {allowedRoles.join(' or ')}
              </strong>{' '}
              privileges.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.08)] text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] text-[#8C847D]">
              <span>Current Session ID:</span>
              <span className="font-mono">{currentUser.id}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8C847D]">
              <span>Attempted Endpoint:</span>
              <span className="font-mono text-[#13110F] truncate max-w-[220px]">{location.pathname}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8C847D]">
              <span>Row-Level Security:</span>
              <span className="text-emerald-700 font-semibold">PostgreSQL RLS Active</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to={authorizedDashboard} className="w-full sm:w-auto">
              <Button
                variant="primary"
                className="w-full sm:w-auto"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Return to {currentUser.role} dashboard
              </Button>
            </Link>

            <Link to="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                leftIcon={<KeyRound className="w-4 h-4" />}
              >
                Switch portal
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
