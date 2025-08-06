import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  
  const { resetToken } = useParams();
  const { darkMode } = useTheme();
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/auth/resetpassword/${resetToken}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/resetpassword/${resetToken}`, {
          method: 'GET'
        });

        if (!response.ok) {
          setIsValidToken(false);
        }
      } catch (error) {
        setIsValidToken(false);
      }
    };

    validateToken();
  }, [resetToken]);

  if (!isValidToken) {
    return (
      <div className={`min-h-screen ${bg} ${text} flex items-center justify-center p-4`}>
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link
              to="/login"
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Login
            </Link>
          </div>

          {/* Error Message */}
          <div className={`${cardBg} rounded-2xl p-8 shadow-xl text-center`}>
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold mb-4">Invalid Reset Link</h1>
            <p className={`text-gray-400 mb-6`}>
              This password reset link is invalid or has expired.
            </p>
            
            <Link
              to="/forgot-password"
              className="w-full bg-[#00CC00] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#00AA00] transition-colors inline-block"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={`min-h-screen ${bg} ${text} flex items-center justify-center p-4`}>
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link
              to="/login"
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Login
            </Link>
          </div>

          {/* Success Message */}
          <div className={`${cardBg} rounded-2xl p-8 shadow-xl text-center`}>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold mb-4">Password Reset Successful!</h1>
            <p className={`text-gray-400 mb-6`}>
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            
            <div className="space-y-4">
              <p className={`text-sm ${text}`}>
                Redirecting to login page...
              </p>
              
              <Link
                to="/login"
                className="w-full bg-[#00CC00] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#00AA00] transition-colors inline-block"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${text} flex items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link
            to="/login"
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Login
          </Link>
        </div>

        {/* Main Form */}
        <div className={`${cardBg} rounded-2xl p-8 shadow-xl`}>
          <h1 className="text-3xl font-bold text-center mb-2">Reset Your Password</h1>
          <p className={`text-center ${text} mb-8`}>
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="New password"
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

            {/* Confirm Password Field */}
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                className={`w-full px-4 py-3 pr-12 ${inputBg} ${border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CC00] focus:border-transparent transition-colors`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Reset Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00CC00] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#00AA00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          {/* Password Requirements */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Password Requirements:</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• At least 6 characters long</li>
              <li>• Use a combination of letters, numbers, and symbols</li>
              <li>• Avoid common passwords</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 