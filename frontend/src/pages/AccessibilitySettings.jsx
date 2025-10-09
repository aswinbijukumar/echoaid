import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon,
  FireIcon,
  SparklesIcon,
  HeartIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  PuzzlePieceIcon,
  Cog6ToothIcon,
  EllipsisHorizontalIcon,
  HandRaisedIcon,
  ShieldCheckIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext.js';
import Sidebar from '../components/Sidebar';
import TopBarUserAvatar from '../components/TopBarUserAvatar';

export default function AccessibilitySettings() {
  const { darkMode } = useTheme();
  const { logout } = useAuth();
  const { themeMode, setTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';

  const SETTINGS_KEY = 'echoaid-user-settings';
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : {
      soundEffects: true,
      animations: true,
      motivationalMessages: true,
      signAnimationSpeed: 'normal',
      emailNotifications: true,
      pushNotifications: false,
      practiceReminders: true,
      profilePublic: false,
      showAchievements: true,
      dataSharing: false
    };
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    // Auto-save privacy to backend
    const token = localStorage.getItem('token');
    if (!token) return;
    // Save notifications
    fetch('http://localhost:5000/api/auth/notifications', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        emailNotifications: settings.emailNotifications,
        practiceReminders: settings.practiceReminders,
        pushNotifications: settings.pushNotifications
      })
    }).catch(() => {});
    fetch('http://localhost:5000/api/auth/privacy', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        profilePublic: settings.profilePublic,
        showAchievements: settings.showAchievements,
        dataSharing: settings.dataSharing
      })
    }).catch(() => {});
  }, [settings]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const requestPushPermission = async () => {
    try {
      if (!('Notification' in window)) return;
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setSettings(s => ({ ...s, pushNotifications: true }));
        // Optional: integrate with backend push registration here
      }
    } catch (e) {
      console.warn('Push permission request failed', e);
    }
  };

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Top Status Bar */}
      <div className={`${statusBarBg} border-b ${border} px-6 py-3 pl-64`}>
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <Cog6ToothIcon className="w-6 h-6 text-green-500" />
            <span className="font-semibold">ACCESSIBILITY SETTINGS</span>
          </div>
          <TopBarUserAvatar size={8} />
        </div>
      </div>

      <div className="flex">
        {/* Fixed Left Sidebar - Navigation */}
        <Sidebar handleLogout={handleLogout} />

        {/* Main Content Area - Duolingo-style Settings Layout */}
        <div className={`flex-1 ml-64 ${bg} min-h-screen flex justify-center items-start py-12`}>
          <div className="flex w-full max-w-5xl gap-8">
            {/* Left: Preferences & Security */}
            <div className="flex-1">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6">Preferences</h2>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">Lesson experience</h3>
                  <hr className="border-gray-700 mb-4" />
                  <Toggle label="Sound effects" checked={settings.soundEffects} onChange={(v) => setSettings(s => ({ ...s, soundEffects: v }))} />
                  <Toggle label="Animations" checked={settings.animations} onChange={(v) => setSettings(s => ({ ...s, animations: v }))} />
                  <Toggle label="Motivational messages" checked={settings.motivationalMessages} onChange={(v) => setSettings(s => ({ ...s, motivationalMessages: v }))} />
                  <div className="flex items-center justify-between py-3">
                    <span>Sign animation speed</span>
                    <select 
                      value={settings.signAnimationSpeed}
                      onChange={(e) => setSettings(s => ({ ...s, signAnimationSpeed: e.target.value }))}
                      className="bg-[#23272F] border border-gray-700 text-white rounded px-3 py-2 focus:outline-none"
                    >
                      <option value="slow">SLOW</option>
                      <option value="normal">NORMAL</option>
                      <option value="fast">FAST</option>
                    </select>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Appearance</h3>
                  <hr className="border-gray-700 mb-4" />
                  <div className="flex items-center justify-between py-3">
                    <span>Dark mode</span>
                    <select 
                      value={themeMode} 
                      onChange={handleThemeChange}
                      className="bg-[#23272F] border border-gray-700 text-white rounded px-3 py-2 focus:outline-none"
                    >
                      <option value="system">SYSTEM DEFAULT</option>
                      <option value="light">LIGHT</option>
                      <option value="dark">DARK</option>
                    </select>
                  </div>
                </div>
                {/* Notifications */}
                <div className="mt-10">
                  <h3 className="text-lg font-semibold mb-2">Notifications</h3>
                  <hr className="border-gray-700 mb-4" />
                  <Toggle label="Email notifications" checked={settings.emailNotifications} onChange={(v) => setSettings(s => ({ ...s, emailNotifications: v }))} />
                  <Toggle label="Practice reminders" checked={settings.practiceReminders} onChange={(v) => setSettings(s => ({ ...s, practiceReminders: v }))} />
                  <div className="flex items-center justify-between py-3">
                    <span>Push notifications</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSettings(s => ({ ...s, pushNotifications: !s.pushNotifications }))}
                        className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${settings.pushNotifications ? 'bg-blue-500' : 'bg-gray-600'}`}
                        aria-pressed={settings.pushNotifications}
                      >
                        <span className={`h-5 w-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${settings.pushNotifications ? 'translate-x-5' : ''}`} />
                      </button>
                      {!settings.pushNotifications && (
                        <button onClick={requestPushPermission} className="px-3 py-2 text-xs rounded bg-green-500 text-white hover:bg-green-600">Enable</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6">Security</h2>
                <h3 className="text-lg font-semibold mb-2">Two-factor authentication (2FA)</h3>
                <hr className="border-gray-700 mb-4" />
                <TwoFactorSettings />
              </div>

              {/* Privacy */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6">Privacy</h2>
                <div className="space-y-1">
                  <Toggle label="Make my profile public" checked={settings.profilePublic} onChange={(v) => setSettings(s => ({ ...s, profilePublic: v }))} />
                  <Toggle label="Show achievements on profile" checked={settings.showAchievements} onChange={(v) => setSettings(s => ({ ...s, showAchievements: v }))} />
                  <Toggle label="Share anonymized usage data" checked={settings.dataSharing} onChange={(v) => setSettings(s => ({ ...s, dataSharing: v }))} />
                </div>
              </div>
            </div>
            {/* Right: Account/Subscription/Support */}
            <div className="w-80 space-y-6">
              <div className={`p-6 rounded-xl border ${border}`}>
                <h3 className="font-bold text-lg mb-4">Account</h3>
                <div className="flex flex-col space-y-2">
                  <Link to="/accessibility" className="font-semibold text-green-400">Preferences</Link>
                  <Link to="/profile" className="hover:text-green-400">Profile</Link>
                  <Link to="/notifications" className="hover:text-green-400">Notifications</Link>
                  <Link to="/courses" className="hover:text-green-400">My Learning Paths</Link>
                  <Link to="/social" className="hover:text-green-400">Social accounts</Link>
                  <Link to="/privacy" className="hover:text-green-400">Privacy settings</Link>
                </div>
              </div>
              <div className={`p-6 rounded-xl border ${border}`}>
                <h3 className="font-bold text-lg mb-4">Subscription</h3>
                <div className="flex flex-col space-y-2">
                  <Link to="/subscription" className="hover:text-green-400">Choose a plan</Link>
                </div>
              </div>
              <div className={`p-6 rounded-xl border ${border}`}>
                <h3 className="font-bold text-lg mb-4">Support</h3>
                <div className="flex flex-col space-y-2">
                  <Link to="/help" className="hover:text-green-400">Help Center</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Subtle line between sidebar and content */}
        <div className="fixed left-64 top-0 h-screen w-px bg-gray-600 z-40"></div>
      </div>
    </div>
  );
}

// Toggle component for settings
function Toggle({ label, checked = true, onChange }) {
  const [enabled, setEnabled] = useState(checked);
  useEffect(() => { setEnabled(checked); }, [checked]);
  return (
    <div className="flex items-center justify-between py-3">
      <span>{label}</span>
      <button
        className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${enabled ? 'bg-blue-500' : 'bg-gray-600'}`}
        onClick={() => { const v = !enabled; setEnabled(v); onChange && onChange(v); }}
        aria-pressed={enabled}
      >
        <span
          className={`h-5 w-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${enabled ? 'translate-x-5' : ''}`}
        />
      </button>
    </div>
  );
}

// 2FA settings component
function TwoFactorSettings() {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [qr, setQr] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch current state via /auth/me
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(d => setEnabled(!!d?.user?.twoFactorEnabled))
    .catch(() => {});
  }, []);

  const startSetup = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const resp = await fetch('http://localhost:5000/api/auth/2fa/setup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.success || !data?.data?.qrDataUrl) {
        throw new Error(data.message || `Failed to start 2FA setup (${resp.status})`);
      }
      setQr(data.data.qrDataUrl);
      setSecret(data.data.base32);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmEnable = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const resp = await fetch('http://localhost:5000/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ token: code })
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.success) throw new Error(data.message || 'Failed to enable 2FA');
      setEnabled(true);
      setQr('');
      setSecret('');
      setCode('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const disable = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const resp = await fetch('http://localhost:5000/api/auth/2fa/disable', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.success) throw new Error(data.message || 'Failed to disable 2FA');
      setEnabled(false);
      setQr('');
      setSecret('');
      setCode('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-4 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-semibold">Authenticator app (TOTP)</div>
          <div className="text-sm text-gray-400">Adds a 6-digit code at sign-in</div>
        </div>
        {enabled ? (
          <button onClick={disable} disabled={loading} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">Disable</button>
        ) : (
          <button onClick={startSetup} disabled={loading} className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-50">{loading ? 'Preparing…' : 'Set up'}</button>
        )}
      </div>
      {error && (
        <div className="mb-3 text-sm text-red-400">{error}</div>
      )}
      {!enabled && qr && (
        <div className="space-y-3">
          <div className="flex flex-col items-center">
            <img src={qr} alt="2FA QR" className="w-44 h-44 bg-white p-2 rounded" />
            <div className="text-xs text-gray-400 mt-2">Scan with Google Authenticator or Authy</div>
            <div className="text-xs text-gray-500 mt-2 break-all">Secret: {secret}</div>
          </div>
          <div className="flex items-center gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter 6-digit code" className="flex-1 px-3 py-2 rounded border border-gray-600 bg-transparent" />
            <button onClick={confirmEnable} disabled={loading || code.length < 6} className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50">Confirm</button>
          </div>
        </div>
      )}
      {enabled && (
        <div className="text-green-400 text-sm">Two-factor authentication is enabled.</div>
      )}
    </div>
  );
}
