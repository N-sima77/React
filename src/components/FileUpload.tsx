import React, { useRef, useState, useCallback } from 'react';
import { Upload, Plus, X, File, Image, FileText, Sheet, Film, Music, Archive } from 'lucide-react';

// Types
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

interface FileUploadProps {
  onFileUpload: (files: FileList) => void;
  currentFolder?: string | null;
  userId: string;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // MB cinsinden
  disabled?: boolean;
  className?: string;
}

interface PendingFile {
  file: File;
  id: string;
  progress: number;
  error?: string;
  preview?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  currentFolder,
  userId,
  multiple = true,
  accept,
  maxSize = 100, // 100MB default
  disabled = false,
  className = ""
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Dosya tipini belirle
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

  // Dosya boyutunu formatla
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Dosya ikonunu getir
  const getFileIcon = (type: UploadedFile['type']) => {
    switch (type) {
      case 'pdf': return <FileText className="w-6 h-6 text-red-500" />;
      case 'excel': return <Sheet className="w-6 h-6 text-emerald-500" />;
      case 'image': return <Image className="w-6 h-6 text-purple-500" />;
      case 'video': return <Film className="w-6 h-6 text-indigo-500" />;
      case 'audio': return <Music className="w-6 h-6 text-amber-500" />;
      case 'archive': return <Archive className="w-6 h-6 text-gray-500" />;
      default: return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  // Dosya validasyonu
  const validateFile = (file: File): string | null => {
    // Boyut kontrolü
    if (file.size > maxSize * 1024 * 1024) {
      return `Dosya boyutu ${maxSize}MB'dan büyük olamaz`;
    }

    // Tip kontrolü (accept prop'u varsa)
    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type;

      const isAccepted = acceptedTypes.some(acceptedType => {
        if (acceptedType.startsWith('.')) {
          return acceptedType === fileExtension;
        }
        if (acceptedType.includes('*')) {
          return mimeType.startsWith(acceptedType.split('*')[0]);
        }
        return acceptedType === mimeType;
      });

      if (!isAccepted) {
        return 'Dosya tipi desteklenmiyor';
      }
    }

    return null;
  };

  // Önizleme oluştur
  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  // Dosya yükleme simülasyonu
  const simulateUpload = async (pendingFile: PendingFile): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }
        setPendingFiles(prev => 
          prev.map(pf => 
            pf.id === pendingFile.id ? { ...pf, progress } : pf
          )
        );
      }, 200);
    });
  };

  // Dosyaları işle
  const processFiles = async (files: File[]) => {
    if (disabled || isUploading) return;

    setIsUploading(true);
    const validFiles: File[] = [];
    const newPendingFiles: PendingFile[] = [];

    // Dosyaları validate et ve pending listesine ekle
    for (const file of files) {
      const error = validateFile(file);
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const preview = await createPreview(file);

      const pendingFile: PendingFile = {
        file,
        id,
        progress: 0,
        error: error || undefined,
        preview
      };

      newPendingFiles.push(pendingFile);
      
      if (!error) {
        validFiles.push(file);
      }
    }

    setPendingFiles(prev => [...prev, ...newPendingFiles]);

    // Geçerli dosyaları yükle
    for (const pendingFile of newPendingFiles) {
      if (!pendingFile.error) {
        try {
          await simulateUpload(pendingFile);
        } catch (error) {
          setPendingFiles(prev => 
            prev.map(pf => 
              pf.id === pendingFile.id 
                ? { ...pf, error: 'Yükleme hatası' } 
                : pf
            )
          );
        }
      }
    }

    // Başarılı yüklemeleri parent component'e bildir
    if (validFiles.length > 0) {
      const fileList = new DataTransfer();
      validFiles.forEach(file => fileList.items.add(file));
      onFileUpload(fileList.files);
    }

    // 2 saniye sonra pending listesini temizle
    setTimeout(() => {
      setPendingFiles(prev => prev.filter(pf => pf.error));
      setIsUploading(false);
    }, 2000);
  };

  // Dosya seçimi
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(Array.from(files));
    }
    // Input'u temizle
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  }, [disabled]);

  // Pending dosyayı kaldır
  const removePendingFile = (id: string) => {
    setPendingFiles(prev => prev.filter(pf => pf.id !== id));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button */}
      <div className="flex items-center space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Dosya {multiple ? 'Yükle' : 'Seç'}</span>
        </button>

        {isUploading && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Yükleniyor...
          </span>
        )}
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 ${
          dragOver ? 'text-indigo-500' : 'text-gray-400'
        }`} />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {dragOver ? 'Dosyaları buraya bırakın' : 'Dosya yükleyin'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Dosyaları sürükleyip bırakın veya seçmek için tıklayın
        </p>
        <div className="text-sm text-gray-400 dark:text-gray-500">
          {accept && <p>Desteklenen formatlar: {accept}</p>}
          <p>Maksimum dosya boyutu: {maxSize}MB</p>
        </div>
      </div>

      {/* Pending Files */}
      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Yüklenen Dosyalar
          </h4>
          
          {pendingFiles.map((pendingFile) => (
            <div
              key={pendingFile.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex-shrink-0">
                {pendingFile.preview ? (
                  <img 
                    src={pendingFile.preview} 
                    alt={pendingFile.file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  getFileIcon(getFileType(pendingFile.file.name))
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {pendingFile.file.name}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(pendingFile.file.size)}
                  </p>
                  {pendingFile.error ? (
                    <p className="text-xs text-red-500">{pendingFile.error}</p>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {pendingFile.progress === 100 ? 'Tamamlandı' : `%${Math.round(pendingFile.progress)}`}
                    </p>
                  )}
                </div>
                
                {!pendingFile.error && pendingFile.progress < 100 && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${pendingFile.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => removePendingFile(pendingFile.id)}
                className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;