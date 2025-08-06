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
      
      // Add a small delay to show the success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } else {
      navigate('/login?error=google_auth_failed');
    }
  }, [searchParams, navigate, setToken]);

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        {/* Success Animation */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-white text-3xl font-bold mb-4">Welcome to EchoAid!</h2>
        <p className="text-gray-400 mb-8 text-lg">Your account has been successfully created</p>
        
        {/* Progress steps */}
        <div className="space-y-4 text-left bg-[#23272F] p-6 rounded-xl">
          <div className="flex items-center text-green-400">
            <div className="w-5 h-5 bg-green-500 rounded-full mr-4 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium">Authentication successful</span>
          </div>
          <div className="flex items-center text-green-400">
            <div className="w-5 h-5 bg-green-500 rounded-full mr-4 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium">Profile created</span>
          </div>
          <div className="flex items-center text-blue-400">
            <div className="w-5 h-5 bg-blue-500 rounded-full mr-4 animate-pulse"></div>
            <span className="text-sm font-medium">Redirecting to dashboard...</span>
          </div>
        </div>
        
        <p className="text-gray-500 text-sm mt-6">
          You'll be redirected automatically in a few seconds
        </p>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess; 