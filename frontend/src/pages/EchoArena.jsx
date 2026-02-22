import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BoltIcon,
    FireIcon,
    TrophyIcon,
    ClockIcon,
    ArrowLeftIcon,
    PlayIcon,
    CheckCircleIcon,
    XCircleIcon,
    SparklesIcon
} from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContextConstants';
import { useTheme } from '../hooks/useTheme';
import StreakFlame from '../components/StreakFlame';
import { API_BASE_URL } from '../constants/api';
// import confetti from 'canvas-confetti'; // Assuming confetti is available, or use CSS keyframes

export default function EchoArena() {
    const { darkMode } = useTheme();
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const [arenaQuizzes, setArenaQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gameState, setGameState] = useState('lobby'); // lobby, playing, result
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isAnswered, setIsAnswered] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [gameStats, setGameStats] = useState({ totalXP: 0, accuracy: 0 });

    // Effects & Music could go here (optional)

    // Fetch Arena Quizzes
    useEffect(() => {
        const fetchArenaQuizzes = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/api/quiz?category=arena&isActive=true`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setArenaQuizzes(data.data);
                }
            } catch (error) {
                console.error("Failed to load Arena quizzes", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArenaQuizzes();
    }, [token]);

    // Timer Logic
    useEffect(() => {
        if (gameState === 'playing' && !isAnswered && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !isAnswered && gameState === 'playing') {
            handleTimeUp();
        }
    }, [gameState, isAnswered, timeLeft]);

    const handleTimeUp = () => {
        setIsAnswered(true);
        setIsCorrect(false);
        setStreak(0);
        setTimeout(nextQuestion, 2000);
    };

    const startGame = (quiz) => {
        setCurrentQuiz(quiz);
        setCurrentQuestionIndex(0);
        setScore(0);
        setStreak(0); // Optional: Inherit daily streak? No, per-game streak is more fun here.
        setTimeLeft(quiz.timeLimit > 0 ? quiz.timeLimit * 60 : 15); // Use 15s per question as default for "Speed" feel if quiz limit is weird
        setGameState('playing');
        setIsAnswered(false);
        setSelectedOption(null);
    };

    const handleAnswer = (optionIndex) => {
        if (isAnswered) return;

        setIsAnswered(true);
        setSelectedOption(optionIndex);

        const currentQuestion = currentQuiz.questions[currentQuestionIndex];
        const correct = currentQuestion.options[optionIndex].isCorrect;

        setIsCorrect(correct);

        if (correct) {
            setScore(prev => prev + (currentQuestion.points || 10) + (streak * 5));
            setStreak(prev => prev + 1);
            // triggerConfetti(); 
        } else {
            setStreak(0);
        }

        setTimeout(nextQuestion, 2000);
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < currentQuiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setIsAnswered(false);
            setSelectedOption(null);
            setIsCorrect(null);
            setTimeLeft(15); // Reset timer per question for Arena Mode (Speed Drill style) or reuse quiz timeLimit
        } else {
            endGame();
        }
    };

    const endGame = async () => {
        setGameState('result');
        // Save results to backend
        try {
            const percentage = Math.round((score / (currentQuiz.questions.reduce((a, b) => a + (b.points || 10), 0) + (currentQuiz.questions.length * 5))) * 100); // Rough calc
            await fetch(`${API_BASE_URL}/api/quiz/${currentQuiz._id}/attempt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    answers: [], // We simplified tracking for this demo, usually you'd track every answer
                    score: score,
                    percentage: Math.min(100, percentage), // Cap at 100
                    timeSpent: 60, // Dummy time
                    isCompleted: true
                })
            });
        } catch (e) {
            console.error("Failed to save score", e);
        }
    };

    // --- RENDERERS ---

    if (loading) return (
        <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-black' : 'bg-gray-100'}`}>
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
    );

    // LOBBY VIEW
    if (gameState === 'lobby') {
        return (
            <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} p-6 transition-colors duration-500`}>
                {/* Header */}
                <div className="max-w-7xl mx-auto mb-12 flex justify-between items-center">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-500 hover:text-white transition-colors">
                        <ArrowLeftIcon className="w-6 h-6 mr-2" /> Back
                    </button>
                    <div className="flex items-center space-x-4">
                        <StreakFlame streak={user?.learningStats?.streak || 0} />
                    </div>
                </div>

                <div className="max-w-5xl mx-auto text-center">
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-6 drop-shadow-xl animate-pulse">
                        ECHO ARENA
                    </h1>
                    <p className="text-xl text-gray-400 mb-12">Prove your mastery in the ultimate speed challenge.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {arenaQuizzes.length > 0 ? arenaQuizzes.map(quiz => (
                            <div key={quiz._id} className="relative group perspective-1000">
                                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                                <div className={`relative p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} ring-1 ring-gray-900/5 rounded-2xl leading-none flex items-top justify-start space-x-6 h-full flex-col items-center text-center transform group-hover:scale-105 transition-transform duration-300`}>
                                    <BoltIcon className="w-12 h-12 text-yellow-500 mb-4" />
                                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>{quiz.title}</h3>
                                    <p className="text-sm text-gray-500 mb-6">{quiz.description}</p>
                                    <div className="flex items-center space-x-4 mb-6 text-xs font-mono text-gray-400">
                                        <span className="flex items-center"><ClockIcon className="w-4 h-4 mr-1" /> Speed: Fast</span>
                                        <span className="flex items-center"><TrophyIcon className="w-4 h-4 mr-1" /> Rank: {quiz.difficulty}</span>
                                    </div>
                                    <button
                                        onClick={() => startGame(quiz)}
                                        className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-yellow-500/50 transition-all"
                                    >
                                        ENTER ARENA
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center text-gray-500">
                                <TrophyIcon className="w-24 h-24 mx-auto mb-4 opacity-20" />
                                <p className="text-xl">No Arena Challenges Active.</p>
                                <p className="text-sm">Check back later or ask an Admin to open the gates!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // GAME VIEW
    if (gameState === 'playing' && currentQuiz) {
        const currentQ = currentQuiz.questions[currentQuestionIndex];
        return (
            <div className="min-h-screen bg-black overflow-hidden relative flex flex-col items-center justify-center p-4">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black z-0"></div>

                {/* HUD */}
                <div className="absolute top-6 w-full max-w-6xl flex justify-between items-center z-10 px-8">
                    <div className="text-white font-mono text-2xl flex items-center">
                        <span className="text-yellow-500 mr-2">SCORE:</span> {score}
                    </div>
                    <div className="flex flex-col items-center">
                        <div className={`text-5xl font-black ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {timeLeft}
                        </div>
                        <div className="text-xs text-gray-500 tracking-widest">SECONDS</div>
                    </div>
                    <div className="flex items-center">
                        <FireIcon className={`w-8 h-8 ${streak > 2 ? 'text-orange-500 animate-bounce' : 'text-gray-600'}`} />
                        <span className="text-2xl font-bold text-white ml-2">x{streak}</span>
                    </div>
                </div>

                {/* Question Stage */}
                <div className="relative z-10 w-full max-w-4xl mb-12 perspective-1000">
                    <div className="bg-gray-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center shadow-2xl transform rotate-x-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
                            {currentQ.question}
                        </h2>
                        {currentQ.image && (
                            <img src={currentQ.image} alt="Visual Clue" className="h-48 mx-auto rounded-lg border-2 border-yellow-500/50 shadow-lg mb-6" />
                        )}
                    </div>
                </div>

                {/* Answer Grid */}
                <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentQ.options.map((option, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrectOption = option.isCorrect;

                        let btnClass = "bg-gray-800/60 border-gray-700 hover:bg-white/10 text-white"; // default
                        if (isAnswered) {
                            if (isCorrectOption) btnClass = "bg-green-600 border-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.6)] scale-105";
                            else if (isSelected && !isCorrectOption) btnClass = "bg-red-600 border-red-400 text-white opacity-50";
                            else btnClass = "bg-gray-900/40 border-gray-800 text-gray-600 blur-[2px]";
                        }

                        return (
                            <button
                                key={idx}
                                disabled={isAnswered}
                                onClick={() => handleAnswer(idx)}
                                className={`
                            relative group p-8 rounded-2xl border-2 text-2xl font-bold transition-all duration-300 transform
                            ${btnClass}
                            flex items-center justify-center overflow-hidden
                        `}
                            >
                                <span className="relative z-10">{option.text}</span>
                                {/* Hover effect */}
                                {!isAnswered && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                                )}
                                {/* Status Icon */}
                                {isAnswered && isCorrectOption && (
                                    <CheckCircleIcon className="w-8 h-8 absolute right-4 text-white" />
                                )}
                                {isAnswered && isSelected && !isCorrectOption && (
                                    <XCircleIcon className="w-8 h-8 absolute right-4 text-white" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-900">
                    <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-red-600 transition-all duration-500"
                        style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%` }}
                    ></div>
                </div>
            </div>
        );
    }

    // RESULT VIEW
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-gray-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500"></div>

                <TrophyIcon className="w-32 h-32 mx-auto text-yellow-500 mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />

                <h2 className="text-4xl font-bold text-white mb-2">ARENA CLEARED</h2>
                <p className="text-gray-400 mb-8">Performance Report</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-gray-800 rounded-xl">
                        <div className="text-4xl font-black text-white">{score}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Total Score</div>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-xl">
                        <div className="text-4xl font-black text-green-400">
                            {Math.round((score / (currentQuiz.questions.length * 15)) * 100)}%
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Accuracy</div>
                    </div>
                </div>

                <button
                    onClick={() => setGameState('lobby')}
                    className="w-full py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-gray-200 transition-colors"
                >
                    RETURN TO LOBBY
                </button>
            </div>
        </div>
    );
}
