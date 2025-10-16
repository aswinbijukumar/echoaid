# EchoAid Session Management System

## 🚀 Overview

The EchoAid application now features a comprehensive session management system that provides:

- **Automatic token refresh** in the background
- **Activity tracking** to prevent session expiration during active use
- **Session warnings** before expiration
- **Multi-device session management** with device tracking
- **Real-time session status** across all components
- **Secure session cleanup** on logout

## 🏗️ Architecture

### Core Components

1. **ModernSessionManager** (`utils/modernSessionManager.js`)
   - Central session management logic
   - Background token refresh
   - Activity tracking
   - Session state management

2. **useSessionManager Hook** (`hooks/useSessionManager.js`)
   - React hook for session management
   - Provides session state to components
   - Handles session refresh and warnings

3. **ModernSessionTimeout** (`components/ModernSessionTimeout.jsx`)
   - Session warning modal
   - User-friendly session extension
   - Automatic logout on expiration

4. **SessionInstances** (`components/SessionInstances.jsx`)
   - Multi-device session management
   - Device tracking and revocation
   - Security monitoring

## 🔧 Implementation

### Session Manager Configuration

```javascript
// Session timeouts (configurable)
SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
REFRESH_THRESHOLD = 30 * 60 * 1000; // 30 minutes before expiry
INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours of inactivity
WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
```

### Using the Session Manager Hook

```javascript
import { useSessionManager } from '../hooks/useSessionManager';

function MyComponent() {
  const { 
    sessionInfo, 
    isRefreshing, 
    showWarning, 
    refreshSession, 
    formatTimeUntilExpiry 
  } = useSessionManager();

  return (
    <div>
      <p>Session valid: {sessionInfo?.isValid ? 'Yes' : 'No'}</p>
      <p>Time until expiry: {formatTimeUntilExpiry(sessionInfo?.timeUntilExpiry)}</p>
      <button onClick={refreshSession} disabled={isRefreshing}>
        {isRefreshing ? 'Refreshing...' : 'Refresh Session'}
      </button>
    </div>
  );
}
```

### Profile Page Integration

The profile page now features:

- **Tabbed Interface**: Overview, Security & Sessions, Subscription, Achievements
- **Real-time Session Status**: Current session information with refresh capability
- **Session Management**: View and manage active sessions across devices
- **Activity Tracking**: Monitor session activity and expiry times

## 🔒 Security Features

### Session Security

1. **Automatic Token Refresh**
   - Tokens refresh 30 minutes before expiry
   - Background refresh without user interruption
   - Fallback to logout on refresh failure

2. **Activity Tracking**
   - Monitors user activity (mouse, keyboard, touch)
   - Extends session on user interaction
   - Prevents session expiration during active use

3. **Multi-Device Management**
   - Track sessions across different devices
   - Revoke suspicious or unwanted sessions
   - Device fingerprinting for security

4. **Session Warnings**
   - 5-minute warning before session expiry
   - User-friendly extension options
   - Automatic logout on expiration

### Session State Management

```javascript
sessionState = {
  isValid: boolean,           // Token is valid and not expired
  timeUntilExpiry: number,    // Milliseconds until token expires
  timeSinceActivity: number,  // Milliseconds since last activity
  isActive: boolean,          // User is actively using the app
  willRefreshSoon: boolean,   // Token will refresh soon
  needsWarning: boolean       // Session needs warning shown
}
```

## 🎯 User Experience

### Seamless Session Management

- **No Interruptions**: Background token refresh
- **Smart Warnings**: Only show warnings when necessary
- **Activity Awareness**: Sessions extend automatically during use
- **Multi-Device Support**: Manage sessions across all devices

### Profile Page Features

1. **Overview Tab**
   - Learning statistics
   - Quick action buttons
   - Achievement progress

2. **Security & Sessions Tab**
   - Current session status
   - Session refresh controls
   - Active sessions management
   - Device tracking

3. **Subscription Tab**
   - Subscription status
   - Billing information
   - Plan management

4. **Achievements Tab**
   - Unlocked achievements
   - Progress tracking
   - Achievement descriptions

## 🔧 Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d
```

### Session Manager Initialization

The session manager is automatically initialized in the `useSessionManager` hook and provides:

- Session state updates every 30 seconds
- Activity tracking on user interactions
- Automatic token refresh
- Session warning management

## 🧪 Testing

### Session Management Testing

1. **Token Refresh Testing**
   ```javascript
   // Test automatic token refresh
   // Wait for token to approach expiry
   // Verify background refresh occurs
   ```

2. **Activity Tracking Testing**
   ```javascript
   // Test activity detection
   // Simulate user interactions
   // Verify session extension
   ```

3. **Session Warning Testing**
   ```javascript
   // Test warning display
   // Verify countdown timer
   // Test session extension
   ```

4. **Multi-Device Testing**
   ```javascript
   // Test session tracking
   // Verify device detection
   // Test session revocation
   ```

## 🚀 Benefits

### For Users

- **Seamless Experience**: No unexpected logouts during active use
- **Security Awareness**: Clear visibility into active sessions
- **Multi-Device Support**: Use the app across multiple devices safely
- **Session Control**: Manage and revoke sessions as needed

### For Developers

- **Centralized Management**: Single source of truth for session state
- **Easy Integration**: Simple hook-based API for components
- **Automatic Handling**: Background processes handle session maintenance
- **Extensible Design**: Easy to add new session features

## 🔍 Monitoring

### Session Analytics

The system provides insights into:

- Session duration and patterns
- Device usage statistics
- Security events and anomalies
- User activity patterns

### Debug Information

```javascript
// Enable debug logging
console.log('Session state:', modernSessionManager.getSessionState());
console.log('Session info:', modernSessionManager.getSessionInfo());
```

## 🛠️ Troubleshooting

### Common Issues

1. **Session Not Refreshing**
   - Check JWT configuration
   - Verify refresh token validity
   - Check network connectivity

2. **Activity Not Detected**
   - Verify event listeners are attached
   - Check for JavaScript errors
   - Test user interaction events

3. **Session Warnings Not Showing**
   - Check warning threshold configuration
   - Verify session state updates
   - Test warning callback functions

### Debug Steps

1. Check browser console for session manager logs
2. Verify session state in React DevTools
3. Test session refresh manually
4. Check network requests for token refresh

The session management system is now fully integrated and provides a secure, user-friendly experience across all components of the EchoAid application!