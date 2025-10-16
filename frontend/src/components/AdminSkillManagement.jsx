import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { API_BASE_URL } from '../constants/api';
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
  Cog6ToothIcon,
  BookOpenIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline';

export default function AdminSkillManagement() {
  const { darkMode } = useTheme();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'basics',
    order: 1,
    xpReward: 20,
    exercises: []
  });

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const inputBg = darkMode ? 'bg-[#1F2937]' : 'bg-white';

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'basics', label: 'Basics' },
    { value: 'alphabet', label: 'Alphabet' },
    { value: 'numbers', label: 'Numbers' },
    { value: 'phrases', label: 'Phrases' },
    { value: 'family', label: 'Family' },
    { value: 'activities', label: 'Activities' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const exerciseTypes = [
    { value: 'sign-recognition', label: 'Sign Recognition' },
    { value: 'sign-production', label: 'Sign Production' },
    { value: 'translation', label: 'Translation' },
    { value: 'matching', label: 'Matching' },
    { value: 'fill-blank', label: 'Fill in the Blank' }
  ];

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/curriculum/skills`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSkills(data.data || []);
      } else {
        console.error('Failed to fetch skills');
        // Use mock data for now
        setSkills([
          {
            _id: '1',
            title: 'Hello & Goodbye',
            description: 'Learn basic greetings and farewells',
            category: 'basics',
            order: 1,
            xpReward: 20,
            level: 0,
            isCompleted: false,
            isUnlocked: true,
            exercises: [
              { type: 'sign-recognition', question: 'Recognize "Hello"', correctAnswer: 'Hello' },
              { type: 'sign-production', question: 'Produce "Goodbye"', correctAnswer: 'Goodbye' }
            ]
          },
          {
            _id: '2',
            title: 'Please & Thank You',
            description: 'Essential polite expressions',
            category: 'basics',
            order: 2,
            xpReward: 20,
            level: 0,
            isCompleted: false,
            isUnlocked: false,
            exercises: [
              { type: 'translation', question: 'Translate "Please"', correctAnswer: 'Please' },
              { type: 'matching', question: 'Match "Thank You"', correctAnswer: 'Thank You' }
            ]
          },
          {
            _id: '3',
            title: 'Letters A-M',
            description: 'First half of the alphabet',
            category: 'alphabet',
            order: 1,
            xpReward: 30,
            level: 0,
            isCompleted: false,
            isUnlocked: true,
            exercises: [
              { type: 'sign-recognition', question: 'Recognize "A"', correctAnswer: 'A' },
              { type: 'sign-production', question: 'Produce "B"', correctAnswer: 'B' }
            ]
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/curriculum/skills`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchSkills();
        setShowAddModal(false);
        resetForm();
      } else {
        console.error('Failed to add skill');
      }
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const handleEditSkill = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/curriculum/skills/${selectedSkill._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchSkills();
        setShowEditModal(false);
        setSelectedSkill(null);
        resetForm();
      } else {
        console.error('Failed to edit skill');
      }
    } catch (error) {
      console.error('Error editing skill:', error);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/curriculum/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchSkills();
      } else {
        console.error('Failed to delete skill');
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'basics',
      order: 1,
      xpReward: 20,
      exercises: []
    });
  };

  const openEditModal = (skill) => {
    setSelectedSkill(skill);
    setFormData({
      title: skill.title,
      description: skill.description,
      category: skill.category,
      order: skill.order,
      xpReward: skill.xpReward,
      exercises: skill.exercises || []
    });
    setShowEditModal(true);
  };

  const addExercise = () => {
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, {
        type: 'sign-recognition',
        question: '',
        correctAnswer: '',
        explanation: '',
        points: 10
      }]
    }));
  };

  const removeExercise = (index) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const updateExercise = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === index ? { ...exercise, [field]: value } : exercise
      )
    }));
  };

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category) => {
    const colors = {
      basics: 'bg-blue-500',
      alphabet: 'bg-green-500',
      numbers: 'bg-purple-500',
      phrases: 'bg-orange-500',
      family: 'bg-pink-500',
      activities: 'bg-red-500',
      advanced: 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getLevelColor = (level) => {
    if (level === 0) return 'text-gray-400';
    if (level <= 2) return 'text-blue-400';
    if (level <= 4) return 'text-green-400';
    return 'text-yellow-400';
  };

  if (loading) {
    return (
      <div className={`${bg} ${text} p-6`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bg} ${text} p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Skill Management</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage learning skills and exercises
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Skill</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border ${border} rounded-lg ${inputBg} ${text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={`px-4 py-2 border ${border} rounded-lg ${inputBg} ${text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.map(skill => (
          <div key={skill._id} className={`${cardBg} rounded-lg border ${border} p-6`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg ${getCategoryColor(skill.category)} flex items-center justify-center`}>
                  <AcademicCapIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{skill.title}</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {skill.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => openEditModal(skill)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteSkill(skill._id)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-red-500"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span>Category:</span>
                <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(skill.category)} text-white`}>
                  {skill.category}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Order:</span>
                <span>{skill.order}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>XP Reward:</span>
                <span className="text-yellow-500">{skill.xpReward}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Exercises:</span>
                <span>{skill.exercises?.length || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StarIcon className={`w-4 h-4 ${getLevelColor(skill.level)}`} />
                <span className="text-sm">Level {skill.level}</span>
              </div>
              <div className="flex items-center space-x-1">
                {skill.isUnlocked ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircleIcon className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm">
                  {skill.isUnlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Add New Skill</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 border ${border} rounded-lg ${inputBg} ${text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter skill title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full px-3 py-2 border ${border} rounded-lg ${inputBg} ${text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  rows="3"
                  placeholder="Enter skill description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full px-3 py-2 border ${border} rounded-lg ${inputBg} ${text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                    className={`w-full px-3 py-2 border ${border} rounded-lg ${inputBg} ${text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">XP Reward</label>
                <input
                  type="number"
                  value={formData.xpReward}
                  onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) }))}
                  className={`w-full px-3 py-2 border ${border} rounded-lg ${inputBg} ${text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  min="1"
                />
              </div>

              {/* Exercises */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium">Exercises</label>
                  <button
                    onClick={addExercise}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Add Exercise
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.exercises.map((exercise, index) => (
                    <div key={index} className={`p-3 border ${border} rounded-lg`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Exercise {index + 1}</span>
                        <button
                          onClick={() => removeExercise(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <select
                          value={exercise.type}
                          onChange={(e) => updateExercise(index, 'type', e.target.value)}
                          className={`px-2 py-1 border ${border} rounded ${inputBg} ${text} text-sm`}
                        >
                          {exerciseTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>

                        <input
                          type="number"
                          value={exercise.points}
                          onChange={(e) => updateExercise(index, 'points', parseInt(e.target.value))}
                          className={`px-2 py-1 border ${border} rounded ${inputBg} ${text} text-sm`}
                          placeholder="Points"
                          min="1"
                        />
                      </div>

                      <input
                        type="text"
                        value={exercise.question}
                        onChange={(e) => updateExercise(index, 'question', e.target.value)}
                        className={`w-full px-2 py-1 border ${border} rounded ${inputBg} ${text} text-sm mb-2`}
                        placeholder="Question"
                      />

                      <input
                        type="text"
                        value={exercise.correctAnswer}
                        onChange={(e) => updateExercise(index, 'correctAnswer', e.target.value)}
                        className={`w-full px-2 py-1 border ${border} rounded ${inputBg} ${text} text-sm`}
                        placeholder="Correct Answer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSkill}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Skill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Skill Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Edit Skill</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 border ${border} rounded-lg ${inputBg} ${text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full px-3 py-2 border ${border} rounded-lg ${inputBg} ${text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full px-3 py-2 border ${border} rounded-lg ${inputBg} ${text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                    className={`w-full px-3 py-2 border ${border} rounded-lg ${inputBg} ${text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">XP Reward</label>
                <input
                  type="number"
                  value={formData.xpReward}
                  onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) }))}
                  className={`w-full px-3 py-2 border ${border} rounded-lg ${inputBg} ${text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  min="1"
                />
              </div>

              {/* Exercises */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium">Exercises</label>
                  <button
                    onClick={addExercise}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Add Exercise
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.exercises.map((exercise, index) => (
                    <div key={index} className={`p-3 border ${border} rounded-lg`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Exercise {index + 1}</span>
                        <button
                          onClick={() => removeExercise(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <select
                          value={exercise.type}
                          onChange={(e) => updateExercise(index, 'type', e.target.value)}
                          className={`px-2 py-1 border ${border} rounded ${inputBg} ${text} text-sm`}
                        >
                          {exerciseTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>

                        <input
                          type="number"
                          value={exercise.points}
                          onChange={(e) => updateExercise(index, 'points', parseInt(e.target.value))}
                          className={`px-2 py-1 border ${border} rounded ${inputBg} ${text} text-sm`}
                          placeholder="Points"
                          min="1"
                        />
                      </div>

                      <input
                        type="text"
                        value={exercise.question}
                        onChange={(e) => updateExercise(index, 'question', e.target.value)}
                        className={`w-full px-2 py-1 border ${border} rounded ${inputBg} ${text} text-sm mb-2`}
                        placeholder="Question"
                      />

                      <input
                        type="text"
                        value={exercise.correctAnswer}
                        onChange={(e) => updateExercise(index, 'correctAnswer', e.target.value)}
                        className={`w-full px-2 py-1 border ${border} rounded ${inputBg} ${text} text-sm`}
                        placeholder="Correct Answer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSkill}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Update Skill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}