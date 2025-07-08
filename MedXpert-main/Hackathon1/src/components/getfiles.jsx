import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  FileText,
  Image,
  FileArchive,
  Download,
  Trash2,
  Search,
  Filter,
  Calendar,
  File,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

function GetFiles() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all, images, documents, archives
  const [sortBy, setSortBy] = useState("date"); // date, name, size
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:3000/medical-files/my-files', {
        withCredentials: true
      });
      console.log('Fetched files:', response.data);
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to fetch files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename) => {
    try {
      await axios.delete(`/delete-file/${filename}`);
      setFiles(prevFiles => prevFiles.filter(file => file.filename !== filename));
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
    } catch (error) {
      console.error("Error deleting file:", error);
      setError("Failed to delete file. Please try again.");
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    window.open(`http://localhost:3000${fileUrl}`, '_blank');
  };

  const getFileIcon = (fileType) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-6 h-6" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="w-6 h-6" />;
      case 'zip':
      case 'rar':
        return <FileArchive className="w-6 h-6" />;
      default:
        return <File className="w-6 h-6" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const filteredFiles = Array.isArray(files) ? files
    .filter(file => {
      if (!file) return false;
      const matchesSearch = file.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
      const matchesFilter = filter === 'all' || 
        (filter === 'images' && file.fileType?.startsWith('image/')) ||
        (filter === 'documents' && (file.fileType?.includes('pdf') || file.fileType?.includes('word') || file.fileType?.includes('excel'))) ||
        (filter === 'archives' && (file.fileType?.includes('zip') || file.fileType?.includes('rar')));
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.uploadedAt || 0) - new Date(b.uploadedAt || 0)
          : new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0);
      }
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? (a.fileName || '').localeCompare(b.fileName || '')
          : (b.fileName || '').localeCompare(a.fileName || '');
      }
      if (sortBy === 'size') {
        return sortOrder === 'asc'
          ? (a.size || 0) - (b.size || 0)
          : (b.size || 0) - (a.size || 0);
      }
      return 0;
    }) : [];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 mb-8 border border-gray-800 shadow-xl"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
              <File className="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Medical Files</h1>
              <p className="text-gray-400">View and manage your uploaded medical documents</p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-800"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-gray-600 focus:outline-none"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-800 rounded-lg border border-gray-700 px-4 py-2 focus:border-gray-600 focus:outline-none"
              >
                <option value="all">All Files</option>
                <option value="images">Images</option>
                <option value="documents">Documents</option>
                <option value="archives">Archives</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 rounded-lg border border-gray-700 px-4 py-2 focus:border-gray-600 focus:outline-none"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-gray-800 rounded-lg border border-gray-700 px-4 py-2 hover:bg-gray-700 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Status Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-xl mb-4"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}

          {deleteSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-green-500 bg-green-500/10 p-4 rounded-xl mb-4"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>File deleted successfully</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Files Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-800"
          >
            <p className="text-gray-400">No files found</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredFiles.map((file) => (
              <motion.div
                key={file._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
                    {getFileIcon(file.fileType)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(file.fileUrl, file.fileName)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(file.fileName)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <h3 className="font-medium mb-2 truncate">{file.fileName}</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(file.uploadedAt)}
                  </p>
                  <p>{formatFileSize(file.size)}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default GetFiles;
