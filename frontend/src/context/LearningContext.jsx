import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContextConstants';
import { useUserStats } from '../hooks/useUserStats';
import { API_BASE_URL } from '../constants/api';

const LearningContext = createContext();

export const useLearning = () => {
    const context = useContext(LearningContext);
    if (!context) {
        throw new Error('useLearning must be used within a LearningProvider');
    }
    return context;
};

export const LearningProvider = ({ children }) => {
    const { user } = useAuth();
    const { stats, fetchStats } = useUserStats(); // Use existing stats hook for XP/Streak

    const [learningPath, setLearningPath] = useState([]);
    const [userProgress, setUserProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [devMode, setDevMode] = useState(() => {
        return localStorage.getItem('devMode') === 'true';
    });

    const toggleDevMode = useCallback(() => {
        setDevMode(prev => {
            const newValue = !prev;
            localStorage.setItem('devMode', String(newValue));
            // Trigger refresh to update unlocks
            setTimeout(() => fetchLearningData(), 0);
            return newValue;
        });
    }, []);

    // Derived state for Practice/Quiz
    const [knownSigns, setKnownSigns] = useState([]);
    const [unlockedUnits, setUnlockedUnits] = useState([]);

    // Fetch all learning content and user progress
    const fetchLearningData = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Parallel fetch: Skills (static content), Progress (user state), and Mastery Quizzes
            const [skillsRes, progressRes, quizRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/skills`, { headers }),
                fetch(`${API_BASE_URL}/api/skills/progress`, { headers }),
                fetch(`${API_BASE_URL}/api/quiz?limit=100`, { headers }),
                // Proactive warm-up for Python AI service
                fetch(`${API_BASE_URL}/api/practice/warmup`, { headers }).catch(() => {}) 
            ]);

            console.log('🔄 Fetching Data');

            if (!skillsRes.ok) throw new Error('Failed to fetch learning content');

            const skillsData = await skillsRes.json();
            const progressData = progressRes.ok ? await progressRes.json() : { data: {} };
            const quizData = quizRes.ok ? await quizRes.json() : { data: [] };

            // Backend's getSkills already merges user progress
            const skills = skillsData.data || [];
            const globalProgress = progressData.data || {};
            const masteryQuizzes = quizData.data || [];

            // 1. Process standard skills
            let mergedPath = skills.map(skill => {
                return {
                    ...skill,
                    type: 'skill', // Explicit type
                    isCompleted: skill.isCompleted || false,
                    isRelearning: skill.isRelearning || false,
                    isUnlocked: devMode || skill.isUnlocked || (skill.level === 0 && skill.order === 1), // Unlock first item of Level 0
                    progress: skill.progress || 0,
                    userScore: skill.userScore || 0
                };
            }).sort((a, b) => {
                const levelDiff = (a.level || 0) - (b.level || 0);
                if (levelDiff !== 0) return levelDiff;
                return (a.order || 0) - (b.order || 0);
            });

            // 2. Inject Mastery Quizzes at the end of their respective levels
            // We group skills by level to find the "end" of each level
            const levelMaxOrders = {};
            mergedPath.forEach(item => {
                if (item.level) {
                    levelMaxOrders[item.level] = Math.max(levelMaxOrders[item.level] || 0, item.order || 0);
                }
            });

            const finalPath = [];
            let currentLevel = 0;

            // Re-sort path to ensure strictly Level -> Order
            mergedPath.sort((a, b) => (a.level - b.level) || (a.order - b.order));

            mergedPath.forEach(item => {
                finalPath.push(item);
                currentLevel = item.level;

                // Check if this is the last item of the level
                if (item.order === levelMaxOrders[item.level]) {
                    // Look for a Mastery/Challenge Quiz for this level
                    const levelQuiz = masteryQuizzes.find(q =>
                        q.level === item.level &&
                        (q.quizType === 'mastery' || /mastery|challenge|check/i.test(q.title))
                    );

                    if (levelQuiz && item.level !== 0 && !/level\s*0\s*mastery/i.test(levelQuiz.title)) {
                        const isLevelComplete = mergedPath.filter(s => s.level === item.level).every(s => s.isCompleted);
                        // Check if user has passed this quiz from masteryQuizzes metadata (backend handles this)
                        const quizStatus = levelQuiz.userStatus || {};
                        const isQuizPassed = quizStatus.passed || false;

                        const quizNode = {
                            _id: levelQuiz._id,
                            id: `quiz-${levelQuiz._id}`,
                            title: levelQuiz.title,
                            description: 'Prove your mastery to earn a certificate',
                            type: 'quiz',
                            level: item.level,
                            order: (item.order || 0) + 1,
                            paramId: levelQuiz._id,
                            isUnlocked: isLevelComplete || (quizStatus.attempts >= (levelQuiz.maxAttempts || 3)),
                            isCompleted: isQuizPassed,
                            isRelearning: quizStatus.attempts >= (levelQuiz.maxAttempts || 3) && !isQuizPassed,
                            icon: 'TrophyIcon'
                        };
                        finalPath.push(quizNode);

                        // If Quiz is passed (need to check attempts), inject Certificate
                        // For now simplified: if we had attempt data we'd unlock certificate
                    }
                }
            });

            setLearningPath(finalPath.length ? finalPath : mergedPath);
            setUserProgress(globalProgress);

            // Calculate known signs (completed skills)
            const learned = mergedPath
                .filter(s => s.isCompleted)
                .flatMap(s => s.signs || [])
                .filter(sign => sign);

            setKnownSigns(learned);
            setUnlockedUnits(mergedPath.filter(u => u.isUnlocked));

        } catch (err) {
            console.error('LearningContext Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Initial load
    useEffect(() => {
        fetchLearningData();
    }, [fetchLearningData]);

    // Action: Complete a Lesson/Module
    const completeLesson = async (skillId, score, xpEarned) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/skills/${skillId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ score, xp: xpEarned })
            });

            if (!res.ok) throw new Error('Failed to save progress');

            const data = await res.json();

            // Optimistic update or refetch
            await fetchLearningData(); // simpler to refetch for now to get next unlocks
            await fetchStats(); // Refresh header stats (XP, streak)

            return data;
        } catch (err) {
            console.error('Complete Lesson Error:', err);
            throw err;
        }
    };

    const value = {
        learningPath,
        userProgress,
        knownSigns,
        unlockedUnits,
        loading,
        error,
        refresh: fetchLearningData,
        completeLesson,
        devMode,
        toggleDevMode
    };

    return (
        <LearningContext.Provider value={value}>
            {children}
        </LearningContext.Provider>
    );
};
