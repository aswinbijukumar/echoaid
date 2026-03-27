// Role-based redirection utility
export const getRoleBasedRedirect = (userRole, currentPath = '') => {
  // If user is already on the correct dashboard, don't redirect
  const roleDashboards = {
    'admin': '/admin',
    'user': '/learn'
  };

  const correctDashboard = roleDashboards[userRole] || '/learn';
  
  // If user is on /dashboard, always redirect to their role-specific dashboard
  if (currentPath === '/dashboard') {
    return correctDashboard;
  }

  // If user is already on their correct dashboard, don't redirect
  if (currentPath === correctDashboard) {
    return null;
  }

  // Don't redirect from subscription page - allow access
  if (currentPath === '/subscription') {
    return null;
  }

  // Don't redirect from other allowed pages (including subpaths like /quiz/:id)
  const allowedPages = ['/profile', '/dictionary', '/quiz', '/practice', '/accessibility', '/subscription', '/support', '/messages', '/admin/messages'];
  if (allowedPages.some(prefix => currentPath === prefix || currentPath.startsWith(prefix + '/'))) {
    return null;
  }

  return correctDashboard;
};

export const isAuthorizedForRoute = (userRole, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true; // No role restrictions
  }
  return allowedRoles.includes(userRole);
};

export const getRoleDisplayName = (role) => {
  const roleNames = {
    'admin': 'Administrator',
    'user': 'User'
  };
  return roleNames[role] || 'User';
};

export const getRolePermissions = (role) => {
  const permissions = {
    'admin': {
      manageUsers: true,
      manageContent: true,
      manageSystem: false,
      viewAnalytics: true,
      moderateForum: true
    },
    'user': {
      manageUsers: false,
      manageContent: false,
      manageSystem: false,
      viewAnalytics: false,
      moderateForum: false
    }
  };
  return permissions[role] || permissions.user;
};