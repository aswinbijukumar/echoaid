import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import PasswordStrength from '../components/PasswordStrength';

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
  const [validationErrors, setValidationErrors] = useState({});
  
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
    setValidationErrors({});
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/\d/.test(password)) errors.push('One number');
    if (!/[@$!%*?&]/.test(password)) errors.push('One special character (@$!%*?&)');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setValidationErrors({});

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      setValidationErrors({ password: passwordErrors.join(', ') });
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
        // Handle validation errors from server
        if (data.errors) {
          const errors = {};
          data.errors.forEach(err => {
            errors[err.field] = err.message;
          });
          setValidationErrors(errors);
          throw new Error('Please fix the validation errors');
        }
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
                className={`w-full px-4 py-3 pr-12 ${inputBg} ${border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CC00] focus:border-transparent transition-colors ${
                  validationErrors.password ? 'border-red-500' : ''
                }`}
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

            {/* Password Strength Indicator */}
            <PasswordStrength password={formData.password} />

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

            {/* Validation Errors */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="text-red-400 text-sm text-center">
                {Object.entries(validationErrors).map(([field, message]) => (
                  <p key={field}>{message}</p>
                ))}
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
              <li>• At least 8 characters long</li>
              <li>• Use a combination of uppercase and lowercase letters</li>
              <li>• Include at least one number</li>
              <li>• Include at least one special character (@$!%*?&)</li>
              <li>• Avoid common passwords</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 