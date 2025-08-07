import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon,
  FireIcon,
  SparklesIcon,
  HeartIcon,
  TrophyIcon,
  ShieldCheckIcon,
  GiftIcon,
  ShoppingBagIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  PuzzlePieceIcon,
  Cog6ToothIcon,
  EllipsisHorizontalIcon,
  HandRaisedIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  CalendarIcon,
  UsersIcon,
  ArrowRightIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('following');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const fileInputRef = useRef(null);
  
  const { darkMode } = useTheme();
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();



  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const sidebarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';

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

  const achievements = [
    { id: 1, title: "First Steps", description: "Complete your first lesson", icon: "🎯", unlocked: true },
    { id: 2, title: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥", unlocked: true },
    { id: 3, title: "Sign Master", description: "Learn 100 signs", icon: "📚", unlocked: true },
    { id: 4, title: "Quiz Champion", description: "Score 90% on any quiz", icon: "🏆", unlocked: false },
    { id: 5, title: "Community Helper", description: "Help 10 other learners", icon: "🤝", unlocked: false },
    { id: 6, title: "Perfect Week", description: "Complete all daily goals for 7 days", icon: "⭐", unlocked: false }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Profile photo management functions
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const photoUrl = e.target.result;
        
                 try {
           // Send to backend
           const response = await fetch('http://localhost:5000/api/auth/profile-photo', {
             method: 'PUT',
             headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${localStorage.getItem('token')}`
             },
             body: JSON.stringify({ photoUrl })
           });

           if (!response.ok) {
             const errorText = await response.text();
             throw new Error(`HTTP ${response.status}: ${errorText}`);
           }
           
           const data = await response.json();
          
                     if (data.success) {
             // Update user context
             setUser(prev => ({ ...prev, avatar: data.data.avatar }));
             setShowPhotoOptions(false);
             alert(isGoogleUser() ? 'Profile photo updated successfully! Your Google photo has been replaced.' : 'Profile photo updated successfully!');
           } else {
             alert(data.message || 'Failed to update profile photo');
           }
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          alert('Failed to upload photo. Please try again.');
        }
      };
      
      reader.onerror = () => {
        alert('Failed to read the image file. Please try again.');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Photo upload error:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    const message = isGoogleUser() 
      ? 'Are you sure you want to remove your Google profile photo? You can always upload your own photo instead.'
      : 'Are you sure you want to remove your profile photo?';
    
    if (!confirm(message)) return;

         try {
       const response = await fetch('http://localhost:5000/api/auth/profile-photo', {
         method: 'DELETE',
         headers: {
           'Authorization': `Bearer ${localStorage.getItem('token')}`
         }
       });

       const data = await response.json();
      
             if (data.success) {
         // Update user context
         setUser(prev => ({ ...prev, avatar: '' }));
         setShowPhotoOptions(false);
         alert(isGoogleUser() ? 'Google profile photo removed successfully! You can now upload your own photo.' : 'Profile photo removed successfully!');
       } else {
         alert(data.message || 'Failed to remove profile photo');
       }
    } catch (error) {
      console.error('Remove photo error:', error);
      alert('Failed to remove photo. Please try again.');
    }
  };

  const getProfilePhoto = () => {
    if (user?.avatar && user.avatar.trim() !== '') {
      return user.avatar;
    }
    return null;
  };

  const isGoogleUser = () => {
    return user?.googleId;
  };



  // Close photo options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPhotoOptions && !event.target.closest('.photo-options-container')) {
        setShowPhotoOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPhotoOptions]);

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
              <span className="font-semibold">{user?.name || 'User'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Fixed Left Sidebar - Navigation */}
        <Sidebar handleLogout={handleLogout} />

        {/* Main Content Area */}
        <div className={`flex-1 ml-64 ${bg}`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex">
              {/* Main Content */}
              <div className="flex-1 p-6">
                {/* Profile Header */}
                <div className={`p-6 rounded-lg border ${border} mb-6`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="relative photo-options-container">
                        {getProfilePhoto() ? (
                          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600">
                            <img 
                              src={getProfilePhoto()} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                                                 ) : (
                           <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center relative group">
                             <PlusIcon className="w-8 h-8 text-white" />
                             <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                               Click to add photo
                             </div>
                           </div>
                         )}
                        
                        {/* Edit Photo Button */}
                        <button 
                          onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                          className="absolute -top-1 -right-1 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4 text-white" />
                        </button>

                        {/* Photo Options Dropdown */}
                        {showPhotoOptions && (
                          <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-600 z-10">
                            <div className="p-2">
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingPhoto}
                                className="w-full flex items-center space-x-2 p-2 hover:bg-gray-700 rounded text-sm transition-colors"
                              >
                                <PhotoIcon className="w-4 h-4 text-gray-900 font-semibold" />
                                <span className="text-gray-900 font-semibold">{isUploadingPhoto ? 'Uploading...' : 'Upload New Photo'}</span>
                              </button>
                              
                              {getProfilePhoto() && (
                                <button
                                  onClick={handleRemovePhoto}
                                  className="w-full flex items-center space-x-2 p-2 hover:bg-gray-700 rounded text-sm transition-colors text-red-400"
                                >
                                  <XMarkIcon className="w-4 h-4 text-gray-900 font-semibold" />
                                  <span className="text-gray-900 font-semibold">{isGoogleUser() ? 'Remove Google Photo' : 'Remove Photo'}</span>
                                </button>
                              )}
                              
                              {isGoogleUser() && getProfilePhoto() && (
                                <div className="p-2 text-xs text-gray-400 border-t border-gray-600 mt-2">
                                  <p className="text-gray-900 font-semibold">Currently using Google profile photo</p>
                                  <p className="text-yellow-400 mt-1">You can replace it with your own photo</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      

                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>{user?.name || 'User'}</h1>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Joined {userStats.joinedDate}</p>
                     {isGoogleUser() && (
                       <p className="text-green-400 text-sm">✓ Google Account</p>
                     )}
                     {isGoogleUser() && getProfilePhoto() && (
                       <p className="text-blue-400 text-sm">📸 Using Google profile photo</p>
                     )}
                     {!isGoogleUser() && getProfilePhoto() && (
                       <p className="text-purple-400 text-sm">📸 Custom profile photo</p>
                     )}
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-blue-400">{userStats.following} Following</span>
                      <span className="text-blue-400">{userStats.followers} Followers</span>
                    </div>
                  </div>
                </div>

                

                {/* Statistics Section */}
                <div className={`p-6 rounded-lg border ${border} mb-6`}>
                  <h2 className="text-xl font-bold mb-4">Statistics</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <FireIcon className="w-5 h-5 text-orange-400" />
                        <span className="font-semibold">{userStats.streak} Day streak</span>
                      </div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <SparklesIcon className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold">{userStats.totalXP} Total XP</span>
                      </div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                        <span className="font-semibold">{userStats.currentLeague}</span>
                      </div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrophyIcon className="w-5 h-5 text-yellow-400" />
                        <span className="font-semibold">{userStats.top3Finishes} Top 3 finishes</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Achievements Section */}
                <div className={`p-6 rounded-lg border ${border}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Achievements</h2>
                    <button className="text-blue-400 hover:text-blue-300 text-sm">
                      VIEW ALL
                    </button>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement) => (
                      <div 
                        key={achievement.id} 
                        className={`p-4 rounded-lg border ${achievement.unlocked ? 'bg-gray-700 border-green-500' : 'bg-gray-800 border-gray-600 opacity-50'}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{achievement.icon}</span>
                          <div>
                            <h3 className="font-semibold text-sm">{achievement.title}</h3>
                            <p className="text-gray-400 text-xs">{achievement.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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

               {/* Right Sidebar */}
              <div className="w-80 p-4 space-y-4">
                {/* Top Bar - User Stats/Currency */}
                <div className={`p-4 rounded-lg border ${border}`}>
                  <div className="flex items-center justify-between">

                    <div className="flex items-center space-x-2">
                      <FireIcon className="w-5 h-5 text-orange-400" />
                      <span className="font-semibold">{userStats.streak}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{userStats.gems}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <HeartIcon className="w-5 h-5 text-red-400" />
                      <span className="font-semibold">{userStats.lives}</span>
                    </div>
                  </div>
                </div>

                {/* Following/Followers Tabs */}
                <div className={`p-4 rounded-lg border ${border}`}>
                  <div className="flex space-x-4 mb-4">
                    <button 
                      onClick={() => setActiveTab('following')}
                      className={`pb-2 ${activeTab === 'following' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
                    >
                      FOLLOWING
                    </button>
                    <button 
                      onClick={() => setActiveTab('followers')}
                      className={`pb-2 ${activeTab === 'followers' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
                    >
                      FOLLOWERS
                    </button>
                  </div>
                  
                  {activeTab === 'following' && (
                    <div className="text-center py-8">
                      <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400 text-sm">No following yet</p>
                    </div>
                  )}
                  
                  {activeTab === 'followers' && (
                    <div className="text-center py-8">
                      <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400 text-sm">No followers yet</p>
                    </div>
                  )}
                </div>

                {/* Social Connection Prompt */}
                <div className={`p-4 rounded-lg border ${border}`}>
                  <div className="text-center py-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <HandRaisedIcon className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-gray-300 text-sm mb-4">
                      Learning sign language is more fun and effective when you connect with others.
                    </p>
                  </div>
                </div>

                {/* Add Friends Section */}
                <div className={`p-4 rounded-lg border ${border}`}>
                  <h3 className="font-semibold mb-3">Add friends</h3>
                  <div className="space-y-2">
                    <button className="flex items-center justify-between w-full p-3 hover:bg-gray-700 rounded-lg transition-colors">
                      <div className="flex items-center space-x-3">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm">Find friends</span>
                      </div>
                      <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="flex items-center justify-between w-full p-3 hover:bg-gray-700 rounded-lg transition-colors">
                      <div className="flex items-center space-x-3">
                        <EnvelopeIcon className="w-5 h-5 text-green-400" />
                        <span className="text-sm">Invite friends</span>
                      </div>
                      <ArrowRightIcon className="w-4 h-4 text-gray-400" />
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
    </div>
  );
} 