import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export function ProtectedRoute({ children, requireFreelancer = false }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated());
  const isFreelancer = useAuthStore(s => s.isFreelancer());
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireFreelancer && !isFreelancer) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
