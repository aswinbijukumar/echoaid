import React from 'react';
import {
    CheckCircleIcon,
    LockClosedIcon,
    PlayIcon,
    StarIcon
} from '@heroicons/react/24/solid';
import { useTheme } from '../hooks/useTheme';

export default function JourneyMap({ modules, onModuleClick }) {
    const { darkMode } = useTheme();

    return (
        <div className="relative py-10 px-4 max-w-2xl mx-auto">
            {/* Central Path Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gray-200 -ml-1 rounded-full z-0"></div>

            <div className="space-y-16 relative z-10">
                {modules.reduce((acc, module, index) => {
                    // Check if this module starts a new level
                    const prevModule = index > 0 ? modules[index - 1] : null;
                    const isNewLevel = !prevModule || prevModule.level !== module.level;

                    if (isNewLevel) {
                        // Calculate progress for this level
                        const levelModules = modules.filter(m => m.level === module.level && m.type !== 'quiz');
                        const completedCount = levelModules.filter(m => m.status === 'completed' || m.isCompleted).length;
                        const totalCount = levelModules.length;

                        acc.push(
                            <div key={`level-header-${module.level}`} className="w-full text-center py-6 relative z-10">
                                <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold border 
                                    ${darkMode ? 'bg-gray-800 border-gray-700 text-blue-400' : 'bg-white border-gray-200 text-blue-600'} shadow-sm`}>
                                    LEVEL {module.level || 0} • {completedCount}/{totalCount} Completed
                                </span>
                            </div>
                        );
                    }

                    const isLeft = index % 2 === 0;
                    const status = module.status || 'locked'; // locked, available, completed

                    // ... (keep existing render logic for module)
                    // We need to inline the module render here since we are inside reduce

                    const Icon = module.icon;
                    let statusColor = 'bg-gray-400';
                    if (status === 'completed') statusColor = 'bg-green-500';
                    if (status === 'available') statusColor = 'bg-blue-500';

                    acc.push(
                        <div key={module.id} className={`flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'} justify-center w-full relative`}>

                            {/* Connector Line to Center */}
                            <div className={`absolute top-1/2 ${isLeft ? 'right-1/2 mr-8' : 'left-1/2 ml-8'} w-12 h-1 bg-gray-300 transform -translate-y-1/2`}></div>

                            {/* Module Node */}
                            <div
                                className={`
                  relative group cursor-pointer transition-all duration-300 transform hover:scale-105
                  ${isLeft ? 'mr-auto' : 'ml-auto'}
                  w-64 // Fixed width for the card
                `}
                                onClick={() => onModuleClick(module)}
                            >
                                {/* Card Content */}
                                <div className={`
                  p-4 rounded-xl shadow-lg border-2
                  ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}
                  ${status === 'available' ? 'ring-4 ring-blue-500/20' : ''}
                  ${status === 'locked' ? 'opacity-75 grayscale' : ''}
                `}>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className={`p-2 rounded-lg ${module.color || statusColor} shadow-inner`}>
                                            {Icon && <Icon className="w-6 h-6 text-white" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-bold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{module.title}</h3>
                                            <p className="text-xs text-gray-500 truncate">{module.description}</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar or Status */}
                                    <div className="mt-2">
                                        {status === 'locked' ? (
                                            <div className="flex items-center text-xs text-gray-400">
                                                <LockClosedIcon className="w-3 h-3 mr-1" /> Locked
                                            </div>
                                        ) : (
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full transition-all duration-500 ${status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${module.progress}%` }}
                                                ></div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Floating Status Badge (Star/Lock) */}
                                <div className={`
                  absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white
                  ${status === 'completed' ? 'bg-yellow-400' : status === 'locked' ? 'bg-gray-500' : 'bg-blue-500'}
                `}>
                                    {status === 'completed' && <StarIcon className="w-5 h-5 text-white" />}
                                    {status === 'locked' && <LockClosedIcon className="w-4 h-4 text-white" />}
                                    {status === 'available' && <PlayIcon className="w-4 h-4 text-white ml-0.5" />}
                                </div>

                            </div>

                            {/* Center Dot */}
                            <div className={`
                absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
                w-6 h-6 rounded-full border-4 border-white shadow-sm z-20
                ${status === 'completed' ? 'bg-green-500' : status === 'available' ? 'bg-blue-500' : 'bg-gray-300'}
              `}></div>

                        </div>
                    );
                    return acc;
                }, [])}
            </div>

            {/* Start/End Flags can be added here */}
        </div>
    );
}
