import { useTheme } from '../hooks/useTheme';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function SimplePrivacy() {
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
              <ShieldCheckIcon className="w-6 h-6 mr-2 text-[#00CC00]" />
              <h1 className="text-2xl font-bold">Privacy Policy</h1>
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
              This Privacy Policy explains how EchoAid collects, uses, and protects your information when you use our sign language learning platform.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-[#00CC00]">Information We Collect</h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-[#00CC00]">Personal Information</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                We collect information you provide directly to us:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Name and email address (for account creation)</li>
                <li>Profile information and preferences</li>
                <li>Learning progress and achievements</li>
                <li>Communication with our support team</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-[#00CC00]">Usage Information</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                We automatically collect certain information:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Device information (type, operating system)</li>
                <li>Usage patterns and learning behavior</li>
                <li>Performance data and error logs</li>
                <li>Camera and microphone data (for sign recognition)</li>
              </ul>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-[#00CC00]">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Provide and improve our learning services</li>
              <li>Personalize your learning experience</li>
              <li>Track your progress and achievements</li>
              <li>Provide customer support</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-[#00CC00]">Data Security</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We implement appropriate security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication</li>
              <li>Secure data storage and backup procedures</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-[#00CC00]">Your Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your data</li>
              <li>Object to certain processing activities</li>
              <li>Data portability (receive your data in a structured format)</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-[#00CC00]">Contact Us</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-300"><strong>Email:</strong> privacy@echoaid.com</p>
              <p className="text-gray-300"><strong>Support:</strong> For data-related requests, use our privacy request form</p>
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