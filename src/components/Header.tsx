
import React, { useState } from 'react';
import { Search, Grid, List, Sun, Moon } from 'lucide-react';
import ProfileModal from './ProfileModal';

interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate?: string;
}

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

interface HeaderProps {
  user: AppUser;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortBy: 'name' | 'date' | 'size';
  onSortChange: (sort: 'name' | 'date' | 'size') => void;
  selectedFiles: string[];
  currentView: string;
  files: UploadedFile[];
  folders: { id: string; name: string }[];
  darkMode: boolean;
  onDarkModeToggle: () => void;
  onDeleteAccount?: () => Promise<void>;
  onUpdateName?: (newName: string) => Promise<boolean>;
  onUpdateEmail?: (newEmail: string) => Promise<boolean>;
  onChangePassword?: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  selectedFiles,
  currentView,
  darkMode,
  onDarkModeToggle,
  onDeleteAccount,
  onUpdateName,
  onUpdateEmail,
  onChangePassword
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const profileApiHandlers = {
    onUpdateName: onUpdateName || (async (newName: string) => { console.warn('Update name handler not provided'); return false; }),
    onUpdateEmail: onUpdateEmail || (async (newEmail: string) => { console.warn('Update email handler not provided'); return false; }),
    onChangePassword: onChangePassword || (async (current: string, newPass: string) => { console.warn('Change password handler not provided'); return false; }),
    onDeleteAccount: onDeleteAccount || (async () => { console.warn('Delete account handler not provided'); }),
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'my-drive': return 'Dosyalarım';
      case 'starred': return 'Yıldızlılar';
      case 'recent': return 'Son Kullanılan';
      case 'trash': return 'Çöp Kutusu';
      default: return 'Dosyalarım';
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {getViewTitle()}
            </h1>
            {selectedFiles.length > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedFiles.length} öğe seçili
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Arama Çubuğu */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Dosyalarda ara..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-80 transition-all duration-300"
              />
            </div>

            {/* Görünüm ve Sıralama Butonları */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 transition-colors">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-full transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-white'
                }`}
                title="Grid görünümü"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded-full transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-white'
                }`}
                title="Liste görünümü"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'name' | 'date' | 'size')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="name">İsme göre</option>
              <option value="date">Tarihe göre</option>
              <option value="size">Boyuta göre</option>
            </select>

            {/* Tema Değiştirme Butonu */}
            <button
              onClick={onDarkModeToggle}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              title={darkMode ? 'Açık tema' : 'Koyu tema'}
            >
              {darkMode ? <Sun className="w-5 h-5 text-gray-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
            </button>

            {/* Profil Butonu */}
            <div>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center space-x-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 border-indigo-500"
                />
                <span className="font-medium text-gray-900 dark:text-white hidden sm:block">{user.name}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <ProfileModal
        user={user}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onLogout={onLogout}
        onDeleteAccount={profileApiHandlers.onDeleteAccount}
        onUpdateName={profileApiHandlers.onUpdateName}
        onUpdateEmail={profileApiHandlers.onUpdateEmail}
        onChangePassword={profileApiHandlers.onChangePassword}
      />
    </>
  );
};

export default Header;