import React, { useRef, useState, useMemo, useEffect } from 'react';
import { 
  Folder, Home, Share, Star, Clock, Trash2, FolderPlus, Plus, Menu,
  ChevronRight, ChevronDown, File, Image, FileText, Video, Music,
  Archive, MoreHorizontal, Edit, X, HardDrive
} from 'lucide-react';


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

interface AppFolder {
  id: string;
  name: string;
  parentId?: string;
  createdDate: string;
  itemCount: number;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  expanded?: boolean;
}

interface SidebarProps {
  files?: UploadedFile[];
  onFileUpload?: (files: FileList) => void;
  currentFolder?: string | null;
  onFolderSelect?: (folderId: string | null) => void;
  onViewChange?: (view: string) => void;
  currentView?: string;
  storageUsed?: number;
  storageTotal?: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  folders?: AppFolder[];
  onAddFolder?: (name: string) => void;
  onFileDrop?: (fileId: string, folderId: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  onRenameFolder?: (folderId: string, newName: string) => void;
  selectedFileId?: string | null;
  onFileAction?: (action: string, file: UploadedFile) => void;
  selectedFiles?: string[];  
  onFileSelect?: (fileIds: string[]) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  files = [],
  onFileUpload,
  currentFolder = null, 
  onFolderSelect,
  onViewChange,
  currentView = 'my-drive',
  storageUsed,
  storageTotal = 15,
  collapsed = false,
  onToggleCollapse,
  folders = [],
  onAddFolder,
  onFileDrop,
  onDeleteFolder,
  onRenameFolder,
  selectedFileId = null,
  onFileSelect,
  onFileAction,
  selectedFiles = [], 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [openMenuFolder, setOpenMenuFolder] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  
  // Menü dışına tıklamada kapanma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuFolder(null);
      }
    };

    if (openMenuFolder) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openMenuFolder]);

  // Edit modunda input'a focus
  useEffect(() => {
    if (editingFolder && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingFolder]);

  const foldersWithCounts = useMemo(() => {
    return folders.map(folder => ({
      ...folder,
      itemCount: files.filter(f => f.folder === folder.id && !f.deleted).length,
    }));
  }, [folders, files]);

  // Gerçek depolama
  const usedBytes = useMemo(() => {
    if (typeof storageUsed === 'number') {
      return storageUsed * 1024 * 1024 * 1024; // GB → Byte
    }
    return files
      .filter(f => !f.deleted)
      .reduce((total, file) => total + file.sizeBytes, 0);
  }, [files, storageUsed]);

  // Son kullanılan dosyalar 
  const recentFiles = useMemo(() => {
    return files
      .filter(f => !f.deleted)
      .sort((a, b) => new Date(b.modifiedDate).getTime() - new Date(a.modifiedDate).getTime())
      .slice(0, 10);
  }, [files]);

  // Dosya türü istatistikleri
  const fileTypeStats = useMemo(() => {
    const activeFiles = files.filter(f => !f.deleted);
    const typeStats = activeFiles.reduce((acc, file) => {
      const sizeInBytes = file.sizeBytes;
      acc[file.type] = (acc[file.type] || { count: 0, size: 0 });
      acc[file.type].count += 1;
      acc[file.type].size += sizeInBytes;
      return acc;
    }, {} as Record<string, { count: number; size: number }>);
    
    return typeStats;
  }, [files]);

  const menuItems = [
    { id: 'my-drive', label: 'Dosyalarım', icon: Home, showOnDrag: true },
    { id: 'shared', label: 'Paylaşılanlar', icon: Share, showOnDrag: false },
    { id: 'starred', label: 'Yıldızlı', icon: Star, showOnDrag: false },
    { id: 'recent', label: 'Son Kullanılan', icon: Clock, showOnDrag: false },
    { id: 'trash', label: 'Çöp Kutusu', icon: Trash2, showOnDrag: false },
  ];

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Music;
      case 'document': 
      case 'pdf': return FileText;
      case 'archive': return Archive;
      default: return File;
    }
  };

  const getFileColor = (fileType: string) => {
    switch (fileType) {
      case 'image': return 'text-emerald-500';
      case 'video': return 'text-rose-500';
      case 'audio': return 'text-fuchsia-500';
      case 'document': return 'text-blue-500';
      case 'pdf': return 'text-red-500';
      case 'archive': return 'text-amber-500';
      default: return 'text-gray-500';
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const toggleFolderExpanded = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleAddFolder = () => {
    const folderName = prompt('Yeni klasör adı girin:');
    if (folderName && folderName.trim() && onAddFolder) {
      onAddFolder(folderName.trim());
    }
  };

  // Dosya seçimi işlevi
  const handleFileClick = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewChange) onViewChange('my-drive');
    const file = files.find(f => f.id === fileId);
    if (file && onFolderSelect) {
      onFolderSelect(file.folder || null);
    }
    if (onFileSelect) {
      const newSelectedFiles = selectedFiles.includes(fileId) 
        ? selectedFiles.filter(id => id !== fileId)
        : [...selectedFiles, fileId];
      onFileSelect(newSelectedFiles);
    }
  };

  // Yeniden adlandırma başlatma
  const startRename = (folderId: string, currentName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingFolder(folderId);
    setEditingName(currentName);
    setOpenMenuFolder(null);
  };

  const cancelRename = () => {
    setEditingFolder(null);
    setEditingName('');
  };

  const saveRename = (folderId: string) => {
    const trimmedName = editingName.trim();
    if (trimmedName && trimmedName !== folders.find(f => f.id === folderId)?.name && onRenameFolder) {
      onRenameFolder(folderId, trimmedName);
    }
    setEditingFolder(null);
    setEditingName('');
  };

  const startDelete = (folderId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirm(folderId);
    setOpenMenuFolder(null);
  };

  const confirmDelete = (folderId: string) => {
    if (onDeleteFolder) {
      onDeleteFolder(folderId);
      if (currentFolder === folderId && onFolderSelect) {
        onFolderSelect(null);
      }
    }
    setDeleteConfirm(null);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleMenuToggle = (folderId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenuFolder(openMenuFolder === folderId ? null : folderId);
  };

  const handleFolderClick = (folderId: string) => {
    if (editingFolder === folderId) return; // Edit modundaysa tıklama engellenir
    if (onViewChange) onViewChange('my-drive');
    if (onFolderSelect) onFolderSelect(folderId);
    if (onFileSelect) onFileSelect([]);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    setDragOverFolder(folderId);
  };

  const handleDragLeave = () => {
    setDragOverFolder(null);
  };

  const handleDrop = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    setDragOverFolder(null);
    const fileId = e.dataTransfer.getData('fileId');
    if (fileId && onFileDrop) {
      onFileDrop(fileId, folderId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays === 1) return 'Dün';
    if (diffDays <= 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <>
      <div
        className={`${collapsed ? 'w-16' : 'w-72'} transition-all duration-300
        bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
        border-r border-gray-200 dark:border-gray-700 flex flex-col h-full relative
        shadow-sm`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Folder className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  CloudDrive
                </span>
              </div>
            )}
            <button
              onClick={onToggleCollapse}
              className={`p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 ${collapsed ? 'mx-auto' : ''}`}
              title="Genişlet/Daralt"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* New Button */}
        <div className="p-4">
          <input
            type="file"
            ref={fileInputRef}
            multiple
            onChange={(e) => e.target.files && onFileUpload && onFileUpload(e.target.files)}
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className={`w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl ${collapsed ? 'px-2' : ''}`}
          >
            <Plus className="w-5 h-5" />
            {!collapsed && <span>Yeni Dosya</span>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Main Menu Items */}
          <div className="px-2 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (onViewChange) onViewChange(item.id);
                  if (onFolderSelect) onFolderSelect(null);
                  if (onFileSelect) onFileSelect([]);
                }}
                className={`w-full group flex items-center space-x-3 p-3 rounded-xl text-left transition-all duration-200
                  ${currentView === item.id 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                title={collapsed ? item.label : undefined}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  currentView === item.id 
                    ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                }`}>
                  <item.icon className="w-5 h-5" />
                </div>
                {!collapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{item.label}</span>
                    {item.id === 'recent' && recentFiles.length > 0 && (
                      <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                        {recentFiles.length}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>

          {!collapsed && (
            <>
              {/* Folders Section */}
              <div className="px-2 mt-6">
                <div className="flex items-center justify-between px-3 py-2 mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Klasörler</span>
                  <button 
                    className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={handleAddFolder}
                    title="Yeni klasör ekle"
                  >
                    <FolderPlus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
                
                {/* Folders container with fixed height and scroll */}
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {foldersWithCounts.map((folder) => (
                    <div key={folder.id} className="group relative">
                      <div
                        onClick={() => handleFolderClick(folder.id)}
                        onDragOver={(e) => handleDragOver(e, folder.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, folder.id)}
                        className={`flex items-center space-x-2 p-2.5 rounded-xl transition-all duration-200 cursor-pointer
                          ${editingFolder === folder.id ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700' :
                          currentFolder === folder.id 
                            ? 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        } ${dragOverFolder === folder.id ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-600 shadow-lg' : ''}`}
                      >
                        <button
                          onClick={(e) => toggleFolderExpanded(folder.id, e)}
                          className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          {expandedFolders.has(folder.id) ? (
                            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </button>
                        
                        <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            folder.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/40' :
                            folder.color === 'green' ? 'bg-emerald-100 dark:bg-emerald-900/40' :
                            folder.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/40' :
                            folder.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/40' :
                            'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <Folder className={`w-4 h-4 ${
                              folder.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                              folder.color === 'green' ? 'text-emerald-600 dark:text-emerald-400' :
                              folder.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                              folder.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                              'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {editingFolder === folder.id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  ref={editInputRef}
                                  type="text"
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveRename(folder.id);
                                    if (e.key === 'Escape') cancelRename();
                                  }}
                                  onBlur={() => saveRename(folder.id)}
                                  className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            ) : (
                              <>
                                <span className="text-sm font-medium text-gray-900 dark:text-white truncate block">
                                  {folder.name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {folder.itemCount} öğe
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Three Dots Menu */}
                        {editingFolder !== folder.id && (
                          <div className="relative" ref={openMenuFolder === folder.id ? menuRef : null}>
                            <button 
                              onClick={(e) => handleMenuToggle(folder.id, e)}
                              className="p-1 rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-200 dark:hover:bg-gray-600"
                              aria-label="Klasör menüsü"
                            >
                              <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                            
                            {openMenuFolder === folder.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                                <button
                                  onClick={(e) => startRename(folder.id, folder.name, e)}
                                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Adını değiştir</span>
                                </button>
                                <button
                                  onClick={(e) => startDelete(folder.id, e)}
                                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Klasörü sil</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Expanded folder content */}
                      {expandedFolders.has(folder.id) && (
                        <div className="ml-6 mt-1 space-y-1">
                          {files
                            .filter(f => f.folder === folder.id && !f.deleted)
                            .slice(0, 3)
                            .map(file => {
                              const FileIcon = getFileIcon(file.type);
                              const isSelected = selectedFiles.includes(file.id); 

                              return (
                                <div 
                                  key={file.id} 
                                  onClick={(e) => handleFileClick(file.id, e)}
                                  className={`relative flex items-center space-x-2.5 p-2.5 rounded-lg transition-all duration-200 cursor-pointer group
                                    ${isSelected 
                                      ? 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm' 
                                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }`}
                                >
                                  {isSelected && (
                                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-violet-600 to-purple-600 rounded-r-full"></div>
                                  )}
                                  
                                  <div className={`relative ${isSelected ? 'scale-105' : 'group-hover:scale-105'} transition-transform duration-200`}>
                                    {file.thumbnail ? (
                                      <div className="relative">
                                        <img 
                                          src={file.thumbnail} 
                                          alt={file.name}
                                          className={`w-6 h-6 rounded object-cover ${isSelected ? 'ring-2 ring-gray-300 dark:ring-gray-500' : ''}`}
                                        />
                                      </div>
                                    ) : (
                                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors
                                        ${isSelected ? 'bg-gray-200 dark:bg-gray-600' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'}`}>
                                        <FileIcon className={`w-4 h-4 ${isSelected ? 'text-gray-700 dark:text-gray-300' : getFileColor(file.type)}`} />
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <span className={`text-sm truncate block transition-all
                                      ${isSelected ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                                      {file.name}
                                    </span>
                                    {isSelected && (
                                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">
                                        {file.size}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className={`flex items-center space-x-1 transition-all
                                    ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                                    {file.favorite && (
                                      <Star className="w-3 h-3 fill-current text-amber-500" />
                                    )}
                                    {file.shared && (
                                      <Share className="w-3 h-3 text-blue-500" />
                                    )}
                                    {isSelected && <div className="w-2 h-2 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full"></div>}
                                  </div>
                                </div>
                              );
                            })}
                          {files.filter(f => f.folder === folder.id && !f.deleted).length > 3 && (
                            <div className="px-2 py-1">
                              <button 
                                onClick={() => handleFolderClick(folder.id)}
                                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                              >
                                +{files.filter(f => f.folder === folder.id && !f.deleted).length - 3} dosya daha →
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Files Section */}
              {currentView === 'recent' && (
                <div className="px-2 mt-6">
                  <div className="flex items-center justify-between px-3 py-2 mb-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Son Kullanılan Dosyalar</span>
                    <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                      Son 10 dosya
                    </span>
                  </div>
                  
                  {recentFiles.length === 0 ? (
                    <div className="px-3 py-8 text-center">
                      <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Henüz yakın zamanda açılmış/düzenlenmiş dosya yok
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {recentFiles.map((file) => {
                        const FileIcon = getFileIcon(file.type);
                        const isSelected = selectedFiles.includes(file.id);
                        
                        return (
                          <div 
                            key={file.id} 
                            onClick={(e) => handleFileClick(file.id, e)}
                            className={`group flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 cursor-pointer relative
                              ${isSelected 
                                ? 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                              }`}
                          >
                            {isSelected && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-violet-600 to-purple-600 rounded-r-full"></div>
                            )}
                            
                            <div className={`relative ${isSelected ? 'scale-105' : 'group-hover:scale-105'} transition-transform duration-200`}>
                              {file.thumbnail ? (
                                <div className="relative">
                                  <img 
                                    src={file.thumbnail} 
                                    alt={file.name}
                                    className={`w-8 h-8 rounded object-cover ${isSelected ? 'ring-2 ring-gray-300 dark:ring-gray-500' : ''}`}
                                  />
                                </div>
                              ) : (
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                  ${isSelected ? 'bg-gray-200 dark:bg-gray-600' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'}`}>
                                  <FileIcon className={`w-4 h-4 ${isSelected ? 'text-gray-700 dark:text-gray-300' : getFileColor(file.type)}`} />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-medium truncate transition-all
                                  ${isSelected ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                                  {file.name}
                                </span>
                                <div className={`flex items-center space-x-1 transition-all
                                  ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                                  {file.favorite && <Star className="w-3 h-3 fill-current text-amber-500" />}
                                  {file.shared && <Share className="w-3 h-3 text-blue-500" />}
                                </div>
                              </div>
                              <div className={`flex items-center space-x-2 text-xs mt-0.5
                                ${isSelected ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                <span>{formatDate(file.modifiedDate)}</span>
                                <span>•</span>
                                <span>{file.size}</span>
                                {file.folder && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center space-x-1">
                                      <Folder className="w-3 h-3" />
                                      <span>{folders.find(f => f.id === file.folder)?.name || 'Bilinmeyen'}</span>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className={`${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all`}>
                              {isSelected ? (
                                <div className="w-2 h-2 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full"></div>
                              ) : (
                                <button className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                                  <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Compact Storage Section */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Depolama</span>
                </div>
                <span className="text-gray-900 dark:text-white font-semibold text-xs">
                  {formatBytes(usedBytes)}
                </span>
              </div>

              {/* Compact stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <File className="w-3 h-3" />
                  <span>{files.filter(f => !f.deleted).length}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Folder className="w-3 h-3" />
                  <span>{folders.length}</span>
                </div>
                {Object.keys(fileTypeStats).length > 0 && (
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-0.5">
                      {Object.entries(fileTypeStats)
                        .sort(([,a], [,b]) => (b as any).size - (a as any).size)
                        .slice(0, 3)
                        .map(([type]) => (
                          <div key={type} className={`w-2 h-2 rounded-full ${
                            type === 'image' ? 'bg-emerald-400' :
                            type === 'video' ? 'bg-rose-400' :
                            type === 'document' ? 'bg-blue-400' :
                            type === 'pdf' ? 'bg-red-400' :
                            type === 'audio' ? 'bg-fuchsia-400' :
                            type === 'archive' ? 'bg-amber-400' :
                            'bg-gray-400'
                          }`}></div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Klasörü Sil</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Bu işlem geri alınamaz</p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                "<strong>{folders.find(f => f.id === deleteConfirm)?.name}</strong>" klasörünü ve içindeki tüm dosyaları silmek istediğinizden emin misiniz?
              </p>
              
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={() => confirmDelete(deleteConfirm)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;