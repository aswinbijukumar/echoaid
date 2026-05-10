import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContextConstants';
import { API_BASE_URL } from '../constants/api';
import audioGenerator from '../utils/audioGenerator';
import ErrorBoundary from './ErrorBoundary';
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
  
  // Audio generation states
  const [generatingAudio, setGeneratingAudio] = useState({});
  const [playingAudio, setPlayingAudio] = useState(null);

  // Theme variables - Transparent dark theme
  const border = darkMode ? 'border-white/20' : 'border-gray-300';
  const cardBg = darkMode ? 'bg-white/5 backdrop-blur-sm' : 'bg-gray-50';
  const inputBg = darkMode ? 'bg-white/10 backdrop-blur-sm' : 'bg-white';

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
  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/skills`, {
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
  }, [token]);

  // Fetch skills on component mount
  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // Test upload endpoint
  const testUploadEndpoint = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/test`);
      const data = await response.json();
      console.log('Upload test response:', data);
      setSuccess('Upload endpoint is working!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Upload test error:', error);
      setError('Upload endpoint test failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Test Cloudinary configuration
  const testCloudinaryConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/debug`);
      const data = await response.json();
      console.log('Cloudinary debug response:', data);
      setSuccess(`Cloudinary config: ${JSON.stringify(data, null, 2)}`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Cloudinary debug error:', error);
      setError('Cloudinary debug failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Filter skills based on search and category
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Check if order already exists within the same level
  const checkOrderExists = (order, level, excludeId = null) => {
    return skills.some(skill => 
      skill.order === order && 
      skill.level === level &&
      skill._id !== excludeId && 
      skill.isActive !== false
    );
  };

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

    if (formData.level < 0) {
      setError('Level must be 0 or higher');
      setTimeout(() => setError(''), 5000);
      return;
    }

    // Check if order already exists within the same level
    if (checkOrderExists(formData.order, formData.level, selectedSkill?._id)) {
      setError(`Order ${formData.order} already exists in Level ${formData.level}. Please choose a different order number.`);
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
      // Category-specific media rules for level-up consistency (optional for creation)
      const cat = formData.category;
      const needsImage = ['alphabet', 'numbers'].includes(cat);
      const needsVideo = ['phrases'].includes(cat);
      
      // Only warn, don't block creation - users can add media later
      if (needsImage && !card.imagePath) {
        console.warn(`Flashcard ${i + 1}: Image recommended for ${cat} modules`);
      }
      if (needsVideo && !card.videoPath) {
        console.warn(`Flashcard ${i + 1}: Video recommended for ${cat} modules`);
      }
      // Media is optional for partial updates - no warnings needed
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

    // Level-based content requirements (for a sensible level-up path)
    const lvl = parseInt(formData.level || 0);
    if (lvl <= 1) {
      if ((formData.flashcards || []).length < 1) {
        setError('Levels 0–1 require at least 1 flashcard to teach basics.');
        setTimeout(() => setError(''), 5000);
        return;
      }
    } else if (lvl <= 3) {
      const hasEnough = ((formData.flashcards || []).length >= 1) || ((formData.quizQuestions || []).length >= 1);
      if (!hasEnough) {
        setError('Levels 2–3 require either 1+ flashcards or 1+ quiz questions.');
        setTimeout(() => setError(''), 5000);
        return;
      }
    } else {
      if ((formData.quizQuestions || []).length < 1) {
        setError('Levels 4+ require at least 1 quiz question for mastery.');
        setTimeout(() => setError(''), 5000);
        return;
      }
    }
    
    setSubmittingForm(true);
    
    console.log('Submitting form with data:', formData);
    
    try {
      console.log('Selected skill for API call:', selectedSkill);
      console.log('Selected skill _id:', selectedSkill?._id);
      
      const url = selectedSkill 
        ? `${API_BASE_URL}/api/admin/skills/${selectedSkill._id}`
        : `${API_BASE_URL}/api/admin/skills`;
      
      const method = selectedSkill ? 'PUT' : 'POST';
      
      // For edit mode, only send modified fields (partial update)
      const dataToSend = selectedSkill ? getModifiedFields() : formData;
      
      console.log('Making API call to:', url);
      console.log('Method:', method);
      console.log('Data to send:', dataToSend);
      
      // Debug: Log flashcards data specifically
      if (dataToSend.flashcards) {
        console.log('Flashcards being sent:', dataToSend.flashcards);
        dataToSend.flashcards.forEach((card, index) => {
          console.log(`Card ${index} (${card.word}):`, {
            word: card.word,
            meaning: card.meaning,
            image: card.image,
            video: card.video,
            additionalVideos: card.additionalVideos
          });
        });
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
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
        console.error('API Error:', errorData);
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

  // Utility function to safely clean data and prevent React object rendering errors
  const safeCleanData = (data) => {
    if (data === null || data === undefined) return '';
    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') return data;
    if (Array.isArray(data)) {
      return data.map(item => safeCleanData(item));
    }
    if (typeof data === 'object') {
      const cleaned = {};
      Object.keys(data).forEach(key => {
        if (key === '_id' || key === '__v') return; // Skip MongoDB fields
        cleaned[key] = safeCleanData(data[key]);
      });
      return cleaned;
    }
    return String(data);
  };

  // Open edit modal
  const openEditModal = (skill) => {
    // Preserve the original skill with _id for API calls, but clean the data for form
    setSelectedSkill(skill);
    
    // Use safe cleaning to prevent React object rendering errors
    const cleanSkill = safeCleanData(skill);
    
    // Clean flashcards to remove MongoDB _id fields and ensure proper structure
    const cleanFlashcards = (cleanSkill.flashcards || []).map(card => {
      // Ensure card is an object and clean it
      if (typeof card !== 'object' || card === null) {
        return {
          word: '',
          meaning: '',
          imagePath: '',
          additionalImages: [],
          videoPath: '',
          audioPath: '',
          customAudioText: '',
          generatedAudio: null
        };
      }
      
      // Remove any MongoDB-specific fields
      const cleanCard = { ...card };
      delete cleanCard._id;
      delete cleanCard.__v;
      
      return {
        word: String(cleanCard.word || ''),
        meaning: String(cleanCard.meaning || ''),
        imagePath: String(cleanCard.imagePath || ''),
        additionalImages: Array.isArray(cleanCard.additionalImages) ? cleanCard.additionalImages.map(img => String(img || '')) : [],
        videoPath: String(cleanCard.videoPath || ''),
        audioPath: String(cleanCard.audioPath || ''),
        customAudioText: String(cleanCard.customAudioText || ''),
        generatedAudio: cleanCard.generatedAudio && typeof cleanCard.generatedAudio === 'object' ? {
          text: String(cleanCard.generatedAudio.text || ''),
          audioText: String(cleanCard.generatedAudio.audioText || '')
        } : null
      };
    });
    
    // Clean quiz questions as well
    const cleanQuizQuestions = (skill.quizQuestions || []).map(question => {
      if (typeof question !== 'object' || question === null) {
        return {
          questionType: 'image-to-word',
          question: '',
          correctAnswer: '',
          options: ['', '', '', ''],
          imagePath: '',
          audioPath: '',
          explanation: ''
        };
      }
      
      const cleanQuestion = { ...question };
      delete cleanQuestion._id;
      delete cleanQuestion.__v;
      
      return {
        questionType: String(cleanQuestion.questionType || 'image-to-word'),
        question: String(cleanQuestion.question || ''),
        correctAnswer: String(cleanQuestion.correctAnswer || ''),
        options: Array.isArray(cleanQuestion.options) ? cleanQuestion.options.map(opt => String(opt || '')) : ['', '', '', ''],
        imagePath: String(cleanQuestion.imagePath || ''),
        audioPath: String(cleanQuestion.audioPath || ''),
        explanation: String(cleanQuestion.explanation || '')
      };
    });

    setFormData({
      title: String(cleanSkill.title || ''),
      description: String(cleanSkill.description || ''),
      category: String(cleanSkill.category || 'basics'),
      order: Number(cleanSkill.order || 1),
      xpReward: Number(cleanSkill.xpReward || 20),
      level: Number(cleanSkill.level || 0),
      isActive: Boolean(cleanSkill.isActive !== undefined ? cleanSkill.isActive : true),
      moduleType: String(cleanSkill.moduleType || 'flashcards'),
      flashcards: Array.isArray(cleanFlashcards) ? cleanFlashcards : [],
      quizQuestions: Array.isArray(cleanQuizQuestions) ? cleanQuizQuestions : []
    });
    setError('');
    setSuccess('');
    setShowEditModal(true);
  };

  // Check if a field has been modified
  const isFieldModified = (fieldName) => {
    if (!selectedSkill) return false;
    
    // For arrays, do deep comparison
    if (Array.isArray(formData[fieldName]) && Array.isArray(selectedSkill[fieldName])) {
      return JSON.stringify(formData[fieldName]) !== JSON.stringify(selectedSkill[fieldName]);
    }
    
    return formData[fieldName] !== selectedSkill[fieldName];
  };

  // Get modified fields for partial update
  const getModifiedFields = () => {
    if (!selectedSkill) return formData;
    
    const modifiedFields = {};
    Object.keys(formData).forEach(key => {
      // For arrays, do deep comparison
      if (Array.isArray(formData[key]) && Array.isArray(selectedSkill[key])) {
        // Special handling for flashcards array
        if (key === 'flashcards') {
          // Compare each flashcard individually
          const hasChanges = formData.flashcards.some((card, index) => {
            const originalCard = selectedSkill.flashcards[index];
            if (!originalCard) return true; // New card
            
            // Compare basic fields
            if (card.word !== originalCard.word || 
                card.meaning !== originalCard.meaning ||
                card.image !== originalCard.image ||
                card.video !== originalCard.video) {
              return true;
            }
            
            // Compare additionalVideos arrays
            const currentVideos = card.additionalVideos || [];
            const originalVideos = originalCard.additionalVideos || [];
            
            console.log(`Comparing additionalVideos for card "${card.word}":`);
            console.log('Current videos:', currentVideos);
            console.log('Original videos:', originalVideos);
            
            if (currentVideos.length !== originalVideos.length) {
              console.log('Video count changed:', currentVideos.length, 'vs', originalVideos.length);
              return true;
            }
            
            // Compare video paths
            for (let i = 0; i < currentVideos.length; i++) {
              if (currentVideos[i] !== originalVideos[i]) {
                console.log(`Video ${i} changed:`, currentVideos[i], 'vs', originalVideos[i]);
                return true;
              }
            }
            
            return false;
          });
          
          if (hasChanges) {
            modifiedFields[key] = formData[key];
          }
        } else {
          // For other arrays, use JSON comparison
          if (JSON.stringify(formData[key]) !== JSON.stringify(selectedSkill[key])) {
            modifiedFields[key] = formData[key];
          }
        }
      } else if (formData[key] !== selectedSkill[key]) {
        modifiedFields[key] = formData[key];
      }
    });
    
    console.log('Modified fields detected:', modifiedFields);
    return modifiedFields;
  };

  // File upload functions
  const uploadFile = async (file) => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      console.log('Uploading file to:', `${API_BASE_URL}/api/admin/upload`);
      console.log('File details:', { name: file.name, type: file.type, size: file.size });
      
      const response = await fetch(`${API_BASE_URL}/api/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      console.log('Upload response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Upload response data:', data);
        if (data.success) {
          return data.filePath || data.url || data.path;
        } else {
          throw new Error(data.message || 'Upload failed');
        }
      } else {
        let errorMessage = `Upload failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('Upload error response:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
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

      console.log('Uploading file:', file.name, 'Type:', file.type, 'Size:', file.size);
      const filePath = await uploadFile(file);
      console.log('File uploaded successfully:', filePath);
      
      if (formData.moduleType === 'flashcards' || formData.moduleType === 'mixed') {
        const updatedFlashcards = [...formData.flashcards];
        if (!updatedFlashcards[index]) {
          updatedFlashcards[index] = { 
            word: '', 
            meaning: '', 
            imagePath: '', 
            additionalImages: [],
            videoPath: '', 
            audioPath: '' 
          };
        }
        updatedFlashcards[index][field] = filePath;
        setFormData(prev => ({ ...prev, flashcards: updatedFlashcards }));
        console.log('Updated flashcards:', updatedFlashcards);
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
        setFormData(prev => ({ ...prev, quizQuestions: updatedQuestions }));
        console.log('Updated quiz questions:', updatedQuestions);
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


  const playGeneratedAudio = async (text) => {
    try {
      await audioGenerator.generateAudio(text, {
        rate: 0.7, // Slower for learning
        pitch: 1.0,
        volume: 1.0
      });
    } catch (err) {
      console.error('Error playing audio:', err);
      setError('Failed to play audio');
      setTimeout(() => setError(''), 3000);
    }
  };

  const generateAudioForQuestion = async (index) => {
    const question = formData.quizQuestions[index];
    if (!question.question.trim()) {
      setError('Please enter a question first');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setUploadingFiles(true);
      
      // Generate TTS audio
      await audioGenerator.generateAudio(question.question, {
        rate: 0.7, // Slower for learning
        pitch: 1.0,
        volume: 1.0
      });

      // Mark as TTS generated
      const updatedQuestions = [...formData.quizQuestions];
      updatedQuestions[index].audioPath = 'tts-generated';
      setFormData({ ...formData, quizQuestions: updatedQuestions });

      setSuccess(`Audio generated for question "${question.question}"`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error generating audio:', err);
      setError('Failed to generate audio');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploadingFiles(false);
    }
  };

  // Audio generation functions for flashcards
  const generateAudioForFlashcard = async (flashcardIndex, text) => {
    if (!text.trim()) {
      setError('Please enter text to generate audio');
      return;
    }

    try {
      setGeneratingAudio(prev => ({ ...prev, [flashcardIndex]: true }));
      
      // Generate audio using browser TTS
      await audioGenerator.generateAudio(text);
      
      // Store the text for playback (we'll use browser TTS for playback too)
      setFormData(prev => ({
        ...prev,
        flashcards: prev.flashcards.map((card, index) => 
          index === flashcardIndex 
            ? { ...card, generatedAudio: { text: text.trim(), audioText: text.trim() } }
            : card
        )
      }));
      
      setSuccess('Audio generated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Audio generation error:', error);
      setError('Failed to generate audio. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setGeneratingAudio(prev => ({ ...prev, [flashcardIndex]: false }));
    }
  };

  const playAudio = async (audioText, cardIndex) => {
    try {
      // If this card is already playing → stop it (toggle off)
      if (playingAudio === cardIndex) {
        audioGenerator.stop();
        setPlayingAudio(null);
        return;
      }

      // Stop whatever is currently playing (different card or null)
      audioGenerator.stop();
      setPlayingAudio(cardIndex);

      // Play and automatically clear state when done
      await audioGenerator.generateAudio(audioText);
      setPlayingAudio(null);
    } catch (error) {
      if (error !== 'cancelled') {
        console.error('Audio play error:', error);
        setError('Failed to play audio');
      }
      setPlayingAudio(null);
    }
  };

  const removeAudioFromFlashcard = (flashcardIndex) => {
    setFormData(prev => ({
      ...prev,
      flashcards: prev.flashcards.map((card, index) => 
        index === flashcardIndex 
          ? { ...card, generatedAudio: null }
          : card
      )
    }));
  };

  // Delete skill
  const handleDelete = async (skill) => {
    if (!window.confirm(`Are you sure you want to delete "${skill.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/skills/${skill._id}`, {
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
    <ErrorBoundary>
      <div className={`min-h-screen ${darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-50'} p-6`}>
        <div className="space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between p-6 rounded-2xl ${cardBg} border ${border}`}>
        <div>
          <h2 className="text-2xl font-bold text-white">Learning Modules Management</h2>
          <p className="text-white/70">Manage Duolingo-style learning skills and progression</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={testUploadEndpoint}
            className="inline-flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Test Upload
          </button>
          <button
            onClick={testCloudinaryConfig}
            className="inline-flex items-center px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
          >
            Debug Cloudinary
          </button>
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
      <div className={`p-6 rounded-2xl ${cardBg} border ${border}`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="text"
                placeholder="Search learning modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border ${border} rounded-2xl ${inputBg} text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200`}
            />
          </div>
        </div>
          <div className="sm:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full px-4 py-3 border ${border} rounded-2xl ${inputBg} text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200`}
            >
              {categories.map(category => (
                <option key={category.value} value={category.value} className="bg-gray-800 text-white">
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.map((skill) => {
          const categoryInfo = getCategoryInfo(skill.category);
          const CategoryIcon = categoryInfo.icon;
          
          return (
            <div key={skill._id} className={`p-6 rounded-2xl border ${border} ${cardBg} hover:bg-white/10 transition-all duration-200 backdrop-blur-sm`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`${categoryInfo.color} p-3 rounded-full`}>
                  <CategoryIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(skill)}
                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                    title="Edit module"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(skill)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Delete module"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">
                {skill.title}
              </h3>
              <p className="text-white/70 text-sm mb-4">
                {skill.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Category:</span>
                  <span className="font-medium text-white">{categoryInfo.label}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Order:</span>
                  <span className="font-medium text-white">{skill.order}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">XP Reward:</span>
                  <span className="font-medium text-white">{skill.xpReward} XP</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Level:</span>
                  <span className="font-medium text-white">{skill.level}/5</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Status:</span>
                  {getStatusBadge(skill.isActive)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSkills.length === 0 && (
        <div className={`text-center py-12 p-8 rounded-2xl ${cardBg} border ${border}`}>
          <BookOpenIcon className="w-16 h-16 text-white/60 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No learning modules found</h3>
          <p className="text-white/70 mb-4">
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
              className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition-colors backdrop-blur-sm"
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
                  className={`w-full bg-transparent border rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 backdrop-blur-sm transition-all duration-200 ${
                    formData.order && checkOrderExists(formData.order, formData.level, selectedSkill?._id)
                      ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                      : 'border-white/20 focus:ring-green-500/50 focus:border-green-500/50'
                  }`}
                  placeholder="Module order (1-100)"
                  required
                />
                {formData.order && checkOrderExists(formData.order, formData.level, selectedSkill?._id) && (
                  <p className="text-xs text-red-400 mt-1">
                    ⚠️ Order {formData.order} already exists in Level {formData.level}. Choose a different order number.
                  </p>
                )}
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
                <input
                  type="number"
                  min="0"
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: parseInt(e.target.value) || 0})}
                  className="w-full bg-transparent border border-white/20 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm transition-all duration-200"
                  placeholder="Enter level number (0, 1, 2, 3...)"
                  required
                />
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
                          additionalImages: [],
                          videoPath: '',
                          audioPath: ''
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
                  
                  {Array.isArray(formData.flashcards) && formData.flashcards.map((card, index) => {
                    try {
                    // Ensure card is a valid object and clean it
                    if (typeof card !== 'object' || card === null) {
                      return null;
                    }
                    
                    // Additional safety: remove any MongoDB fields that might have slipped through
                    const cleanCard = { ...card };
                    delete cleanCard._id;
                    delete cleanCard.__v;
                    
                    // Ensure all values are strings or arrays, not objects
                    cleanCard.word = String(cleanCard.word || '');
                    cleanCard.meaning = String(cleanCard.meaning || '');
                    cleanCard.imagePath = String(cleanCard.imagePath || '');
                    cleanCard.videoPath = String(cleanCard.videoPath || '');
                    cleanCard.audioPath = String(cleanCard.audioPath || '');
                    cleanCard.customAudioText = String(cleanCard.customAudioText || '');
                    cleanCard.additionalImages = Array.isArray(cleanCard.additionalImages) ? cleanCard.additionalImages.map(img => String(img || '')) : [];
                    
                    // Clean generatedAudio object
                    if (cleanCard.generatedAudio && typeof cleanCard.generatedAudio === 'object') {
                      cleanCard.generatedAudio = {
                        text: String(cleanCard.generatedAudio.text || ''),
                        audioText: String(cleanCard.generatedAudio.audioText || '')
                      };
                    } else {
                      cleanCard.generatedAudio = null;
                    }
                    
                    return (
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
                            value={cleanCard.word}
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
                            value={cleanCard.meaning}
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
                          <label className="block text-xs text-gray-400 mb-2">Sign Image (Primary)</label>
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
                          {cleanCard.imagePath && (
                            <p className="text-xs text-green-400 mt-1">✓ Primary image uploaded</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Additional Images</label>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={async (e) => {
                              if (e.target.files.length > 0) {
                                const files = Array.from(e.target.files);
                                const uploadedPaths = [];
                                
                                for (const file of files) {
                                  try {
                                    const filePath = await uploadFile(file, 'image');
                                    uploadedPaths.push(filePath);
                                  } catch (error) {
                                    console.error('Error uploading additional image:', error);
                                    setError('Failed to upload some images');
                                  }
                                }
                                
                                const updatedFlashcards = [...formData.flashcards];
                                updatedFlashcards[index].additionalImages = [
                                  ...(updatedFlashcards[index].additionalImages || []),
                                  ...uploadedPaths
                                ];
                                setFormData({...formData, flashcards: updatedFlashcards});
                              }
                            }}
                            className="w-full bg-transparent border border-white/20 text-white rounded-lg px-3 py-2 text-sm"
                          />
                          {Array.isArray(cleanCard.additionalImages) && cleanCard.additionalImages.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-green-400 mb-1">✓ Additional images:</p>
                              {cleanCard.additionalImages.map((img, imgIndex) => {
                                // Ensure img is a string, not an object
                                const imgPath = typeof img === 'string' ? img : (img.path || img.url || '');
                                return (
                                  <div key={imgIndex} className="flex items-center justify-between bg-gray-800/30 rounded px-2 py-1 mb-1">
                                    <div className="flex items-center space-x-2">
                                      <img 
                                        src={imgPath} 
                                        alt={`Additional ${imgIndex + 1}`}
                                        className="w-8 h-8 object-cover rounded"
                                      />
                                      <span className="text-xs text-white">{imgPath.split('/').pop()}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedFlashcards = [...formData.flashcards];
                                        updatedFlashcards[index].additionalImages = updatedFlashcards[index].additionalImages.filter((_, i) => i !== imgIndex);
                                        setFormData({...formData, flashcards: updatedFlashcards});
                                      }}
                                      className="text-xs text-red-400 hover:text-red-300"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
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
                          {cleanCard.videoPath && (
                            <p className="text-xs text-green-400 mt-1">✓ Video uploaded</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Additional Videos</label>
                          <input
                            type="file"
                            accept="video/*"
                            multiple
                            onChange={async (e) => {
                              if (e.target.files.length > 0) {
                                const files = Array.from(e.target.files);
                                const uploadedPaths = [];
                                
                                for (const file of files) {
                                  try {
                                    const filePath = await uploadFile(file, 'video');
                                    uploadedPaths.push(filePath);
                                  } catch (error) {
                                    console.error('Error uploading additional video:', error);
                                    setError('Failed to upload some videos');
                                  }
                                }
                                
                                const updatedFlashcards = [...formData.flashcards];
                                updatedFlashcards[index].additionalVideos = [
                                  ...(updatedFlashcards[index].additionalVideos || []),
                                  ...uploadedPaths
                                ];
                                setFormData({...formData, flashcards: updatedFlashcards});
                                
                                console.log('Updated flashcards with additional videos:', updatedFlashcards[index]);
                                console.log('New additionalVideos array:', updatedFlashcards[index].additionalVideos);
                              }
                            }}
                            className="w-full bg-transparent border border-white/20 text-white rounded-lg px-3 py-2 text-sm"
                          />
                          {Array.isArray(cleanCard.additionalVideos) && cleanCard.additionalVideos.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-green-400 mb-1">✓ Additional videos:</p>
                              {cleanCard.additionalVideos.map((video, videoIndex) => {
                                return (
                                  <div key={videoIndex} className="flex items-center justify-between bg-gray-800/20 rounded p-2 mb-1">
                                    <span className="text-xs text-gray-300 truncate flex-1 mr-2">
                                      Video {videoIndex + 1}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedFlashcards = [...formData.flashcards];
                                        updatedFlashcards[index].additionalVideos = updatedFlashcards[index].additionalVideos.filter((_, i) => i !== videoIndex);
                                        setFormData({...formData, flashcards: updatedFlashcards});
                                      }}
                                      className="text-red-400 hover:text-red-300 text-xs"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        
                      </div>
                      
                      {/* Custom Audio Generation Section */}
                      <div className="mt-4 p-3 bg-gray-800/20 rounded-lg border border-white/10">
                        <label className="block text-xs text-gray-400 mb-2">Custom Audio Generation</label>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={cleanCard.customAudioText || ''}
                            onChange={(e) => {
                              const updatedFlashcards = [...formData.flashcards];
                              updatedFlashcards[index].customAudioText = e.target.value;
                              setFormData({...formData, flashcards: updatedFlashcards});
                            }}
                            placeholder="Enter custom sentence for audio generation..."
                            className="w-full bg-transparent border border-white/20 text-white rounded-lg px-3 py-2 text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                            onClick={() => generateAudioForFlashcard(index, cleanCard.customAudioText)}
                            disabled={generatingAudio[index] || !cleanCard.customAudioText?.trim()}
                              className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm"
                            >
                              {generatingAudio[index] ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>Generating...</span>
                                </>
                              ) : (
                                <>
                                  <SpeakerWaveIcon className="w-4 h-4" />
                                  <span>Generate Audio</span>
                                </>
                              )}
                            </button>
                            {cleanCard.generatedAudio && (
                              <button
                                type="button"
                                onClick={() => playAudio(cleanCard.generatedAudio.audioText, index)}
                                className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-1 text-sm text-white ${
                                  playingAudio === index
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                              >
                                {playingAudio === index ? (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                      <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
                                    </svg>
                                    <span>Pause</span>
                                  </>
                                ) : (
                                  <>
                                    <SpeakerWaveIcon className="w-4 h-4" />
                                    <span>Play</span>
                                  </>
                                )}
                              </button>
                            )}
                            {cleanCard.generatedAudio && (
                              <button
                                type="button"
                                onClick={() => removeAudioFromFlashcard(index)}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1 text-sm"
                              >
                                <TrashIcon className="w-4 h-4" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>
                          {cleanCard.generatedAudio && (
                            <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded">
                              <p className="text-xs text-green-300 mb-1">Generated Audio:</p>
                                <p className="text-xs text-white">{cleanCard.generatedAudio.text}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    );
                    } catch (error) {
                      console.error('Error rendering flashcard:', error, card);
                      return (
                        <div key={index} className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                          <p className="text-red-400 text-sm">Error rendering flashcard {index + 1}</p>
                        </div>
                      );
                    }
                  })}
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
                          <div className="space-y-2">
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
                            <button
                              type="button"
                              onClick={() => generateAudioForQuestion(index)}
                              disabled={!question.question.trim() || uploadingFiles}
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
                                  <span>Generate Audio from Question</span>
                                </>
                              )}
                            </button>
                          </div>
                          {(question.imagePath || question.audioPath) && (
                            <div className="mt-1 flex items-center space-x-2">
                              <p className="text-xs text-green-400">✓ Media ready</p>
                              {question.audioPath === 'tts-generated' && (
                                <button
                                  type="button"
                                  onClick={() => playGeneratedAudio(question.question)}
                                  className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition-colors flex items-center space-x-1"
                                >
                                  <SpeakerWaveIcon className="w-3 h-3" />
                                  <span>Play</span>
                                </button>
                              )}
                            </div>
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
                            audioPath: ''
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
                  {Object.keys(getModifiedFields()).map(field => {
                    // Safely convert field values to strings to prevent React object rendering errors
                    const oldValue = selectedSkill[field];
                    const newValue = formData[field];
                    
                    let oldValueStr = '';
                    let newValueStr = '';
                    
                    if (Array.isArray(oldValue)) {
                      oldValueStr = `Array(${oldValue.length} items)`;
                    } else if (typeof oldValue === 'object' && oldValue !== null) {
                      oldValueStr = 'Object';
                    } else {
                      oldValueStr = String(oldValue || '');
                    }
                    
                    if (Array.isArray(newValue)) {
                      newValueStr = `Array(${newValue.length} items)`;
                    } else if (typeof newValue === 'object' && newValue !== null) {
                      newValueStr = 'Object';
                    } else {
                      newValueStr = String(newValue || '');
                    }
                    
                    return (
                      <li key={field} className="flex justify-between">
                        <span className="capitalize">{field}:</span>
                        <span>"{oldValueStr}" → "{newValueStr}"</span>
                      </li>
                    );
                  })}
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
      </div>
    </ErrorBoundary>
  );
}
