import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useLearning } from '../context/LearningContext';
import LearningModule from './LearningModule';
import Modal from './Modal';
import { LockClosedIcon, CheckCircleIcon, PlayIcon, StarIcon, AcademicCapIcon } from '@heroicons/react/24/solid';

// --- Constellation Node Component ---
const ConstellationNode = ({ node, x, y, isOpen, onClick, isUnlocked, isCompleted, isRelearning }) => {
  const { darkMode } = useTheme();

  return (
    <div
      id={node._id || node.id}
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out group ${isUnlocked ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-60 grayscale'
        }`}
      style={{ left: `${x}%`, top: `${y}px` }}
      onClick={() => isUnlocked && onClick(node)}
    >
      {/* Relearning Badge */}
      {/* Relearning Badge Removed as requested */}

      {/* Glow Effect */}
      {isUnlocked && (
        <div className={`absolute inset-0 rounded-full animate-pulse opacity-50 blur-md ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: '60px', height: '60px', left: '-10px', top: '-10px' }} />
      )}

      {/* Node Circle */}
      <div className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 shadow-lg
        ${isCompleted
          ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-300 text-white'
          : isUnlocked
            ? 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-300 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)]'
            : 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 text-gray-500'
        }`}
      >
        {isCompleted ? <StarIcon className="w-6 h-6" /> : node.type === 'quiz' ? <AcademicCapIcon className="w-7 h-7 text-yellow-400" /> : isUnlocked ? <PlayIcon className="w-6 h-6" /> : <LockClosedIcon className="w-5 h-5" />}

        {/* Padlock Overlay for Locked Nodes */}
        {!isUnlocked && (
          <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-1 border border-gray-600">
            <LockClosedIcon className="w-3 h-3 text-gray-400" />
          </div>
        )}
      </div>

      {/* Label Tooltip */}
      <div className={`absolute left-1/2 -translate-x-1/2 top-14 whitespace-nowrap px-3 py-1.5 rounded-lg backdrop-blur-md border text-sm font-medium transition-all duration-300 shadow-xl z-20
        ${darkMode ? 'bg-black/80 border-gray-700 text-white' : 'bg-white/90 border-white text-gray-800'}
        ${isUnlocked ? 'opacity-100 translate-y-0' : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'}
      `}>
        {node.title}
      </div>
    </div>
  );
};

export default function LevelTree() {
  const { darkMode } = useTheme();
  const { learningPath, refresh, completeLesson } = useLearning();
  const [openNode, setOpenNode] = useState(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const handleNodeClick = (node) => {
    if (node.type === 'quiz') {
      navigate(`/quiz/${node.paramId || node._id}`);
    } else {
      setOpenNode(node);
    }
  };

  // Status checks
  const isUnlocked = (node) => node.isUnlocked;
  const isCompleted = (node) => node.isCompleted;

  const handleComplete = async (_node, _result) => {
    // Note: LearningModule handles completion internally via Context generally, 
    // but if we need a callback here, we can use it to close modal.
    setOpenNode(null);
    await refresh(); // ensure tree updates
  };



  // --- Layout Calculation ---
  // Calculates specific X, Y for each node to create a constellation path
  const layout = useMemo(() => {
    if (!learningPath) return { nodes: [], height: 0, items: [] };

    const X_VARIANCE = 30;
    const Y_SPACING = 120;

    let currentY = 50;
    const items = []; // Can be nodes or headers

    learningPath.forEach((node, index) => {
      // Check for level change
      const prevNode = index > 0 ? learningPath[index - 1] : null;
      if (!prevNode || prevNode.level !== node.level) {
        // Add Level Header
        items.push({
          type: 'header',
          level: (node.level !== undefined && node.level !== null) ? node.level : 0, // Ensure level is a number, default to 0 if undefined/null
          id: `header-${node.level}`,
          y: currentY,
          x: 50
        });
        currentY += 80; // Space for header
      }

      // Add Node
      const x = 50 + (Math.sin(index) * X_VARIANCE);
      items.push({
        ...node,
        type: 'node',
        id: node._id,
        x,
        y: currentY
      });
      currentY += Y_SPACING;
    });

    return {
      items,
      height: currentY + 100
    };
  }, [learningPath]);

  // Auto-scroll effect
  useEffect(() => {
    if (!layout.items.length) return;

    // Find target: first node needing relearning, OR first unlocked non-completed node
    const targetNode = layout.items.find(item =>
      (item.type === 'node' || item.type === 'quiz') &&
      (item.isUnlocked && !item.isCompleted)
    );

    if (targetNode) {
      setTimeout(() => {
        const nodeElement = document.getElementById(targetNode._id || targetNode.id);
        if (nodeElement) {
          nodeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [layout.items]);

  return (
    <div className={`min-h-screen relative overflow-hidden ${darkMode ? 'text-white' : 'text-gray-900'} p-6 pb-20`}>
      {/* Title */}
      <div className="relative z-10 text-center mb-10">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Learning Constellation
        </h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Follow the stars to master Sign Language</p>
      </div>

      {/* Map Container */}
      <div ref={containerRef} className="relative max-w-2xl mx-auto" style={{ height: layout.height }}>

        {/* Connection Lines (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {layout.items.map((item, i) => {
            if (item.type !== 'node' && item.type !== 'quiz') return null; // Only draw lines for nodes and quizzes

            // Find previous NODE/QUIZ (skipping headers)
            let prevNode = null;
            for (let j = i - 1; j >= 0; j--) {
              if (layout.items[j].type === 'node') {
                prevNode = layout.items[j];
                break;
              }
            }

            if (!prevNode) return null;

            const active = isUnlocked(item) || isCompleted(prevNode);
            return (
              <line
                key={`line-${i}`}
                x1={`${prevNode.x}%`} y1={prevNode.y}
                x2={`${item.x}%`} y2={item.y}
                stroke={active ? (isCompleted(item) ? '#22c55e' : '#3b82f6') : (darkMode ? '#374151' : '#e5e7eb')}
                strokeWidth="2"
                strokeDasharray={active ? "0" : "5,5"}
                className="transition-all duration-1000"
              />
            );
          })}
        </svg>

        {/* Nodes and Headers */}
        {layout.items.map(item => {
          if (item.type === 'header') {
            return (
              <div
                key={item.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-6 py-2 rounded-full border shadow-lg z-10 font-bold tracking-wider
                   ${darkMode ? 'bg-gray-800 border-gray-700 text-blue-400' : 'bg-white border-blue-100 text-blue-600'}
                 `}
                style={{ left: `${item.x}%`, top: `${item.y}px` }}
              >
                LEVEL {item.level}
              </div>
            );
          }

          return (
            <ConstellationNode
              key={item.id}
              node={item}
              x={item.x}
              y={item.y}
              isUnlocked={isUnlocked(item)}
              isCompleted={isCompleted(item)}
              isRelearning={false}
              onClick={handleNodeClick}
            />
          );
        })}


      </div>

      {/* Learning Modal */}
      <Modal
        isOpen={!!openNode}
        onClose={() => setOpenNode(null)}
        className={`${darkMode ? 'bg-gray-900/95 backdrop-blur-xl' : 'bg-white/95 backdrop-blur-xl'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
        fullscreen={true}
      >
        {openNode && (
          <LearningModule
            skill={openNode}
            onBack={() => setOpenNode(null)}
            onComplete={(data) => handleComplete(openNode, data)}
          />
        )}
      </Modal>
    </div>
  );
}
