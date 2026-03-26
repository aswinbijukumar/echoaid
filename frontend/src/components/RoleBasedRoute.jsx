import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContextConstants';
import { getRoleBasedRedirect, isAuthorizedForRoute } from '../utils/roleRedirect';

export default function RoleBasedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      // Check if session is valid
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      // Validate token format and expiry
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;
        if (Date.now() >= expiry) {
          console.log('Token expired, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          navigate('/login');
          return;
        }
      } catch (error) {
        console.error('Invalid token format:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        navigate('/login');
        return;
      }

      if (!user) {
        console.log('No user found, redirecting to login');
        navigate('/login');
        return;
      }

      // Check if user is authorized for this route
      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        console.log(`[RoleBasedRoute] User role ${user.role} not authorized for route, redirecting to appropriate dashboard`);
        const redirectPath = getRoleBasedRedirect(user.role, location.pathname);
        if (redirectPath) {
          navigate(redirectPath, { replace: true });
        }
        return;
      }

      // Handle root-level dashboard redirects or role corrections
      // If we are at /dashboard (generic) or strictly unauthorized, bounce them to their home.
      if (location.pathname === '/dashboard') {
        const correctPath = getRoleBasedRedirect(user.role, '/dashboard');
        if (correctPath && correctPath !== '/dashboard') {
          navigate(correctPath, { replace: true });
          return;
        }
      }
    } else {
      console.log('[RoleBasedRoute] Loading...', { loading, user: !!user });
    }
  }, [user, loading, navigate, allowedRoles, location.pathname]);

  // Show loading while checking role
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
} 
