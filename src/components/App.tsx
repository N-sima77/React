// src/components/App.tsx
import React, { useState, useEffect } from "react";
import { AppUser, UploadedFile, AppFolder } from "../types";
import { STORAGE_KEYS } from "../data/Data";

import LoginScreen from "./LoginScreen";
import FileManagerApp from "./FileManagerApp";

const App: React.FC = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [folders, setFolders] = useState<AppFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  // 🔑 şifreyi localStorage'da tutmak için key
  const PASSWORD_KEY = "USER_PASSWORD";

  // Dark mode değiştiğinde html class ve localStorage güncelle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  // Dark mode toggle fonksiyonu
  const handleDarkModeToggle = (next?: boolean) => {
    setDarkMode((prev) => (typeof next === "boolean" ? next : !prev));
  };

  // LOCAL STORAGE ile giriş işlemi
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // simülasyon
      const storedData = localStorage.getItem(email);
      if (!storedData) return false;

      const data = JSON.parse(storedData);

      // şifre kontrolü
      const storedPassword = localStorage.getItem(`${PASSWORD_KEY}_${email}`);
      if (!storedPassword || storedPassword !== password) {
        return false;
      }

      if (data.user.email === email) {
        
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_EMAIL, data.user.email);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login process failed:", error);
      return false;
    }
  };

  // LOCAL STORAGE ile kayıt işlemi
  const handleRegister = async (userData: { name: string; email: string; password: string }): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (localStorage.getItem(userData.email)) return false;

      const newUser: AppUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`,
        joinDate: new Date().toISOString(),
      };

      const newUserData = { user: newUser, files: [], folders: [] };
      localStorage.setItem(userData.email, JSON.stringify(newUserData));
      // şifreyi sakla
      localStorage.setItem(`${PASSWORD_KEY}_${userData.email}`, userData.password);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_EMAIL, newUser.email);

      return true; // user setUser animasyondan sonra yapılacak
    } catch (error) {
      console.error("Registration process failed:", error);
      return false;
    }
  };

  // LOCAL STORAGE ile çıkış işlemi
  const handleLogout = async (): Promise<void> => {
    setUser(null);
    setFiles([]);
    setFolders([]);

    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_EMAIL);
  };

  // Profil güncelleme fonksiyonları
  const handleUpdateName = async (newName: string): Promise<boolean> => {
    try {
      if (!user) return false;

      const storedData = localStorage.getItem(user.email);
      if (!storedData) return false;

      const data = JSON.parse(storedData);
      data.user.name = newName;
      data.user.avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${newName}`;
      
      localStorage.setItem(user.email, JSON.stringify(data));

      setUser(prevUser => {
        if (!prevUser) return null;
        return { 
          ...prevUser, 
          name: newName,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${newName}`
        };
      });

      return true;
    } catch (error) {
      console.error("Name update failed:", error);
      return false;
    }
  };

  const handleUpdateEmail = async (newEmail: string): Promise<boolean> => {
    try {
      if (!user) return false;

      // Yeni email zaten var mı kontrol et
      const existingData = localStorage.getItem(newEmail);
      if (existingData) return false;

      const storedData = localStorage.getItem(user.email);
      if (!storedData) return false;

      // Eski email key'ini sil
      localStorage.removeItem(user.email);
      
      // Yeni email ile kaydet
      const data = JSON.parse(storedData);
      data.user.email = newEmail;
      localStorage.setItem(newEmail, JSON.stringify(data));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_EMAIL, newEmail);

      // Şifreyi yeni email key'i ile taşı
      const oldPass = localStorage.getItem(`${PASSWORD_KEY}_${user.email}`);
      if (oldPass) {
        localStorage.setItem(`${PASSWORD_KEY}_${newEmail}`, oldPass);
        localStorage.removeItem(`${PASSWORD_KEY}_${user.email}`);
      }

      setUser(prevUser => {
        if (!prevUser) return null;
        return { ...prevUser, email: newEmail };
      });

      return true;
    } catch (error) {
      console.error("Email update failed:", error);
      return false;
    }
  };

  // 🔑 Şifre değiştirme
  const handleChangePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      if (!user) return false;

      const storedPassword = localStorage.getItem(`${PASSWORD_KEY}_${user.email}`);
      if (!storedPassword || storedPassword !== currentPassword) {
        return false; // mevcut şifre yanlış
      }

      // yeni şifreyi kaydet
      localStorage.setItem(`${PASSWORD_KEY}_${user.email}`, newPassword);
      return true;
    } catch (error) {
      console.error("Password change failed:", error);
      return false;
    }
  };

  const handleDeleteAccount = async (): Promise<void> => {
    if (user) {
      localStorage.removeItem(user.email); // kullanıcı dataları
      localStorage.removeItem(`${PASSWORD_KEY}_${user.email}`); // şifre
    }
    await handleLogout();
  };

  // Uygulama başlatma - localStorage
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);

      const userEmail = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_EMAIL);
      if (userEmail) {
        const storedData = localStorage.getItem(userEmail);
        if (storedData) {
          const data = JSON.parse(storedData);
          setUser(data.user);
          setFiles(data.files || []);
          setFolders(data.folders || []);
        }
      }

      setIsLoading(false);
    };

    initializeApp();
  }, []);

  // Profil handler'ları
  const profileApiHandlers = {
    onUpdateName: handleUpdateName,
    onUpdateEmail: handleUpdateEmail,
    onChangePassword: handleChangePassword,
    onDeleteAccount: handleDeleteAccount,
  };

  // Loading ekranı
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        darkMode={darkMode}
        onDarkModeToggle={handleDarkModeToggle}
        onSuccess={(email: string) => {           // ✅ burası eklenmiş olmalı
    const storedData = localStorage.getItem(email);
    if (storedData) {
      const data = JSON.parse(storedData);
      setUser(data.user);
      setFiles(data.files || []);
      setFolders(data.folders || []);
    }
  }}
      />
    );
  }

  return (
    <FileManagerApp
      user={user}
      onLogout={handleLogout}
      initialFiles={files}
      initialFolders={folders}
      darkMode={darkMode}
      onDarkModeToggle={handleDarkModeToggle}
      profileApiHandlers={profileApiHandlers}
    />
  );
};

export default App;
