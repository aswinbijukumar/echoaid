import { useEffect, useState, useCallback } from 'react';
import { ENV_CONFIG } from '../config/prettyConfig.js';

export function useUserStats() {
  const [stats, setStats] = useState({
    streak: 0,
    totalXP: 0,
    level: 1,
    xpToNextLevel: 100,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data?.success) {
        const ls = data.user?.learningStats || {};
        const totalXP = ls.totalXP || 0;
        // Use backend-provided level if available, otherwise fallback (sync with backend 1000xp rule)
        const level = ls.level || Math.floor(totalXP / 1000) + 1;
        // recalculate xpToNextLevel based on 1000xp tiers if not provided
        const xpToNextLevel = ls.xpToNextLevel !== undefined ? ls.xpToNextLevel : Math.max(0, (level * 1000) - totalXP);
        setStats({
          streak: ls.streak || 0,
          totalXP,
          level,
          xpToNextLevel,
        });
        setError(null);
      } else {
        setError('Failed to fetch user stats');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refreshUserStats: fetchStats };
}


