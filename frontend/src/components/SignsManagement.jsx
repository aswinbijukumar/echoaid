import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export default function SignsManagement() {
  const [signs, setSigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSign, setSelectedSign] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: '',
    isActive: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const { token } = useAuth();

  // Form states
  const [createForm, setCreateForm] = useState({
    word: '',
    category: 'alphabet',
    difficulty: 'Beginner',
    description: '',
    tags: '',
    usage: '',
    signLanguageType: 'ASL',
    handDominance: 'right',
    facialExpression: '',
    bodyPosition: '',
    movement: '',
    isActive: true
  });

  const [editForm, setEditForm] = useState({});

  // File upload states
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  useEffect(() => {
    fetchSigns();
  }, [pagination.currentPage, filters]);

  const fetchSigns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters
      });

      const response = await fetch(`http://localhost:5000/api/admin/content/signs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSigns(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching signs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSign = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Add form fields
    Object.keys(createForm).forEach(key => {
      if (createForm[key] !== '') {
        formData.append(key, createForm[key]);
      }
    });

    // Add files
    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (videoFile) {
      formData.append('video', videoFile);
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/content/signs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setSigns([data.data, ...signs]);
        setShowCreateModal(false);
        resetCreateForm();
      }
    } catch (error) {
      console.error('Error creating sign:', error);
    }
  };

  const handleUpdateSign = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Add form fields
    Object.keys(editForm).forEach(key => {
      if (editForm[key] !== '') {
        formData.append(key, editForm[key]);
      }
    });

    // Add files
    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (videoFile) {
      formData.append('video', videoFile);
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
        setSigns(signs.map(sign => 
          sign._id === selectedSign._id ? data.data : sign
        ));
        setShowEditModal(false);
        setSelectedSign(null);
        resetEditForm();
      }
    } catch (error) {
      console.error('Error updating sign:', error);
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
      }
    } catch (error) {
      console.error('Error deleting sign:', error);
    }
  };

  const handleBulkOperation = async (operation, signIds) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/content/signs/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          operation,
          signIds
        })
      });

      if (response.ok) {
        fetchSigns(); // Refresh the list
      }
    } catch (error) {
      console.error('Error performing bulk operation:', error);
    }
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'image') {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      } else if (type === 'video') {
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
      }
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      word: '',
      category: 'alphabet',
      difficulty: 'Beginner',
      description: '',
      tags: '',
      usage: '',
      signLanguageType: 'ASL',
      handDominance: 'right',
      facialExpression: '',
      bodyPosition: '',
      movement: '',
      isActive: true
    });
    setImageFile(null);
    setVideoFile(null);
    setImagePreview(null);
    setVideoPreview(null);
  };

  const resetEditForm = () => {
    setEditForm({});
    setImageFile(null);
    setVideoFile(null);
    setImagePreview(null);
    setVideoPreview(null);
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircleIcon className="w-3 h-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircleIcon className="w-3 h-3 mr-1" />
        Inactive
      </span>
    );
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = {
      'Beginner': 'bg-green-100 text-green-800',
      'Intermediate': 'bg-yellow-100 text-yellow-800',
      'Advanced': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[difficulty]}`}>
        {difficulty}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Signs Management</h2>
          <p className="text-gray-600">Manage sign language dictionary entries</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add New Sign
          </button>
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = `http://localhost:5000/api/admin/content/signs/export?format=csv`;
              link.download = 'signs-export.csv';
              link.click();
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search signs..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters({...filters, isActive: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Signs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {signs.map((sign) => (
                <tr key={sign._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {sign.imagePath ? (
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={`http://localhost:5000${sign.imagePath}`}
                            alt={sign.word}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <CloudArrowUpIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{sign.word}</div>
                        <div className="text-sm text-gray-500">{sign.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {sign.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getDifficultyBadge(sign.difficulty)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(sign.isActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sign.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedSign(sign);
                          setEditForm({
                            word: sign.word,
                            category: sign.category,
                            difficulty: sign.difficulty,
                            description: sign.description,
                            tags: sign.tags?.join(', ') || '',
                            usage: sign.usage || '',
                            signLanguageType: sign.signLanguageType,
                            handDominance: sign.handDominance,
                            facialExpression: sign.facialExpression || '',
                            bodyPosition: sign.bodyPosition || '',
                            movement: sign.movement || '',
                            isActive: sign.isActive
                          });
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSign(sign);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
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
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})}
                disabled={pagination.currentPage === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.totalItems}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPagination({...pagination, currentPage: page})}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.currentPage
                          ? 'z-10 bg-green-50 border-green-500 text-green-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Sign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Add New Sign</h3>
            <form onSubmit={handleCreateSign} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Word</label>
                  <input
                    type="text"
                    value={createForm.word}
                    onChange={(e) => setCreateForm({...createForm, word: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={createForm.difficulty}
                    onChange={(e) => setCreateForm({...createForm, difficulty: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sign Language Type</label>
                  <select
                    value={createForm.signLanguageType}
                    onChange={(e) => setCreateForm({...createForm, signLanguageType: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="ASL">ASL</option>
                    <option value="BSL">BSL</option>
                    <option value="AUSLAN">AUSLAN</option>
                    <option value="ISL">ISL</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={createForm.tags}
                    onChange={(e) => setCreateForm({...createForm, tags: e.target.value})}
                    placeholder="beginner, basic, greeting"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage</label>
                  <input
                    type="text"
                    value={createForm.usage}
                    onChange={(e) => setCreateForm({...createForm, usage: e.target.value})}
                    placeholder="Common usage context"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hand Dominance</label>
                  <select
                    value={createForm.handDominance}
                    onChange={(e) => setCreateForm({...createForm, handDominance: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="right">Right</option>
                    <option value="left">Left</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={createForm.isActive}
                    onChange={(e) => setCreateForm({...createForm, isActive: e.target.value === 'true'})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facial Expression</label>
                  <input
                    type="text"
                    value={createForm.facialExpression}
                    onChange={(e) => setCreateForm({...createForm, facialExpression: e.target.value})}
                    placeholder="Required facial expression"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body Position</label>
                  <input
                    type="text"
                    value={createForm.bodyPosition}
                    onChange={(e) => setCreateForm({...createForm, bodyPosition: e.target.value})}
                    placeholder="Body position requirement"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Movement</label>
                  <input
                    type="text"
                    value={createForm.movement}
                    onChange={(e) => setCreateForm({...createForm, movement: e.target.value})}
                    placeholder="Movement description"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video (optional)</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {videoPreview && (
                    <video src={videoPreview} controls className="mt-2 h-20 w-20 object-cover rounded" />
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Edit Sign: {selectedSign.word}</h3>
            <form onSubmit={handleUpdateSign} className="space-y-4">
              {/* Same form fields as create, but with editForm values */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Word</label>
                  <input
                    type="text"
                    value={editForm.word || ''}
                    onChange={(e) => setEditForm({...editForm, word: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editForm.category || ''}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="alphabet">Alphabet</option>
                    <option value="phrases">Phrases</option>
                    <option value="family">Family</option>
                    <option value="activities">Activities</option>
                    <option value="advanced">Advanced</option>
                    <option value="numbers">Numbers</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedSign(null);
                    resetEditForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-2" />
              <h3 className="text-lg font-medium">Delete Sign</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedSign.word}"? This action cannot be undone and will also remove associated files.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSign(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSign}
                className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600"
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