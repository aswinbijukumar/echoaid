import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    SpeakerWaveIcon,
    MicrophoneIcon,
    VideoCameraIcon,
    ArrowPathIcon,
    TrashIcon,
    LanguageIcon,
    StopIcon
} from '@heroicons/react/24/solid';
import Navbar from '../components/Navbar';
import SignRecognition from '../components/SignRecognition';
import { useTheme } from '../hooks/useTheme';

const Translator = () => {
    const { darkMode } = useTheme();
    const [transcribedText, setTranscribedText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [mode, setMode] = useState('sign-to-speech'); // 'sign-to-speech' or 'speech-to-text'
    const recognitionRef = useRef(null);

    // Buffer for sign detection to prevent jitter
    const [signBuffer, setSignBuffer] = useState('');
    const lastSignTimeRef = useRef(0);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    setTranscribedText(prev => prev + ' ' + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                if (isListening) {
                    recognitionRef.current.start();
                } else {
                    setIsListening(false);
                }
            };
        }
    }, [isListening]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
            setMode('speech-to-text');
        }
    };

    const [detectedSign, setDetectedSign] = useState(null);
    const [stabilityCounter, setStabilityCounter] = useState(0);
    const STABILITY_THRESHOLD = 15; // requires ~1 second of sustained detection (assuming 15fps roughly)
    const [lastStableSign, setLastStableSign] = useState(null);

    const handleSignRecognition = (result) => {
        if (mode !== 'sign-to-speech') return;

        // HIGH STRICTNESS: Only process high confidence results
        if (result.confidence > 80) {
            setDetectedSign(result.label);

            // Logic: If same sign is held, increment stability
            if (result.label === lastStableSign) {
                const newCount = stabilityCounter + 1;
                setStabilityCounter(newCount);

                // If threshold reached, commit the sign
                if (newCount === STABILITY_THRESHOLD) {
                    setTranscribedText(prev => prev + result.label);
                    // Visual Flash or Haptic Feedback could go here
                    setStabilityCounter(0); // Reset for next character
                }
            } else {
                // New sign detected, reset counter
                setLastStableSign(result.label);
                setStabilityCounter(1);
            }
        } else {
            // Low confidence: Reset stability but keep last detected for "fading" UI effects if desired
            setStabilityCounter(Math.max(0, stabilityCounter - 1));
        }
    };

    const speakText = (text) => {
        if (!text) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const clearText = () => setTranscribedText('');

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} font-sans transition-colors duration-300`}>
            <Navbar />

            <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#00CC00] p-3 rounded-xl shadow-lg">
                            <LanguageIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00CC00] to-[#008800]">
                                EchoLink Translator
                            </h1>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Real-time Bidirectional Communication
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setMode('sign-to-speech')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${mode === 'sign-to-speech'
                                ? 'bg-[#00CC00] text-white shadow-lg'
                                : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            Sign to Speech
                        </button>
                        <button
                            onClick={() => setMode('speech-to-text')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${mode === 'speech-to-text'
                                ? 'bg-[#4285F4] text-white shadow-lg'
                                : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            Speech to Text
                        </button>
                    </div>
                </div>

                {/* Main Interface Grid */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">

                    {/* Left Panel: Input Source */}
                    <div className={`relative rounded-3xl overflow-hidden border transition-all duration-300 shadow-2xl flex flex-col ${stabilityCounter > 0 && mode === 'sign-to-speech'
                            ? 'border-[#00CC00] ring-2 ring-[#00CC00]/50'
                            : 'border-gray-200 dark:border-gray-700'
                        } bg-black`}>

                        {/* Visual Mode Indicator */}
                        <div className="absolute top-4 left-4 z-20 flex gap-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${mode === 'sign-to-speech' ? 'bg-[#00CC00]/20 text-[#00CC00]' : 'bg-gray-500/20 text-gray-300'}`}>
                                CAMERA INPUT
                            </div>
                            {isListening && (
                                <div className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md bg-red-500/20 text-red-500 animate-pulse">
                                    LISTENING...
                                </div>
                            )}
                        </div>

                        {mode === 'sign-to-speech' ? (
                            <div className="flex-1 relative">
                                <SignRecognition
                                    onRecognition={handleSignRecognition}
                                    mode="webcam"
                                />
                                {/* Stability Indicator Overlay */}
                                {stabilityCounter > 0 && (
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                        <div className="w-32 h-32 rounded-full border-4 border-[#00CC00] border-t-transparent animate-spin opacity-50"></div>
                                    </div>
                                )}

                                {/* Confidence Overlay */}
                                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-center">
                                    <p className="text-gray-300 text-sm font-medium">
                                        {detectedSign
                                            ? `Detecting: ${detectedSign} (${Math.round((stabilityCounter / STABILITY_THRESHOLD) * 100)}% Locked)`
                                            : "Hold a sign steadily to type..."}
                                    </p>
                                    {/* Progress Bar for Lock-in */}
                                    <div className="mt-2 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#00CC00] transition-all duration-100 ease-linear"
                                            style={{ width: `${(stabilityCounter / STABILITY_THRESHOLD) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 relative overflow-hidden">
                                {/* Audio Visualization Circles */}
                                <AnimatePresence>
                                    {isListening && (
                                        <>
                                            <motion.div
                                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                                className="absolute w-64 h-64 rounded-full bg-blue-500 blur-3xl"
                                            />
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                                                transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                                                className="absolute w-48 h-48 rounded-full bg-purple-500 blur-2xl"
                                            />
                                        </>
                                    )}
                                </AnimatePresence>

                                <button
                                    onClick={toggleListening}
                                    className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isListening
                                        ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_40px_rgba(239,68,68,0.5)]'
                                        : 'bg-[#4285F4] hover:bg-blue-600 shadow-xl'
                                        }`}
                                >
                                    {isListening ? <StopIcon className="w-10 h-10 text-white" /> : <MicrophoneIcon className="w-10 h-10 text-white" />}
                                </button>
                                <p className="relative z-10 mt-6 text-gray-400 font-medium">
                                    {isListening ? 'Listening to speech...' : 'Tap to Start Listening'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Transcription & Output */}
                    <div className="flex flex-col rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl">
                        {/* Toolbar */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <h2 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                                <ArrowPathIcon className="w-4 h-4 mr-2" /> Live Transcription
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={clearText}
                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Clear Text"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => speakText(transcribedText)}
                                    className="p-2 text-[#00CC00] hover:bg-[#00CC00]/10 rounded-lg transition-colors"
                                    title="Speak Text"
                                >
                                    <SpeakerWaveIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-6 overflow-y-auto relative">
                            {transcribedText ? (
                                <p className={`text-2xl md:text-3xl font-medium leading-relaxed ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {transcribedText}
                                    {isListening && <span className="animate-pulse text-gray-400">|</span>}
                                </p>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                                    <div className="w-16 h-16 border-4 border-dashed border-gray-300 rounded-xl mb-4" />
                                    <p>Transcription will appear here...</p>
                                </div>
                            )}
                        </div>

                        {/* Input Footer (Manual Correction) */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <input
                                type="text"
                                value={transcribedText}
                                onChange={(e) => setTranscribedText(e.target.value)}
                                placeholder="Type to correct or speak..."
                                className="w-full bg-transparent border-none focus:ring-0 text-lg dark:text-white placeholder-gray-500"
                            />
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Translator;
