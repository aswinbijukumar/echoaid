import { FireIcon } from '@heroicons/react/24/solid';

export default function StreakFlame({ streak = 0, size = "md", className = "" }) {
    // Determine flame intensity based on streak
    const getFlameColor = (s) => {
        if (s >= 30) return "from-purple-500 to-pink-500 text-purple-500";
        if (s >= 14) return "from-blue-500 to-purple-500 text-blue-500";
        if (s >= 7) return "from-orange-500 to-red-500 text-orange-500";
        if (s >= 3) return "from-yellow-400 to-orange-500 text-yellow-500";
        return "from-gray-400 to-gray-300 text-gray-400"; // Inactive/low streak
    };

    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-12 h-12",
        lg: "w-24 h-24",
        xl: "w-32 h-32"
    };

    const isActive = streak > 0;
    const colorClass = isActive ? getFlameColor(streak) : "from-gray-400 to-gray-500 text-gray-400";

    // Choose animation based on intensity
    const animationClass = isActive ? (streak >= 7 ? "animate-bounce" : "animate-pulse") : "";

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Outer Glow */}
            {isActive && (
                <div
                    className={`absolute inset-0 bg-gradient-to-tr ${colorClass} rounded-full blur-xl opacity-40 animate-pulse`}
                />
            )}

            {/* Main Flame */}
            <div className={`relative z-10 transition-transform duration-500 ${animationClass}`}>
                <FireIcon className={`${sizeClasses[size]} ${isActive ? 'text-transparent bg-gradient-to-t ' + colorClass + ' bg-clip-text' : 'text-gray-400'}`} />
                {/* Fallback for bg-clip-text issues: using text color if gradient doesn't show */}
                {!isActive && <FireIcon className={`${sizeClasses[size]} absolute inset-0 text-gray-400 -z-10`} />}
            </div>

            {/* Streak Count Badge (for larger sizes) */}
            {(size === 'lg' || size === 'xl') && (
                <div className="absolute -bottom-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded-full border border-white/10 backdrop-blur-sm z-20">
                    {streak} Day{streak !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
}
