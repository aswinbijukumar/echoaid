import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  ChartBarIcon,
  PlayIcon,
  PauseIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';

const AdminQuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    category: 'alphabet',
    difficulty: 'Beginner',
    timeLimit: 10,
    passingScore: 70,
    maxAttempts: 3,
    tags: [],
    questions: []
  });
  const [analytics, setAnalytics] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    points: 1,
    image: null,
    imagePreview: null
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

  const { darkMode } = useTheme();
  const { token } = useAuth();

  useEffect(() => {
  const fetchQuizzes = async () => {
    try {
        setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.current,
        limit: 10,
        ...filters
      });

      const response = await fetch(`http://localhost:5000/api/admin/quiz?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
          if (data.success) {
        setQuizzes(data.data);
        setPagination(data.pagination);
          }
        } else {
          console.error('Failed to fetch quizzes');
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
      }
    };

    fetchQuizzes();
  }, [filters, pagination.current, token]);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
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
          mediaUrl: question.image || null  // Save image to mediaUrl field
        };
        
        console.log('Transformed question:', transformed);
        return transformed;
      });

      const quizData = {
        ...quizForm,
        questions: transformedQuestions
      };

      const response = await fetch('http://localhost:5000/api/admin/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quizData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowCreateModal(false);
          setQuizForm({
            title: '',
            description: '',
            category: 'alphabet',
            difficulty: 'Beginner',
            timeLimit: 10,
            passingScore: 70,
            maxAttempts: 3,
            tags: [],
            questions: []
          });
          // Refresh quizzes list
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
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
          mediaUrl: question.image || null  // Save image to mediaUrl field
        };
        
        console.log('Transformed question:', transformed);
        return transformed;
      });

      const quizData = {
        ...quizForm,
        questions: transformedQuestions
      };

      const response = await fetch(`http://localhost:5000/api/admin/quiz/${selectedQuiz._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quizData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowEditModal(false);
          // Refresh quizzes list
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/quiz/${quizId}`, {
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
      const response = await fetch(`http://localhost:5000/api/admin/quiz/${quizId}/toggle`, {
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

  const handleViewAnalytics = async (quizId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/quiz/analytics/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalytics(data.data);
          setShowAnalyticsModal(true);
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
        image: question.mediaUrl
      };
    });

    setQuizForm({
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      difficulty: quiz.difficulty,
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
      imagePreview: null
    });
    setEditingQuestionIndex(null);
    setShowQuestionModal(true);
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
      imagePreview: question.image || null
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

    const newQuestion = {
      question: questionForm.question,
      options: questionForm.options.filter(opt => opt && typeof opt === 'string' && opt.trim()),
      correctAnswer: questionForm.correctAnswer,
      explanation: questionForm.explanation,
      points: questionForm.points,
      image: questionForm.imagePreview
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
      imagePreview: null
    });
    setEditingQuestionIndex(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setQuestionForm({
          ...questionForm,
          image: file,
          imagePreview: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setQuestionForm({
      ...questionForm,
      image: null,
      imagePreview: null
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'alphabet': return 'bg-blue-100 text-blue-800';
      case 'phrases': return 'bg-purple-100 text-purple-800';
      case 'family': return 'bg-pink-100 text-pink-800';
      case 'activities': return 'bg-orange-100 text-orange-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} w-full overflow-y-auto`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quiz Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold text-base transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Quiz
        </button>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Categories</option>
            <option value="alphabet">Alphabet</option>
            <option value="phrases">Phrases</option>
            <option value="family">Family</option>
            <option value="activities">Activities</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              handleFilterChange('sortBy', sortBy);
              handleFilterChange('sortOrder', sortOrder);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="stats.totalAttempts-desc">Most Popular</option>
            <option value="stats.averageScore-desc">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Quizzes Table */}
      <div className={`rounded-lg shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Quiz
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {quizzes.map((quiz) => (
                <tr key={quiz._id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} hover:bg-gray-50`}>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-base font-semibold text-gray-800 truncate">{quiz.title}</div>
                      <div className="text-sm text-gray-600 truncate">{quiz.description}</div>
                      <div className="text-xs text-gray-600 font-semibold">
                        {quiz.questions?.length || 0} questions • {quiz.timeLimit} min
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getCategoryColor(quiz.category)}`}>
                      {quiz.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="font-medium">Attempts: {quiz.stats?.totalAttempts || 0}</div>
                    <div className="font-medium">Avg Score: {quiz.stats?.averageScore || 0}%</div>
                    <div className="font-medium">Completion: {quiz.stats?.completionRate || 0}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      quiz.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {quiz.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2 flex-wrap">
                      <button
                        onClick={() => handleViewAnalytics(quiz._id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Analytics"
                      >
                        <ChartBarIcon className="w-4 h-4" />
                      </button>
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
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600 font-medium">
              Showing {((pagination.current - 1) * 10) + 1} to {Math.min(pagination.current * 10, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                disabled={pagination.current === 1}
                className="px-4 py-2 border-2 border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-transparent hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {pagination.current} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                disabled={pagination.current === pagination.pages}
                className="px-4 py-2 border-2 border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-transparent hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Quiz" className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg`} widthClass="w-full max-w-4xl mx-4">
          <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quiz Title</label>
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({...quizForm, title: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={quizForm.category}
                    onChange={(e) => setQuizForm({...quizForm, category: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
                  >
                    <option value="alphabet">Alphabet</option>
                    <option value="phrases">Phrases</option>
                    <option value="family">Family</option>
                    <option value="activities">Activities</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={quizForm.difficulty}
                    onChange={(e) => setQuizForm({...quizForm, difficulty: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
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
                    onChange={(e) => setQuizForm({...quizForm, timeLimit: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Passing Score (%)</label>
                  <input
                    type="number"
                    value={quizForm.passingScore}
                    onChange={(e) => setQuizForm({...quizForm, passingScore: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
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
                    onChange={(e) => setQuizForm({...quizForm, maxAttempts: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({...quizForm, description: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
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
            <div className="flex justify-end space-x-2">
              <button
                  type="button"
                onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold text-base transition-colors"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-base transition-colors"
              >
                Create Quiz
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Quiz Modal */}
      {showEditModal && selectedQuiz && (
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Quiz" className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg`} widthClass="w-full max-w-4xl mx-4">
          <form onSubmit={handleUpdateQuiz} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quiz Title</label>
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({...quizForm, title: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={quizForm.category}
                    onChange={(e) => setQuizForm({...quizForm, category: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
                  >
                    <option value="alphabet">Alphabet</option>
                    <option value="phrases">Phrases</option>
                    <option value="family">Family</option>
                    <option value="activities">Activities</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={quizForm.difficulty}
                    onChange={(e) => setQuizForm({...quizForm, difficulty: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
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
                    onChange={(e) => setQuizForm({...quizForm, timeLimit: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Passing Score (%)</label>
                  <input
                    type="number"
                    value={quizForm.passingScore}
                    onChange={(e) => setQuizForm({...quizForm, passingScore: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
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
                    onChange={(e) => setQuizForm({...quizForm, maxAttempts: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({...quizForm, description: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
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
            <div className="flex justify-end space-x-2">
              <button
                  type="button"
                onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold text-base transition-colors"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-base transition-colors"
              >
                  Update Quiz
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && analytics && (
        <Modal isOpen={showAnalyticsModal} onClose={() => setShowAnalyticsModal(false)} title="Quiz Analytics" className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg`} widthClass="w-full max-w-4xl mx-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800">Total Attempts</h3>
                <p className="text-2xl font-bold text-blue-600">{analytics.totalAttempts || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800">Average Score</h3>
                <p className="text-2xl font-bold text-green-600">{analytics.averageScore || 0}%</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800">Completion Rate</h3>
                <p className="text-2xl font-bold text-purple-600">{analytics.completionRate || 0}%</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
        </Modal>
      )}

      {/* Question Management Modal */}
      {showQuestionModal && (
        <Modal isOpen={showQuestionModal} onClose={() => setShowQuestionModal(false)} title={editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'} className={`bg-transparent border-2 border-gray-300 rounded-lg`} widthClass="w-full max-w-4xl mx-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSaveQuestion(); }} className="space-y-4">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Question Text</label>
                <textarea
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({...questionForm, question: e.target.value})}
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
                        onChange={(e) => setQuestionForm({...questionForm, correctAnswer: parseInt(e.target.value)})}
                        className="w-4 h-4 text-blue-600"
                      />
                      <input
                        type="text"
                        value={option || ''}
                        onChange={(e) => {
                          const newOptions = [...(questionForm.options || [])];
                          newOptions[index] = e.target.value;
                          setQuestionForm({...questionForm, options: newOptions});
                        }}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
                        placeholder={`Option ${index + 1}`}
                      />
                      {(questionForm.options || []).length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = (questionForm.options || []).filter((_, i) => i !== index);
                            setQuestionForm({...questionForm, options: newOptions});
                            if (questionForm.correctAnswer >= index) {
                              setQuestionForm({...questionForm, options: newOptions, correctAnswer: Math.max(0, questionForm.correctAnswer - 1)});
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {(questionForm.options || []).length < 6 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = [...(questionForm.options || []), ''];
                        setQuestionForm({...questionForm, options: newOptions});
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
                    onChange={(e) => setQuestionForm({...questionForm, points: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm text-gray-700 font-medium placeholder-gray-500"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Explanation (Optional)</label>
                  <textarea
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm({...questionForm, explanation: e.target.value})}
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
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          questionForm.correctAnswer === index ? 'bg-green-500 border-green-500' : 'border-gray-300'
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
      )}
    </div>
  );
};

export default AdminQuizManagement;