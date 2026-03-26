import { useTheme } from '../hooks/useTheme';
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function SimpleTerms() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Header */}
      <div className="border-b border-gray-600">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back
            </button>
            <div className="flex items-center">
              <DocumentTextIcon className="w-6 h-6 mr-2 text-[#00CC00]" />
              <h1 className="text-2xl font-bold">Terms of Service</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className={`${cardBg} rounded-2xl p-8 shadow-xl`}>
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-[#00CC00]">Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              Welcome to EchoAid! These Terms of Service govern your use of our sign language learning platform.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-[#00CC00]">Our Services</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              EchoAid provides an interactive sign language learning platform featuring:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Real-time sign language recognition</li>
              <li>Interactive learning modules</li>
              <li>Progress tracking and assessments</li>
              <li>AI-powered coaching and feedback</li>
              <li>Community features and support</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-[#00CC00]">User Accounts</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              To access certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-[#00CC00]">Acceptable Use</h2>
            <p className="text-gray-300 leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Use automated systems to access the service</li>
              <li>Share your account credentials with others</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-[#00CC00]">Contact Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have questions about these Terms, please contact us at:
            </p>
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-300"><strong>Email:</strong> legal@echoaid.com</p>
              <p className="text-gray-300"><strong>Support:</strong> Visit our help center for assistance</p>
            </div>
          </div>

          <div className="border-t border-gray-600 pt-6">
            <p className="text-sm text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
