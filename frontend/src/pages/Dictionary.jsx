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
  PhotoIcon,
  XMarkIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { useUserStats } from '../hooks/useUserStats';
import TopBarUserAvatar from '../components/TopBarUserAvatar';
import Modal from '../components/Modal';

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
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { stats: userStats } = useUserStats();

  const handleLogout = () => {
    logout();
    navigate('/');
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
        
        // Fetch categories from public alias
        const categoriesResponse = await fetch(`${API_BASE_URL}/api/content/categories`);
        const categoriesData = await categoriesResponse.json();
        
        let fetchedCategories = [];
        if (categoriesData.success && categoriesData.data) {
          // Transform database categories to match expected format
          fetchedCategories = categoriesData.data.map(cat => ({
            id: cat.slug,
            name: cat.name,
            count: cat.signCount || 0,
            color: cat.color
          }));
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
    const fetchCategorySigns = async () => {
      try {
        setLoading(true);
        
        if (selectedCategory === 'all') {
          // Fetch all signs from database
          const response = await fetch(`${API_BASE_URL}/api/dictionary/db/signs?limit=500`);
          const data = await response.json();
          
          if (data.signs && data.signs.length > 0) {
            setSigns(data.signs);
          } else {
            // Fallback to filesystem alphabet
            const fsResp = await fetch(`${API_BASE_URL}/api/dictionary/signs/alphabet`);
            const fsData = await fsResp.json();
            setSigns(fsData.signs || []);
          }
        } else {
          // Fetch signs for specific category
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
        }
      } catch (err) {
        console.error('Error fetching category signs:', err);
        setError('Failed to load signs for this category.');
        // Fallback attempt
        try {
          const fsResp = await fetch(`${API_BASE_URL}/api/dictionary/signs/${encodeURIComponent(selectedCategory === 'all' ? 'alphabet' : selectedCategory)}`);
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

  const openPractice = (sign) => {
    console.log('Dictionary - Opening practice for sign:', sign);
    console.log('Dictionary - Sign ID:', sign._id || sign.id);
    
    // Navigate to Practice page with sign data
    navigate('/practice', {
      state: {
        startPractice: true,
        specificSign: sign._id || sign.id,
        signData: sign // Send full sign data as fallback
      }
    });
  };


  // Handle escape key to close preview
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showPreview) closePreview();
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


  // Filter signs based on search term and category
  const filteredSigns = signs.filter(sign => {
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = sign.word.toLowerCase().includes(searchLower) ||
                           sign.description.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    
    // Filter by category (if not 'all')
    if (selectedCategory !== 'all') {
      return sign.category === selectedCategory;
    }
    
    return true;
  });



  return (
    <div className={`min-h-screen ${bg} ${text} overflow-x-hidden`}>
      {/* Top Status Bar */}
      <div className={`${statusBarBg} border-b ${border} px-6 py-3 pl-64 sticky top-0 z-30`}>
        <div className="flex items-center justify-between w-full">
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
              <span className="font-semibold">{userStats.totalXP} XP</span>
            </div>
            <div className="flex items-center space-x-2">
              <StarIcon className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">Lv {userStats.level}</span>
              <span className="text-sm text-gray-400">({userStats.xpToNextLevel} to next)</span>
            </div>
            <TopBarUserAvatar size={8} />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Fixed Left Sidebar - Navigation */}
        <Sidebar handleLogout={handleLogout} />

        {/* Main Content Area with Left Margin */}
        <div className={`flex-1 ml-64 ${bg} flex flex-col h-screen overflow-hidden`}>
          <div className="w-full mx-auto flex-1 flex flex-col min-h-0">
            <div className="flex flex-1 min-h-0">
              {/* Main Content - Scrollable */}
              <div 
                ref={setContentRef}
                className={`flex-1 p-6 overflow-y-auto min-h-0 ${bg}`}
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
                      const categoryColor = category.color || iconData.color;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`p-3 rounded-lg border transition-all ${
                            selectedCategory === category.id
                              ? `${categoryColor} text-white border-transparent`
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
                      {loading ? 'Loading...' : `${filteredSigns.length} Signs Found`}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                      {filteredSigns.map((sign) => (
                        <div
                          key={sign.id}
                          className={`${cardBg} p-4 rounded-lg border ${border} hover:shadow-lg transition-all cursor-pointer group`}
                          onClick={() => handleSignPreview(sign)}
                        >
                          {/* Sign Image */}
                          <div className="mb-3 relative">
                            {(() => {
                              const pickThumb = sign.thumbnailUrl || sign.imageUrl || sign.imagePath;
                              const imageSource = typeof pickThumb === 'string' && pickThumb.startsWith('http') ? pickThumb : `${API_BASE_URL}${pickThumb || ''}`;
                              return (
                                <img
                                  src={imageSource}
                                  alt={`Sign for ${sign.word}`}
                                  className="w-full h-32 object-contain rounded-lg bg-white dark:bg-gray-100 border border-gray-200 dark:border-gray-300 group-hover:scale-105 transition-all duration-200 shadow-sm"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              );
                            })()}
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
                              <button
                                onClick={(e) => { e.stopPropagation(); openPractice(sign); }}
                                className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                              >
                                Practice
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {!loading && !error && filteredSigns.length === 0 && (
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

              {/* Right Sidebar removed per request (content auto-expands) */}
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
        <Modal isOpen={showPreview} onClose={closePreview} className={`${cardBg} rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600`} widthClass="max-w-3xl w-full mx-4">
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
                {(() => {
                  const pickUrl = selectedSign.imageUrl || selectedSign.imagePath;
                  const src = typeof pickUrl === 'string' && pickUrl.startsWith('http') ? pickUrl : `${API_BASE_URL}${pickUrl || ''}`;
                  return (
                    <img
                      src={src}
                      alt={`Sign for ${selectedSign.word}`}
                      className="w-full h-80 object-contain rounded-xl bg-white dark:bg-gray-100 border border-gray-200 dark:border-gray-300 shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  );
                })()}
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

                {/* Video Section */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-semibold text-xl ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>
                      🎥 Video Tutorial
                    </h3>
                  </div>
                  {selectedSign.videoPath || selectedSign.videoUrl ? (
                    <div className="rounded-xl overflow-hidden border border-blue-300 dark:border-blue-600 bg-black">
                      {(() => {
                        const pickVideo = selectedSign.videoUrl || selectedSign.videoPath;
                        const videoSource = typeof pickVideo === 'string' && pickVideo.startsWith('http') ? pickVideo : `${API_BASE_URL}${pickVideo || ''}`;
                        return (
                          <video
                            key={pickVideo}
                            src={videoSource}
                            controls
                            className="w-full h-64"
                          />
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-600">
                      <div className="flex items-center justify-center space-x-3 text-gray-500 dark:text-gray-400">
                        <PlayIcon className="w-6 h-6" />
                        <span className="text-lg">Video tutorial will be available here</span>
                      </div>
                    </div>
                  )}
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
                  const notif = document.createElement('div');
                  notif.className = 'fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50';
                  (async () => {
                    try {
                      const token = localStorage.getItem('token');
                      const res = await fetch(`${API_BASE_URL}/api/practice/later`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ signId: selectedSign.id })
                      });
                      const data = await res.json();
                      if (res.ok) {
                        notif.textContent = 'Saved to Practice Later';
                        notif.className += ' bg-green-100 text-green-800 border border-green-300';
                      } else {
                        notif.textContent = data.message || 'Failed to save';
                        notif.className += ' bg-red-100 text-red-800 border border-red-300';
                      }
                    } catch {
                      notif.textContent = 'Network error';
                      notif.className += ' bg-red-100 text-red-800 border border-red-300';
                    } finally {
                      document.body.appendChild(notif);
                      setTimeout(() => notif.remove(), 2500);
                    }
                  })();
                }}
              >
                Practice Later
              </button>
              <button
                className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={(e) => {
                  e.stopPropagation();
                  openPractice(selectedSign);
                }}
              >
                Practice Now
              </button>
            </div>
        </Modal>
      )}

    </div>
  );
}
