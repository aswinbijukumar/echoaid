import { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline';
import Modal from './Modal';
import { useAuth } from '../context/AuthContextConstants';
import { API_BASE_URL } from '../constants/api';

const AdminQuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    category: 'alphabet',
    difficulty: 'Beginner',
    quizType: 'standard', // Default type
    level: 1, // Default level
    timeLimit: 10,
    passingScore: 70,
    maxAttempts: 3,
    tags: [],
    questions: []
  });
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    correctAnswerText: '',
    explanation: '',
    points: 1,
    image: null,
    imagePreview: null,
    video: null,
    videoPreview: null
  });
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    difficulty: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pages: 0
  });
  const [currentPage, setCurrentPage] = useState(1);

  const { token } = useAuth();

  // Reusable fetch function
  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...filters
      });

      const response = await fetch(`${API_BASE_URL}/api/admin/quiz?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setQuizzes(data.data);
          setPagination(data.pagination);
          setCurrentPage(data.pagination.current);
        }
      } else {
        console.error('Failed to fetch quizzes');
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, token]);

  // Effect for filters and token changes
  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      // Logical validations
      const errors = [];
      if (!quizForm.title || quizForm.title.trim().length < 3) errors.push('Title must be at least 3 characters');
      if (!quizForm.category) errors.push('Category is required');
      if (!quizForm.difficulty) errors.push('Difficulty is required');
      if (!Number.isFinite(quizForm.timeLimit) || quizForm.timeLimit < 1) errors.push('Time limit must be at least 1 minute');
      if (!Number.isFinite(quizForm.passingScore) || quizForm.passingScore < 1 || quizForm.passingScore > 100) errors.push('Passing score must be between 1 and 100');
      if (!Number.isFinite(quizForm.maxAttempts) || quizForm.maxAttempts < 1) errors.push('Max attempts must be at least 1');
      if (!quizForm.description || quizForm.description.trim().length < 10) errors.push('Description must be at least 10 characters');
      if (!Array.isArray(quizForm.questions) || quizForm.questions.length === 0) errors.push('Add at least one question');
      if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
      }

      // Transform questions to match backend schema
      const transformedQuestions = quizForm.questions.map(question => {
        console.log('Creating question:', question);
        console.log('Correct answer index:', question.correctAnswer);

        const transformed = {
          question: question.question,
          type: 'multiple-choice',
          options: question.options.map((option, index) => ({
            text: option,
            isCorrect: index === question.correctAnswer
          })),
          correctAnswer: question.options[question.correctAnswer] || '',
          explanation: question.explanation || '',
          difficulty: question.difficulty || 'Beginner',
          points: question.points || 10,
          mediaUrl: question.image || null,  // Save image to mediaUrl field
          videoUrl: question.video || null  // Save video to videoUrl field
        };

        console.log('Transformed question:', transformed);
        return transformed;
      });

      const quizData = {
        ...quizForm,
        questions: transformedQuestions
      };

      console.log('🔄 Creating quiz...');
      console.log('🔑 Token present:', !!token);
      console.log('📝 Quiz data:', quizData);
      console.log('🌐 API URL:', `${API_BASE_URL}/api/admin/quiz`);

      // Test network connectivity first
      try {
        const testResponse = await fetch(`${API_BASE_URL}/api/admin/quiz`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('🔍 Test fetch status:', testResponse.status);
      } catch (testError) {
        console.error('❌ Test fetch failed:', testError);
        alert(`Network error: ${testError.message}. Please check if the backend server is running.`);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quizData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Quiz creation successful:', data);
        if (data.success) {
          setShowCreateModal(false);
          resetQuizForm();
          // Refresh quizzes list
          fetchQuizzes();
        } else {
          alert(`Quiz creation failed: ${data.message || 'Unknown error'}`);
        }
      } else {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('❌ Quiz creation failed:', errorData);
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        alert(`Quiz creation failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Error creating quiz:', error);

      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Unable to connect to server. Please check if the backend server is running on port 5000.';
      } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
        errorMessage = 'Network error: Check your internet connection and server status.';
      }

      alert(`Error creating quiz: ${errorMessage}`);
    }
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    try {
      // Transform questions to match backend schema
      const transformedQuestions = quizForm.questions.map(question => {
        console.log('Updating question:', question);
        console.log('Correct answer index:', question.correctAnswer);

        const transformed = {
          question: question.question,
          type: 'multiple-choice',
          options: question.options.map((option, index) => ({
            text: option,
            isCorrect: index === question.correctAnswer
          })),
          correctAnswer: question.options[question.correctAnswer] || '',
          explanation: question.explanation || '',
          difficulty: question.difficulty || 'Beginner',
          points: question.points || 10,
          mediaUrl: question.image || null,  // Save image to mediaUrl field
          videoUrl: question.video || null  // Save video to videoUrl field
        };

        console.log('Transformed question:', transformed);
        return transformed;
      });

      const quizData = {
        ...quizForm,
        questions: transformedQuestions
      };

      console.log('🔄 Updating quiz:', selectedQuiz._id);
      console.log('🔑 Token present:', !!token);
      console.log('📝 Quiz data:', quizData);
      console.log('🌐 API URL:', `${API_BASE_URL}/api/admin/quiz/${selectedQuiz._id}`);

      // Test network connectivity first
      try {
        const testResponse = await fetch(`${API_BASE_URL}/api/admin/quiz`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('🔍 Test fetch status:', testResponse.status);
      } catch (testError) {
        console.error('❌ Test fetch failed:', testError);
        alert(`Network error: ${testError.message}. Please check if the backend server is running.`);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/quiz/${selectedQuiz._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quizData)
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Quiz update successful:', data);
        if (data.success) {
          setShowEditModal(false);
          // Refresh quizzes list
          fetchQuizzes();
        } else {
          alert(`Quiz update failed: ${data.message || 'Unknown error'}`);
        }
      } else {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('❌ Quiz update failed:', errorData);
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        alert(`Quiz update failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Error updating quiz:', error);

      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Unable to connect to server. Please check if the backend server is running on port 5000.';
      } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
        errorMessage = 'Network error: Check your internet connection and server status.';
      }

      alert(`Error updating quiz: ${errorMessage}`);
    }
  };

  const testConnectivity = async () => {
    try {
      console.log('🔍 Testing connectivity to:', `${API_BASE_URL}/api/admin/quiz`);
      const response = await fetch(`${API_BASE_URL}/api/admin/quiz`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('📊 Connectivity test status:', response.status);
      if (response.ok) {
        alert('✅ Backend server is reachable!');
      } else {
        alert(`⚠️ Backend responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Connectivity test failed:', error);
      alert(`❌ Cannot reach backend server: ${error.message}`);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/quiz/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setQuizzes(quizzes.filter(quiz => quiz._id !== quizId));
        }
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const handleToggleStatus = async (quizId, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/quiz/${quizId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setQuizzes(quizzes.map(quiz =>
            quiz._id === quizId
              ? { ...quiz, isActive: !currentStatus }
              : quiz
          ));
        }
      }
    } catch (error) {
      console.error('Error toggling quiz status:', error);
    }
  };


  const handleEditQuiz = (quiz) => {
    setSelectedQuiz(quiz);

    // Transform questions from backend format to frontend format
    const transformedQuestions = (quiz.questions || []).map(question => {
      const correctAnswerIndex = question.options.findIndex(opt => opt.isCorrect);
      console.log('Question:', question.question);
      console.log('Options:', question.options);
      console.log('Correct Answer Index:', correctAnswerIndex);

      return {
        question: question.question,
        options: question.options.map(opt => opt.text),
        correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : 0, // Default to 0 if no correct answer found
        explanation: question.explanation,
        points: question.points,
        image: question.mediaUrl,
        video: question.videoUrl // Add video field
      };
    });

    setQuizForm({
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      difficulty: quiz.difficulty,
      quizType: quiz.quizType || 'standard',
      level: quiz.level || 1,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      tags: quiz.tags || [],
      questions: transformedQuestions
    });
    setShowEditModal(true);
  };

  const handleAddQuestion = () => {
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 1,
      image: null,
      imagePreview: null,
      video: null,
      videoPreview: null
    });
    setEditingQuestionIndex(null);
    setShowQuestionModal(true);
  };

  const resetQuizForm = () => {
    setQuizForm({
      title: '',
      description: '',
      category: 'alphabet',
      difficulty: 'Beginner',
      quizType: 'standard',
      level: 1,
      timeLimit: 10,
      passingScore: 70,
      maxAttempts: 3,
      tags: [],
      questions: []
    });
    setSelectedQuiz(null);
  };

  const handleEditQuestion = (questionIndex) => {
    const question = quizForm.questions[questionIndex];
    setQuestionForm({
      question: question.question || '',
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer || 0,
      explanation: question.explanation || '',
      points: question.points || 1,
      image: null,
      imagePreview: question.image || null,
      video: null,
      videoPreview: question.video || null
    });
    setEditingQuestionIndex(questionIndex);
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = (questionIndex) => {
    const updatedQuestions = quizForm.questions.filter((_, index) => index !== questionIndex);
    setQuizForm({ ...quizForm, questions: updatedQuestions });
  };

  const handleSaveQuestion = () => {
    if (!questionForm.question.trim()) {
      alert('Please enter a question');
      return;
    }

    if (questionForm.options.filter(opt => opt && typeof opt === 'string' && opt.trim()).length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    console.log('Saving question form:', questionForm);
    console.log('Correct answer selected:', questionForm.correctAnswer);

    const selectedCorrectText = (questionForm.options || [])[questionForm.correctAnswer] || '';
    const newQuestion = {
      question: questionForm.question,
      options: questionForm.options.filter(opt => opt && typeof opt === 'string' && opt.trim()),
      correctAnswer: questionForm.correctAnswer,
      correctAnswerText: questionForm.correctAnswerText || selectedCorrectText,
      explanation: questionForm.explanation,
      points: questionForm.points,
      image: questionForm.imagePreview,
      video: questionForm.videoPreview
    };

    console.log('New question object:', newQuestion);

    let updatedQuestions;
    if (editingQuestionIndex !== null) {
      updatedQuestions = [...quizForm.questions];
      updatedQuestions[editingQuestionIndex] = newQuestion;
    } else {
      updatedQuestions = [...quizForm.questions, newQuestion];
    }

    setQuizForm({ ...quizForm, questions: updatedQuestions });
    setShowQuestionModal(false);
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 1,
      image: null,
      imagePreview: null,
      video: null,
      videoPreview: null
    });
    setEditingQuestionIndex(null);
  };

  const uploadFile = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'quizzes');

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.data.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Failed to upload ${type}. Please try again.`);
      return null;
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show loading or optimistic update could go here
      const url = await uploadFile(file, 'image');
      if (url) {
        setQuestionForm({
          ...questionForm,
          image: url, // Store URL directly
          imagePreview: url
        });
      }
    }
  };

  const removeImage = () => {
    setQuestionForm({
      ...questionForm,
      image: null,
      imagePreview: null
    });
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await uploadFile(file, 'video');
      if (url) {
        setQuestionForm({
          ...questionForm,
          video: url, // Store URL directly
          videoPreview: url
        });
      }
    }
  };

  const removeVideo = () => {
    setQuestionForm({
      ...questionForm,
      video: null,
      videoPreview: null
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'alphabet': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'phrases': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'family': return 'bg-pink-500/20 text-pink-400 border border-pink-500/30';
      case 'activities': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'arena': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold shadow-[0_0_15px_rgba(234,179,8,0.4)] animate-pulse';
      default: return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
  };

  // Keep UI mounted to preserve input focus; show inline loader instead

  return (
    <div className="w-full max-w-full bg-transparent overflow-hidden">
      {/* Page Header with Transparent Background */}
      <div className="bg-transparent border-b border-white/20 mb-6">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-white">Quiz Management</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={testConnectivity}
              className="inline-flex items-center px-4 py-2 bg-blue-500/90 backdrop-blur-sm text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-lg border border-blue-400/30"
              title="Test Backend Connectivity"
            >
              <span className="text-sm">Test Connection</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-6 py-3 bg-green-500/90 backdrop-blur-sm text-white rounded-xl hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl border border-green-400/30"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-transparent border border-white/20 rounded-2xl p-4 mb-6 backdrop-blur-sm relative">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm"
              onFocus={(e) => e.target.select && e.target.select()}
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-green-500"></div>
              </div>
            )}
          </div>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="glass-select px-3 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 appearance-none"
            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
          >
            <option value="all" className="bg-gray-800 text-white">All Categories</option>
            <option value="alphabet" className="bg-gray-800 text-white">Alphabet</option>
            <option value="phrases" className="bg-gray-800 text-white">Phrases</option>
            <option value="family" className="bg-gray-800 text-white">Family</option>
            <option value="activities" className="bg-gray-800 text-white">Activities</option>
            <option value="advanced" className="bg-gray-800 text-white">Advanced</option>
            <option value="arena" className="bg-yellow-600 text-white font-bold">⚡ Arena Mode</option>
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="glass-select px-3 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 appearance-none"
            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
          >
            <option value="all" className="bg-gray-800 text-white">All Difficulties</option>
            <option value="Beginner" className="bg-gray-800 text-white">Beginner</option>
            <option value="Intermediate" className="bg-gray-800 text-white">Intermediate</option>
            <option value="Advanced" className="bg-gray-800 text-white">Advanced</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="glass-select px-3 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 appearance-none"
            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
          >
            <option value="all" className="bg-gray-800 text-white">All Status</option>
            <option value="active" className="bg-gray-800 text-white">Active</option>
            <option value="inactive" className="bg-gray-800 text-white">Inactive</option>
          </select>

          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              handleFilterChange('sortBy', sortBy);
              handleFilterChange('sortOrder', sortOrder);
            }}
            className="glass-select px-3 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 appearance-none"
            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
          >
            <option value="createdAt-desc" className="bg-gray-800 text-white">Newest First</option>
            <option value="createdAt-asc" className="bg-gray-800 text-white">Oldest First</option>
            <option value="title-asc" className="bg-gray-800 text-white">Title A-Z</option>
            <option value="title-desc" className="bg-gray-800 text-white">Title Z-A</option>
            <option value="stats.totalAttempts-desc" className="bg-gray-800 text-white">Most Popular</option>
            <option value="stats.averageScore-desc" className="bg-gray-800 text-white">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Quizzes Table - Transparent theme */}
      <div className="bg-transparent border border-white/20 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <table className="w-full table-auto divide-y divide-white/20">
            <thead className="bg-transparent">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Quiz
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-white/20">
              {quizzes.map((quiz, index) => (
                <tr key={`admin-quiz-${quiz._id}-${index}`} className={`hover:bg-white/5 transition-all duration-200`}>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm font-bold text-white truncate">{quiz.title}</div>
                      <div className="text-xs text-gray-300 truncate">{quiz.description}</div>
                      <div className="text-xs text-gray-300 font-semibold">
                        {quiz.questions?.length || 0} questions • {quiz.timeLimit} min
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getCategoryColor(quiz.category)}`}>
                      {quiz.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-300">
                    <div className="font-medium">Attempts: {quiz.stats?.totalAttempts || 0}</div>
                    <div className="font-medium">Avg Score: {quiz.stats?.averageScore || 0}%</div>
                    <div className="font-medium">Completion: {quiz.stats?.completionRate || 0}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${quiz.isActive
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                      {quiz.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2 flex-wrap">
                      <button
                        onClick={() => handleEditQuiz(quiz)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit Quiz"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(quiz._id, quiz.isActive)}
                        className={quiz.isActive ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                        title={quiz.isActive ? "Deactivate" : "Activate"}
                      >
                        {quiz.isActive ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Quiz"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-3 border-t border-white/20 flex items-center justify-between">
            <div className="text-sm text-gray-300 font-medium">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-white/20 rounded-xl text-sm font-medium text-gray-300 bg-transparent hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {pagination.pages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === pagination.pages}
                className="px-4 py-2 border border-white/20 rounded-xl text-sm font-medium text-gray-300 bg-transparent hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals would go here */}
      {/* Create Quiz Modal */}
      {showCreateModal && (
        <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); resetQuizForm(); }} title="Create New Quiz" className={`bg-transparent border border-white/20 backdrop-blur-sm max-w-4xl w-full mx-4 rounded-2xl`}>
          <form onSubmit={handleCreateQuiz} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Quiz Title</label>
                <input
                  type="text"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
                <select
                  value={quizForm.category}
                  onChange={(e) => setQuizForm({ ...quizForm, category: e.target.value })}
                  className="glass-select w-full px-4 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
                >
                  <option value="alphabet" className="bg-gray-800 text-white">Alphabet</option>
                  <option value="phrases" className="bg-gray-800 text-white">Phrases</option>
                  <option value="family" className="bg-gray-800 text-white">Family</option>
                  <option value="activities" className="bg-gray-800 text-white">Activities</option>
                  <option value="advanced" className="bg-gray-800 text-white">Advanced</option>
                  <option value="arena" className="bg-yellow-600 text-white font-bold">⚡ Arena Mode</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Difficulty</label>
                <select
                  value={quizForm.difficulty}
                  onChange={(e) => setQuizForm({ ...quizForm, difficulty: e.target.value })}
                  className="glass-select w-full px-4 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
                >
                  <option value="Beginner" className="bg-gray-800 text-white">Beginner</option>
                  <option value="Intermediate" className="bg-gray-800 text-white">Intermediate</option>
                  <option value="Advanced" className="bg-gray-800 text-white">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Time Limit (minutes)</label>
                <input
                  type="number"
                  value={quizForm.timeLimit}
                  onChange={(e) => setQuizForm({ ...quizForm, timeLimit: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Passing Score (%)</label>
                <input
                  type="number"
                  value={quizForm.passingScore}
                  onChange={(e) => setQuizForm({ ...quizForm, passingScore: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
                  min="1"
                  max="100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Max Attempts</label>
                <input
                  type="number"
                  value={quizForm.maxAttempts}
                  onChange={(e) => setQuizForm({ ...quizForm, maxAttempts: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
                  min="1"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
              <textarea
                value={quizForm.description}
                onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                className="w-full px-4 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
                rows="3"
                required
              />
            </div>

            {/* Questions Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Quiz Questions ({quizForm.questions.length})</h3>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {quizForm.questions.map((question, index) => (
                  <div key={index} className="p-4 border border-white/20 rounded-2xl bg-transparent backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-semibold text-gray-300">Q{index + 1}:</span>
                          <span className="text-sm font-bold text-white">{question.question}</span>
                        </div>
                        {question.image && (
                          <div className="mb-2">
                            <img
                              src={question.image}
                              alt="Question"
                              className="w-20 h-20 object-cover rounded border"
                            />
                          </div>
                        )}
                        <div className="text-xs text-gray-300 font-semibold">
                          {question.options?.length || 0} options • {question.points || 1} point(s) • Correct: Option {(question.correctAnswer || 0) + 1}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEditQuestion(index)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit Question"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(index)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Question"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {quizForm.questions.length === 0 && (
                  <div className="text-center py-8 text-gray-600">
                    <PuzzlePieceIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="font-medium">No questions added yet</p>
                    <p className="text-sm font-medium">Click "Add Question" to get started</p>
                  </div>
                )}
              </div>
            </div>
            {/* Validation summary */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h4 className="text-base font-semibold text-white mb-2">Validation</h4>
              <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                <li className={`${(quizForm.title || '').trim().length >= 3 ? 'text-green-400' : 'text-red-400'}`}>Title at least 3 characters</li>
                <li>Category selected</li>
                <li>Difficulty selected</li>
                <li>Time limit ≥ 1</li>
                <li>Passing score 1-100</li>
                <li>Max attempts ≥ 1</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => { setShowCreateModal(false); resetQuizForm(); }}
                className="px-6 py-3 border border-white/20 text-white rounded-2xl hover:bg-white/10 font-semibold text-base transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-500/90 backdrop-blur-sm text-white rounded-2xl hover:bg-blue-600 font-semibold text-base transition-colors border border-blue-400/30"
              >
                Create Quiz
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Quiz Modal */}
      {showEditModal && selectedQuiz && (
        <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); resetQuizForm(); }} title="Edit Quiz" className={`bg-transparent border border-white/20 backdrop-blur-sm max-w-4xl w-full mx-4 rounded-2xl`}>
          <form onSubmit={handleUpdateQuiz} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quiz Title</label>
                <input
                  type="text"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={quizForm.category}
                  onChange={(e) => setQuizForm({ ...quizForm, category: e.target.value })}
                  className="w-full px-4 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
                >
                  <option value="alphabet">Alphabet</option>
                  <option value="phrases">Phrases</option>
                  <option value="family">Family</option>
                  <option value="activities">Activities</option>
                  <option value="advanced">Advanced</option>
                  <option value="arena" className="bg-yellow-600 text-white font-bold">⚡ Arena Mode</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quiz Type</label>
                <select
                  value={quizForm.quizType}
                  onChange={(e) => setQuizForm({ ...quizForm, quizType: e.target.value })}
                  className="w-full px-4 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
                >
                  <option value="standard">Standard Quiz</option>
                  <option value="mastery">Level Mastery</option>
                  <option value="arena">Arena Challenge</option>
                </select>
              </div>
              {quizForm.quizType === 'mastery' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Level</label>
                  <input
                    type="number"
                    value={quizForm.level}
                    onChange={(e) => setQuizForm({ ...quizForm, level: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
                    min="1"
                    max="10"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                <select
                  value={quizForm.difficulty}
                  onChange={(e) => setQuizForm({ ...quizForm, difficulty: e.target.value })}
                  className="w-full px-4 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Time Limit (minutes)</label>
                <input
                  type="number"
                  value={quizForm.timeLimit}
                  onChange={(e) => setQuizForm({ ...quizForm, timeLimit: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Passing Score (%)</label>
                <input
                  type="number"
                  value={quizForm.passingScore}
                  onChange={(e) => setQuizForm({ ...quizForm, passingScore: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
                  min="1"
                  max="100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Attempts</label>
                <input
                  type="number"
                  value={quizForm.maxAttempts}
                  onChange={(e) => setQuizForm({ ...quizForm, maxAttempts: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
                  min="1"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={quizForm.description}
                onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                className="w-full px-4 py-3 bg-transparent border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
                rows="3"
                required
              />
            </div>

            {/* Questions Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Quiz Questions ({quizForm.questions.length})</h3>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {quizForm.questions.map((question, index) => (
                  <div key={index} className="p-4 border-2 border-gray-300 rounded-lg bg-transparent backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-semibold text-gray-600">Q{index + 1}:</span>
                          <span className="text-sm font-bold text-gray-800">{question.question}</span>
                        </div>
                        {question.image && (
                          <div className="mb-2">
                            <img
                              src={question.image}
                              alt="Question"
                              className="w-20 h-20 object-cover rounded border"
                            />
                          </div>
                        )}
                        {question.video && (
                          <div className="mb-2">
                            <video
                              src={question.video}
                              controls
                              className="w-32 h-20 object-cover rounded border"
                            />
                          </div>
                        )}
                        <div className="text-xs text-gray-600 font-semibold">
                          {question.options?.length || 0} options • {question.points || 1} point(s) • Correct: Option {(question.correctAnswer || 0) + 1}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEditQuestion(index)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit Question"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(index)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Question"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {quizForm.questions.length === 0 && (
                  <div className="text-center py-8 text-gray-600">
                    <PuzzlePieceIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="font-medium">No questions added yet</p>
                    <p className="text-sm font-medium">Click "Add Question" to get started</p>
                  </div>
                )}
              </div>
            </div>
            {/* Changes Summary */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h4 className="text-base font-semibold text-white mb-2">Changes Summary</h4>
              <div className="text-sm text-gray-300">
                {selectedQuiz ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {quizForm.title !== selectedQuiz.title && <li>Title will be updated</li>}
                    {quizForm.description !== selectedQuiz.description && <li>Description will be updated</li>}
                    {quizForm.category !== selectedQuiz.category && <li>Category will be updated</li>}
                    {quizForm.difficulty !== selectedQuiz.difficulty && <li>Difficulty will be updated</li>}
                    {quizForm.timeLimit !== selectedQuiz.timeLimit && <li>Time limit will be updated</li>}
                    {quizForm.passingScore !== selectedQuiz.passingScore && <li>Passing score will be updated</li>}
                    {quizForm.maxAttempts !== selectedQuiz.maxAttempts && <li>Max attempts will be updated</li>}
                    {JSON.stringify(quizForm.tags || []) !== JSON.stringify(selectedQuiz.tags || []) && <li>Tags will be updated</li>}
                    {quizForm.questions.length !== selectedQuiz.questions.length && <li>Questions will be updated</li>}
                  </ul>
                ) : (
                  <p className="text-gray-400">No changes detected</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => { setShowEditModal(false); resetQuizForm(); }}
                className="px-6 py-3 border border-white/20 text-white rounded-2xl hover:bg-white/10 font-semibold text-base transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-500/90 backdrop-blur-sm text-white rounded-2xl hover:bg-blue-600 font-semibold text-base transition-colors border border-blue-400/30"
              >
                Update Quiz
              </button>
            </div>
          </form>
        </Modal>
      )
      }


      {/* Question Management Modal */}
      {
        showQuestionModal && (
          <Modal isOpen={showQuestionModal} onClose={() => setShowQuestionModal(false)} title={editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'} className={`bg-transparent border-2 border-gray-300 rounded-lg`} widthClass="w-full max-w-4xl mx-4">
            <form onSubmit={(e) => { e.preventDefault(); handleSaveQuestion(); }} className="space-y-4">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Question Text</label>
                <textarea
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
                  rows="3"
                  placeholder="Enter your question here..."
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Question Image (Optional)</label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
                  />
                  {questionForm.imagePreview && (
                    <div className="relative inline-block">
                      <img
                        src={questionForm.imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Question Video (Optional)</label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
                  />
                  {questionForm.videoPreview && (
                    <div className="relative inline-block">
                      <video
                        src={questionForm.videoPreview}
                        controls
                        className="w-64 h-48 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Answer Options</label>
                <div className="space-y-2">
                  {(questionForm.options || []).map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={index}
                        checked={questionForm.correctAnswer === index}
                        onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: parseInt(e.target.value) })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <input
                        type="text"
                        value={option || ''}
                        onChange={(e) => {
                          const newOptions = [...(questionForm.options || [])];
                          newOptions[index] = e.target.value;
                          setQuestionForm({ ...questionForm, options: newOptions });
                        }}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
                        placeholder={`Option ${index + 1}`}
                      />
                      {(questionForm.options || []).length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = (questionForm.options || []).filter((_, i) => i !== index);
                            setQuestionForm({ ...questionForm, options: newOptions });
                            if (questionForm.correctAnswer >= index) {
                              setQuestionForm({ ...questionForm, options: newOptions, correctAnswer: Math.max(0, questionForm.correctAnswer - 1) });
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {/* Explicit correct answer text */}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">Correct Answer (text)</span>
                    <input
                      type="text"
                      value={questionForm.correctAnswerText || (questionForm.options || [])[questionForm.correctAnswer] || ''}
                      onChange={(e) => setQuestionForm({ ...questionForm, correctAnswerText: e.target.value })}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
                      placeholder="Type the exact correct answer"
                    />
                  </div>
                  {(questionForm.options || []).length < 6 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = [...(questionForm.options || []), ''];
                        setQuestionForm({ ...questionForm, options: newOptions });
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Add Option</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Points and Explanation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Points</label>
                  <input
                    type="number"
                    value={questionForm.points}
                    onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Explanation (Optional)</label>
                  <textarea
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
                    rows="2"
                    placeholder="Explain why this is the correct answer..."
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="border-t pt-4">
                <h4 className="text-base font-semibold text-gray-700 mb-3">Preview:</h4>
                <div className="p-4 bg-transparent border-2 border-gray-300 rounded-lg backdrop-blur-sm">
                  <p className="font-semibold text-gray-800 mb-2">{questionForm.question || 'Question preview...'}</p>
                  {questionForm.imagePreview && (
                    <img src={questionForm.imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded mb-2" />
                  )}
                  <div className="space-y-1">
                    {questionForm.options.filter(opt => opt && typeof opt === 'string' && opt.trim()).map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full border-2 ${questionForm.correctAnswer === index ? 'bg-green-500 border-green-500' : 'border-gray-300'
                          }`}></div>
                        <span className="text-sm font-medium text-gray-700">{option || `Option ${index + 1}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold text-base transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-base transition-colors"
                >
                  {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
                </button>
              </div>
            </form>
          </Modal>
        )
      }
    </div >
  );
};

export default AdminQuizManagement;