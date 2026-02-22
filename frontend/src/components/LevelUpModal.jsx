import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, SparklesIcon, FireIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../hooks/useTheme';

export default function LevelUpModal({ isOpen, level, onClose }) {
    const { darkMode } = useTheme();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal Window */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 100 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.5, opacity: 0, y: 100 }}
                    className={`relative w-full max-w-md p-8 rounded-2xl text-center overflow-hidden shadow-2xl border-4 border-yellow-400 ${darkMode ? 'bg-gray-900' : 'bg-white'
                        }`}
                >
                    {/* Background Effects */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-yellow-500/20 to-transparent"></div>
                    </div>

                    <div className="relative z-10">
                        {/* Animated Icon */}
                        <motion.div
                            initial={{ rotate: -180, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                            className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-yellow-200"
                        >
                            <StarIcon className="w-20 h-20 text-white" />
                        </motion.div>

                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2"
                        >
                            RANK {level}!
                        </motion.h2>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className={`text-lg mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                        >
                            Outstanding performance! You're crushing it!
                        </motion.p>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex justify-center space-x-4"
                        >
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg transform transition hover:scale-105 active:scale-95"
                            >
                                Continue Learning
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
