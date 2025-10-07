import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import LearningFlow from './LearningFlow';
import Sidebar from './Sidebar';
import { 
  FireIcon, 
  HeartIcon, 
  SparklesIcon, 
  UserCircleIcon,
  ArrowUpIcon,
  HandRaisedIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  EyeIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://localhost:5000/api';

export default function UnifiedLearning() {
  const { darkMode } = useTheme();
  const { user, logout } = useAuth();
  
  // State management
  const [currentView, setCurrentView] = useState('dictionary'); // 'dictionary', 'learning'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [signs, setSigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSign, setSelectedSign] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    streak: 0,
    xp: 0,
    signsLearned: 0,
    accuracy: 0
  });

  // Theme variables
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const categoriesResponse = await fetch(`${API_BASE_URL}/content/categories`);
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData.categories || []);
      
      // Fetch signs
      const signsResponse = await fetch(`${API_BASE_URL}/dictionary/db/signs?limit=500`);
      const signsData = await signsResponse.json();
      setSigns(signsData.signs || []);
      
      // Fetch user progress
      if (token) {
        const progressResponse = await fetch(`${API_BASE_URL}/practice/progress`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const progressData = await progressResponse.json();
        if (progressData.success) {
          setUserProgress(progressData.data || {});
        }
      }
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSigns = signs.filter(sign => {
    const matchesSearch = sign.word.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || sign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getSignProgress = (sign) => {
    const progress = userProgress[sign._id];
    if (!progress) return { level: 0, accuracy: 0, practiceCount: 0 };
    
    return {
      level: progress.level || 0,
      accuracy: progress.accuracy || 0,
      practiceCount: progress.practiceCount || 0
    };
  };

  const getProgressColor = (level) => {
    switch (level) {
      case 4: return 'bg-green-500';
      case 3: return 'bg-blue-500';
      case 2: return 'bg-yellow-500';
      case 1: return 'bg-orange-500';
      default: return 'bg-gray-300';
    }
  };

  const getProgressText = (level) => {
    switch (level) {
      case 4: return 'Mastered';
      case 3: return 'Advanced';
      case 2: return 'Learning';
      case 1: return 'Beginner';
      default: return 'Not Started';
    }
  };

  const handleSignSelect = (sign) => {
    setSelectedSign(sign);
    setCurrentView('learning');
  };

  const handleBackToDictionary = () => {
    setCurrentView('dictionary');
    setSelectedSign(null);
  };

  if (loading) {
    return (
      <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-700'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'learning' && selectedSign) {
    return (
      <LearningFlow
        selectedSign={selectedSign}
        onBack={handleBackToDictionary}
        userProgress={userProgress}
      />
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Top Status Bar */}
      <div className={`${statusBarBg} border-b ${border} px-4 py-3`}>
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            {/* Empty space on the left */}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FireIcon className="w-5 h-5 text-orange-400" />
              <span className="font-semibold">{userStats.streak}</span>
            </div>
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">{userStats.xp}</span>
            </div>
            <div className="flex items-center space-x-2">
              <HeartIcon className="w-5 h-5 text-red-400" />
              <span className="font-semibold">5</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="w-8 h-8 text-gray-300" />
              <span className="font-semibold">{user?.name || 'User'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Fixed Left Sidebar - Navigation */}
        <Sidebar handleLogout={logout} />

        {/* Main Content Area with Left Margin */}
        <div className={`flex-1 ml-64 ${bg}`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex">
              {/* Main Content */}
              <div className="flex-1 p-6">
                {/* Section Header */}
                <div className="bg-green-500 text-white p-4 rounded-lg mb-6">
                  <div className="flex items-center space-x-3">
                    <ArrowUpIcon className="w-5 h-5 rotate-90" />
                    <div>
                      <h1 className="text-sm font-medium">PRACTICE SECTION</h1>
                      <h2 className="text-xl font-bold">Sign Language Learning & Practice</h2>
                    </div>
                  </div>
                </div>
                {/* Search and Filter */}
                <div className={`${cardBg} rounded-lg border ${border} p-6 mb-6`}>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search signs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full p-3 rounded-lg border ${border} ${bg} ${text} placeholder-gray-400 focus:border-green-500 focus:outline-none`}
                      />
                    </div>
                    <div className="md:w-64">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className={`w-full p-3 rounded-lg border ${border} ${bg} ${text} focus:border-green-500 focus:outline-none`}
                      >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Signs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredSigns.map(sign => {
                    const progress = getSignProgress(sign);
                    return (
                      <div
                        key={sign._id}
                        onClick={() => handleSignSelect(sign)}
                        className={`${cardBg} rounded-lg border ${border} p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105`}
                      >
                        {/* Sign Display */}
                        <div className="text-center mb-4">
                          <div className="text-6xl mb-3">🤟</div>
                          <h3 className="text-xl font-bold mb-1">{sign.word}</h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {sign.category}
                          </p>
                        </div>

                        {/* Progress Indicator */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progress</span>
                            <span className={`text-xs px-2 py-1 rounded-full text-white ${getProgressColor(progress.level)}`}>
                              {getProgressText(progress.level)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress.level)}`}
                              style={{ width: `${(progress.level / 4) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className={`flex justify-between text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <span>Accuracy: {progress.accuracy}%</span>
                          <span>Practices: {progress.practiceCount}</span>
                        </div>

                        {/* Action Button */}
                        <button className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
                          {progress.level === 0 ? 'Start Learning' : 'Continue Practice'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Empty State */}
                {filteredSigns.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold mb-2">No signs found</h3>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Try adjusting your search or category filter
                    </p>
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="w-80 p-6 space-y-6">
                {/* Search Stats */}
                <div className={`${cardBg} rounded-lg border ${border} p-4`}>
                  <h3 className="font-semibold mb-3">Search Stats</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Signs</span>
                      <span className="font-semibold">{signs.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Categories</span>
                      <span className="font-semibold">{categories.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Recently Viewed</span>
                      <span className="font-semibold">12</span>
                    </div>
                  </div>
                </div>

                {/* Popular Searches */}
                <div className={`${cardBg} rounded-lg border ${border} p-4`}>
                  <h3 className="font-semibold mb-3">Popular Searches</h3>
                  <div className="space-y-2">
                    {['Hello', 'Thank You', 'I Love You', 'Help'].map((term, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-purple-500' : 'bg-orange-500'}`}></div>
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{term}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Learning Tips */}
                <div className={`${cardBg} rounded-lg border ${border} p-4`}>
                  <h3 className="font-semibold mb-3">Learning Tips</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <LightBulbIcon className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Practice signs in front of a mirror</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <LightBulbIcon className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Start with basic hand shapes</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <LightBulbIcon className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Use facial expressions to enhance meaning</span>
                    </div>
                  </div>
                </div>

                {/* Stay Updated */}
                <div className={`${cardBg} rounded-lg border ${border} p-4`}>
                  <h3 className="font-semibold mb-2">Stay Updated</h3>
                  <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Get the latest learning tips and community updates</p>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className={`w-full p-2 rounded border ${border} ${bg} ${text} text-sm mb-2`}
                  />
                  <button className="w-full bg-green-500 text-white py-2 rounded text-sm font-medium hover:bg-green-600 transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}