import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const dashboardByRole = {
  candidate: '/dashboard',
  interviewer: '/interviewer/dashboard',
  admin: '/admin',
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardByRole[user.role] || '/login'} replace />;
  }

  return children;
}
