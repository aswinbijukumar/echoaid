import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUserStats } from '../hooks/useUserStats';
import LevelUpModal from '../components/LevelUpModal';

const GamificationContext = createContext();

export function useGamification() {
    return useContext(GamificationContext);
}

export function GamificationProvider({ children }) {
    const { stats, refreshUserStats } = useUserStats();
    const [isInitialized, setIsInitialized] = useState(false);
    const [prevLevel, setPrevLevel] = useState(stats.level);
    const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
    const [leveledUpTo, setLeveledUpTo] = useState(1);

    // Initial sync - store prevLevel in sessionStorage so it persists across re-renders
    useEffect(() => {
        if (!isInitialized && stats.level > 0) {
            // On first load, read the saved level from sessionStorage
            const savedLevel = parseInt(sessionStorage.getItem('echoaid_user_level') || '0', 10);
            if (savedLevel === 0) {
                // First ever visit this session, just save the current level
                sessionStorage.setItem('echoaid_user_level', String(stats.level));
                setPrevLevel(stats.level);
            } else {
                setPrevLevel(savedLevel);
            }
            setIsInitialized(true);
        }
    }, [stats.level, isInitialized]);

    // Check for level up - only after initialization
    useEffect(() => {
        if (isInitialized && stats.level > 0 && stats.level > prevLevel) {
            setLeveledUpTo(stats.level);
            setIsLevelModalOpen(true);
            // Save new level to sessionStorage
            sessionStorage.setItem('echoaid_user_level', String(stats.level));
            setPrevLevel(stats.level);
        }
    }, [stats.level, isInitialized, prevLevel]);

    const closeLevelModal = () => {
        setIsLevelModalOpen(false);
    };

    // Expose backend call wrapper if needed
    const addXP = async (amount) => {
        // In a real implementation, this would call an API. 
        // For now, we assume the component calling this also triggers the API update 
        // or we can implement a global 'addXP' function here.
        // But typically, XP is added on the server side after an action.
        // So we just rely on refreshUserStats.
        await refreshUserStats();
    };

    return (
        <GamificationContext.Provider value={{
            level: stats.level,
            xp: stats.totalXP,
            addXP
        }}>
            {children}
            <LevelUpModal
                isOpen={isLevelModalOpen}
                level={leveledUpTo}
                onClose={closeLevelModal}
            />
        </GamificationContext.Provider>
    );
}
