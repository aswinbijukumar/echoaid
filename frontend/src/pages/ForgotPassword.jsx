import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { darkMode } = useTheme();
  const { forgotPassword } = useAuth();

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const inputBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`min-h-screen ${bg} ${text} flex items-center justify-center p-4`}>
        <div
          className="w-full max-w-md"
        >
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
              <EnvelopeIcon className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold mb-4">Check your email</h1>
            <p className={`text-gray-400 mb-6`}>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            
            <div className="space-y-4">
              <p className={`text-sm ${text}`}>
                Didn't receive the email? Check your spam folder or try again.
              </p>
              
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="w-full bg-[#00CC00] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#00AA00] transition-colors"
              >
                Send another email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${text} flex items-center justify-center p-4`}>
      <div
        className="w-full max-w-md"
      >
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
          <h1 className="text-3xl font-bold text-center mb-2">Forgot your password?</h1>
          <p className={`text-center ${text} mb-8`}>
            No worries! Enter your email and we'll send you reset instructions.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="Enter your email"
                className={`w-full px-4 py-3 ${inputBg} ${border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CC00] focus:border-transparent transition-colors`}
                required
              />
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
              {isLoading ? 'Sending...' : 'Reset Password'}
            </button>
          </form>

          {/* Additional Help */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${text}`}>
              Remember your password?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 