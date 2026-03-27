import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import LearningModule from './LearningModule';
import Modal from './Modal';
import { LockClosedIcon, CheckCircleIcon, PlayIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../constants/api';

// Removed demoTree - using only real admin-created content

function useLocalProgress(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}

export default function LevelTree() {
  const { darkMode } = useTheme();
  const [openNode, setOpenNode] = useState(null);
  // progress map: { nodeId: { mastered: boolean, levelState: 'easy'|'medium'|'hard' } }
  const [progress, setProgress] = useLocalProgress('level-tree-progress', {});
  const [liveNodes, setLiveNodes] = useState(null);
  const [loading, setLoading] = useState(false);

  const isUnlocked = (node) => {
    // Use backend's isUnlocked value which handles proper order-based unlocking within levels
    return node.skillRef?.isUnlocked || false;
  };
  const isCompleted = (node) => {
    // Check local progress first
    if (progress[node.id]?.mastered) return true;
    // Check backend progress
    return node.skillRef?.isCompleted || false;
  };

  // Fetch live skills for level tree
  useEffect(() => {
    fetchSkills();
  }, []);

  // Helper function to get color based on level (dynamic colors)
  const getLevelColor = (level) => {
    const colors = [
      'bg-green-500',    // Level 0
      'bg-blue-500',     // Level 1
      'bg-purple-500',   // Level 2
      'bg-orange-500',   // Level 3
      'bg-red-500',      // Level 4
      'bg-yellow-500',   // Level 5
      'bg-pink-500',     // Level 6
      'bg-indigo-500',   // Level 7
      'bg-teal-500',     // Level 8
      'bg-cyan-500',     // Level 9
      'bg-emerald-500',  // Level 10
      'bg-violet-500',   // Level 11
      'bg-rose-500',     // Level 12
      'bg-amber-500',    // Level 13
      'bg-lime-500',     // Level 14
      'bg-sky-500'       // Level 15+
    ];
    return colors[level] || 'bg-gray-500';
  };

  const ordered = useMemo(() => liveNodes || [], [liveNodes]);

  const handleComplete = (node, result) => {
    // mark mastered only when child module bubbles mastered: true (after Hard)
    const mastered = result?.mastered === true; // LearningModule sets this when Hard is done
    setProgress(prev => ({ ...prev, [node.id]: { ...(prev[node.id]||{}), mastered } }));
    setOpenNode(null);
    
    // Refresh the skills data to get updated progress from backend
    if (mastered) {
      fetchSkills();
    }
  };

  // Move fetchSkills outside useEffect so it can be called from handleComplete
  const fetchSkills = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
        console.log('Fetching skills from:', `${API_BASE_URL}/api/skills`);
      
        const res = await fetch(`${API_BASE_URL}/api/skills`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });
      
      if (!res.ok) {
        console.error('Skills API failed:', res.status, res.statusText);
        throw new Error(`Skills load failed: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Skills API response:', data);
      
      const skills = Array.isArray(data?.data) ? data.data : data;
      
      // Debug: Log what we're receiving (remove in production)
      console.log('Received skills with levels:', skills.map(s => ({
        title: s.title,
        level: s.level,
        skillLevel: s.skillLevel,
        order: s.order
      })));
      const actives = skills.filter(s => s.isActive !== false).sort((a,b)=> {
        // Sort by skill level first, then by order within each level
        const aLevel = a.skillLevel || a.level || 0;
        const bLevel = b.skillLevel || b.level || 0;
        if (aLevel !== bLevel) return aLevel - bLevel;
        return (a.order || 0) - (b.order || 0);
      });
      
      console.log('Active skills:', actives);
      
      const nodes = actives.map(s => ({
        id: s._id,
        title: s.title,
        levelLabel: `Level ${s.skillLevel || s.level || 0}`,
        color: getLevelColor(s.skillLevel || s.level || 0),
        requires: Array.isArray(s.prerequisites) ? s.prerequisites.map(x=> (typeof x==='string'?x:String(x))) : [],
        skillRef: s
      }));
      
      // Debug: Log unlocking status
      console.log('Unlocking status:', nodes.map(n => ({
        title: n.title,
        level: n.skillRef?.skillLevel || n.skillRef?.level,
        order: n.skillRef?.order,
        isUnlocked: n.skillRef?.isUnlocked,
        isCompleted: n.skillRef?.isCompleted
      })));
      
      console.log('Mapped nodes:', nodes);
      setLiveNodes(nodes);
    } catch (error) {
      console.error('Error fetching skills:', error);
      setLiveNodes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#23272F]'} p-6`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Level Tree</h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>Complete ALL modules in Level 0 to unlock Level 1, then complete ALL modules in Level 1 to unlock Level 2, and so on. You must progress through levels sequentially.</p>

        <div className="relative">
          {/* vertical line */}
          <div className={`absolute left-6 top-0 bottom-0 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} style={{ width: 2 }} />

          <ul className="space-y-6">
            {loading ? (
              <li className="py-8 text-center text-gray-500">Loading modules…</li>
            ) : ordered.length === 0 ? (
              <li className="py-8 text-center">
                <div className="text-gray-500 mb-4">No learning modules available</div>
                <div className="text-sm text-gray-400">
                  Admin needs to create learning modules first. Check the admin dashboard.
                </div>
              </li>
            ) : (() => {
              // Group nodes by skill level (not user progress level)
              const groupedNodes = ordered.reduce((groups, node) => {
                const level = node.skillRef?.skillLevel || node.skillRef?.level || 0;
                console.log(`Grouping node "${node.title}": skillLevel=${node.skillRef?.skillLevel}, level=${node.skillRef?.level}, final level=${level}`);
                if (!groups[level]) groups[level] = [];
                groups[level].push(node);
                return groups;
              }, {});
              
              console.log('Grouped nodes:', groupedNodes);

              // Render grouped nodes
              return Object.keys(groupedNodes).sort((a, b) => parseInt(a) - parseInt(b)).map(level => (
                <div key={`level-${level}`}>
                  {/* Level Header */}
                  <div className="mb-4 mt-6 first:mt-0">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Level {level} Modules
                    </h3>
                    <div className={`w-full h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} mt-2`}></div>
                  </div>
                  
                  {/* Level Nodes */}
                  {groupedNodes[level].map((node, idx) => {
                    const unlocked = isUnlocked(node);
                    const completed = isCompleted(node);
                    const bg = node.milestone ? node.color : (completed ? 'bg-green-600' : unlocked ? node.color : 'bg-gray-500');
                    return (
                      <li key={node.id} className="flex items-center mb-6">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${bg}`}>
                      {node.milestone ? <SparklesIcon className="w-6 h-6" /> : completed ? <CheckCircleIcon className="w-6 h-6" /> : unlocked ? <PlayIcon className="w-6 h-6" /> : <LockClosedIcon className="w-6 h-6" />}
                    </div>
                  </div>
                  <div className={`flex-1 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-300'} p-4 ${unlocked ? 'opacity-100' : 'opacity-60'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-500">{node.levelLabel}</div>
                        <div className="font-semibold text-lg">{node.title}</div>
                        {node.skillRef && (
                          <div className="text-xs text-gray-400 mt-1">
                            Module Level: {node.skillRef.skillLevel || 0}
                            {node.skillRef.totalXP ? ` • ${node.skillRef.totalXP} XP` : ''}
                            {node.skillRef.progress ? ` • ${Math.round(node.skillRef.progress)}%` : ''}
                          </div>
                        )}
                      </div>
                      {!node.milestone && (
                        <button
                          disabled={!unlocked}
                          onClick={() => setOpenNode(node)}
                          className={`px-3 py-2 rounded-lg text-white ${unlocked ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 cursor-not-allowed'}`}
                        >
                          {completed ? 'Review' : 'Start'}
                        </button>
                      )}
                    </div>
                  </div>
                      </li>
                    );
                  })}
                </div>
              ));
            })()}
          </ul>
        </div>

        {/* Open module in a modal to avoid long scroll */}
        <Modal
          isOpen={!!openNode}
          onClose={() => setOpenNode(null)}
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          fullscreen={true}
        >
          {openNode && openNode.skillRef && (
            <LearningModule
              skill={openNode.skillRef}
              onBack={() => setOpenNode(null)}
              onComplete={(data) => handleComplete(openNode, data)}
            />
          )}
        </Modal>
      </div>
    </div>
  );
}

