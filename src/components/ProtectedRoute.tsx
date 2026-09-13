import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Spinner from './Spinner';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!profile) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!profile) return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  if (profile.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}
