import { UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export default function TopBarUserAvatar({ showName = true, size = 8 }) {
  const { user } = useAuth();
  const pixelSize = `w-${size} h-${size}`;
  const avatarUrl = user?.avatar && user.avatar.trim() !== '' ? user.avatar : null;

  return (
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
    </div>
  );
}

