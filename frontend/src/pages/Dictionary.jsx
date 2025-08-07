import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  HandRaisedIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  Cog6ToothIcon,
  ArrowUpIcon,
  FireIcon,
  HeartIcon,
  SparklesIcon,
  PlayIcon,
  EllipsisHorizontalIcon,
  ShieldCheckIcon,
  GiftIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import Sidebar from '../components/Sidebar';

export default function Dictionary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const { darkMode } = useTheme();
  const { user, handleLogout } = useAuth();

  // Mock user data - in real app, this would come from user context/API
  const userStats = {
    streak: 7,
    totalXP: 1250,
    lives: 5,
    gems: 500,
    following: 12,
    followers: 8,
    joinedDate: 'January 2024',
    currentLeague: 'Gold League',
    top3Finishes: 3,
    lessonsCompleted: 45,
    signsLearned: 120,
    quizScore: 85
  };

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sign Language Categories
  const categories = [
    { id: 'all', name: 'All Signs', icon: HandRaisedIcon, color: 'bg-green-500' },
    { id: 'alphabet', name: 'Alphabet', icon: AcademicCapIcon, color: 'bg-blue-500' },
    { id: 'phrases', name: 'Common Phrases', icon: ChatBubbleLeftRightIcon, color: 'bg-purple-500' },
    { id: 'family', name: 'Family & Friends', icon: UserCircleIcon, color: 'bg-pink-500' },
    { id: 'activities', name: 'Daily Activities', icon: BookOpenIcon, color: 'bg-orange-500' },
    { id: 'advanced', name: 'Advanced', icon: PuzzlePieceIcon, color: 'bg-red-500' }
  ];

  // Sample sign language data
  const signs = [
    { id: 1, word: 'Hello', category: 'phrases', difficulty: 'Beginner', videoUrl: '#', description: 'A friendly greeting sign' },
    { id: 2, word: 'Thank You', category: 'phrases', difficulty: 'Beginner', videoUrl: '#', description: 'Expressing gratitude' },
    { id: 3, word: 'A', category: 'alphabet', difficulty: 'Beginner', videoUrl: '#', description: 'First letter of the alphabet' },
    { id: 4, word: 'B', category: 'alphabet', difficulty: 'Beginner', videoUrl: '#', description: 'Second letter of the alphabet' },
    { id: 5, word: 'Mother', category: 'family', difficulty: 'Beginner', videoUrl: '#', description: 'Sign for mother' },
    { id: 6, word: 'Father', category: 'family', difficulty: 'Beginner', videoUrl: '#', description: 'Sign for father' },
    { id: 7, word: 'Eat', category: 'activities', difficulty: 'Beginner', videoUrl: '#', description: 'Action of eating' },
    { id: 8, word: 'Sleep', category: 'activities', difficulty: 'Beginner', videoUrl: '#', description: 'Action of sleeping' },
    { id: 9, word: 'Love', category: 'advanced', difficulty: 'Intermediate', videoUrl: '#', description: 'Expression of love' },
    { id: 10, word: 'Help', category: 'phrases', difficulty: 'Beginner', videoUrl: '#', description: 'Asking for assistance' }
  ];

  // Filter signs based on search and category
  const filteredSigns = signs.filter(sign => {
    const matchesSearch = sign.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || sign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
              <span className="font-semibold">{userStats.totalXP}</span>
            </div>
            <div className="flex items-center space-x-2">
              <HeartIcon className="w-5 h-5 text-red-400" />
              <span className="font-semibold">{userStats.lives}</span>
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
        <Sidebar handleLogout={handleLogout} />

        {/* Main Content Area with Left Margin */}
        <div className={`flex-1 ml-64 ${bg}`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex">
              {/* Main Content */}
              <div className="flex-1 p-6">
                {/* Header */}
                <div className="mb-6">
                  <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>Sign Language Dictionary</h1>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Search and learn thousands of sign language signs</p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for signs, words, or phrases..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 ${cardBg} border ${border} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>Categories</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`p-3 rounded-lg border transition-all ${
                          selectedCategory === category.id
                            ? `${category.color} text-white border-transparent`
                            : `${cardBg} ${border} hover:${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${darkMode ? 'text-white' : 'text-[#23272F]'}`
                        }`}
                      >
                        <category.icon className={`w-6 h-6 mx-auto mb-2 ${selectedCategory === category.id ? 'text-white' : (darkMode ? 'text-white' : 'text-[#23272F]')}`} />
                        <span className={`text-sm font-medium ${selectedCategory === category.id ? 'text-white' : (darkMode ? 'text-white' : 'text-[#23272F]')}`}>{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>
                      {filteredSigns.length} Signs Found
                    </h2>
                    <span className="text-gray-400 text-sm">
                      {selectedCategory !== 'all' && `in ${categories.find(c => c.id === selectedCategory)?.name}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSigns.map((sign) => (
                      <div
                        key={sign.id}
                        className={`${cardBg} p-4 rounded-lg border ${border} hover:shadow-lg transition-all cursor-pointer`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>{sign.word}</h3>
                            <p className="text-gray-400 text-sm">{sign.description}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            sign.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            sign.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {sign.difficulty}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 capitalize">
                            {categories.find(c => c.id === sign.category)?.name}
                          </span>
                          <button className="flex items-center space-x-1 text-blue-500 hover:text-blue-400 transition-colors">
                            <PlayIcon className="w-4 h-4 text-gray-900" />
                            <span className="text-sm text-gray-900">Watch</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredSigns.length === 0 && (
                    <div className="text-center py-12">
                      <HandRaisedIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">No signs found</h3>
                      <p className="text-gray-400">Try adjusting your search or category filter</p>
                    </div>
                  )}
                </div>

                {/* Minimal Footer */}
                <div className="mt-12 mb-8">
                  <div className={`p-6 rounded-lg border ${border}`}>
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <div className="flex items-center space-x-4 mb-4 md:mb-0">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#00CC00] to-[#00AA00] rounded-lg flex items-center justify-center shadow-md">
                              <span className="text-white font-black text-sm">E</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-[#FFC107] to-[#FF9800] rounded-full animate-pulse"></div>
                            <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 bg-[#00CC00]/20 rounded-full animate-ping"></div>
                          </div>
                          <span className="font-black text-lg text-[#00CC00]">EchoAid</span>
                        </div>
                        <span className="text-gray-400 text-sm">
                          © 2024 EchoAid. All rights reserved.
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <Link to="/about" className="text-gray-400 hover:text-green-400 transition-colors">
                          About
                        </Link>
                        <Link to="/blog" className="text-gray-400 hover:text-green-400 transition-colors">
                          Blog
                        </Link>
                        <Link to="/store" className="text-gray-400 hover:text-green-400 transition-colors">
                          Store
                        </Link>
                        <Link to="/efficacy" className="text-gray-400 hover:text-green-400 transition-colors">
                          Efficacy
                        </Link>
                        <Link to="/careers" className="text-gray-400 hover:text-green-400 transition-colors">
                          Careers
                        </Link>
                        <Link to="/investors" className="text-gray-400 hover:text-green-400 transition-colors">
                          Investors
                        </Link>
                        <Link to="/terms" className="text-gray-400 hover:text-green-400 transition-colors">
                          Terms
                        </Link>
                        <Link to="/privacy" className="text-gray-400 hover:text-green-400 transition-colors">
                          Privacy
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Quick Stats */}
              <div className="w-80 p-4 space-y-4">
                {/* Search Stats */}
                <div className={`p-4 rounded-lg border ${border}`}>
                  <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>Search Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Signs</span>
                      <span className={`${darkMode ? 'text-white' : 'text-[#23272F]'}`}>1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Categories</span>
                      <span className="text-blue-400">6</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Recently Viewed</span>
                      <span className="text-purple-400">12</span>
                    </div>
                  </div>
                </div>

                {/* Popular Searches */}
                <div className={`p-4 rounded-lg border ${border}`}>
                  <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>Popular Searches</h3>
                  <div className="space-y-2">
                    <button className={`block w-full text-left p-2 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded transition-colors text-sm ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>
                      🔍 Hello
                    </button>
                    <button className={`block w-full text-left p-2 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded transition-colors text-sm ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>
                      🔍 Thank You
                    </button>
                    <button className={`block w-full text-left p-2 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded transition-colors text-sm ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>
                      🔍 I Love You
                    </button>
                    <button className={`block w-full p-2 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded transition-colors text-sm ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>
                      🔍 Help
                    </button>
                  </div>
                </div>

                {/* Learning Tips */}
                <div className={`p-4 rounded-lg border ${border}`}>
                  <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>Learning Tips</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-400">💡</span>
                      <span className={`${darkMode ? 'text-white' : 'text-[#23272F]'}`}>Practice signs in front of a mirror</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-400">💡</span>
                      <span className={`${darkMode ? 'text-white' : 'text-[#23272F]'}`}>Start with basic hand shapes</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-purple-400">💡</span>
                      <span className={`${darkMode ? 'text-white' : 'text-[#23272F]'}`}>Use facial expressions to enhance meaning</span>
                    </div>
                  </div>
                </div>

                {/* Newsletter Signup */}
                <div className={`p-4 rounded-lg border ${border}`}>
                  <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>Stay Updated</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    Get the latest learning tips and community updates
                  </p>
                  <div className="space-y-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    />
                    <button className="w-full bg-green-500 text-white py-2 rounded text-sm hover:bg-green-600 transition-colors">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle line between sidebar and content */}
        <div className="fixed left-64 top-0 h-screen w-px bg-gray-600 z-40"></div>
      </div>

      {/* Enhanced Scroll to Top Button */}
      {showScrollTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-green-500 text-white p-4 rounded-full hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 z-50"
          title="Scroll to top"
        >
          <ArrowUpIcon className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
}
