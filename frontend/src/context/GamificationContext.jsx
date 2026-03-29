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

    // Initial sync
    useEffect(() => {
        if (!isInitialized && stats.level > 0) {
            setPrevLevel(stats.level);
            setIsInitialized(true);
        }
    }, [stats.level, isInitialized]);

    // Check for level up
    useEffect(() => {
        if (isInitialized && stats.level > prevLevel) {
            setLeveledUpTo(stats.level);
            setIsLevelModalOpen(true);
        }
        if (stats.level > 0) {
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
