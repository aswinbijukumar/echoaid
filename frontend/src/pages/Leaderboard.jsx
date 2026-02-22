import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { TrophyIcon, FireIcon, StarIcon, UserCircleIcon } from '@heroicons/react/24/solid';

export default function Leaderboard() {
    const { darkMode } = useTheme();
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data for now - in production this would come from API
    useEffect(() => {
        // Simulate API fetch
        setTimeout(() => {
            const mockLeaders = [
                { id: 1, name: "Sarah J.", xp: 15420, streak: 45, image: null, rank: 1 },
                { id: 2, name: "Mike Chen", xp: 14200, streak: 32, image: null, rank: 2 },
                { id: 3, name: "Alex R.", xp: 13800, streak: 12, image: null, rank: 3 },
                { id: 4, name: "Jessica W.", xp: 12500, streak: 28, image: null, rank: 4 },
                { id: 5, name: "David K.", xp: 11200, streak: 5, image: null, rank: 5 },
                { id: 6, name: "Emma S.", xp: 10800, streak: 15, image: null, rank: 6 },
                { id: 7, name: "Ryan P.", xp: 9500, streak: 8, image: null, rank: 7 },
                { id: 8, name: "You", xp: 8400, streak: 3, image: null, rank: 8, isCurrentUser: true },
                { id: 9, name: "Lisa M.", xp: 7200, streak: 1, image: null, rank: 9 },
                { id: 10, name: "Tom H.", xp: 6800, streak: 0, image: null, rank: 10 },
            ];
            setLeaders(mockLeaders);
            setLoading(false);
        }, 1000);
    }, []);

    const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
    const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
    const text = darkMode ? 'text-white' : 'text-gray-900';
    const subText = darkMode ? 'text-gray-400' : 'text-gray-500';

    if (loading) {
        return (
            <div className={`min-h-screen ${bg} p-8 flex items-center justify-center`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    const top3 = leaders.slice(0, 3);
    const rest = leaders.slice(3);

    return (
        <div className={`min-h-screen ${bg} ${text} p-4 md:p-8 ml-64 overflow-x-hidden`}>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black mb-4 flex items-center justify-center gap-3">
                        <TrophyIcon className="w-10 h-10 text-yellow-400" />
                        LEADERBOARD
                    </h1>
                    <p className={`${subText} text-lg`}>Compete with the community and rise to the top!</p>
                </div>

                {/* Podium */}
                <div className="flex justify-center items-end gap-4 mb-16 h-64">
                    {/* 2nd Place */}
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-gray-300 overflow-hidden bg-gray-200 mb-3">
                                <UserCircleIcon className="w-full h-full text-gray-400" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-gray-300 text-gray-800 w-8 h-8 flex items-center justify-center rounded-full font-bold border-2 border-white">
                                2
                            </div>
                        </div>
                        <div className="text-center mb-2">
                            <p className="font-bold">{top3[1].name}</p>
                            <p className="text-sm text-green-500 font-bold">{top3[1].xp} XP</p>
                        </div>
                        <div className="w-24 h-32 bg-gray-300 rounded-t-lg flex items-end justify-center p-4 opacity-80 bg-gradient-to-t from-gray-400 to-gray-300">
                        </div>
                    </div>

                    {/* 1st Place */}
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                                <text className="text-4xl">👑</text>
                            </div>
                            <div className="w-24 h-24 rounded-full border-4 border-yellow-400 overflow-hidden bg-yellow-100 mb-3 ring-4 ring-yellow-400/20">
                                <UserCircleIcon className="w-full h-full text-yellow-500" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 w-8 h-8 flex items-center justify-center rounded-full font-bold border-2 border-white">
                                1
                            </div>
                        </div>
                        <div className="text-center mb-2">
                            <p className="font-bold text-lg">{top3[0].name}</p>
                            <p className="text-sm text-green-500 font-bold">{top3[0].xp} XP</p>
                        </div>
                        <div className="w-32 h-44 bg-yellow-400 rounded-t-lg flex items-end justify-center p-4 bg-gradient-to-t from-yellow-500 to-yellow-300 shadow-xl z-10">
                        </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-orange-300 overflow-hidden bg-orange-100 mb-3">
                                <UserCircleIcon className="w-full h-full text-orange-400" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-orange-400 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold border-2 border-white">
                                3
                            </div>
                        </div>
                        <div className="text-center mb-2">
                            <p className="font-bold">{top3[2].name}</p>
                            <p className="text-sm text-green-500 font-bold">{top3[2].xp} XP</p>
                        </div>
                        <div className="w-24 h-24 bg-orange-300 rounded-t-lg flex items-end justify-center p-4 opacity-80 bg-gradient-to-t from-orange-400 to-orange-300">
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className={`rounded-xl overflow-hidden shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    {rest.map((user) => (
                        <div
                            key={user.id}
                            className={`
                flex items-center px-6 py-4 border-b last:border-b-0 transition-colors
                ${user.isCurrentUser ? (darkMode ? 'bg-green-900/20' : 'bg-green-50') : cardBg}
                ${darkMode ? 'border-gray-700' : 'border-gray-100'}
                hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
              `}
                        >
                            <div className={`w-8 font-bold ${subText} text-center mr-4`}>
                                {user.rank}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                                <UserCircleIcon className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <span className={`font-semibold ${user.isCurrentUser ? 'text-green-500' : text}`}>
                                    {user.name} {user.isCurrentUser && "(You)"}
                                </span>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-1 text-orange-500" title="Streak">
                                    <FireIcon className="w-5 h-5" />
                                    <span className="font-bold">{user.streak}</span>
                                </div>
                                <div className="flex items-center gap-1 text-yellow-500 w-24 justify-end" title="Total XP">
                                    <StarIcon className="w-5 h-5" />
                                    <span className="font-bold">{user.xp.toLocaleString()} XP</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
