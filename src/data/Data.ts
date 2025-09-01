import { UploadedFile } from '../types';

// ---Constants ---
export const STORAGE_KEYS = {
  CURRENT_USER_EMAIL: "fileManager_currentUserEmail",
  AUTH_TOKEN: "fileManager_authToken",
  REFRESH_TOKEN: "fileManager_refreshToken",
  DARK_MODE: "fileManager_darkMode",
} as const;

export const FILE_TYPES = {
  PDF: 'pdf',
  EXCEL: 'excel',
  IMAGE: 'image',
  DOCUMENT: 'document',
  VIDEO: 'video',
  AUDIO: 'audio',
  ARCHIVE: 'archive',
  OTHER: 'other',
} as const;

export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
} as const;

export const VIEWS = {
  MY_DRIVE: 'my-drive',
  SHARED: 'shared',
  STARRED: 'starred',
  RECENT: 'recent',
  TRASH: 'trash',
} as const;

export const SORT_OPTIONS = {
  NAME: 'name',
  DATE: 'date',
  SIZE: 'size',
} as const;

export const FOLDER_COLORS = {
  BLUE: 'blue',
  GREEN: 'green',
  PURPLE: 'purple',
  ORANGE: 'orange',
} as const;

export const PERMISSIONS = {
  VIEW: 'view',
  EDIT: 'edit',
  OWNER: 'owner',
} as const;

// --- Folder Color Classes ---
export const FOLDER_COLOR_CLASSES = {
  blue: 'text-blue-500',
  green: 'text-emerald-500',
  purple: 'text-purple-500',
  orange: 'text-amber-500',
  default: 'text-gray-500',
} as const;

// --- File Extension Mappings ---
export const FILE_EXTENSION_MAP = {
  pdf: ['pdf'],
  excel: ['xls', 'xlsx'],
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  video: ['mp4', 'avi', 'mov', 'mkv'],
  audio: ['mp3', 'wav', 'flac'],
  archive: ['zip', 'rar', '7z'],
  document: ['doc', 'docx', 'txt'],
} as const;

// --- Default Values ---
export const DEFAULT_STORAGE = {
  TOTAL: 15, // GB
  INITIAL_USED: 0,
} as const;

export const FEATURE_LIST = [
  '🚀 Hızlı dosya yükleme',
  '🔒 Güvenli saklama',
  '🌐 Her yerden erişim',
  '👥 Kolay paylaşım'
] as const;

// --- Utility Functions ---
export const getFileType = (filename: string): UploadedFile['type'] => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return 'other';
  
  if (FILE_EXTENSION_MAP.pdf.includes(ext as any)) return 'pdf';
  if (FILE_EXTENSION_MAP.excel.includes(ext as any)) return 'excel';
  if (FILE_EXTENSION_MAP.image.includes(ext as any)) return 'image';
  if (FILE_EXTENSION_MAP.video.includes(ext as any)) return 'video';
  if (FILE_EXTENSION_MAP.audio.includes(ext as any)) return 'audio';
  if (FILE_EXTENSION_MAP.archive.includes(ext as any)) return 'archive';
  if (FILE_EXTENSION_MAP.document.includes(ext as any)) return 'document';
  
  return 'other';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const generateAvatar = (name: string): string => {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;
};

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

export const formatISODate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};