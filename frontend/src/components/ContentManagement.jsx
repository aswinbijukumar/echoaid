import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  CloudArrowUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

export default function ContentManagement() {
  const [signs, setSigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSign, setSelectedSign] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    search: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { token } = useAuth();
  const { darkMode } = useTheme();

  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-white';
  const subtleBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-50';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const borderClr = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBorder = darkMode ? 'border-gray-600' : 'border-gray-300';
  const inputBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const tableHeaderBg = darkMode ? 'bg-[#111827]' : 'bg-gray-50';
  const tableRowHover = darkMode ? 'hover:bg-[#1F2937]' : 'hover:bg-gray-50';

  const [createForm, setCreateForm] = useState({
    word: '',
    category: 'alphabet',
    difficulty: 'Beginner',
    description: '',
    isActive: true
  });

  const [editForm, setEditForm] = useState({
    word: '',
    category: 'alphabet',
    difficulty: 'Beginner',
    description: '',
    isActive: true
  });

  const [createFiles, setCreateFiles] = useState({
    image: null,
    video: null
  });

  const [editFiles, setEditFiles] = useState({
    image: null,
    video: null
  });

  const filteredSigns = (() => {
    const term = (filters.search || '').toLowerCase().trim();
    return signs.filter(sign => {
      const matchesText = !term ||
        sign.word.toLowerCase().includes(term) ||
        (sign.description || '').toLowerCase().includes(term);
      const matchesCategory = !filters.category || sign.category === filters.category;
      return matchesText && matchesCategory;
    });
  })();

  useEffect(() => {
    fetchSigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/content/signs?limit=500', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSigns(data.data);
      }
    } catch (error) {
      console.error('Error fetching signs:', error);
      setSigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSign = async (e) => {
    e.preventDefault();
    
    // Basic validation: word, description, image are required
    if (!createForm.word.trim()) {
      setError('Please enter a word');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (!createForm.description.trim()) {
      setError('Please enter a description');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (!createFiles.image) {
      setError('Please select an image for the sign');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    const formData = new FormData();
    Object.keys(createForm).forEach(key => {
      formData.append(key, createForm[key]);
    });

    if (createFiles.image) {
      formData.append('image', createFiles.image);
    }
    if (createFiles.video) {
      formData.append('video', createFiles.video);
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/content/signs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to create sign');
        setTimeout(() => setError(''), 4000);
        return;
      }

      setSigns([data.data, ...signs]);
      setShowCreateModal(false);
      setCreateForm({
        word: '',
        category: 'alphabet',
        difficulty: 'Beginner',
        description: '',
        isActive: true
      });
      setCreateFiles({ image: null, video: null });
      setSuccess('Sign created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating sign:', error);
      setError('Error creating sign');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteSign = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/content/signs/${selectedSign._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSigns(signs.filter(sign => sign._id !== selectedSign._id));
        setShowDeleteModal(false);
        setSelectedSign(null);
        setSuccess('Sign deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete sign');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting sign:', error);
      setError('Error deleting sign');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditSign = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    Object.keys(editForm).forEach(key => {
      formData.append(key, editForm[key]);
    });

    if (editFiles.image) {
      formData.append('image', editFiles.image);
    }
    if (editFiles.video) {
      formData.append('video', editFiles.video);
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/content/signs/${selectedSign._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setSigns(signs.map(sign => sign._id === selectedSign._id ? data.data : sign));
        setShowEditModal(false);
        setSelectedSign(null);
        setEditForm({
          word: '',
          category: 'alphabet',
          difficulty: 'Beginner',
          description: '',
          isActive: true
        });
        setEditFiles({ image: null, video: null });
        setSuccess('Sign updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update sign');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error updating sign:', error);
      setError('Error updating sign');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openEditModal = (sign) => {
    setSelectedSign(sign);
    setEditForm({
      word: sign.word,
      category: sign.category,
      difficulty: sign.difficulty,
      description: sign.description,
      isActive: sign.isActive
    });
    setEditFiles({ image: null, video: null });
    setShowEditModal(true);
  };

  const handleFileChange = (fileType, file, isEdit = false) => {
    if (isEdit) {
      setEditFiles(prev => ({ ...prev, [fileType]: file }));
    } else {
      setCreateFiles(prev => ({ ...prev, [fileType]: file }));
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/content/signs/export?format=csv', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'signs-export.csv';
        link.click();
        window.URL.revokeObjectURL(url);
        setSuccess('Export completed successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error exporting signs:', error);
      setError('Error exporting signs');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${subtleBg}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className={`${cardBg} p-6 rounded-lg border ${borderClr}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${textPrimary}`}>Content Management</h2>
            <p className={`${textSecondary} mt-1`}>Manage sign language dictionary entries</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add New Sign
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className={`bg-green-100 ${darkMode ? 'text-green-800' : 'text-green-700'} border border-green-400 px-4 py-3 rounded-lg`}>
          {success}
        </div>
      )}
      {error && (
        <div className={`bg-red-100 ${darkMode ? 'text-red-800' : 'text-red-700'} border border-red-400 px-4 py-3 rounded-lg`}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div className={`${cardBg} p-6 rounded-lg border ${borderClr}`}>
        <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Search & Filter</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Search Signs</label>
            <div className="relative">
              <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search by word or description..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className={`pl-10 w-full border ${inputBorder} ${inputBg} ${textPrimary} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
              />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Filter by Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className={`w-full border ${inputBorder} ${inputBg} ${textPrimary} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
            >
              <option value="">All Categories</option>
              <option value="alphabet">Alphabet</option>
              <option value="phrases">Phrases</option>
              <option value="family">Family</option>
              <option value="activities">Activities</option>
              <option value="advanced">Advanced</option>
              <option value="numbers">Numbers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Signs Table */}
      <div className={`${cardBg} rounded-lg border ${borderClr} overflow-hidden shadow-sm`}>
        <div className={`px-6 py-4 border-b ${borderClr}`}>
          <h3 className={`text-lg font-semibold ${textPrimary}`}>Sign Language Dictionary</h3>
          <p className={`text-sm ${textSecondary} mt-1`}>
            {filteredSigns.length} signs found
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className={`min-w-full table-fixed divide-y ${borderClr}`}>
            <thead className={`${tableHeaderBg}`}>
              <tr>
                <th className={`w-2/5 px-4 md:px-6 py-4 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                  Sign
                </th>
                <th className={`w-1/5 px-4 md:px-6 py-4 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                  Category
                </th>
                <th className={`w-1/6 px-4 md:px-6 py-4 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider hidden sm:table-cell`}>
                  Difficulty
                </th>
                <th className={`w-1/6 px-4 md:px-6 py-4 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`w-1/6 px-4 md:px-6 py-4 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider hidden md:table-cell`}>
                  Created
                </th>
                <th className={`w-28 px-4 md:px-6 py-4 text-right text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`${cardBg} divide-y ${borderClr}`}>
              {filteredSigns.map((sign) => (
                <tr key={sign._id} className={`${tableRowHover} transition-colors`}>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center max-w-full">
                      <div className="flex-shrink-0 h-12 w-12">
                        {sign.imageUrl || sign.thumbnailUrl || sign.imagePath ? (
                          <img
                            className={`h-12 w-12 rounded-lg object-cover border ${borderClr}`}
                            src={sign.thumbnailUrl ? `http://localhost:5000${sign.thumbnailUrl}` : sign.imageUrl ? `http://localhost:5000${sign.imageUrl}` : `http://localhost:5000${sign.imagePath}`}
                            alt={sign.word}
                          />
                        ) : (
                          <div className={`h-12 w-12 rounded-lg ${subtleBg} flex items-center justify-center border ${borderClr}`}>
                            <CloudArrowUpIcon className={`w-6 h-6 ${textSecondary}`} />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 min-w-0">
                        <div className={`text-sm font-semibold ${textPrimary} truncate`}>{sign.word}</div>
                        <div className={`text-sm ${textSecondary} mt-1 line-clamp-1`}>{sign.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'}`}>
                      {sign.category}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800'}`}>
                      {sign.difficulty}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sign.isActive 
                        ? (darkMode ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800') 
                        : (darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800')
                    }`}>
                      {sign.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className={`px-4 md:px-6 py-4 whitespace-nowrap text-sm ${textSecondary} hidden md:table-cell`}>
                    {new Date(sign.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => openEditModal(sign)}
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium ${darkMode ? 'text-blue-300 bg-blue-950 hover:bg-blue-900' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'} rounded-lg transition-colors`}
                        title="Edit sign"
                      >
                        <PencilIcon className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSign(sign);
                          setShowDeleteModal(true);
                        }}
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium ${darkMode ? 'text-red-300 bg-red-950 hover:bg-red-900' : 'text-red-600 bg-red-50 hover:bg-red-100'} rounded-lg transition-colors`}
                        title="Delete sign"
                      >
                        <TrashIcon className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Sign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border ${borderClr}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${textPrimary}`}>Add New Sign</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`${textSecondary} hover:opacity-80`}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateSign} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Word</label>
                <input
                  type="text"
                  value={createForm.word}
                  onChange={(e) => setCreateForm({...createForm, word: e.target.value})}
                  className={`w-full border ${inputBorder} ${inputBg} ${textPrimary} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Category</label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                  className={`w-full border ${inputBorder} ${inputBg} ${textPrimary} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                >
                  <option value="alphabet">Alphabet</option>
                  <option value="phrases">Phrases</option>
                  <option value="family">Family</option>
                  <option value="activities">Activities</option>
                  <option value="advanced">Advanced</option>
                  <option value="numbers">Numbers</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Difficulty</label>
                <select
                  value={createForm.difficulty}
                  onChange={(e) => setCreateForm({...createForm, difficulty: e.target.value})}
                  className={`w-full border ${inputBorder} ${inputBg} ${textPrimary} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  rows="3"
                  className={`w-full border ${inputBorder} ${inputBg} ${textPrimary} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Image (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className={`w-full border ${inputBorder} ${inputBg} ${textPrimary} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                    onChange={(e) => setCreateFiles({ ...createFiles, image: e.target.files[0] })}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Video (optional)</label>
                  <input
                    type="file"
                    accept="video/*"
                    className={`w-full border ${inputBorder} ${inputBg} ${textPrimary} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                    onChange={(e) => setCreateFiles({ ...createFiles, video: e.target.files[0] })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`px-4 py-2 border ${inputBorder} rounded-lg text-sm font-medium ${textSecondary} hover:opacity-80 transition-colors`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  Create Sign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Sign Modal */}
      {showEditModal && selectedSign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border ${borderClr}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${textPrimary}`}>Edit Sign</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSign(null);
                }}
                className={`${textSecondary} hover:opacity-80`}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditSign} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Word</label>
                <input
                  type="text"
                  value={editForm.word}
                  onChange={(e) => setEditForm({...editForm, word: e.target.value})}
                  className={`w-full border ${inputBorder} ${inputBg} ${textPrimary} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  className={`w-full border ${inputBorder} ${inputBg} ${textPrimary} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                >
                  <option value="alphabet">Alphabet</option>
                  <option value="phrases">Phrases</option>
                  <option value="family">Family</option>
                  <option value="activities">Activities</option>
                  <option value="advanced">Advanced</option>
                  <option value="numbers">Numbers</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Difficulty</label>
                <select
                  value={editForm.difficulty}
                  onChange={(e) => setEditForm({...editForm, difficulty: e.target.value})}
                  className={`w-full border ${inputBorder} ${inputBg} ${textPrimary} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows="3"
                  className={`w-full border ${inputBorder} ${inputBg} ${textPrimary} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Status</label>
                <select
                  value={editForm.isActive}
                  onChange={(e) => setEditForm({...editForm, isActive: e.target.value === 'true'})}
                  className={`w-full border ${inputBorder} ${inputBg} ${textPrimary} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
              <div>
                <label className={`block text sm font-medium ${textSecondary} mb-1`}>Replace Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('image', e.target.files[0], true)}
                  className={`w-full border ${inputBorder} ${inputBg} ${textPrimary} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Replace Video</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange('video', e.target.files[0], true)}
                  className={`w-full border ${inputBorder} ${inputBg} ${textPrimary} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedSign(null);
                  }}
                  className={`px-4 py-2 border ${inputBorder} rounded-md text-sm font-medium ${textSecondary} hover:opacity-80`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600"
                >
                  Update Sign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedSign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-lg p-6 w-full max-w-md border ${borderClr}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${textPrimary}`}>Delete Sign</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSign(null);
                }}
                className={`${textSecondary} hover:opacity-80`}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <p className={`${textSecondary} mb-6`}>
              Are you sure you want to delete "<strong>{selectedSign.word}</strong>"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSign(null);
                }}
                className={`px-4 py-2 border ${inputBorder} rounded-lg text-sm font-medium ${textSecondary} hover:opacity-80 transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSign}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 