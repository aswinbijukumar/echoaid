import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { 
  CloudArrowDownIcon,
  ChartBarIcon,
  TagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { fetchCISLRVideos, fetchCISLRStats, fetchCISLRData } from '../api/hfApi';

const API_BASE_URL = 'http://localhost:5000/api/admin';

export default function CISLRIntegration() {
  const { token } = useAuth();
  const { darkMode } = useTheme();
  
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [classifyResult, setClassifyResult] = useState(null);
  const [error, setError] = useState(null);
  const [importSettings, setImportSettings] = useState({
    limit: 50,
    offset: 0,
    autoClassify: true
  });

  const bg = darkMode ? 'bg-[#0F1216]' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-[#1A1F2B]' : 'bg-white';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  // Fetch CISLR statistics from Kaggle directly
  const fetchKaggleStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to fetch real Kaggle stats, but fallback to mock data
      let kaggleStats = null;
      try {
        kaggleStats = await fetchCISLRStats();
      } catch (err) {
        console.warn('Kaggle stats failed, using mock data');
      }
      
      const sampleData = await fetchCISLRData(100, 0);
      
      // Count categories from sample data
      const categoryCounts = {};
      sampleData.forEach(item => {
        const category = item.category || 'miscellaneous';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      const categories = Object.entries(categoryCounts).map(([name, count]) => ({
        name,
        count
      }));
      
      setStats({
        totalSigns: sampleData.length,
        categories,
        lastUpdated: new Date().toISOString(),
        dataset: "Kaggle CISLR Dataset (Mock Data)",
        language: "Indian Sign Language (ISL)",
        kaggleInfo: kaggleStats,
        isMockData: !kaggleStats
      });
    } catch (err) {
      console.error('Error fetching Kaggle stats:', err);
      setError('Failed to fetch CISLR statistics from Kaggle. Using mock data for testing.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch CISLR statistics from backend
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/content/cislr/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch CISLR stats');
      
      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Import CISLR signs using real HF data
  const handleImport = async () => {
    setIsLoading(true);
    setError(null);
    setImportResult(null);

    try {
      // First fetch real CISLR data from Hugging Face
      const cislrData = await fetchCISLRData(importSettings.limit, importSettings.offset);
      
      // Transform data for our backend
      const transformedData = cislrData.map(item => ({
        word: item.word,
        category: item.category || 'miscellaneous',
        description: item.description,
        imagePath: item.image_path,
        thumbnailPath: item.thumbnail_path,
        videoPath: item.video_path,
        signLanguageType: item.signLanguageType || 'ISL',
        tags: item.tags || [],
        usage: item.usage || ''
      }));

      const response = await fetch(`${API_BASE_URL}/content/cislr/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...importSettings,
          cislrData: transformedData
        })
      });

      if (!response.ok) throw new Error('Failed to import CISLR signs');
      
      const data = await response.json();
      setImportResult(data);
      
      // Refresh stats after import
      await fetchKaggleStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-classify existing signs
  const handleAutoClassify = async () => {
    setIsLoading(true);
    setError(null);
    setClassifyResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/content/cislr/auto-classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to auto-classify signs');
      
      const data = await response.json();
      setClassifyResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKaggleStats(); // Use Kaggle stats instead of backend stats
  }, []);

  return (
    <div className={`${bg} min-h-screen p-6`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className={`${cardBg} border ${border} rounded-2xl p-6 shadow-sm`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500 p-2 rounded-full">
              <CloudArrowDownIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                CISLR Dataset Integration
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Import and manage Indian Sign Language data from Kaggle CISLR datasets
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className={`${cardBg} border ${border} rounded-2xl p-6 shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <ChartBarIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Dataset Statistics
                </h2>
                {stats.isMockData && (
                  <span className="ml-3 px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-full">
                    Mock Data
                  </span>
                )}
              </div>
              <button
                onClick={fetchKaggleStats}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalSigns.toLocaleString()}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Total Signs</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.categories.length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Categories</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {new Date(stats.lastUpdated).toLocaleDateString()}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Last Updated</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ISL
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400">Language Type</div>
              </div>
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {stats && (
          <div className={`${cardBg} border ${border} rounded-2xl p-6 shadow-sm`}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
              <TagIcon className="w-5 h-5 mr-2 text-green-500" />
              Category Breakdown
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {stats.categories.map((category, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white capitalize">
                    {category.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {category.count} signs
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Import Section */}
        <div className={`${cardBg} border ${border} rounded-2xl p-6 shadow-sm`}>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
            <CloudArrowDownIcon className="w-5 h-5 mr-2 text-blue-500" />
            Import CISLR Signs
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Import Limit
                </label>
                <input
                  type="number"
                  value={importSettings.limit}
                  onChange={(e) => setImportSettings(prev => ({ ...prev, limit: parseInt(e.target.value) || 50 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="1"
                  max="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Offset
                </label>
                <input
                  type="number"
                  value={importSettings.offset}
                  onChange={(e) => setImportSettings(prev => ({ ...prev, offset: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="0"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importSettings.autoClassify}
                    onChange={(e) => setImportSettings(prev => ({ ...prev, autoClassify: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Auto-classify by filename</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleImport}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              {isLoading ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <CloudArrowDownIcon className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Importing...' : 'Import Signs'}</span>
            </button>
          </div>

          {/* Import Result */}
          {importResult && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <h3 className="font-semibold text-green-800 dark:text-green-200">Import Successful</h3>
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                <p>Imported: {importResult.data.imported} signs</p>
                <p>Errors: {importResult.data.errors}</p>
                {importResult.data.signs.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Imported Signs:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                      {importResult.data.signs.slice(0, 10).map((sign, index) => (
                        <div key={index} className="text-xs bg-green-100 dark:bg-green-800 p-1 rounded">
                          {sign.word} ({sign.category})
                        </div>
                      ))}
                      {importResult.data.signs.length > 10 && (
                        <div className="text-xs text-green-600 dark:text-green-400">
                          +{importResult.data.signs.length - 10} more...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Auto-classification Section */}
        <div className={`${cardBg} border ${border} rounded-2xl p-6 shadow-sm`}>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
            <TagIcon className="w-5 h-5 mr-2 text-green-500" />
            Auto-classify Existing Signs
          </h2>
          
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">How Auto-classification Works:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Analyzes video filenames to determine appropriate categories</li>
                  <li>Creates new categories automatically if they don't exist</li>
                  <li>Updates category sign counts</li>
                  <li>Only processes signs with video files</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleAutoClassify}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            {isLoading ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : (
              <TagIcon className="w-5 h-5" />
            )}
            <span>{isLoading ? 'Classifying...' : 'Auto-classify Signs'}</span>
          </button>

          {/* Classification Result */}
          {classifyResult && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <h3 className="font-semibold text-green-800 dark:text-green-200">Classification Complete</h3>
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                <p>Processed: {classifyResult.data.processed} signs</p>
                <p>Updated: {classifyResult.data.updated} signs</p>
                <p>Errors: {classifyResult.data.errors.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className={`${cardBg} border border-red-200 dark:border-red-800 rounded-2xl p-6 shadow-sm`}>
            <div className="flex items-center">
              <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <h3 className="font-semibold text-red-800 dark:text-red-200">Error</h3>
            </div>
            <p className="text-red-700 dark:text-red-300 mt-2">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}