import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContextConstants';
import audioGenerator from '../utils/audioGenerator';
import Modal from './Modal';
import {
  AcademicCapIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  HandRaisedIcon,
  UserGroupIcon,
  BoltIcon,
  ChartBarIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';

export default function LearningModulesManagement() {
  const { darkMode } = useTheme();
  const { token } = useAuth();
  
  // State management
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'basics',
    order: 1,
    xpReward: 20,
    level: 0,
    isActive: true,
    moduleType: 'flashcards',
    flashcards: [],
    quizQuestions: []
  });

  // File upload states
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Theme variables
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const inputBg = darkMode ? 'bg-[#1F2937]' : 'bg-white';

  // Categories for learning modules
  const categories = [
    { value: 'all', label: 'All Categories', icon: BookOpenIcon, color: 'bg-gray-500' },
    { value: 'basics', label: 'Basics', icon: HandRaisedIcon, color: 'bg-green-500' },
    { value: 'alphabet', label: 'Alphabet', icon: AcademicCapIcon, color: 'bg-blue-500' },
    { value: 'numbers', label: 'Numbers', icon: PuzzlePieceIcon, color: 'bg-purple-500' },
    { value: 'phrases', label: 'Phrases', icon: BookOpenIcon, color: 'bg-pink-500' },
    { value: 'family', label: 'Family', icon: UserGroupIcon, color: 'bg-orange-500' },
    { value: 'activities', label: 'Activities', icon: BoltIcon, color: 'bg-red-500' },
    { value: 'advanced', label: 'Advanced', icon: StarIcon, color: 'bg-yellow-500' }
  ];

  // Fetch skills from API
  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/skills', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSkills(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch learning modules');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch learning modules');
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      setError('Failed to fetch learning modules');
    } finally {
      setLoading(false);
    }
  };

  // Filter skills based on search and category
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Basic validation
    if (!formData.title.trim()) {
      setError('Title is required');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    if (formData.title.length > 100) {
      setError('Title must be 100 characters or less');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    if (formData.description.length > 300) {
      setError('Description must be 300 characters or less');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    if (formData.order < 1 || formData.order > 100) {
      setError('Order must be between 1 and 100');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    if (formData.xpReward < 5 || formData.xpReward > 100) {
      setError('XP Reward must be between 5 and 100');
      setTimeout(() => setError(''), 5000);
      return;
    }

    // Content validation based on module type
    if (formData.moduleType === 'flashcards' && formData.flashcards.length === 0) {
      setError('At least one flashcard is required for flashcard modules');
      setTimeout(() => setError(''), 5000);
      return;
    }

    if (formData.moduleType === 'quiz' && formData.quizQuestions.length === 0) {
      setError('At least one quiz question is required for quiz modules');
      setTimeout(() => setError(''), 5000);
      return;
    }

    if (formData.moduleType === 'mixed' && formData.flashcards.length === 0 && formData.quizQuestions.length === 0) {
      setError('Mixed modules require at least one flashcard or quiz question');
      setTimeout(() => setError(''), 5000);
      return;
    }

    // Validate flashcards
    for (let i = 0; i < formData.flashcards.length; i++) {
      const card = formData.flashcards[i];
      if (!card.word.trim()) {
        setError(`Flashcard ${i + 1}: Word is required`);
        setTimeout(() => setError(''), 5000);
        return;
      }
      if (!card.meaning.trim()) {
        setError(`Flashcard ${i + 1}: Meaning is required`);
        setTimeout(() => setError(''), 5000);
        return;
      }
      if (!card.imagePath && !card.videoPath) {
        setError(`Flashcard ${i + 1}: At least one image or video is required`);
        setTimeout(() => setError(''), 5000);
        return;
      }
    }

    // Validate quiz questions
    for (let i = 0; i < formData.quizQuestions.length; i++) {
      const question = formData.quizQuestions[i];
      if (!question.question.trim()) {
        setError(`Quiz Question ${i + 1}: Question is required`);
        setTimeout(() => setError(''), 5000);
        return;
      }
      if (!question.correctAnswer.trim()) {
        setError(`Quiz Question ${i + 1}: Correct answer is required`);
        setTimeout(() => setError(''), 5000);
        return;
      }
      if (question.options.filter(opt => opt.trim()).length < 2) {
        setError(`Quiz Question ${i + 1}: At least 2 options are required`);
        setTimeout(() => setError(''), 5000);
        return;
      }
      if (!question.options.includes(question.correctAnswer)) {
        setError(`Quiz Question ${i + 1}: Correct answer must be one of the options`);
        setTimeout(() => setError(''), 5000);
        return;
      }
    }
    
    setSubmittingForm(true);
    
    try {
      const url = selectedSkill 
        ? `http://localhost:5000/api/admin/skills/${selectedSkill._id}`
        : 'http://localhost:5000/api/admin/skills';
      
      const method = selectedSkill ? 'PUT' : 'POST';
      
      // For edit mode, only send modified fields (partial update)
      const dataToSend = selectedSkill ? getModifiedFields() : formData;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuccess(selectedSkill ? 'Learning module updated successfully!' : 'Learning module created successfully!');
          setShowAddModal(false);
          setShowEditModal(false);
          setSelectedSkill(null);
          resetForm();
          fetchSkills();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(data.message || 'Failed to save learning module');
          setTimeout(() => setError(''), 5000);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save learning module');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error saving skill:', error);
      setError('Error saving learning module');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSubmittingForm(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'basics',
      order: 1,
      xpReward: 20,
      level: 0,
      isActive: true,
      moduleType: 'flashcards',
      flashcards: [],
      quizQuestions: []
    });
    setError('');
    setSuccess('');
    setUploadingFiles(false);
  };

  // Open edit modal
  const openEditModal = (skill) => {
    setSelectedSkill(skill);
    setFormData({
      title: skill.title || '',
      description: skill.description || '',
      category: skill.category || 'basics',
      order: skill.order || 1,
      xpReward: skill.xpReward || 20,
      level: skill.level || 0,
      isActive: skill.isActive !== undefined ? skill.isActive : true,
      moduleType: skill.moduleType || 'flashcards',
      flashcards: skill.flashcards || [],
      quizQuestions: skill.quizQuestions || []
    });
    setError('');
    setSuccess('');
    setShowEditModal(true);
  };

  // Check if a field has been modified
  const isFieldModified = (fieldName) => {
    if (!selectedSkill) return false;
    return formData[fieldName] !== selectedSkill[fieldName];
  };

  // Get modified fields for partial update
  const getModifiedFields = () => {
    if (!selectedSkill) return formData;
    
    const modifiedFields = {};
    Object.keys(formData).forEach(key => {
      if (formData[key] !== selectedSkill[key]) {
        modifiedFields[key] = formData[key];
      }
    });
    return modifiedFields;
  };

  // File upload functions
  const uploadFile = async (file, type) => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.filePath;
        } else {
          throw new Error(data.message || 'Upload failed');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleFileUpload = async (file, type, index, field) => {
    setUploadingFiles(true);
    setError('');
    
    try {
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size must be less than 50MB');
      }

      // Validate file type
      const allowedTypes = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'video/mp4': 'mp4',
        'video/webm': 'webm',
        'video/avi': 'avi',
        'audio/mpeg': 'mp3',
        'audio/wav': 'wav',
        'audio/ogg': 'ogg',
        'audio/mp4': 'm4a'
      };

      if (!allowedTypes[file.type]) {
        throw new Error('Invalid file type. Only images, videos, and audio files are allowed.');
      }

      const filePath = await uploadFile(file, type);
      
      if (formData.moduleType === 'flashcards' || formData.moduleType === 'mixed') {
        const updatedFlashcards = [...formData.flashcards];
        if (!updatedFlashcards[index]) {
          updatedFlashcards[index] = { 
            word: '', 
            meaning: '', 
            imagePath: '', 
            videoPath: '', 
            audioPath: '', 
            difficulty: 'beginner' 
          };
        }
        updatedFlashcards[index][field] = filePath;
        setFormData({ ...formData, flashcards: updatedFlashcards });
      } 
      
      if (formData.moduleType === 'quiz' || formData.moduleType === 'mixed') {
        const updatedQuestions = [...formData.quizQuestions];
        if (!updatedQuestions[index]) {
          updatedQuestions[index] = { 
            questionType: 'image-to-word', 
            question: '', 
            correctAnswer: '', 
            options: ['', '', '', ''], 
            imagePath: '', 
            audioPath: '', 
            explanation: '' 
          };
        }
        updatedQuestions[index][field] = filePath;
        setFormData({ ...formData, quizQuestions: updatedQuestions });
      }

      setSuccess('File uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload file');
      setTimeout(() => setError(''), 5000);
    } finally {
      setUploadingFiles(false);
    }
  };

  // Generate audio using TTS for flashcard
  const generateAudioForCard = async (index) => {
    const card = formData.flashcards[index];
    if (!card.word.trim()) {
      setError('Please enter a word first');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setUploadingFiles(true);
      
      // Generate TTS audio
      await audioGenerator.generateAudio(card.word, {
        rate: 0.7, // Slower for learning
        pitch: 1.0,
        volume: 1.0
      });

      // For now, we'll use a placeholder path since we can't save TTS to file in browser
      // In a real implementation, you'd send this to backend to generate and save audio file
      const updatedFlashcards = [...formData.flashcards];
      updatedFlashcards[index].audioPath = 'tts-generated'; // Placeholder
      setFormData({ ...formData, flashcards: updatedFlashcards });

      setSuccess(`Audio generated for "${card.word}"`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to generate audio');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploadingFiles(false);
    }
  };

  // Delete skill
  const handleDelete = async (skill) => {
    if (!window.confirm(`Are you sure you want to delete "${skill.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/skills/${skill._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Learning module deleted successfully!');
        fetchSkills();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete learning module');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
      setError('Error deleting learning module');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Get category info
  const getCategoryInfo = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || categories[0];
  };

  // Get status badge
  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <XCircleIcon className="w-3 h-3 mr-1" />
          Inactive
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className={`p-6 rounded-lg border ${border} ${cardBg}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Modules Management</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage Duolingo-style learning skills and progression</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Learning Module
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg dark:bg-green-900 dark:border-green-600 dark:text-green-200">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-600 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search learning modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border ${border} rounded-lg ${inputBg} ${text} focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>
        </div>
        <div className="sm:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`w-full px-3 py-2 border ${border} rounded-lg ${inputBg} ${text} focus:outline-none focus:ring-2 focus:ring-green-500`}
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.map((skill) => {
          const categoryInfo = getCategoryInfo(skill.category);
          const CategoryIcon = categoryInfo.icon;
          
          return (
            <div key={skill._id} className={`p-6 rounded-lg border ${border} ${cardBg} hover:shadow-lg transition-all duration-200`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`${categoryInfo.color} p-3 rounded-full`}>
                  <CategoryIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(skill)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Edit module"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(skill)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete module"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {skill.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {skill.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Category:</span>
                  <span className="font-medium">{categoryInfo.label}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Order:</span>
                  <span className="font-medium">{skill.order}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">XP Reward:</span>
                  <span className="font-medium">{skill.xpReward} XP</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Level:</span>
                  <span className="font-medium">{skill.level}/5</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  {getStatusBadge(skill.isActive)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-12">
          <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No learning modules found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first learning module.'
            }
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create First Module
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <Modal 
          isOpen={showAddModal || showEditModal} 
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedSkill(null);
            resetForm();
          }} 
          title={selectedSkill ? "Edit Learning Module" : "Add Learning Module"}
          className="bg-transparent border border-white/20 backdrop-blur-sm max-w-2xl w-full mx-4"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Module Title
                <span className="text-xs text-gray-400 ml-2">({formData.title.length}/100 characters)</span>
                {showEditModal && isFieldModified('title') && (
                  <span className="text-xs text-green-400 ml-2">✓ Will be updated</span>
                )}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 100);
                  setFormData({...formData, title: value});
                }}
                className={`w-full bg-transparent border text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200 ${
                  showEditModal && isFieldModified('title') 
                    ? 'border-green-500/50 bg-green-500/5' 
                    : 'border-white/20'
                }`}
                placeholder="Enter learning module title (e.g., Hello & Goodbye)"
                required
              />
              {showEditModal && isFieldModified('title') && (
                <p className="text-xs text-green-400 mt-1">
                  Current: "{selectedSkill.title}" → New: "{formData.title}"
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Description
                <span className="text-xs text-gray-400 ml-2">({formData.description.length}/300 characters)</span>
                {showEditModal && isFieldModified('description') && (
                  <span className="text-xs text-green-400 ml-2">✓ Will be updated</span>
                )}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 300);
                  setFormData({...formData, description: value});
                }}
                rows="3"
                className={`w-full bg-transparent border text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200 resize-none ${
                  showEditModal && isFieldModified('description') 
                    ? 'border-green-500/50 bg-green-500/5' 
                    : 'border-white/20'
                }`}
                placeholder="Describe what this module teaches"
                required
              />
              {showEditModal && isFieldModified('description') && (
                <p className="text-xs text-green-400 mt-1">
                  Current: "{selectedSkill.description}" → New: "{formData.description}"
                </p>
              )}
            </div>

            {/* Module Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Module Type
                {showEditModal && isFieldModified('moduleType') && (
                  <span className="text-xs text-green-400 ml-2">✓ Will be updated</span>
                )}
              </label>
              <select
                value={formData.moduleType}
                onChange={(e) => setFormData({...formData, moduleType: e.target.value})}
                className={`w-full bg-transparent border text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200 ${
                  showEditModal && isFieldModified('moduleType') 
                    ? 'border-green-500/50 bg-green-500/5' 
                    : 'border-white/20'
                }`}
                required
              >
                <option value="flashcards" className="bg-gray-800 text-white">Visual Flashcards (Learn Mode)</option>
                <option value="quiz" className="bg-gray-800 text-white">Quiz Mode (Multiple Choice)</option>
                <option value="mixed" className="bg-gray-800 text-white">Mixed (Flashcards + Quiz)</option>
              </select>
              {showEditModal && isFieldModified('moduleType') && (
                <p className="text-xs text-green-400 mt-1">
                  Current: "{selectedSkill.moduleType}" → New: "{formData.moduleType}"
                </p>
              )}
            </div>

            {/* Category and Order */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-transparent border border-white/20 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200"
                  required
                >
                  {categories.filter(cat => cat.value !== 'all').map(category => (
                    <option key={category.value} value={category.value} className="bg-gray-800 text-white">
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Order
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 1})}
                  className="w-full bg-transparent border border-white/20 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200"
                  placeholder="Module order (1-100)"
                  required
                />
              </div>
            </div>

            {/* XP Reward and Level */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  XP Reward
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={formData.xpReward}
                  onChange={(e) => setFormData({...formData, xpReward: parseInt(e.target.value) || 20})}
                  className="w-full bg-transparent border border-white/20 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200"
                  placeholder="XP reward (5-100)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: parseInt(e.target.value)})}
                  className="w-full bg-transparent border border-white/20 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200"
                >
                  <option value={0} className="bg-gray-800 text-white">Level 0 (New)</option>
                  <option value={1} className="bg-gray-800 text-white">Level 1 (Purple)</option>
                  <option value={2} className="bg-gray-800 text-white">Level 2 (Blue)</option>
                  <option value={3} className="bg-gray-800 text-white">Level 3 (Green)</option>
                  <option value={4} className="bg-gray-800 text-white">Level 4 (Red)</option>
                  <option value={5} className="bg-gray-800 text-white">Level 5 (Orange)</option>
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Status
              </label>
              <select
                value={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                className="w-full bg-transparent border border-white/20 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200"
              >
                <option value={true} className="bg-gray-800 text-white">Active</option>
                <option value={false} className="bg-gray-800 text-white">Inactive</option>
              </select>
            </div>

            {/* Content Management Section */}
            <div className="border-t border-white/20 pt-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">Content Management</h3>
              
              {formData.moduleType === 'flashcards' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-gray-300">Flashcards</h4>
                    <button
                      type="button"
                      onClick={() => {
                        const newFlashcards = [...formData.flashcards, {
                          word: '',
                          meaning: '',
                          imagePath: '',
                          videoPath: '',
                          audioPath: '',
                          difficulty: 'beginner'
                        }];
                        setFormData({...formData, flashcards: newFlashcards});
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Add Flashcard
                    </button>
                  </div>
                  
                  {formData.flashcards.length === 0 && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-sm text-blue-300">
                        No flashcards added yet. Click "Add Flashcard" to create your first learning card.
                      </p>
                    </div>
                  )}
                  
                  {formData.flashcards.map((card, index) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-gray-300">Flashcard {index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedFlashcards = formData.flashcards.filter((_, i) => i !== index);
                            setFormData({...formData, flashcards: updatedFlashcards});
                          }}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Word</label>
                          <input
                            type="text"
                            value={card.word}
                            onChange={(e) => {
                              const updatedFlashcards = [...formData.flashcards];
                              updatedFlashcards[index].word = e.target.value;
                              setFormData({...formData, flashcards: updatedFlashcards});
                            }}
                            className="w-full bg-transparent border border-white/20 text-white rounded-lg px-3 py-2 text-sm"
                            placeholder="Enter word"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Meaning</label>
                          <input
                            type="text"
                            value={card.meaning}
                            onChange={(e) => {
                              const updatedFlashcards = [...formData.flashcards];
                              updatedFlashcards[index].meaning = e.target.value;
                              setFormData({...formData, flashcards: updatedFlashcards});
                            }}
                            className="w-full bg-transparent border border-white/20 text-white rounded-lg px-3 py-2 text-sm"
                            placeholder="Enter meaning"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Sign Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                handleFileUpload(e.target.files[0], 'image', index, 'imagePath');
                              }
                            }}
                            className="w-full bg-transparent border border-white/20 text-white rounded-lg px-3 py-2 text-sm"
                          />
                          {card.imagePath && (
                            <p className="text-xs text-green-400 mt-1">✓ Image uploaded</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Sign Video</label>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                handleFileUpload(e.target.files[0], 'video', index, 'videoPath');
                              }
                            }}
                            className="w-full bg-transparent border border-white/20 text-white rounded-lg px-3 py-2 text-sm"
                          />
                          {card.videoPath && (
                            <p className="text-xs text-green-400 mt-1">✓ Video uploaded</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Audio Pronunciation</label>
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={(e) => {
                                if (e.target.files[0]) {
                                  handleFileUpload(e.target.files[0], 'audio', index, 'audioPath');
                                }
                              }}
                              className="w-full bg-transparent border border-white/20 text-white rounded-lg px-3 py-2 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => generateAudioForCard(index)}
                              disabled={!card.word.trim() || uploadingFiles}
                              className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                            >
                              {uploadingFiles ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>Generating...</span>
                                </>
                              ) : (
                                <>
                                  <SpeakerWaveIcon className="w-4 h-4" />
                                  <span>Auto-Generate Audio</span>
                                </>
                              )}
                            </button>
                          </div>
                          {card.audioPath && (
                            <p className="text-xs text-green-400 mt-1">✓ Audio uploaded</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Difficulty</label>
                          <select
                            value={card.difficulty}
                            onChange={(e) => {
                              const updatedFlashcards = [...formData.flashcards];
                              updatedFlashcards[index].difficulty = e.target.value;
                              setFormData({...formData, flashcards: updatedFlashcards});
                            }}
                            className="w-full bg-transparent border border-white/20 text-white rounded-lg px-3 py-2 text-sm"
                          >
                            <option value="beginner" className="bg-gray-800 text-white">Beginner</option>
                            <option value="intermediate" className="bg-gray-800 text-white">Intermediate</option>
                            <option value="advanced" className="bg-gray-800 text-white">Advanced</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {formData.moduleType === 'quiz' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-gray-300">Quiz Questions</h4>
                    <button
                      type="button"
                      onClick={() => {
                        const newQuestions = [...formData.quizQuestions, {
                          questionType: 'image-to-word',
                          question: '',
                          correctAnswer: '',
                          options: ['', '', '', ''],
                          imagePath: '',
                          audioPath: '',
                          explanation: ''
                        }];
                        setFormData({...formData, quizQuestions: newQuestions});
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Add Question
                    </button>
                  </div>
                  
                  {formData.quizQuestions.length === 0 && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-sm text-blue-300">
                        No quiz questions added yet. Click "Add Question" to create your first quiz question.
                      </p>
                    </div>
                  )}
                  
                  {formData.quizQuestions.map((question, index) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-gray-300">Question {index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedQuestions = formData.quizQuestions.filter((_, i) => i !== index);
                            setFormData({...formData, quizQuestions: updatedQuestions});
                          }}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Question Type</label>
                          <select
                            value={question.questionType}
                            onChange={(e) => {
                              const updatedQuestions = [...formData.quizQuestions];
                              updatedQuestions[index].questionType = e.target.value;
                              setFormData({...formData, quizQuestions: updatedQuestions});
                            }}
                            className="w-full bg-transparent border border-white/20 text-white rounded-lg px-3 py-2 text-sm"
                          >
                            <option value="image-to-word" className="bg-gray-800 text-white">Image → Word</option>
                            <option value="word-to-image" className="bg-gray-800 text-white">Word → Image</option>
                            <option value="audio-to-image" className="bg-gray-800 text-white">Audio → Image</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Question</label>
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) => {
                              const updatedQuestions = [...formData.quizQuestions];
                              updatedQuestions[index].question = e.target.value;
                              setFormData({...formData, quizQuestions: updatedQuestions});
                            }}
                            className="w-full bg-transparent border border-white/20 text-white rounded-lg px-3 py-2 text-sm"
                            placeholder="Enter question"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Options</label>
                          {question.options.map((option, optionIndex) => (
                            <input
                              key={optionIndex}
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const updatedQuestions = [...formData.quizQuestions];
                                updatedQuestions[index].options[optionIndex] = e.target.value;
                                setFormData({...formData, quizQuestions: updatedQuestions});
                              }}
                              className="w-full bg-transparent border border-white/20 text-white rounded-lg px-3 py-2 text-sm mb-2"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                          ))}
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Correct Answer</label>
                          <input
                            type="text"
                            value={question.correctAnswer}
                            onChange={(e) => {
                              const updatedQuestions = [...formData.quizQuestions];
                              updatedQuestions[index].correctAnswer = e.target.value;
                              setFormData({...formData, quizQuestions: updatedQuestions});
                            }}
                            className="w-full bg-transparent border border-white/20 text-white rounded-lg px-3 py-2 text-sm"
                            placeholder="Enter correct answer"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Media (Image/Audio)</label>
                          <input
                            type="file"
                            accept="image/*,audio/*"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                const fileType = e.target.files[0].type.startsWith('image/') ? 'image' : 'audio';
                                const field = fileType === 'image' ? 'imagePath' : 'audioPath';
                                handleFileUpload(e.target.files[0], fileType, index, field);
                              }
                            }}
                            className="w-full bg-transparent border border-white/20 text-white rounded-lg px-3 py-2 text-sm"
                          />
                          {(question.imagePath || question.audioPath) && (
                            <p className="text-xs text-green-400 mt-1">✓ Media uploaded</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Explanation (Optional)</label>
                          <input
                            type="text"
                            value={question.explanation}
                            onChange={(e) => {
                              const updatedQuestions = [...formData.quizQuestions];
                              updatedQuestions[index].explanation = e.target.value;
                              setFormData({...formData, quizQuestions: updatedQuestions});
                            }}
                            className="w-full bg-transparent border border-white/20 text-white rounded-lg px-3 py-2 text-sm"
                            placeholder="Enter explanation"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {formData.moduleType === 'mixed' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-400">
                    Mixed modules will include both flashcards and quiz questions. 
                    Users will first learn with flashcards, then take a quiz.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <h4 className="text-md font-medium text-gray-300 mb-2">Flashcards</h4>
                      <p className="text-xs text-gray-400 mb-3">{formData.flashcards.length} cards</p>
                      <button
                        type="button"
                        onClick={() => {
                          const newFlashcards = [...formData.flashcards, {
                            word: '',
                            meaning: '',
                            imagePath: '',
                            videoPath: '',
                            audioPath: '',
                            difficulty: 'beginner'
                          }];
                          setFormData({...formData, flashcards: newFlashcards});
                        }}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Add Flashcard
                      </button>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <h4 className="text-md font-medium text-gray-300 mb-2">Quiz Questions</h4>
                      <p className="text-xs text-gray-400 mb-3">{formData.quizQuestions.length} questions</p>
                      <button
                        type="button"
                        onClick={() => {
                          const newQuestions = [...formData.quizQuestions, {
                            questionType: 'image-to-word',
                            question: '',
                            correctAnswer: '',
                            options: ['', '', '', ''],
                            imagePath: '',
                            audioPath: '',
                            explanation: ''
                          }];
                          setFormData({...formData, quizQuestions: newQuestions});
                        }}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Add Question
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Changes Summary for Edit Mode */}
            {showEditModal && Object.keys(getModifiedFields()).length > 0 && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h4 className="text-sm font-medium text-green-400 mb-2">Changes Summary:</h4>
                <ul className="text-xs text-green-300 space-y-1">
                  {Object.keys(getModifiedFields()).map(field => (
                    <li key={field} className="flex justify-between">
                      <span className="capitalize">{field}:</span>
                      <span>"{selectedSkill[field]}" → "{formData[field]}"</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-6 pt-8 border-t border-white/20">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedSkill(null);
                  resetForm();
                }}
                className="px-8 py-4 border border-white/20 text-white rounded-2xl text-base font-medium hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingForm || uploadingFiles}
                className={`px-8 py-4 backdrop-blur-sm text-white rounded-2xl text-base font-medium transition-all duration-200 shadow-lg border ${
                  submittingForm || uploadingFiles
                    ? 'bg-gray-500/50 border-gray-400/30 cursor-not-allowed'
                    : 'bg-green-500/90 hover:bg-green-600 hover:shadow-xl border-green-400/30'
                }`}
              >
                {submittingForm ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  selectedSkill ? 'Update Module' : 'Create Module'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
