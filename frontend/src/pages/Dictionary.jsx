import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  ShoppingBagIcon,
  PhotoIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

export default function Dictionary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [signs, setSigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentRef, setContentRef] = useState(null);
  const [selectedSign, setSelectedSign] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const { darkMode } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch categories and signs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories (filesystem-based is fine for list)
        const categoriesResponse = await fetch(`${API_BASE_URL}/api/dictionary/categories`);
        const categoriesData = await categoriesResponse.json();
        
        let fetchedCategories = categoriesData.categories || [];
        
        // Ensure Numbers category appears if DB has any numbers
        try {
          const numbersResp = await fetch(`${API_BASE_URL}/api/dictionary/db/signs?category=numbers&limit=500`);
          const numbersData = await numbersResp.json();
          if (numbersData.signs && numbersData.signs.length > 0 && !fetchedCategories.find(c => c.id === 'numbers')) {
            fetchedCategories = [
              ...fetchedCategories,
              { id: 'numbers', name: 'Numbers', count: numbersData.signs.length }
            ];
          }
        } catch {
          // Ignore secondary fallback error
        }
        
        setCategories(fetchedCategories);
        
        // Fetch all signs from DB (reflects admin changes)
        const signsResponse = await fetch(`${API_BASE_URL}/api/dictionary/db/signs?limit=500`);
        const signsData = await signsResponse.json();
        
        if (signsData.signs && signsData.signs.length > 0) {
          setSigns(signsData.signs);
        } else {
          // Fallback to filesystem alphabet
          const fsResp = await fetch(`${API_BASE_URL}/api/dictionary/signs/alphabet`);
          const fsData = await fsResp.json();
          setSigns(fsData.signs || []);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load signs. Please try again.');
        // Fallback attempt
        try {
          const fsResp = await fetch(`${API_BASE_URL}/api/dictionary/signs/alphabet`);
          const fsData = await fsResp.json();
          setSigns(fsData.signs || []);
        } catch {
          // Ignore secondary fallback error
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL]);

  // Fetch signs for selected category
  useEffect(() => {
    if (selectedCategory === 'all') return;
    
    const fetchCategorySigns = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/dictionary/db/signs?category=${encodeURIComponent(selectedCategory)}&limit=500`);
        const data = await response.json();
        
        if (data.signs && data.signs.length > 0) {
          setSigns(data.signs);
        } else {
          // Fallback to filesystem for that category
          const fsResp = await fetch(`${API_BASE_URL}/api/dictionary/signs/${encodeURIComponent(selectedCategory)}`);
          const fsData = await fsResp.json();
          setSigns(fsData.signs || []);
        }
      } catch (err) {
        console.error('Error fetching category signs:', err);
        setError('Failed to load signs for this category.');
        // Fallback attempt
        try {
          const fsResp = await fetch(`${API_BASE_URL}/api/dictionary/signs/${encodeURIComponent(selectedCategory)}`);
          const fsData = await fsResp.json();
          setSigns(fsData.signs || []);
        } catch {
          // Ignore secondary fallback error
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategorySigns();
  }, [selectedCategory, API_BASE_URL]);

  // Search signs
  useEffect(() => {
    if (!searchTerm.trim()) return;
    
    const searchSigns = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/dictionary/db/signs?q=${encodeURIComponent(searchTerm)}&limit=500`);
        const data = await response.json();
        
        if (data.signs && data.signs.length > 0) {
          setSigns(data.signs);
        } else {
          // Fallback to filesystem search
          const fsResp = await fetch(`${API_BASE_URL}/api/dictionary/search?q=${encodeURIComponent(searchTerm)}`);
          const fsData = await fsResp.json();
          setSigns(fsData.signs || []);
        }
      } catch (err) {
        console.error('Error searching signs:', err);
        setError('Failed to search signs.');
        // Fallback attempt
        try {
          const fsResp = await fetch(`${API_BASE_URL}/api/dictionary/search?q=${encodeURIComponent(searchTerm)}`);
          const fsData = await fsResp.json();
          setSigns(fsData.signs || []);
        } catch {
          // Ignore secondary fallback error
        }
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchSigns, 400);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, API_BASE_URL]);

  // Scroll detection for content area
  useEffect(() => {
    const handleContentScroll = () => {
      if (contentRef) {
        const scrollTop = contentRef.scrollTop;
        setShowScrollTop(scrollTop > 300);
      }
    };

    if (contentRef) {
      contentRef.addEventListener('scroll', handleContentScroll);
      return () => contentRef.removeEventListener('scroll', handleContentScroll);
    }
  }, [contentRef]);

  // Scroll to top function for content area
  const scrollToTop = () => {
    if (contentRef) {
      contentRef.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Preview sign functionality
  const handleSignPreview = (sign) => {
    setSelectedSign(sign);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setSelectedSign(null);
  };

  // Handle escape key to close preview
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showPreview) {
        closePreview();
      }
    };

    if (showPreview) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showPreview]);

  // Sign Language Categories with icons
  const categoryIcons = {
    all: { icon: HandRaisedIcon, color: 'bg-green-500' },
    alphabet: { icon: AcademicCapIcon, color: 'bg-blue-500' },
    numbers: { icon: AcademicCapIcon, color: 'bg-teal-500' },
    phrases: { icon: ChatBubbleLeftRightIcon, color: 'bg-purple-500' },
    family: { icon: UserCircleIcon, color: 'bg-pink-500' },
    activities: { icon: BookOpenIcon, color: 'bg-orange-500' },
    advanced: { icon: PuzzlePieceIcon, color: 'bg-red-500' }
  };



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
        <div className={`flex-1 ml-64 ${bg} flex flex-col h-screen`}>
          <div className="max-w-6xl mx-auto flex-1 flex flex-col">
            <div className="flex flex-1">
              {/* Main Content - Scrollable */}
              <div 
                ref={setContentRef}
                className="flex-1 p-6 overflow-y-auto"
                style={{ maxHeight: 'calc(100vh - 80px)' }}
              >
                {/* Header */}
                <div className="mb-6">
                  <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>Sign Language Dictionary</h1>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Search and learn thousands of sign language signs</p>
                  
                  {/* Scroll Progress Indicator */}
                  {showScrollTop && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-green-500 h-1 rounded-full transition-all duration-300"
                          style={{ 
                            width: contentRef ? `${Math.min((contentRef.scrollTop / (contentRef.scrollHeight - contentRef.clientHeight)) * 100, 100)}%` : '0%' 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
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
                    {/* All Signs Category */}
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedCategory === 'all'
                          ? `${categoryIcons.all.color} text-white border-transparent`
                          : `${cardBg} ${border} hover:${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${darkMode ? 'text-white' : 'text-[#23272F]'}`
                      }`}
                    >
                      <categoryIcons.all.icon className={`w-6 h-6 mx-auto mb-2 ${selectedCategory === 'all' ? 'text-white' : (darkMode ? 'text-white' : 'text-[#23272F]')}`} />
                      <span className={`text-sm font-medium ${selectedCategory === 'all' ? 'text-white' : (darkMode ? 'text-white' : 'text-[#23272F]')}`}>All Signs</span>
                    </button>
                    
                    {/* Dynamic Categories from API */}
                    {categories.map((category) => {
                      const iconData = categoryIcons[category.id] || categoryIcons.all;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`p-3 rounded-lg border transition-all ${
                            selectedCategory === category.id
                              ? `${iconData.color} text-white border-transparent`
                              : `${cardBg} ${border} hover:${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${darkMode ? 'text-white' : 'text-[#23272F]'}`
                          }`}
                        >
                          <iconData.icon className={`w-6 h-6 mx-auto mb-2 ${selectedCategory === category.id ? 'text-white' : (darkMode ? 'text-white' : 'text-[#23272F]')}`} />
                          <div className="text-center">
                            <span className={`text-sm font-medium block ${selectedCategory === category.id ? 'text-white' : (darkMode ? 'text-white' : 'text-[#23272F]')}`}>
                              {category.name}
                            </span>
                            <span className={`text-xs ${selectedCategory === category.id ? 'text-white/80' : 'text-gray-500'}`}>
                              {category.count}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Results */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>
                      {loading ? 'Loading...' : `${signs.length} Signs Found`}
                    </h2>
                    <span className="text-gray-400 text-sm">
                      {selectedCategory !== 'all' && categories.find(c => c.id === selectedCategory)?.name}
                    </span>
                  </div>

                  {/* Loading State */}
                  {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, index) => (
                        <div key={index} className={`${cardBg} p-4 rounded-lg border ${border} animate-pulse`}>
                          <div className="h-32 bg-gray-300 rounded mb-3"></div>
                          <div className="h-4 bg-gray-300 rounded mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Error State */}
                  {error && !loading && (
                    <div className="text-center py-12">
                      <HandRaisedIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2 text-red-600">Error Loading Signs</h3>
                      <p className="text-gray-400 mb-4">{error}</p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {/* Signs Grid */}
                  {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {signs.map((sign) => (
                        <div
                          key={sign.id}
                          className={`${cardBg} p-4 rounded-lg border ${border} hover:shadow-lg transition-all cursor-pointer group`}
                          onClick={() => handleSignPreview(sign)}
                        >
                          {/* Sign Image */}
                          <div className="mb-3 relative">
                            <img
                              src={`${API_BASE_URL}${sign.thumbnailUrl}`}
                              alt={`Sign for ${sign.word}`}
                              className="w-full h-32 object-contain rounded-lg bg-white dark:bg-gray-100 border border-gray-200 dark:border-gray-300 group-hover:scale-105 transition-all duration-200 shadow-sm"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-32 bg-white dark:bg-gray-100 rounded-lg flex items-center justify-center hidden border border-gray-200 dark:border-gray-300">
                              <PhotoIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          </div>
                          
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
                              {categories.find(c => c.id === sign.category)?.name || sign.category}
                            </span>
                            <div className="flex items-center space-x-2">
                              <button 
                                className="flex items-center space-x-1 text-blue-500 hover:text-blue-400 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Future video functionality
                                }}
                              >
                                <PlayIcon className="w-4 h-4" />
                                <span className="text-sm">Watch</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {!loading && !error && signs.length === 0 && (
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
                
                {/* Scroll Indicator */}
                <div className="text-center py-4">
                  <div className="inline-flex items-center space-x-2 text-gray-400 text-sm">
                    <ArrowUpIcon className="w-4 h-4" />
                    <span>Scroll for more content</span>
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
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-green-500 text-white p-4 rounded-full hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 z-50"
          title="Scroll to top"
        >
          <ArrowUpIcon className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Sign Preview Modal */}
      {showPreview && selectedSign && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto border border-gray-200 dark:border-gray-600`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
              <div>
                <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>
                  {selectedSign.word}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {categories.find(c => c.id === selectedSign.category)?.name || selectedSign.category}
                </p>
              </div>
              <button
                onClick={closePreview}
                className={`p-2 rounded-lg hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''} transition-colors`}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Large Sign Image */}
              <div className="mb-6">
                <img
                  src={`${API_BASE_URL}${selectedSign.imageUrl}`}
                  alt={`Sign for ${selectedSign.word}`}
                  className="w-full h-80 object-contain rounded-xl bg-white dark:bg-gray-100 border border-gray-200 dark:border-gray-300 shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-80 bg-white dark:bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-300 hidden">
                  <PhotoIcon className="w-16 h-16 text-gray-400" />
                </div>
              </div>

              {/* Sign Details */}
              <div className="space-y-6">
                <div>
                  <h3 className={`font-semibold text-xl mb-3 ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">{selectedSign.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      selectedSign.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      selectedSign.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {selectedSign.difficulty}
                    </span>
                    <span className="text-gray-500 text-sm">
                      ID: {selectedSign.id}
                    </span>
                  </div>
                </div>

                {/* Future Video Section */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-semibold text-xl ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>
                      🎥 Video Tutorial
                    </h3>
                    <span className="text-sm text-gray-500">Coming Soon</span>
                  </div>
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-600">
                    <div className="flex items-center justify-center space-x-3 text-gray-500 dark:text-gray-400">
                      <PlayIcon className="w-6 h-6" />
                      <span className="text-lg">Video tutorial will be available here</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={closePreview}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors font-medium"
              >
                Close
              </button>
              <button
                className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={(e) => {
                  e.stopPropagation();
                  // Future: Add to favorites or practice list
                }}
              >
                Practice Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
