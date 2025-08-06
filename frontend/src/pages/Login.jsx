import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { darkMode } = useTheme();
  const { login, googleAuth } = useAuth();
  const navigate = useNavigate();

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const inputBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Load Google OAuth script
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        
        script.onload = () => {
          window.google.accounts.id.initialize({
            client_id: '837632799022-ejqg1r9mms133c6co8npk5ohjkbdn203.apps.googleusercontent.com',
            callback: handleGoogleCallback
          });
          window.google.accounts.id.prompt();
        };
      } else {
        window.google.accounts.id.initialize({
          client_id: '837632799022-ejqg1r9mms133c6co8npk5ohjkbdn203.apps.googleusercontent.com',
          callback: handleGoogleCallback
        });
        window.google.accounts.id.prompt();
      }
    } catch {
      setError('Google login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleCallback = async (response) => {
    try {
      await googleAuth(response.credential);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${bg} ${text} flex items-center justify-center p-4`}>
             <div
         className="w-full max-w-md"
       >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 border border-blue-400 text-blue-400 rounded-lg hover:bg-blue-400 hover:text-white transition-colors"
          >
            SIGN UP
          </Link>
        </div>

        {/* Main Form */}
        <div className={`${cardBg} rounded-2xl p-8 shadow-xl`}>
          <h1 className="text-3xl font-bold text-center mb-8">Welcome Back!</h1>

          {/* User Avatar (placeholder) */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              U
            </div>
          </div>

          <Link
            to="/login"
            className="block text-center text-blue-400 hover:text-blue-300 mb-6 transition-colors"
          >
            USE ANOTHER ACCOUNT
          </Link>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className={`w-full px-4 py-3 ${inputBg} ${border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CC00] focus:border-transparent transition-colors`}
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className={`w-full px-4 py-3 pr-12 ${inputBg} ${border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CC00] focus:border-transparent transition-colors`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00CC00] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#00AA00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing In...' : 'SIGN IN'}
            </button>
          </form>

          {/* Forgot Password */}
          <div className="text-center mt-4">
            <Link
              to="/forgot-password"
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-400 text-sm">OR</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-gray-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <div className="w-6 h-6 mr-3">
              <svg viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            GOOGLE
          </button>

          {/* Legal Text */}
          <div className="mt-6 text-xs text-gray-400 text-center space-y-2">
            <p>
              By signing in to EchoAid, you agree to our{' '}
              <Link to="/terms" className="text-blue-400 hover:underline">Terms</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>.
            </p>
            <p>
              This site is protected by reCAPTCHA Enterprise and the Google{' '}
              <Link to="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>
              {' '}and{' '}
              <Link to="/terms" className="text-blue-400 hover:underline">Terms of Service</Link> apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
