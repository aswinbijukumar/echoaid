import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  CheckIcon,
  Square2StackIcon,
  AcademicCapIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContextConstants';
import { useTheme } from '../hooks/useTheme';
import Modal from './Modal';

export default function ContentManagement() {
  const [signs, setSigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [selectedSign, setSelectedSign] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    difficulty: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSigns, setSelectedSigns] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const { token } = useAuth();
  const { darkMode } = useTheme();

  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-white';
  const subtleBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-50';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const borderClr = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBorder = darkMode ? 'border-gray-600' : 'border-gray-300';
  const inputBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';

  const [createForm, setCreateForm] = useState({
    word: '',
    category: '',
    difficulty: '',
    description: '',
    usage: '',
    tags: '',
    isActive: true
  });

  const [editForm, setEditForm] = useState({
    word: '',
    category: '',
    difficulty: '',
    description: '',
    usage: '',
    tags: '',
    isActive: true
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'AcademicCapIcon',
    color: 'bg-blue-500',
    order: 0,
    slug: ''
  });

  const [editCategoryForm, setEditCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'AcademicCapIcon',
    color: 'bg-blue-500',
    order: 0,
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
    let filtered = signs.filter(sign => {
      const matchesText = !term ||
        (sign.word || '').toLowerCase().includes(term) ||
        (sign.description || '').toLowerCase().includes(term) ||
        (sign.usage || '').toLowerCase().includes(term) ||
        (Array.isArray(sign.tags) ? sign.tags.join(' ').toLowerCase() : (sign.tags || '').toLowerCase()).includes(term);
      const matchesCategory = !filters.category || sign.category === filters.category;
      const matchesDifficulty = !filters.difficulty || sign.difficulty === filters.difficulty;
      const matchesStatus = !filters.status || 
        (filters.status === 'active' && sign.isActive) ||
        (filters.status === 'inactive' && !sign.isActive);
      return matchesText && matchesCategory && matchesDifficulty && matchesStatus;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (filters.sortBy) {
        case 'word':
          aValue = a.word.toLowerCase();
          bValue = b.word.toLowerCase();
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'difficulty': {
          const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
          aValue = difficultyOrder[a.difficulty] || 0;
          bValue = difficultyOrder[b.difficulty] || 0;
          break;
        }
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  })();

  useEffect(() => {
    fetchSigns();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set default category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !createForm.category) {
      setCreateForm(prev => ({ ...prev, category: categories[0].slug }));
    }
  }, [categories, createForm.category]);

  const fetchSigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${'https://echoaidbackend.onrender.com'}/api/admin/content/signs?limit=500`, {
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

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${'https://echoaidbackend.onrender.com'}/api/content/categories`);

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
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
      const response = await fetch(`${'https://echoaidbackend.onrender.com'}/api/admin/content/signs`, {
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
        category: categories.length > 0 ? categories[0].slug : '',
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
      const response = await fetch(`${'https://echoaidbackend.onrender.com'}/api/admin/content/signs/${selectedSign._id}`, {
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
    
    // Always send all fields that have been modified or are required
    // This allows for partial updates while maintaining data integrity
    
    // Word field - always send if it has content
    if (editForm.word !== undefined && editForm.word.trim() !== '') {
      formData.append('word', editForm.word.trim());
    }
    
    // Category field - send if changed from original or if explicitly set
    if (editForm.category !== undefined && editForm.category !== '') {
      formData.append('category', editForm.category);
    }
    
    // Difficulty field - send if changed from original or if explicitly set
    if (editForm.difficulty !== undefined && editForm.difficulty !== '') {
      formData.append('difficulty', editForm.difficulty);
    }
    
    // Description field - send if it has content (can be empty to clear)
    if (editForm.description !== undefined) {
      formData.append('description', editForm.description.trim());
    }
    
    // Usage field - send if it has content (can be empty to clear)
    if (editForm.usage !== undefined) {
      formData.append('usage', editForm.usage.trim());
    }
    
    // Tags field - send if it has content (can be empty to clear)
    if (editForm.tags !== undefined) {
      formData.append('tags', editForm.tags.trim());
    }
    
    // Status field - always send the current value
    formData.append('isActive', editForm.isActive.toString());

    // File uploads - only send if new files are selected
    if (editFiles.image) {
      formData.append('image', editFiles.image);
    }
    if (editFiles.video) {
      formData.append('video', editFiles.video);
    }

    try {
      console.log('Updating sign with data:', {
        word: editForm.word,
        category: editForm.category,
        difficulty: editForm.difficulty,
        description: editForm.description,
        usage: editForm.usage,
        tags: editForm.tags,
        isActive: editForm.isActive
      });

      console.log('Selected sign ID:', selectedSign._id);
      console.log('Token:', token ? 'Present' : 'Missing');

      const response = await fetch(`${'https://echoaidbackend.onrender.com'}/api/admin/content/signs/${selectedSign._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const responseData = await response.json();
      console.log('Update response:', responseData);

      if (response.ok) {
        setSigns(signs.map(sign => sign._id === selectedSign._id ? responseData.data : sign));
        setShowEditModal(false);
        setSelectedSign(null);
        setEditForm({
          word: '',
          category: '',
          difficulty: '',
          description: '',
          usage: '',
          tags: '',
          isActive: true
        });
        setEditFiles({ image: null, video: null });
        setSuccess('Sign updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        console.error('Update failed:', responseData);
        setError(`Failed to update sign: ${responseData.message || 'Unknown error'}`);
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error updating sign:', error);
      setError(`Error updating sign: ${error.message}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  const openEditModal = (sign) => {
    setSelectedSign(sign);
    setEditForm({
      word: sign.word || '',
      category: sign.category || '',
      difficulty: sign.difficulty || '',
      description: sign.description || '',
      usage: sign.usage || '',
      tags: Array.isArray(sign.tags) ? sign.tags.join(', ') : (sign.tags || ''),
      isActive: sign.isActive !== undefined ? sign.isActive : true
    });
    setEditFiles({ image: null, video: null });
    setShowEditModal(true);
  };


  // Category Management Functions
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    // Comprehensive validation
    const validationErrors = [];

    // Name validation
    if (!categoryForm.name.trim()) {
      validationErrors.push('Category name is required');
    } else if (categoryForm.name.trim().length < 2) {
      validationErrors.push('Category name must be at least 2 characters long');
    } else if (categoryForm.name.trim().length > 50) {
      validationErrors.push('Category name must be less than 50 characters');
    } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(categoryForm.name.trim())) {
      validationErrors.push('Category name can only contain letters, numbers, spaces, hyphens, and underscores');
    }

    // Description validation (optional but if provided, validate)
    if (categoryForm.description && categoryForm.description.trim().length > 200) {
      validationErrors.push('Description must be less than 200 characters');
    }

    // Color validation
    const validColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-red-500', 'bg-teal-500', 'bg-yellow-500'];
    if (!validColors.includes(categoryForm.color)) {
      validationErrors.push('Invalid color selected');
    }

    // Order validation
    if (categoryForm.order < 0 || categoryForm.order > 100) {
      validationErrors.push('Order must be between 0 and 100');
    }

    // Check for duplicate category name
    const duplicateCategory = categories.find(cat => 
      cat.name.toLowerCase() === categoryForm.name.trim().toLowerCase()
    );
    if (duplicateCategory) {
      validationErrors.push(`Category "${categoryForm.name}" already exists`);
    }

    // Authentication check
    if (!token) {
      validationErrors.push('Authentication token not found. Please log in again.');
    }

    // Display validation errors
    if (validationErrors.length > 0) {
      setError('Validation Errors:\n\n' + validationErrors.join('\n'));
      setTimeout(() => setError(''), 5000);
      return;
    }

    // Generate slug from name
    const slug = categoryForm.name.trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    const categoryData = {
      ...categoryForm,
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim(),
      slug: slug
    };

    console.log('Creating category:', categoryData);
    console.log('Token:', token ? 'Present' : 'Missing');

    try {
      const response = await fetch(`${'https://echoaidbackend.onrender.com'}/api/admin/content/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('Category created successfully:', data);
        setCategories([...categories, data.data]);
        setShowCategoryModal(false);
        setCategoryForm({
          name: '',
          description: '',
          icon: 'AcademicCapIcon',
          color: 'bg-blue-500',
          order: 0,
          slug: ''
        });
        setSuccess('Category created successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        console.error('Category creation failed:', errorData);
        setError(errorData.message || 'Failed to create category');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setError('Error creating category');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    
    if (!editCategoryForm.name.trim()) {
      setError('Please enter a category name');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const response = await fetch(`${'https://echoaidbackend.onrender.com'}/api/admin/content/categories/${selectedCategory._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editCategoryForm)
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(categories.map(cat => cat._id === selectedCategory._id ? data.data : cat));
        setShowEditCategoryModal(false);
        setSelectedCategory(null);
        setEditCategoryForm({
          name: '',
          description: '',
          icon: 'AcademicCapIcon',
          color: 'bg-blue-500',
          order: 0,
          isActive: true
        });
        setSuccess('Category updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update category');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Error updating category');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const response = await fetch(`${'https://echoaidbackend.onrender.com'}/api/admin/content/categories/${selectedCategory._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setCategories(categories.filter(cat => cat._id !== selectedCategory._id));
        setSelectedCategory(null);
        setSuccess('Category deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete category');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Error deleting category');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openEditCategoryModal = (category) => {
    setSelectedCategory(category);
    setEditCategoryForm({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      order: category.order,
      isActive: category.isActive
    });
    setShowEditCategoryModal(true);
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
      const response = await fetch(`${'https://echoaidbackend.onrender.com'}/api/admin/content/signs/export?format=csv`, {
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

  // Bulk selection functions
  const handleSelectAll = () => {
    if (selectedSigns.length === filteredSigns.length) {
      setSelectedSigns([]);
    } else {
      setSelectedSigns(filteredSigns.map(sign => sign._id));
    }
  };

  const handleSelectSign = (signId) => {
    setSelectedSigns(prev => 
      prev.includes(signId) 
        ? prev.filter(id => id !== signId)
        : [...prev, signId]
    );
  };

  const handleBulkDelete = async () => {
    try {
      console.log('Bulk delete request:', {
        operation: 'delete',
        signIds: selectedSigns,
        token: token ? 'present' : 'missing'
      });

      const response = await fetch(`${'https://echoaidbackend.onrender.com'}/api/admin/content/signs/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          operation: 'delete',
          signIds: selectedSigns
        })
      });

      console.log('Bulk delete response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Bulk delete success:', result);
        setSigns(signs.filter(sign => !selectedSigns.includes(sign._id)));
        setSelectedSigns([]);
        setShowBulkDeleteModal(false);
        setSuccess(`Successfully deleted ${selectedSigns.length} signs!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        console.error('Bulk delete error:', errorData);
        setError(errorData.message || 'Failed to delete signs');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error bulk deleting signs:', error);
      setError('Error bulk deleting signs');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleBulkToggleStatus = async (isActive) => {
    try {
      const response = await fetch(`${'https://echoaidbackend.onrender.com'}/api/admin/content/signs/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          operation: isActive ? 'activate' : 'deactivate',
          signIds: selectedSigns
        })
      });

      if (response.ok) {
        setSigns(signs.map(sign => 
          selectedSigns.includes(sign._id) 
            ? { ...sign, isActive }
            : sign
        ));
        setSelectedSigns([]);
        setSuccess(`Successfully ${isActive ? 'activated' : 'deactivated'} ${selectedSigns.length} signs!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || `Failed to ${isActive ? 'activate' : 'deactivate'} signs`);
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error bulk updating signs:', error);
      setError('Error bulk updating signs');
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
    <div className="w-full max-w-full bg-transparent overflow-hidden">
      {/* Page Header with Transparent Background */}
      <div className="bg-transparent border-b border-white/20 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 lg:py-6 gap-4">
          <div className="flex-1 min-w-0">
            <h1 className={`text-2xl lg:text-3xl font-bold ${textPrimary} mb-2`}>Sign Management</h1>
            <p className={`${textSecondary} text-base lg:text-lg`}>Manage sign language dictionary entries and categories</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:gap-4">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="inline-flex items-center px-4 lg:px-6 py-2 lg:py-3 bg-purple-500/90 backdrop-blur-sm text-white rounded-xl hover:bg-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl border border-purple-400/30 text-sm lg:text-base"
            >
              <PlusIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
              <span className="hidden sm:inline">Add Category</span>
              <span className="sm:hidden">Category</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 lg:px-6 py-2 lg:py-3 bg-green-500/90 backdrop-blur-sm text-white rounded-xl hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl border border-green-400/30 text-sm lg:text-base"
            >
              <PlusIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
              <span className="hidden sm:inline">Add New Sign</span>
              <span className="sm:hidden">Add Sign</span>
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 lg:px-6 py-2 lg:py-3 bg-blue-500/90 backdrop-blur-sm text-white rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl border border-blue-400/30 text-sm lg:text-base"
            >
              <DocumentArrowDownIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Management Section */}
      <div className="bg-transparent border border-white/20 rounded-2xl p-4 lg:p-8 mb-6 lg:mb-8 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6 gap-2">
          <h3 className={`text-lg lg:text-xl font-bold ${textPrimary}`}>Categories</h3>
          <span className={`text-sm ${textSecondary}`}>{categories.length} categories</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category) => (
            <div key={category._id} className="bg-transparent border border-white/20 rounded-2xl p-4 lg:p-6 backdrop-blur-sm hover:border-white/40 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="flex items-center space-x-2 lg:space-x-3 min-w-0 flex-1">
                  <div className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full ${category.color} shadow-sm flex-shrink-0`}></div>
                  <h4 className={`font-bold text-base lg:text-lg ${textPrimary} truncate`}>{category.name}</h4>
                </div>
                <div className="flex space-x-1 lg:space-x-2 flex-shrink-0">
                  <button
                    onClick={() => openEditCategoryModal(category)}
                    className="p-1.5 lg:p-2 hover:bg-white/10 rounded-xl text-blue-400 hover:text-blue-300 transition-all duration-200"
                    title="Edit category"
                  >
                    <PencilIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory(category);
                      handleDeleteCategory();
                    }}
                    className="p-1.5 lg:p-2 hover:bg-white/10 rounded-xl text-red-400 hover:text-red-300 transition-all duration-200"
                    title="Delete category"
                  >
                    <TrashIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                  </button>
                </div>
              </div>
              <p className={`text-xs lg:text-sm ${textSecondary} mb-3 lg:mb-4 leading-relaxed line-clamp-2`}>{category.description}</p>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${
                  category.isActive 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className={`text-xs lg:text-sm font-medium ${textSecondary}`}>{category.signCount || 0} signs</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/30 text-green-400 px-6 py-4 rounded-2xl mb-6">
          <div className="flex items-center space-x-2">
            <CheckIcon className="w-5 h-5" />
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 text-red-400 px-6 py-4 rounded-2xl mb-6">
          <div className="flex items-center space-x-2">
            <XMarkIcon className="w-5 h-5" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-transparent border border-white/20 rounded-2xl p-4 lg:p-8 mb-6 lg:mb-8 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <h3 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-0">Search & Filter</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setFilters({
                category: '',
                search: '',
                difficulty: '',
                status: '',
                sortBy: 'createdAt',
                sortOrder: 'desc'
              })}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors border border-white/20 rounded-xl hover:bg-white/10 backdrop-blur-sm"
            >
              Clear All Filters
            </button>
            <div className="text-sm text-gray-400">
              {filteredSigns.length} of {signs.length} signs
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">Search Signs</label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by word, description, usage, or tags..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="pl-12 w-full bg-transparent border border-white/20 text-white rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200"
            />
            {filters.search && (
              <button
                onClick={() => setFilters({...filters, search: ''})}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="glass-select w-full bg-transparent border border-white/20 text-white rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200"
            >
              <option value="" className="bg-gray-800 text-white">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category.slug} className="bg-gray-800 text-white">
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
              className="glass-select w-full bg-transparent border border-white/20 text-white rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200"
            >
              <option value="" className="bg-gray-800 text-white">All Difficulties</option>
              <option value="Beginner" className="bg-gray-800 text-white">Beginner</option>
              <option value="Intermediate" className="bg-gray-800 text-white">Intermediate</option>
              <option value="Advanced" className="bg-gray-800 text-white">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="glass-select w-full bg-transparent border border-white/20 text-white rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200"
            >
              <option value="" className="bg-gray-800 text-white">All Status</option>
              <option value="active" className="bg-gray-800 text-white">Active</option>
              <option value="inactive" className="bg-gray-800 text-white">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Sort By</label>
            <div className="flex space-x-2">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="flex-1 bg-transparent border border-white/20 text-white rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200"
              >
                <option value="createdAt" className="bg-gray-800 text-white">Date Created</option>
                <option value="word" className="bg-gray-800 text-white">Word</option>
                <option value="category" className="bg-gray-800 text-white">Category</option>
                <option value="difficulty" className="bg-gray-800 text-white">Difficulty</option>
              </select>
              <button
                onClick={() => setFilters({...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'})}
                className="px-4 py-4 bg-transparent border border-white/20 text-white rounded-2xl hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {filters.sortOrder === 'asc' ? (
                  <ArrowUpIcon className="w-5 h-5" />
                ) : (
                  <ArrowDownIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(filters.search || filters.category || filters.difficulty || filters.status) && (
          <div className="mt-6 pt-6 border-t border-white/20">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Active Filters:</h4>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
                  Search: "{filters.search}"
                  <button
                    onClick={() => setFilters({...filters, search: ''})}
                    className="ml-2 hover:text-green-300"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30">
                  Category: {categories.find(c => c.slug === filters.category)?.name || filters.category}
                  <button
                    onClick={() => setFilters({...filters, category: ''})}
                    className="ml-2 hover:text-blue-300"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.difficulty && (
                <span className="inline-flex items-center px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium border border-purple-500/30">
                  Difficulty: {filters.difficulty}
                  <button
                    onClick={() => setFilters({...filters, difficulty: ''})}
                    className="ml-2 hover:text-purple-300"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium border border-orange-500/30">
                  Status: {filters.status}
                  <button
                    onClick={() => setFilters({...filters, status: ''})}
                    className="ml-2 hover:text-orange-300"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedSigns.length > 0 && (
        <div className="bg-transparent border border-white/20 rounded-2xl p-4 lg:p-6 mb-6 lg:mb-8 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className={`text-base lg:text-lg font-medium ${textPrimary}`}>
                {selectedSigns.length} sign{selectedSigns.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedSigns([])}
                className={`text-sm ${textSecondary} hover:${textPrimary} transition-colors underline`}
              >
                Clear selection
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <button
                onClick={() => handleBulkToggleStatus(true)}
                className="inline-flex items-center px-3 lg:px-4 py-2 text-sm font-medium text-green-400 bg-green-500/10 hover:bg-green-500/20 rounded-xl transition-all duration-200 border border-green-500/30"
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                Activate
              </button>
              <button
                onClick={() => handleBulkToggleStatus(false)}
                className="inline-flex items-center px-3 lg:px-4 py-2 text-sm font-medium text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-xl transition-all duration-200 border border-yellow-500/30"
              >
                <XMarkIcon className="w-4 h-4 mr-2" />
                Deactivate
              </button>
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="inline-flex items-center px-3 lg:px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all duration-200 border border-red-500/30"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signs Table */}
      <div className="bg-transparent border border-white/20 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="px-4 lg:px-8 py-4 lg:py-6 border-b border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className={`text-xl lg:text-2xl font-bold ${textPrimary} mb-2`}>Sign Language Dictionary</h3>
              <p className={`text-base lg:text-lg ${textSecondary}`}>
                {filteredSigns.length} signs found
                {selectedSigns.length > 0 && ` • ${selectedSigns.length} selected`}
              </p>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSelectAll}
                className={`inline-flex items-center px-3 lg:px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                  selectedSigns.length === filteredSigns.length && filteredSigns.length > 0
                    ? 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30'
                    : 'text-gray-400 bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/30'
                }`}
              >
                {selectedSigns.length === filteredSigns.length && filteredSigns.length > 0 ? (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Deselect All</span>
                    <span className="sm:hidden">Deselect</span>
                  </>
                ) : (
                  <>
                    <Square2StackIcon className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Select All</span>
                    <span className="sm:hidden">Select</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto divide-y divide-white/20">
            <thead className="bg-transparent">
              <tr>
                <th className="w-12 px-3 lg:px-6 py-4 lg:py-6 text-center">
                  <input
                    type="checkbox"
                    checked={selectedSigns.length === filteredSigns.length && filteredSigns.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 lg:w-5 lg:h-5 text-green-500 bg-transparent border-white/30 rounded focus:ring-green-500/50 focus:ring-2"
                  />
                </th>
                <th className="min-w-[200px] px-3 lg:px-6 py-4 lg:py-6 text-left text-xs lg:text-sm font-bold text-white uppercase tracking-wider">
                  Sign
                </th>
                <th className="min-w-[120px] px-3 lg:px-6 py-4 lg:py-6 text-left text-xs lg:text-sm font-bold text-white uppercase tracking-wider hidden sm:table-cell">
                  Category
                </th>
                <th className="min-w-[100px] px-3 lg:px-6 py-4 lg:py-6 text-left text-xs lg:text-sm font-bold text-white uppercase tracking-wider hidden md:table-cell">
                  Difficulty
                </th>
                <th className="min-w-[80px] px-3 lg:px-6 py-4 lg:py-6 text-left text-xs lg:text-sm font-bold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="min-w-[100px] px-3 lg:px-6 py-4 lg:py-6 text-left text-xs lg:text-sm font-bold text-white uppercase tracking-wider hidden lg:table-cell">
                  Created
                </th>
                <th className="min-w-[120px] px-3 lg:px-6 py-4 lg:py-6 text-right text-xs lg:text-sm font-bold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-white/20">
              {filteredSigns.map((sign) => (
                <tr key={sign._id} className={`hover:bg-white/5 transition-all duration-200 ${selectedSigns.includes(sign._id) ? 'bg-blue-500/10' : ''}`}>
                  <td className="px-3 lg:px-6 py-4 lg:py-6 text-center">
                    <input
                      type="checkbox"
                      checked={selectedSigns.includes(sign._id)}
                      onChange={() => handleSelectSign(sign._id)}
                      className="w-4 h-4 lg:w-5 lg:h-5 text-green-500 bg-transparent border-white/30 rounded focus:ring-green-500/50 focus:ring-2"
                    />
                  </td>
                  <td className="px-3 lg:px-6 py-4 lg:py-6">
                    <div className="flex items-center max-w-full">
                      <div className="flex-shrink-0 h-12 w-12 lg:h-16 lg:w-16">
                        {sign.imageUrl || sign.thumbnailUrl || sign.imagePath ? (
                          (() => {
                            const pickUrl = sign.thumbnailUrl || sign.imageUrl || sign.imagePath;
                            const src = typeof pickUrl === 'string' && pickUrl.startsWith('http')
                              ? pickUrl
                              : `${'https://echoaidbackend.onrender.com'}${pickUrl || ''}`;
                            return (
                              <img
                                className="h-12 w-12 lg:h-16 lg:w-16 rounded-xl lg:rounded-2xl object-cover border border-white/20 shadow-lg"
                                src={src}
                                alt={sign.word}
                              />
                            );
                          })()
                        ) : (
                          <div className="h-12 w-12 lg:h-16 lg:w-16 rounded-xl lg:rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm">
                            <CloudArrowUpIcon className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-3 lg:ml-6 min-w-0 flex-1">
                        <div className="text-sm lg:text-lg font-bold text-white truncate">{sign.word}</div>
                        <div className="text-xs lg:text-sm text-gray-300 mt-1 line-clamp-1">{sign.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 lg:py-6 hidden sm:table-cell">
                    <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {sign.category}
                    </span>
                  </td>
                  <td className="px-3 lg:px-6 py-4 lg:py-6 hidden md:table-cell">
                    <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                      {sign.difficulty}
                    </span>
                  </td>
                  <td className="px-3 lg:px-6 py-4 lg:py-6">
                    <span className={`inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium ${
                      sign.isActive 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {sign.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 lg:px-6 py-4 lg:py-6 text-xs lg:text-sm text-gray-300 hidden lg:table-cell">
                    {new Date(sign.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 lg:px-6 py-4 lg:py-6 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-1 lg:space-x-3">
                      <button
                        onClick={() => openEditModal(sign)}
                        className="inline-flex items-center px-2 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg lg:rounded-xl transition-all duration-200 border border-blue-500/30"
                        title="Edit sign"
                      >
                        <PencilIcon className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSign(sign);
                          setShowDeleteModal(true);
                        }}
                        className="inline-flex items-center px-2 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg lg:rounded-xl transition-all duration-200 border border-red-500/30"
                        title="Delete sign"
                      >
                        <TrashIcon className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                        <span className="hidden sm:inline">Delete</span>
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
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add New Sign" className="bg-transparent border border-white/20 backdrop-blur-sm max-w-4xl w-full mx-4">
          <form onSubmit={handleCreateSign} className="space-y-6">
            {/* Word Field - Full Width */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Word <span className="text-red-400">*</span>
                <span className="text-xs text-gray-400 ml-2">({createForm.word.length}/50 characters)</span>
              </label>
              <input
                type="text"
                value={createForm.word}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 50);
                  setCreateForm({...createForm, word: value});
                }}
                className="w-full bg-transparent border border-white/20 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200"
                placeholder="Enter the sign word (e.g., Hello, Thank you)"
                required
              />
              {createForm.word.length > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  {createForm.word.length < 2 ? (
                    <span className="text-red-400">Word must be at least 2 characters</span>
                  ) : createForm.word.length > 50 ? (
                    <span className="text-red-400">Word must be less than 50 characters</span>
                  ) : (
                    <span className="text-green-400">✓ Valid word</span>
                  )}
                </div>
              )}
            </div>

            {/* Category and Difficulty - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                  className="w-full bg-transparent border border-white/20 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200"
                  required
                >
                  <option value="" className="bg-gray-800 text-gray-400">Select a category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category.slug} className="bg-gray-800 text-white">
                      {category.name}
                    </option>
                  ))}
                </select>
                {createForm.category && (
                  <div className="mt-2 text-xs text-green-400">✓ Category selected</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Difficulty <span className="text-red-400">*</span>
                </label>
                <select
                  value={createForm.difficulty}
                  onChange={(e) => setCreateForm({...createForm, difficulty: e.target.value})}
                  className="w-full bg-transparent border border-white/20 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200"
                  required
                >
                  <option value="" className="bg-gray-800 text-gray-400">Select difficulty level</option>
                  <option value="Beginner" className="bg-gray-800 text-white">Beginner - Basic signs</option>
                  <option value="Intermediate" className="bg-gray-800 text-white">Intermediate - Moderate complexity</option>
                  <option value="Advanced" className="bg-gray-800 text-white">Advanced - Complex signs</option>
                </select>
                {createForm.difficulty && (
                  <div className="mt-2 text-xs text-green-400">✓ Difficulty level selected</div>
                )}
              </div>
            </div>

            {/* Description Field - Full Width */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Description
                <span className="text-xs text-gray-400 ml-2">({createForm.description.length}/500 characters)</span>
              </label>
              <textarea
                value={createForm.description}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 500);
                  setCreateForm({...createForm, description: value});
                }}
                rows="4"
                className="w-full bg-transparent border border-white/20 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200 resize-none"
                placeholder="Describe the sign, its usage, or context (optional)"
              />
              {createForm.description.length > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  {createForm.description.length > 500 ? (
                    <span className="text-red-400">Description must be less than 500 characters</span>
                  ) : (
                    <span className="text-green-400">✓ Valid description</span>
                  )}
                </div>
              )}
            </div>

            {/* Usage and Tags - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Usage Context
                  <span className="text-xs text-gray-400 ml-2">({createForm.usage?.length || 0}/200 characters)</span>
                </label>
                <input
                  type="text"
                  value={createForm.usage || ''}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 200);
                    setCreateForm({...createForm, usage: value});
                  }}
                  className="w-full bg-transparent border border-white/20 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200"
                  placeholder="When to use this sign (e.g., Greeting, Formal setting)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Tags
                  <span className="text-xs text-gray-400 ml-2">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={createForm.tags || ''}
                  onChange={(e) => setCreateForm({...createForm, tags: e.target.value})}
                  className="w-full bg-transparent border border-white/20 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200"
                  placeholder="greeting, formal, common (optional)"
                />
              </div>
            </div>

            {/* File Upload Section */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h4 className="text-xl font-semibold text-white mb-6">Media Files (Optional)</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Image File
                    <span className="text-xs text-gray-400 ml-2">(JPG, PNG, GIF - Max 5MB)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full bg-transparent border border-white/20 text-white rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-green-500/20 file:text-green-400 hover:file:bg-green-500/30"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert('Image file must be less than 5MB');
                            e.target.value = '';
                            return;
                          }
                          setCreateFiles({ ...createFiles, image: file });
                        }
                      }}
                    />
                  </div>
                  {createFiles.image && (
                    <div className="mt-2 text-xs text-green-400">
                      ✓ {createFiles.image.name} ({(createFiles.image.size / 1024 / 1024).toFixed(2)}MB)
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Video File
                    <span className="text-xs text-gray-400 ml-2">(MP4, MOV, AVI - Max 50MB)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="video/*"
                      className="w-full bg-transparent border border-white/20 text-white rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 50 * 1024 * 1024) {
                            alert('Video file must be less than 50MB');
                            e.target.value = '';
                            return;
                          }
                          setCreateFiles({ ...createFiles, video: file });
                        }
                      }}
                    />
                  </div>
                  {createFiles.video && (
                    <div className="mt-2 text-xs text-green-400">
                      ✓ {createFiles.video.name} ({(createFiles.video.size / 1024 / 1024).toFixed(2)}MB)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Validation Summary */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4">Validation Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-3">
                  {createForm.word.length >= 2 && createForm.word.length <= 50 ? (
                    <span className="text-green-400 text-lg">✓</span>
                  ) : (
                    <span className="text-red-400 text-lg">✗</span>
                  )}
                  <span className="text-gray-300">Word (2-50 characters)</span>
                </div>
                <div className="flex items-center space-x-3">
                  {createForm.category ? (
                    <span className="text-green-400 text-lg">✓</span>
                  ) : (
                    <span className="text-red-400 text-lg">✗</span>
                  )}
                  <span className="text-gray-300">Category selected</span>
                </div>
                <div className="flex items-center space-x-3">
                  {createForm.difficulty ? (
                    <span className="text-green-400 text-lg">✓</span>
                  ) : (
                    <span className="text-red-400 text-lg">✗</span>
                  )}
                  <span className="text-gray-300">Difficulty level</span>
                </div>
                <div className="flex items-center space-x-3">
                  {createForm.description.length <= 500 ? (
                    <span className="text-green-400 text-lg">✓</span>
                  ) : (
                    <span className="text-red-400 text-lg">✗</span>
                  )}
                  <span className="text-gray-300">Description (max 500 characters)</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-6 pt-8 border-t border-white/20">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-8 py-4 border border-white/20 text-white rounded-2xl text-base font-medium hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!createForm.word || !createForm.category || !createForm.difficulty || createForm.word.length < 2 || createForm.word.length > 50 || createForm.description.length > 500}
                className="px-8 py-4 bg-green-500/90 backdrop-blur-sm text-white rounded-2xl text-base font-medium hover:bg-green-600 disabled:bg-gray-500/50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl border border-green-400/30"
              >
                Create Sign
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Sign Modal */}
      {showEditModal && selectedSign && (
        <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedSign(null); }} title="Edit Sign" className="bg-transparent border border-white/20 backdrop-blur-sm max-w-4xl w-full mx-4">
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <h3 className="text-blue-400 font-semibold">Quick Edit Mode</h3>
            </div>
            <p className="text-sm text-gray-300">
              You can edit any field below. Only the fields you change will be updated. 
              Leave fields unchanged to keep their current values.
            </p>
          </div>
          <form onSubmit={handleEditSign} className="space-y-6">
            {/* Word Field - Full Width */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Word
                <span className="text-xs text-gray-400 ml-2">({editForm.word.length}/50 characters)</span>
                {editForm.word !== selectedSign.word && (
                  <span className="ml-2 text-xs text-green-400">✓ Will be updated</span>
                )}
              </label>
              <input
                type="text"
                value={editForm.word}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 50);
                  setEditForm({...editForm, word: value});
                }}
                className={`w-full bg-transparent border text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200 ${
                  editForm.word !== selectedSign.word 
                    ? 'border-green-500/50 bg-green-500/5' 
                    : 'border-white/20'
                }`}
                placeholder="Enter the sign word (e.g., Hello, Thank you, or single letters like a, b, c)"
              />
              {editForm.word.length > 50 && (
                <div className="mt-2 text-xs text-red-400">
                  Word must be less than 50 characters
                </div>
              )}
              {editForm.word !== selectedSign.word && (
                <div className="mt-2 text-xs text-gray-400">
                  Current: "{selectedSign.word}" → New: "{editForm.word}"
                </div>
              )}
            </div>

            {/* Category and Difficulty - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Category
                  {editForm.category !== selectedSign.category && editForm.category !== '' && (
                    <span className="ml-2 text-xs text-green-400">✓ Will be updated</span>
                  )}
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  className={`w-full bg-transparent border text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200 ${
                    editForm.category !== selectedSign.category && editForm.category !== ''
                      ? 'border-green-500/50 bg-green-500/5' 
                      : 'border-white/20'
                  }`}
                >
                  <option value="" className="bg-gray-800 text-gray-400">Keep current: {selectedSign.category}</option>
                  {categories.map(category => (
                    <option key={category._id} value={category.slug} className="bg-gray-800 text-white">
                      {category.name}
                    </option>
                  ))}
                </select>
                {editForm.category !== selectedSign.category && editForm.category !== '' && (
                  <div className="mt-2 text-xs text-gray-400">
                    Current: "{selectedSign.category}" → New: "{editForm.category}"
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Difficulty
                  {editForm.difficulty !== selectedSign.difficulty && editForm.difficulty !== '' && (
                    <span className="ml-2 text-xs text-green-400">✓ Will be updated</span>
                  )}
                </label>
                <select
                  value={editForm.difficulty}
                  onChange={(e) => setEditForm({...editForm, difficulty: e.target.value})}
                  className={`w-full bg-transparent border text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200 ${
                    editForm.difficulty !== selectedSign.difficulty && editForm.difficulty !== ''
                      ? 'border-green-500/50 bg-green-500/5' 
                      : 'border-white/20'
                  }`}
                >
                  <option value="" className="bg-gray-800 text-gray-400">Keep current: {selectedSign.difficulty}</option>
                  <option value="Beginner" className="bg-gray-800 text-white">Beginner - Basic signs</option>
                  <option value="Intermediate" className="bg-gray-800 text-white">Intermediate - Moderate complexity</option>
                  <option value="Advanced" className="bg-gray-800 text-white">Advanced - Complex signs</option>
                </select>
                {editForm.difficulty !== selectedSign.difficulty && editForm.difficulty !== '' && (
                  <div className="mt-2 text-xs text-gray-400">
                    Current: "{selectedSign.difficulty}" → New: "{editForm.difficulty}"
                  </div>
                )}
              </div>
            </div>

            {/* Description Field - Full Width */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Description
                <span className="text-xs text-gray-400 ml-2">({editForm.description.length}/500 characters)</span>
                {editForm.description !== selectedSign.description && (
                  <span className="ml-2 text-xs text-green-400">✓ Will be updated</span>
                )}
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 500);
                  setEditForm({...editForm, description: value});
                }}
                rows="4"
                className={`w-full bg-transparent border text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200 resize-none ${
                  editForm.description !== selectedSign.description 
                    ? 'border-green-500/50 bg-green-500/5' 
                    : 'border-white/20'
                }`}
                placeholder="Describe the sign, its usage, or context (optional)"
              />
              {editForm.description.length > 500 && (
                <div className="mt-2 text-xs text-red-400">
                  Description must be less than 500 characters
                </div>
              )}
              {editForm.description !== selectedSign.description && (
                <div className="mt-2 text-xs text-gray-400">
                  {selectedSign.description ? `Current: "${selectedSign.description}"` : 'Current: (empty)'} → 
                  {editForm.description ? ` New: "${editForm.description}"` : ' New: (empty)'}
                </div>
              )}
            </div>

            {/* Usage and Status - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Usage Context
                  <span className="text-xs text-gray-400 ml-2">({editForm.usage?.length || 0}/200 characters)</span>
                  {editForm.usage !== selectedSign.usage && (
                    <span className="ml-2 text-xs text-green-400">✓ Will be updated</span>
                  )}
                </label>
                <input
                  type="text"
                  value={editForm.usage || ''}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 200);
                    setEditForm({...editForm, usage: value});
                  }}
                  className={`w-full bg-transparent border text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200 ${
                    editForm.usage !== selectedSign.usage 
                      ? 'border-green-500/50 bg-green-500/5' 
                      : 'border-white/20'
                  }`}
                  placeholder="When to use this sign (e.g., Greeting, Formal setting)"
                />
                {editForm.usage !== selectedSign.usage && (
                  <div className="mt-2 text-xs text-gray-400">
                    {selectedSign.usage ? `Current: "${selectedSign.usage}"` : 'Current: (empty)'} → 
                    {editForm.usage ? ` New: "${editForm.usage}"` : ' New: (empty)'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Status
                  {editForm.isActive !== selectedSign.isActive && (
                    <span className="ml-2 text-xs text-green-400">✓ Will be updated</span>
                  )}
                </label>
                <select
                  value={editForm.isActive}
                  onChange={(e) => setEditForm({...editForm, isActive: e.target.value === 'true'})}
                  className={`w-full bg-transparent border text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200 ${
                    editForm.isActive !== selectedSign.isActive 
                      ? 'border-green-500/50 bg-green-500/5' 
                      : 'border-white/20'
                  }`}
                >
                  <option value={true} className="bg-gray-800 text-white">Active</option>
                  <option value={false} className="bg-gray-800 text-white">Inactive</option>
                </select>
                {editForm.isActive !== selectedSign.isActive && (
                  <div className="mt-2 text-xs text-gray-400">
                    Current: {selectedSign.isActive ? 'Active' : 'Inactive'} → New: {editForm.isActive ? 'Active' : 'Inactive'}
                  </div>
                )}
              </div>
            </div>

            {/* Tags Field - Full Width */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Tags
                <span className="text-xs text-gray-400 ml-2">(comma-separated)</span>
                {editForm.tags !== (Array.isArray(selectedSign.tags) ? selectedSign.tags.join(', ') : selectedSign.tags || '') && (
                  <span className="ml-2 text-xs text-green-400">✓ Will be updated</span>
                )}
              </label>
              <input
                type="text"
                value={editForm.tags || ''}
                onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                className={`w-full bg-transparent border text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200 ${
                  editForm.tags !== (Array.isArray(selectedSign.tags) ? selectedSign.tags.join(', ') : selectedSign.tags || '')
                    ? 'border-green-500/50 bg-green-500/5' 
                    : 'border-white/20'
                }`}
                placeholder="greeting, formal, common (optional)"
              />
              {editForm.tags !== (Array.isArray(selectedSign.tags) ? selectedSign.tags.join(', ') : selectedSign.tags || '') && (
                <div className="mt-2 text-xs text-gray-400">
                  Current: "{Array.isArray(selectedSign.tags) ? selectedSign.tags.join(', ') : selectedSign.tags || '(empty)'}" → 
                  New: "{editForm.tags || '(empty)'}"
                </div>
              )}
            </div>

            {/* File Upload Section */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h4 className="text-xl font-semibold text-white mb-6">Replace Media Files (Optional)</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Replace Image
                    <span className="text-xs text-gray-400 ml-2">(JPG, PNG, GIF - Max 5MB)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full bg-transparent border border-white/20 text-white rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-green-500/20 file:text-green-400 hover:file:bg-green-500/30"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert('Image file must be less than 5MB');
                            e.target.value = '';
                            return;
                          }
                          handleFileChange('image', file, true);
                        }
                      }}
                    />
                  </div>
                  {editFiles.image && (
                    <div className="mt-2 text-xs text-green-400">
                      ✓ {editFiles.image.name} ({(editFiles.image.size / 1024 / 1024).toFixed(2)}MB)
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Replace Video
                    <span className="text-xs text-gray-400 ml-2">(MP4, MOV, AVI - Max 50MB)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="video/*"
                      className="w-full bg-transparent border border-white/20 text-white rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 50 * 1024 * 1024) {
                            alert('Video file must be less than 50MB');
                            e.target.value = '';
                            return;
                          }
                          handleFileChange('video', file, true);
                        }
                      }}
                    />
                  </div>
                  {editFiles.video && (
                    <div className="mt-2 text-xs text-green-400">
                      ✓ {editFiles.video.name} ({(editFiles.video.size / 1024 / 1024).toFixed(2)}MB)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Changes Summary */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4">Changes Summary</h4>
              <div className="space-y-3">
                {(() => {
                  const changes = [];
                  if (editForm.word !== selectedSign.word) changes.push('Word');
                  if (editForm.category !== selectedSign.category && editForm.category !== '') changes.push('Category');
                  if (editForm.difficulty !== selectedSign.difficulty && editForm.difficulty !== '') changes.push('Difficulty');
                  if (editForm.description !== selectedSign.description) changes.push('Description');
                  if (editForm.usage !== selectedSign.usage) changes.push('Usage');
                  if (editForm.tags !== (Array.isArray(selectedSign.tags) ? selectedSign.tags.join(', ') : selectedSign.tags || '')) changes.push('Tags');
                  if (editForm.isActive !== selectedSign.isActive) changes.push('Status');
                  if (editFiles.image) changes.push('Image');
                  if (editFiles.video) changes.push('Video');
                  
                  if (changes.length === 0) {
                    return (
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-400 text-lg">ℹ</span>
                        <span className="text-gray-300">No changes detected. All fields will remain unchanged.</span>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-green-400 text-lg">✓</span>
                        <span className="text-gray-300">The following fields will be updated:</span>
                      </div>
                      <div className="ml-8">
                        <div className="flex flex-wrap gap-2">
                          {changes.map((change, index) => (
                            <span key={index} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
                              {change}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-blue-400">
                  💡 <strong>Partial Update:</strong> Only the fields you've changed will be updated. Unchanged fields will keep their current values.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-6 pt-8 border-t border-white/20">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSign(null);
                }}
                className="px-8 py-4 border border-white/20 text-white rounded-2xl text-base font-medium hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editForm.description.length > 500}
                className="px-8 py-4 bg-blue-500/90 backdrop-blur-sm text-white rounded-2xl text-base font-medium hover:bg-blue-600 disabled:bg-gray-500/50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl border border-blue-400/30"
              >
                Update Sign
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedSign && (
        <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedSign(null); }} title="Delete Sign" className={`${cardBg} border ${borderClr}`}>
          <p className={`${textSecondary} mb-6`}>
            Are you sure you want to delete "<strong>{selectedSign.word}</strong>"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => { setShowDeleteModal(false); setSelectedSign(null); }}
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
        </Modal>
      )}

      {/* Create Category Modal */}
      {showCategoryModal && (
        <Modal 
          isOpen={showCategoryModal} 
          onClose={() => setShowCategoryModal(false)} 
          title="Create New Category" 
          className="bg-transparent border border-white/20 backdrop-blur-sm max-w-4xl w-full mx-4"
        >
          <form onSubmit={handleCreateCategory} className="space-y-6">
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Category Name <span className="text-red-400">*</span>
                <span className="text-xs text-gray-400 ml-2">({categoryForm.name.length}/50 characters)</span>
              </label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="w-full bg-transparent border border-white/20 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm transition-all duration-200"
                placeholder="e.g., Basic Signs, Advanced Vocabulary"
                maxLength={50}
                required
              />
              {categoryForm.name.length > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  {categoryForm.name.length < 2 ? (
                    <span className="text-red-400">Name must be at least 2 characters</span>
                  ) : categoryForm.name.length > 50 ? (
                    <span className="text-red-400">Name must be less than 50 characters</span>
                  ) : (
                    <span className="text-green-400">✓ Valid category name</span>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Description <span className="text-gray-400">(Optional)</span>
                <span className="text-xs text-gray-400 ml-2">({categoryForm.description.length}/200 characters)</span>
              </label>
              <textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                className="w-full bg-transparent border border-white/20 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm transition-all duration-200 resize-none"
                placeholder="Describe what signs belong to this category..."
                rows={4}
                maxLength={200}
              />
              {categoryForm.description.length > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  {categoryForm.description.length > 200 ? (
                    <span className="text-red-400">Description must be less than 200 characters</span>
                  ) : (
                    <span className="text-green-400">✓ Valid description</span>
                  )}
                </div>
              )}
            </div>

            {/* Color Selection and Display Order - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Category Color <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: 'bg-blue-500', name: 'Blue', preview: 'bg-blue-500' },
                    { value: 'bg-green-500', name: 'Green', preview: 'bg-green-500' },
                    { value: 'bg-purple-500', name: 'Purple', preview: 'bg-purple-500' },
                    { value: 'bg-pink-500', name: 'Pink', preview: 'bg-pink-500' },
                    { value: 'bg-orange-500', name: 'Orange', preview: 'bg-orange-500' },
                    { value: 'bg-red-500', name: 'Red', preview: 'bg-red-500' },
                    { value: 'bg-teal-500', name: 'Teal', preview: 'bg-teal-500' },
                    { value: 'bg-yellow-500', name: 'Yellow', preview: 'bg-yellow-500' }
                  ].map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, color: color.value })}
                      className={`p-3 rounded-xl border-2 transition-all backdrop-blur-sm ${
                        categoryForm.color === color.value
                          ? 'border-purple-500 ring-2 ring-purple-500/30 bg-white/10'
                          : 'border-white/20 hover:border-purple-500/50 bg-white/5'
                      }`}
                    >
                      <div className={`w-full h-8 rounded-lg ${color.preview} mb-2 shadow-lg`}></div>
                      <span className="text-xs font-medium text-gray-300">{color.name}</span>
                    </button>
                  ))}
                </div>
                {categoryForm.color && (
                  <div className="mt-2 text-xs text-green-400">✓ Color selected</div>
                )}
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Display Order <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="number"
                  value={categoryForm.order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 0 })}
                  className="w-full bg-transparent border border-white/20 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm transition-all duration-200"
                  placeholder="0"
                  min="0"
                  max="100"
                />
                <div className="mt-2 text-xs text-gray-400">
                  Lower numbers appear first (0-100)
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4">Category Preview</h4>
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-2xl ${categoryForm.color} flex items-center justify-center shadow-lg`}>
                  <AcademicCapIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">
                    {categoryForm.name || 'Category Name'}
                  </h3>
                  <p className="text-sm text-gray-300 mt-1">
                    {categoryForm.description || 'Category description will appear here...'}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
                      Active
                    </span>
                    <span className="text-xs text-gray-400">
                      Order: {categoryForm.order || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Validation Summary */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4">Validation Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-3">
                  {categoryForm.name.length >= 2 && categoryForm.name.length <= 50 ? (
                    <span className="text-green-400 text-lg">✓</span>
                  ) : (
                    <span className="text-red-400 text-lg">✗</span>
                  )}
                  <span className="text-gray-300">Name (2-50 characters)</span>
                </div>
                <div className="flex items-center space-x-3">
                  {categoryForm.color ? (
                    <span className="text-green-400 text-lg">✓</span>
                  ) : (
                    <span className="text-red-400 text-lg">✗</span>
                  )}
                  <span className="text-gray-300">Color selected</span>
                </div>
                <div className="flex items-center space-x-3">
                  {categoryForm.description.length <= 200 ? (
                    <span className="text-green-400 text-lg">✓</span>
                  ) : (
                    <span className="text-red-400 text-lg">✗</span>
                  )}
                  <span className="text-gray-300">Description (max 200 characters)</span>
                </div>
                <div className="flex items-center space-x-3">
                  {categoryForm.order >= 0 && categoryForm.order <= 100 ? (
                    <span className="text-green-400 text-lg">✓</span>
                  ) : (
                    <span className="text-red-400 text-lg">✗</span>
                  )}
                  <span className="text-gray-300">Order (0-100)</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-6 pt-8 border-t border-white/20">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-8 py-4 border border-white/20 text-white rounded-2xl text-base font-medium hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!categoryForm.name || !categoryForm.color || categoryForm.name.length < 2 || categoryForm.name.length > 50 || categoryForm.description.length > 200 || categoryForm.order < 0 || categoryForm.order > 100}
                className="px-8 py-4 bg-purple-500/90 backdrop-blur-sm text-white rounded-2xl text-base font-medium hover:bg-purple-600 disabled:bg-gray-500/50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl border border-purple-400/30"
              >
                Create Category
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && (
        <Modal isOpen={showEditCategoryModal} onClose={() => setShowEditCategoryModal(false)} title="Edit Category" className={`${cardBg} border ${borderClr}`}>
          <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Category Name</label>
                <input
                  type="text"
                  value={editCategoryForm.name}
                  onChange={(e) => setEditCategoryForm({ ...editCategoryForm, name: e.target.value })}
                  className={`w-full border ${inputBorder} ${inputBg} ${textPrimary} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Description</label>
                <textarea
                  value={editCategoryForm.description}
                  onChange={(e) => setEditCategoryForm({ ...editCategoryForm, description: e.target.value })}
                  className={`w-full border ${inputBorder} ${inputBg} ${textPrimary} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Color</label>
                <select
                  value={editCategoryForm.color}
                  onChange={(e) => setEditCategoryForm({ ...editCategoryForm, color: e.target.value })}
                  className={`w-full border ${inputBorder} ${inputBg} ${textPrimary} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="bg-blue-500">Blue</option>
                  <option value="bg-green-500">Green</option>
                  <option value="bg-purple-500">Purple</option>
                  <option value="bg-pink-500">Pink</option>
                  <option value="bg-orange-500">Orange</option>
                  <option value="bg-red-500">Red</option>
                  <option value="bg-teal-500">Teal</option>
                  <option value="bg-yellow-500">Yellow</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Order</label>
                <input
                  type="number"
                  value={editCategoryForm.order}
                  onChange={(e) => setEditCategoryForm({ ...editCategoryForm, order: parseInt(e.target.value) })}
                  className={`w-full border ${inputBorder} ${inputBg} ${textPrimary} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder="Display order"
                  min="0"
                />
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editCategoryForm.isActive}
                    onChange={(e) => setEditCategoryForm({ ...editCategoryForm, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <span className={`text-sm ${textSecondary}`}>Active</span>
                </label>
              </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditCategoryModal(false)}
                className={`px-4 py-2 border ${inputBorder} rounded-md text-sm font-medium ${textSecondary} hover:opacity-80`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600"
              >
                Update Category
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <Modal isOpen={showBulkDeleteModal} onClose={() => setShowBulkDeleteModal(false)} title="Bulk Delete Signs" className={`${cardBg} border ${borderClr}`}>
          <p className={`${textSecondary} mb-6`}>
            Are you sure you want to delete <strong>{selectedSigns.length}</strong> selected sign{selectedSigns.length !== 1 ? 's' : ''}? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowBulkDeleteModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600"
            >
              Delete {selectedSigns.length} Sign{selectedSigns.length !== 1 ? 's' : ''}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
} 
