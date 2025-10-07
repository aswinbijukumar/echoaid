import { useEffect, useState, useCallback } from 'react';

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
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data?.success) {
        const ls = data.user?.learningStats || {};
        const totalXP = ls.totalXP || 0;
        const level = ls.level || Math.floor(totalXP / 1000) + 1;
        const xpToNextLevel = ls.xpToNextLevel ?? Math.max(0, (Math.floor(totalXP / 1000) + 1) * 1000 - totalXP);
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

