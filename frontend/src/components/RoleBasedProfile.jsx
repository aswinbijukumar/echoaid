import { useAuth } from '../context/AuthContextConstants';
import { useTheme } from '../hooks/useTheme';
import Profile from '../pages/Profile';
import AdminProfile from '../pages/AdminProfile';

export default function RoleBasedProfile() {
  const { user, loading } = useAuth();
  const { darkMode } = useTheme();
  
  // Show loading spinner while user data is being fetched
  if (loading || !user) {
    const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
    const text = darkMode ? 'text-white' : 'text-[#23272F]';
    
    return (
      <div className={`min-h-screen ${bg} ${text} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  // Route to appropriate profile based on user role
    if (user.role === 'admin') {
    return <AdminProfile />;
  }
  
  return <Profile />;
}
