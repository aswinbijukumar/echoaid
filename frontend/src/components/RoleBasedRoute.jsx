import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleBasedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('RoleBasedRoute - User:', user);
    console.log('RoleBasedRoute - Loading:', loading);
    console.log('RoleBasedRoute - Current pathname:', window.location.pathname);
    console.log('RoleBasedRoute - Allowed roles:', allowedRoles);
    
    if (!loading) {
      if (!user) {
        // User not authenticated, redirect to login
        console.log('RoleBasedRoute - No user, redirecting to login');
        navigate('/login');
        return;
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        // User doesn't have required role, redirect based on their role
        console.log('RoleBasedRoute - User role not allowed, redirecting');
        switch (user.role) {
          case 'super_admin':
            navigate('/super-admin');
            break;
          case 'admin':
            navigate('/admin');
            break;
          case 'user':
          default:
            navigate('/dashboard');
            break;
        }
        return;
      }

      // For /dashboard route, redirect based on user role
      if (window.location.pathname === '/dashboard') {
        console.log('RoleBasedRoute - User role:', user.role);
        switch (user.role) {
          case 'super_admin':
            console.log('RoleBasedRoute - Redirecting super_admin to /super-admin');
            navigate('/super-admin');
            break;
          case 'admin':
            console.log('RoleBasedRoute - Redirecting admin to /admin');
            navigate('/admin');
            break;
          case 'user':
          default:
            console.log('RoleBasedRoute - User stays on /dashboard');
            // Regular users stay on /dashboard
            break;
        }
      }
    }
  }, [user, loading, navigate, allowedRoles]);

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