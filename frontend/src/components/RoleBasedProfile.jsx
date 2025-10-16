import { useAuth } from '../context/AuthContextConstants';
import Profile from '../pages/Profile';
import AdminProfile from '../pages/AdminProfile';

export default function RoleBasedProfile() {
  const { user } = useAuth();
  
  // Route to appropriate profile based on user role
  if (user?.role === 'admin' || user?.role === 'super_admin') {
    return <AdminProfile />;
  }
  
  return <Profile />;
}