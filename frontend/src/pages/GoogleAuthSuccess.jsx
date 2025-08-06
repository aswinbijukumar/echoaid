import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GoogleAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      navigate('/login?error=google_auth_failed');
      return;
    }

    if (token) {
      // Store the token
      localStorage.setItem('token', token);
      setToken(token);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      navigate('/login?error=google_auth_failed');
    }
  }, [searchParams, navigate, setToken]);

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <h2 className="text-white text-xl font-semibold">Completing Google Sign In...</h2>
        <p className="text-gray-400 mt-2">Please wait while we redirect you.</p>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess; 