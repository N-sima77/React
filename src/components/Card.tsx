import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MoreVertical, Star, Trash2, Eye, Download, Share, Edit, 
  Undo2, File, FileText, Sheet, Image, Film, Music, Archive
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

interface FileCardProps {
  file: UploadedFile;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onSelect: (id: string) => void;
  onAction: (action: string, file: UploadedFile) => void;
  currentView: string;
}

const Card: React.FC<FileCardProps> = ({ file, viewMode, isSelected, onSelect, onAction, currentView }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  const handleRename = () => {
    if (newName.trim() !== '' && newName !== file.name) {
      onAction('rename', { ...file, name: newName });
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setNewName(file.name);
      setIsEditingName(false);
    }
  };

  const getFileIcon = () => {
    switch (file.type) {
      case 'pdf': return <FileText className="w-6 h-6 text-red-500" />;
      case 'excel': return <Sheet className="w-6 h-6 text-emerald-500" />;
      case 'image': return <Image className="w-6 h-6 text-purple-500" />;
      case 'video': return <Film className="w-6 h-6 text-indigo-500" />;
      case 'audio': return <Music className="w-6 h-6 text-amber-500" />;
      case 'archive': return <Archive className="w-6 h-6 text-gray-500" />;
      default: return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  const getFileColor = () => {
    switch (file.type) {
      case 'pdf': return 'border-red-200 bg-red-50 dark:bg-red-900/10';
      case 'excel': return 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10';
      case 'image': return 'border-purple-200 bg-purple-50 dark:bg-purple-900/10';
      case 'video': return 'border-indigo-200 bg-indigo-50 dark:bg-indigo-900/10';
      case 'audio': return 'border-amber-200 bg-amber-50 dark:bg-amber-900/10';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-800';
    }
  };

  const menuItems = useMemo(() => {
    if (currentView === 'trash') {
      return (
        <>
          <button
            onClick={() => onAction('restore', file)}
            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Undo2 className="w-4 h-4" />
            <span>Kurtar</span>
          </button>
          <hr className="my-1 border-gray-200 dark:border-gray-600" />
          <button
            onClick={() => onAction('delete-permanently', file)}
            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
            <span>Kalıcı Sil</span>
          </button>
        </>
      );
    }

    return (
      <>
        <button
          onClick={() => onAction('preview', file)}
          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Eye className="w-4 h-4" />
          <span>Önizle</span>
        </button>
        <button
          onClick={() => onAction('download', file)}
          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Download className="w-4 h-4" />
          <span>İndir</span>
        </button>
        <button
          onClick={() => onAction('star', file)}
          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Star className="w-4 h-4" />
          <span>{file.favorite ? 'Yıldızdan Kaldır' : 'Yıldızla'}</span>
        </button>
        <button
          onClick={() => onAction('share', file)}
          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Share className="w-4 h-4" />
          <span>Paylaş</span>
        </button>
        <hr className="my-1 border-gray-200 dark:border-gray-600" />
        <button
          onClick={() => onAction('delete', file)}
          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4" />
          <span>Sil</span>
        </button>
      </>
    );
  }, [file, currentView, onAction]);
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('fileId', file.id);
  };
  
  if (viewMode === 'list') {
    return (
      <div
        className={`flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group ${
          isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
        }`}
        onClick={(e) => {
          if (e.target instanceof Element) {
            if (!e.target.closest('.action-button') && !e.target.closest('input')) {
              onSelect(file.id);
            }
          }
        }}
        draggable
        onDragStart={handleDragStart}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(file.id)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <div className="flex-shrink-0">
            {getFileIcon()}
          </div>
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={newName}
              onChange={handleNameChange}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              className="text-sm font-medium text-gray-900 dark:text-white bg-transparent border-b border-indigo-500 outline-none min-w-0"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p 
              className="text-sm font-medium text-gray-900 dark:text-white truncate" 
              title={file.name}
              onDoubleClick={() => setIsEditingName(true)}
            >
              {file.name}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
          <span className="w-20 text-right">{file.size}</span>
          <span className="w-24 text-right">{file.modifiedDate}</span>
          <div className="flex items-center space-x-2">
            {file.favorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
            {file.deleted && <Trash2 className="w-4 h-4 text-red-500" />}
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded action-button"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsEditingName(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Yeniden Adlandır</span>
                  </button>
                  <hr className="my-1 border-gray-200 dark:border-gray-600" />
                  {menuItems}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative group rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-indigo-500 shadow-md' : `border-dashed ${getFileColor()}`
      }`}
      onClick={(e) => {
        if (e.target instanceof Element) {
          if (!e.target.closest('.action-button') && !e.target.closest('input')) {
            onSelect(file.id);
          }
        }
      }}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="absolute top-2 left-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(file.id)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
      </div>

      <div className="absolute top-2 right-2 flex items-center space-x-2">
        {file.favorite && (
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
        )}
        {file.deleted && (
          <Trash2 className="w-4 h-4 text-red-500" />
        )}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-full shadow-sm action-button"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsEditingName(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit className="w-4 h-4" />
                  <span>Yeniden Adlandır</span>
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-600" />
                {menuItems}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center text-center pt-4">
        <div className="mb-3">
          {file.thumbnail ? (
            <img src={file.thumbnail} alt={file.name} className="w-12 h-12 object-cover rounded" />
          ) : (
            getFileIcon()
          )}
        </div>
        {isEditingName ? (
          <input
            ref={nameInputRef}
            type="text"
            value={newName}
            onChange={handleNameChange}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="text-sm font-medium text-gray-900 dark:text-white bg-transparent border-b border-indigo-500 outline-none w-full text-center"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <h3 
            className="font-medium text-gray-900 dark:text-white text-sm truncate w-full" 
            title={file.name}
            onDoubleClick={() => setIsEditingName(true)}
          >
            {file.name}
          </h3>
        )}
        
        <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{file.size}</span>
          <span>•</span>
          <span>{file.modifiedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default Card;