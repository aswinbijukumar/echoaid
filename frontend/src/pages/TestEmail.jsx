import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

export default function TestEmail() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { darkMode } = useTheme();

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const inputBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';

  const handleTestEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send test email');
      }

      setMessage('Test email sent successfully! Check your inbox.');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${bg} ${text} flex items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        <div className={`${cardBg} rounded-2xl p-8 shadow-xl`}>
          <h1 className="text-2xl font-bold text-center mb-8">Test Email Configuration</h1>
          
          <form onSubmit={handleTestEmail} className="space-y-6">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={`w-full px-4 py-3 ${inputBg} ${border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CC00] focus:border-transparent transition-colors`}
                required
              />
            </div>

            {message && (
              <div className={`text-sm text-center p-3 rounded-lg ${
                message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00CC00] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#00AA00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send Test Email'}
            </button>
          </form>

          <div className="mt-6 text-xs text-gray-400 text-center">
            <p>This will help verify if email configuration is working properly.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 