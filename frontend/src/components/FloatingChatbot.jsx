import { useState, useMemo } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import SignLearningChatbot from './SignLearningChatbot';

const FloatingChatbot = ({ detectedSign, signDictionary }) => {
  const [isOpen, setIsOpen] = useState(false);

  const badge = useMemo(() => {
    if (!detectedSign?.confidence) return null;
    const c = detectedSign.confidence;
    if (c >= 90) return '🏆';
    if (c >= 70) return '⭐';
    if (c >= 50) return '👍';
    return '📚';
  }, [detectedSign]);

  return (
    <div className="fixed bottom-20 right-8 md:bottom-10 md:right-14 z-50">
      {/* Panel */}
      {isOpen && (
        <div className="mb-3 w-[420px] max-w-[95vw] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 animate-fade-in-up">
          <div className="p-3">
            <SignLearningChatbot
              detectedSign={detectedSign}
              isOpen={true}
              onClose={() => setIsOpen(false)}
              signDictionary={signDictionary}
            />
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Open Sign Learning Assistant"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
        {badge && (
          <span className="absolute -top-1 -right-1 text-xs bg-white text-blue-700 rounded-full px-1.5 py-0.5 border border-blue-200">
            {badge}
          </span>
        )}
      </button>
    </div>
  );
};

export default FloatingChatbot;

