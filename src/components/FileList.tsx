import React, { useRef } from 'react';
import { Upload, File } from 'lucide-react';
import { UploadedFile, AppUser } from '../types'; 
import FileCard from './Card'; 

interface FileListProps {
  files: UploadedFile[];
  viewMode: 'grid' | 'list';
  selectedFiles: string[];
  onFileSelect: (id: string) => void;
  onFileAction: (action: string, file: UploadedFile) => void;
  currentView: string;
  dragOver: boolean;
  onFileUpload: (files: FileList) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

const FileList: React.FC<FileListProps> = ({
  files,
  viewMode,
  selectedFiles,
  onFileSelect,
  onFileAction,
  currentView,
  dragOver,
  onFileUpload,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (files.length === 0) {
    return (
      <div 
        className={`flex-1 overflow-auto p-6 transition-colors ${dragOver ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
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
            <>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={(e) => e.target.files && onFileUpload(e.target.files)}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span>İlk dosyanızı yükleyin</span>
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex-1 overflow-auto p-6 transition-colors ${dragOver ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
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
        
        {files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            viewMode={viewMode}
            isSelected={selectedFiles.includes(file.id)}
            onSelect={onFileSelect}
            onAction={onFileAction}
            currentView={currentView}
          />
        ))}
      </div>
    </div>
  );
};

export default FileList;