// types.ts - Tüm uygulama için type tanımları

export interface UploadedFile {
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

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate?: string;
}

export interface AppFolder {
  id: string;
  name: string;
  parentId?: string;
  createdDate: string;
  itemCount: number;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  count: number;
  
}