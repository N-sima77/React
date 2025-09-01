import React, { useEffect, useRef, useState, useCallback } from "react";
import { LogOut, User, Settings, Trash2, X, Eye, EyeOff, Lock, Check, AlertCircle } from "lucide-react";

interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate?: string;
  isActive?: boolean;
}

interface ProfileModalProps {
  user: AppUser;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onDeleteAccount?: () => Promise<void>;
  onUpdateName?: (newName: string) => Promise<boolean>;
  onChangePassword?: (currentPassword: string, newPassword: string) => Promise<boolean>;
  onUpdateEmail?: (newEmail: string) => Promise<boolean>;
}

// Optimize edilmiş PasswordInput component
const PasswordInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
}> = React.memo(({
  value,
  onChange,
  placeholder,
  show,
  onToggle
}) => {
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        autoComplete="off"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onLogout,
  onDeleteAccount,
  onUpdateName,
  onChangePassword,
  onUpdateEmail
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);

  // Optimize edilmiş handler functions
  const handleCurrentPasswordChange = useCallback((value: string) => {
    setCurrentPassword(value);
  }, []);

  const handleNewPasswordChange = useCallback((value: string) => {
    setNewPassword(value);
  }, []);

  const handleConfirmPasswordChange = useCallback((value: string) => {
    setConfirmPassword(value);
  }, []);

  const handleNewNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  }, []);

  const handleNewEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmail(e.target.value);
  }, []);

  const handleDeleteConfirmTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDeleteConfirmText(e.target.value);
  }, []);

  // Toggle functions
  const toggleCurrentPasswordVisibility = useCallback(() => {
    setShowCurrentPassword(prev => !prev);
  }, []);

  const toggleNewPasswordVisibility = useCallback(() => {
    setShowNewPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const toggleEditing = useCallback(() => {
    setIsEditing(prev => !prev);
  }, []);

  const showSettingsHandler = useCallback(() => {
    setShowSettings(true);
  }, []);

  const hideSettingsHandler = useCallback(() => {
    setShowSettings(false);
  }, []);

  const showDeleteConfirmation = useCallback(() => {
    setDeleteConfirmationVisible(true);
  }, []);

  const hideDeleteConfirmation = useCallback(() => {
    setDeleteConfirmationVisible(false);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen, onClose]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && user) {
      setNewName(user.name || "");
      setNewEmail(user.email || "");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setDeleteConfirmText("");
      setMessage(null);
      setIsEditing(false);
      setShowSettings(false);
      setDeleteConfirmationVisible(false);
    }
  }, [isOpen, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !user) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Bilinmiyor";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return "Bilinmiyor";
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveProfile = async () => {
    if (!newName.trim()) {
      showMessage('error', 'İsim boş olamaz!');
      return;
    }

    setIsLoading(true);
    try {
      let success = true;

      if (newName.trim() !== (user?.name || "") && onUpdateName) {
        success = await onUpdateName(newName.trim());
        if (!success) {
          showMessage('error', 'İsim güncellenirken hata oluştu!');
          setIsLoading(false);
          return;
        }
      }

      if (newEmail.trim() !== (user?.email || "") && onUpdateEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail.trim())) {
          showMessage('error', 'Geçerli bir e-posta adresi girin!');
          setIsLoading(false);
          return;
        }

        success = await onUpdateEmail(newEmail.trim());
        if (!success) {
          showMessage('error', 'E-posta güncellenirken hata oluştu!');
          setIsLoading(false);
          return;
        }
      }

      showMessage('success', 'Profil başarıyla güncellendi!');
      setIsEditing(false);
    } catch (error) {
      showMessage('error', 'Bir hata oluştu!');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePasswordClick = async () => {
    // Form validasyonları
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage('error', 'Tüm alanları doldurun!');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('error', 'Yeni şifreler eşleşmiyor!');
      return;
    }

    if (newPassword.length < 6) {
      showMessage('error', 'Yeni şifre en az 6 karakter olmalı!');
      return;
    }

    
    if (currentPassword === newPassword) {
      showMessage('error', 'Yeni şifre mevcut şifrenizden farklı olmalı!');
      return;
    }

    if (!onChangePassword) {
      showMessage('error', 'Şifre değiştirme özelliği mevcut değil!');
      return;
    }

    setIsLoading(true);
    try {
      const success = await onChangePassword(currentPassword, newPassword);
      if (success) {
        showMessage('success', 'Şifre başarıyla değiştirildi!');
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowSettings(false);
      } else {
        showMessage('error', 'Mevcut şifre yanlış veya bir hata oluştu!');
      }
    } catch (error) {
      showMessage('error', 'Şifre değiştirilirken hata oluştu!');
      console.error('Password change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccountClick = async () => {
    if (!onDeleteAccount) {
      showMessage('error', 'Hesap silme özelliği mevcut değil!');
      return;
    }

    if (deleteConfirmText.trim().toLowerCase() !== user.email?.trim().toLowerCase()) {
      showMessage('error', 'Lütfen e-posta adresinizi doğru yazarak onaylayın!');
      return;
    }

    setIsLoading(true);
    try {
      await onDeleteAccount();
      showMessage('success', 'Hesabınız başarıyla silindi. Çıkış yapılıyor...');
      setTimeout(() => {
        onLogout();
        onClose();
      }, 2000);
    } catch (error) {
      showMessage('error', 'Hesap silinirken hata oluştu!');
      console.error('Account deletion error:', error);
      setIsLoading(false);
    }
  };

  const handleLogoutClick = () => {
    if (window.confirm("Çıkış yapmak istediğinizden emin misiniz?")) {
      onLogout();
      onClose();
    }
  };

  const getUserAvatar = () => {
    if (user?.avatar) {
      return user.avatar;
    }
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || "User")}&backgroundColor=6366f1&color=ffffff&size=64`;
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[101] flex items-start justify-end p-4 pointer-events-none">
        <div
          ref={modalRef}
          className="w-full max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-in slide-in-from-right-4 duration-300 max-h-[90vh] overflow-y-auto mt-16 mr-2"
          onClick={(e) => e.stopPropagation()}
        >
          {message && (
            <div className={`p-3 text-sm font-medium text-center ${
              message.type === 'success'
                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-b border-green-200 dark:border-green-800'
                : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-b border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center justify-center space-x-2">
                {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{message.text}</span>
              </div>
            </div>
          )}

          <div className="relative p-6 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors z-10"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="relative z-10 flex items-center space-x-4">
              <div className="relative">
                <img
                  src={getUserAvatar()}
                  alt={user?.name || "User"}
                  className="w-16 h-16 rounded-xl border-2 border-white/30 shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || "User")}&backgroundColor=6366f1&color=ffffff&size=64`;
                  }}
                />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-2 border-white rounded-full ${user?.isActive !== false ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white truncate">{user?.name}</h3>
                <p className="text-sm text-white/80 truncate">{user?.email}</p>
                {user?.joinDate && <p className="text-xs text-white/70 mt-1">Üye: {formatDate(user.joinDate)}</p>}
              </div>
            </div>
          </div>

          <div className="p-4 space-y-2">
            {!showSettings ? (
              <>
                <button
                  onClick={toggleEditing}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl text-gray-700 dark:text-gray-200 transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <span className="font-medium">Profil Düzenle</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Kişisel bilgilerinizi güncelleyin</p>
                  </div>
                </button>

                {isEditing && (
                  <div className="mx-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">İsim</label>
                      <input
                        key="profile-name-input"
                        type="text"
                        value={newName}
                        onChange={handleNewNameChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Adınız"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-posta</label>
                      <input
                        key="profile-email-input"
                        type="email"
                        value={newEmail}
                        onChange={handleNewEmailChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="E-posta adresiniz"
                      />
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                    >
                      {isLoading ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                  </div>
                )}

                <button
                  onClick={showSettingsHandler}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl text-gray-700 dark:text-gray-200 transition-colors group"
                >
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-xl flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-900/60">
                    <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <span className="font-medium">Şifre Değiştir</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mevcut şifrenizi değiştirin</p>
                  </div>
                </button>

                {/* Hesabı Sil Düğmesi */}
                <button
                  onClick={showDeleteConfirmation}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 transition-colors group"
                >
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/60">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-medium">Hesabı Sil</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Hesabınızı kalıcı olarak silin</p>
                  </div>
                </button>

                {/* Hesap Silme Onayı */}
                {deleteConfirmationVisible && (
                  <div className="mx-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Bu işlem geri alınamaz! Devam etmek için e-posta adresinizi yazın.</p>
                    <input
                      key="delete-confirm-input"
                      type="email"
                      value={deleteConfirmText}
                      onChange={handleDeleteConfirmTextChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={`Onaylamak için "${user.email}" yazın`}
                    />
                    <button
                      onClick={handleDeleteAccountClick}
                      disabled={isLoading || deleteConfirmText.trim().toLowerCase() !== user.email?.trim().toLowerCase()}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                    >
                      {isLoading ? "Siliniyor..." : "Hesabımı Kalıcı Olarak Sil"}
                    </button>
                    <button 
                      onClick={hideDeleteConfirmation} 
                      className="w-full py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200"
                    >
                      İptal
                    </button>
                  </div>
                )}

                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl text-gray-700 dark:text-gray-200 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-600">
                    <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <span className="font-medium">Çıkış Yap</span>
                  </div>
                </button>
              </>
            ) : (
              <>
                <div className="space-y-4 mx-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mevcut Şifre</label>
                    <PasswordInput
                      key="current-password"
                      value={currentPassword}
                      onChange={handleCurrentPasswordChange}
                      placeholder="Mevcut Şifre"
                      show={showCurrentPassword}
                      onToggle={toggleCurrentPasswordVisibility}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yeni Şifre</label>
                    <PasswordInput
                      key="new-password"
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                      placeholder="Yeni Şifre"
                      show={showNewPassword}
                      onToggle={toggleNewPasswordVisibility}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yeni Şifre (Tekrar)</label>
                    <PasswordInput
                      key="confirm-password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      placeholder="Yeni Şifre (Tekrar)"
                      show={showConfirmPassword}
                      onToggle={toggleConfirmPasswordVisibility}
                    />
                  </div>
                  <button
                    onClick={handleChangePasswordClick}
                    disabled={isLoading}
                    className="w-full py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                  >
                    {isLoading ? "Kaydediliyor..." : "Şifreyi Değiştir"}
                  </button>
                  <button
                    onClick={hideSettingsHandler}
                    className="w-full py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200"
                  >
                    Geri
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileModal;