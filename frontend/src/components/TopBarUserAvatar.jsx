import { useState } from 'react';
import { UserCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContextConstants';
import SessionSettings from './SessionSettings';

export default function TopBarUserAvatar({ showName = true, size = 8, showSessionSettings = true }) {
  const { user } = useAuth();
  const [showSessionSettingsModal, setShowSessionSettingsModal] = useState(false);
  const pixelSize = `w-${size} h-${size}`;
  const avatarUrl = user?.avatar && user.avatar.trim() !== '' ? user.avatar : null;

  return (
    <>
      <div className="flex items-center space-x-2">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user?.name || 'User'}
            className={`${pixelSize} rounded-full object-cover border border-gray-600/40`}
            referrerPolicy="no-referrer"
          />
        ) : (
          <UserCircleIcon className={`${pixelSize} text-gray-300`} />
        )}
        {showName && <span className="font-semibold">{user?.name || 'User'}</span>}
        
        {showSessionSettings && (
          <button
            onClick={() => setShowSessionSettingsModal(true)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Session Settings"
          >
            <Cog6ToothIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <SessionSettings 
        isOpen={showSessionSettingsModal}
        onClose={() => setShowSessionSettingsModal(false)}
      />
    </>
  );
}

