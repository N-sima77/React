import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Upload, File, Folder, Undo2, Trash2, Download
} from 'lucide-react';
import Sidebar from './Sidebar';
import Card from './Card';
import Header from './Header';


// --- Türler (Types) ---
interface UploadedFile {
  id: string;
  name: string;
  type: 'pdf' | 'excel' | 'image' | 'document' | 'video' | 'audio' | 'archive' | 'other';
  size: string;
  sizeBytes: number;
  uploadDate: string;
  modifiedDate: string;
  favorite?: boolean;
  deleted?: boolean;
  shared?: boolean;
  url: string;
  thumbnail?: string;
  owner: string;
  permissions: 'view' | 'edit' | 'owner';
  folder?: string | null;
}

interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate?: string;
}

interface AppFolder {
  id: string;
  name: string;
  parentId?: string;
  createdDate: string;
  itemCount: number;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

interface ProfileApiHandlers {
  onUpdateName: (newName: string) => Promise<boolean>;
  onUpdateEmail: (newEmail: string) => Promise<boolean>;
  onChangePassword: (current: string, next: string) => Promise<boolean>;
  onDeleteAccount: () => Promise<void>;
}

interface FileManagerProps {
  user: AppUser;
  onLogout: () => Promise<void>;
  initialFiles: UploadedFile[];
  initialFolders: AppFolder[];
  darkMode: boolean;
  onDarkModeToggle: (next?: boolean) => void;
  profileApiHandlers: ProfileApiHandlers;
}

const FileManagerApp: React.FC<FileManagerProps> = ({ 
  user, 
  onLogout, 
  initialFiles, 
  initialFolders,
  darkMode,
  onDarkModeToggle,
  profileApiHandlers
}) => {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [folders, setFolders] = useState<AppFolder[]>(initialFolders);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentView, setCurrentView] = useState('my-drive');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const selectedFile = files.find(f => f.id === selectedFileId);

  

  useEffect(() => {
    
    console.log('Data updated:', { user, files: files.length, folders: folders.length });
  }, [files, folders, user]);

  const getFilteredFiles = useMemo(() => {
    let filtered = files;

    switch (currentView) {
      case 'starred':
        filtered = files.filter(f => f.favorite && !f.deleted);
        break;
      
      case 'recent':
        filtered = files.filter(f => !f.deleted).sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()).slice(0, 10);
        break;
      case 'trash':
        filtered = files.filter(f => f.deleted);
        break;
      default:
        if (currentFolder) {
          filtered = files.filter(f => f.folder === currentFolder && !f.deleted);
        } else {
          filtered = files.filter(f => f.folder === null && !f.deleted);
        }
    }

    if (currentFolder && currentView === 'my-drive') {
      filtered = filtered.filter(f => f.folder === currentFolder);
    }

    if (searchQuery) {
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case 'size':
          return b.sizeBytes - a.sizeBytes;
        default:
          return 0;
      }
    });

    return filtered;
  }, [files, currentView, currentFolder, searchQuery, sortBy]);

  const handleFileUpload = async (uploadedFiles: FileList) => {
    try {
      const newFiles: UploadedFile[] = Array.from(uploadedFiles).map(file => {
        const type = getFileType(file.name);
        return {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type,
          size: formatFileSize(file.size),
          sizeBytes: file.size,
          uploadDate: new Date().toISOString().split('T')[0],
          modifiedDate: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
          owner: user.id,
          permissions: 'owner',
          url: URL.createObjectURL(file),
          folder: currentFolder
        };
      });
      setFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      console.error("Dosya yükleme hatası:", error);
    }
  };

  const getFileType = (filename: string): UploadedFile['type'] => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) return 'other';
    
    if (['pdf'].includes(ext)) return 'pdf';
    if (['xls', 'xlsx'].includes(ext)) return 'excel';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'flac'].includes(ext)) return 'audio';
    if (['zip', 'rar', '7z'].includes(ext)) return 'archive';
    if (['doc', 'docx', 'txt'].includes(ext)) return 'document';
    return 'other';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileAction = (action: string, file: UploadedFile) => {
    switch (action) {
      case 'star':
        setFiles(prev => prev.map(f => f.id === file.id ? { ...f, favorite: !f.favorite } : f));
        break;
      case 'delete':
        setFiles(prev => prev.map(f => f.id === file.id ? { ...f, deleted: true, folder: null } : f));
        break;
      case 'delete-permanently':
        if (window.confirm(`${file.name} dosyasını kalıcı olarak silmek istediğinize emin misiniz?`)) {
          setFiles(prev => prev.filter(f => f.id !== file.id));
        }
        break;
      case 'restore':
        setFiles(prev => prev.map(f => f.id === file.id ? { ...f, deleted: false, folder: null } : f));
        break;
      case 'rename':
        setFiles(prev => prev.map(f => f.id === file.id ? { ...f, name: file.name } : f));
        break;
      case 'download':
        if (file.url) {
          const a = document.createElement('a');
          a.href = file.url;
          a.download = file.name;
          a.click();
        }
        break;
      case 'preview':
        window.open(file.url, '_blank');
        break;
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedFiles.length === 0) return;
  
    setFiles(prev => prev.map(file => {
      if (selectedFiles.includes(file.id)) {
        switch (action) {
          case 'download':
            const a = document.createElement('a');
            a.href = file.url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return file;
          case 'delete':
            return { ...file, deleted: true, folder: null };
          case 'restore':
            return { ...file, deleted: false, folder: null };
          case 'delete-permanently':
            return null;
          default:
            return file;
        }
      }
      return file;
    }).filter(f => f !== null) as UploadedFile[]);
  
    setSelectedFiles([]);
  };

  // Klasör İşlemleri
  const handleAddFolder = (name: string) => {
    const newFolder: AppFolder = {
      id: Date.now().toString(),
      name,
      createdDate: new Date().toISOString().split('T')[0],
      itemCount: 0,
      color: 'blue'
    };
    setFolders(prev => [...prev, newFolder]);
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders(prev => prev.filter(f => f.id !== folderId));
    setFiles(prev => prev.map(file => file.folder === folderId ? { ...file, folder: null } : file));
    if (currentFolder === folderId) {
      setCurrentFolder(null);
    }
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: newName } : f));
  };

  const handleFileDrop = (fileId: string, folderId: string) => {
    setFiles(prev => prev.map(file => file.id === fileId ? { ...file, folder: folderId } : file));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const storageUsed = files
    .filter(f => !f.deleted)
    .reduce((total, file) => total + file.sizeBytes, 0) / (1024 * 1024 * 1024);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen">
        <Sidebar
          files={files}
          onFileUpload={handleFileUpload}
          currentFolder={currentFolder}
          onFolderSelect={setCurrentFolder}
          onViewChange={setCurrentView}
          currentView={currentView}
          storageUsed={storageUsed}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          folders={folders}
          onAddFolder={handleAddFolder}
          onFileDrop={handleFileDrop}
          onDeleteFolder={handleDeleteFolder} 
          onRenameFolder={handleRenameFolder} 
          selectedFiles={selectedFiles} 
          onFileSelect={setSelectedFiles} 
          onFileAction={handleFileAction}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            user={user}
            onLogout={onLogout}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={sortBy}
            onSortChange={setSortBy}
            selectedFiles={selectedFiles}
            currentView={currentView}
            files={files}
            folders={folders}
            darkMode={darkMode}
            onDarkModeToggle={onDarkModeToggle}
           //
            onDeleteAccount={profileApiHandlers.onDeleteAccount}
            onUpdateName={profileApiHandlers.onUpdateName}
            onUpdateEmail={profileApiHandlers.onUpdateEmail}
            onChangePassword={profileApiHandlers.onChangePassword}
          />

          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Dosya Yükle</span>
                </button>
                
                {selectedFiles.length > 0 && (
                  <>
                    {currentView === 'trash' ? (
                      <>
                        <button 
                          onClick={() => handleBulkAction('restore')}
                          className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                        >
                          <Undo2 className="w-4 h-4" />
                          <span>Kurtar</span>
                        </button>
                        <button 
                          onClick={() => handleBulkAction('delete-permanently')}
                          className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Kalıcı Sil</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleBulkAction('download')}
                          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                          <Download className="w-4 h-4" />
                          <span>İndir</span>
                        </button>
                        <button 
                          onClick={() => handleBulkAction('delete')}
                          className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Sil</span>
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {getFilteredFiles.length} öğe
              </div>
            </div>
          </div>

          <div 
            className={`flex-1 overflow-auto p-6 transition-colors ${dragOver ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {dragOver && (
              <div className="fixed inset-0 bg-indigo-500/20 flex items-center justify-center z-50 pointer-events-none">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
                  <Upload className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Dosyaları buraya bırakın
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Yüklemek için dosyalarınızı serbest bırakın
                  </p>
                </div>
              </div>
            )}

            {getFilteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <File className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Henüz dosya yok
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-center max-w-md">
                  {currentView === 'trash' 
                    ? 'Çöp kutunuz boş. Silinen dosyalar burada görünecek.'
                    : 'Dosya yüklemek için yukarıdaki "Dosya Yükle" butonunu kullanın veya dosyaları buraya sürükleyin.'
                  }
                </p>
                {currentView !== 'trash' && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span>İlk dosyanızı yükleyin</span>
                  </button>
                )}
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4'
                  : 'space-y-1'
              }>
                {viewMode === 'list' && (
                  <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-4"></div>
                      <span>Ad</span>
                    </div>
                    <div className="flex items-center space-x-6">
                      <span className="w-20 text-right">Boyut</span>
                      <span className="w-24 text-right">Değiştirilme</span>
                      <div className="w-16"></div>
                      <div className="w-8"></div>
                    </div>
                  </div>
                )}
                
                {getFilteredFiles.map((file) => (
                  <Card
                    key={file.id}
                    file={file}
                    viewMode={viewMode}
                    isSelected={selectedFiles.includes(file.id)}
                    onSelect={(id) => {
                      setSelectedFiles(prev => 
                        prev.includes(id) 
                          ? prev.filter(fId => fId !== id)
                          : [...prev, id]
                      );
                    }}
                    onAction={handleFileAction}
                    currentView={currentView}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* ProfileModal yok */}
    </div>
  );
};

export default FileManagerApp;