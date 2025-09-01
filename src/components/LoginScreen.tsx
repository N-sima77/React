import React, { useState, useEffect } from 'react';
import { Folder, Sun, Moon, ChevronRight, RefreshCw, CheckCircle, Sparkles, User, Heart, Zap, Star,Eye,EyeOff} from 'lucide-react';

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

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister?: (userData: { name: string; email: string; password: string }) => Promise<boolean>;
  darkMode?: boolean;
  onDarkModeToggle?: (next?: boolean) => void;
  onSuccess?: (email: string) => void; 
}

// --- Hook'lar ---
function useDarkMode(initial?: boolean) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Browser ortamında localStorage kullanımı (Claude.ai desteklemez)
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : initial || false;
      } catch {
        return initial || false;
      }
    }
    return initial || false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('darkMode', 'true');
        } catch {
          // localStorage kullanılamıyorsa sessizce devam et
        }
      }
    } else {
      document.documentElement.classList.remove('dark');
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('darkMode', 'false');
        } catch {
          // localStorage kullanılamıyorsa sessizce devam et
        }
      }
    }
  }, [isDarkMode]);

  return [isDarkMode, setIsDarkMode] as const;
}

const LoginScreen: React.FC<LoginProps> = ({ onLogin, onRegister, darkMode: darkModeProp, onDarkModeToggle,onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userName, setUserName] = useState('');
  const [darkMode, setDarkMode] = useDarkMode(darkModeProp);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // API'den gelen cevap simülasyonu
      await new Promise(resolve => setTimeout(resolve, 500));

      let success = false;

      if (isSignUp) {
        if (!name || !email || !password) {
          setError('Lütfen tüm alanları doldurun.');
          setLoading(false);
          return;
        }
        
        if (password.length < 6) {
          setError('Şifre en az 6 karakter olmalı.');
          setLoading(false);
          return;
        }
        
        // Kayıt işlemi için App.tsx'teki onRegister prop'unu çağır.
        if (onRegister) {
          success = await onRegister({ name, email, password });
          if (!success) {
            setError('Kayıt işlemi başarısız. Lütfen tekrar deneyin.');
          } else {
            // Başarı durumunu ayarla
            localStorage.setItem('userName', name);
            setUserName(name);
            setSuccess(true);
            // 3 saniye sonra ana uygulamaya geç
              setTimeout(() => {
              setSuccess(false);
              onSuccess?.(email);
              // Burada ana uygulamaya geçiş yapılacak (App.tsx'te kontrol edilecek)
            }, 3000);
          }
        } else {
          setError('Kayıt fonksiyonu bulunamıyor.');
        }
      } else {
        if (!email || !password) {
          setError('Lütfen e-posta ve şifrenizi girin.');
          setLoading(false);
          return;
        }
        // Giriş işlemi için App.tsx'teki onLogin prop'unu çağır.
        success = await onLogin(email, password);
if (!success) {
  setError('Giriş başarısız. Lütfen e-posta ve şifrenizi kontrol edin.');
} else {
  // Başarı durumunu ayarla
  // Local storage'dan giriş yapan kullanıcının adını al
  const storedData = localStorage.getItem(email);
  let displayName = email.split('@')[0]; // fallback
  
  if (storedData) {
    const data = JSON.parse(storedData);
    displayName = data.user?.name || email.split('@')[0];
  }
  
  setUserName(displayName.charAt(0).toUpperCase() + displayName.slice(1));
  setSuccess(true);
  // 3 saniye sonra ana uygulamaya geç
   setTimeout(() => {
   setSuccess(false);
   onSuccess?.(email);
    // Burada ana uygulamaya geçiş yapılacak (App.tsx'te kontrol edilecek)
  }, 3000);
}
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Login/SignUp error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Başarı mesajı overlay - sadece tasarım değişikliği
  if (success) {
    return (
      <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
        {/* Ana login ekranı arka planda */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-500 via-pink-500 to-rose-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="flex-1 bg-gray-50 dark:bg-gray-950"></div>

        {/* Başarı overlay */}
        <div className="fixed inset-0 bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 flex items-center justify-center z-50">
          {/* Animasyonlu arka plan elementleri */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              >
                {i % 3 === 0 ? (
                  <Heart className="w-6 h-6 text-white/20" />
                ) : i % 3 === 1 ? (
                  <Star className="w-5 h-5 text-white/25" />
                ) : (
                  <Zap className="w-4 h-4 text-white/30" />
                )}
              </div>
            ))}
          </div>

          {/* Ana başarı içeriği */}
          <div className="relative z-10 text-center text-white max-w-lg mx-auto px-8">
            {/* Büyük başarı ikonu */}
            <div className="mb-8 relative">
              <div 
                className="w-32 h-32 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border-4 border-white/20 shadow-2xl"
                style={{ animation: 'successBounce 0.8s ease-out' }}
              >
                <CheckCircle className="w-16 h-16 text-green-300" />
              </div>
              {/* Çoklu dalgalar */}
              <div className="absolute inset-0 w-32 h-32 mx-auto border-4 border-white/20 rounded-full animate-ping"></div>
              <div className="absolute inset-0 w-32 h-32 mx-auto border-2 border-white/30 rounded-full animate-pulse"></div>
            </div>

            {/* Başarı mesajları */}
            <div 
              className="space-y-6"
              style={{ animation: 'slideInUp 0.6s ease-out 0.2s both' }}
            >
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                🎉 Harika!
              </h1>
              
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">{userName}</h2>
              </div>

              <p className="text-xl text-white/90 leading-relaxed mb-8">
                {isSignUp ? (
                  <>
                    <span className="font-semibold">Hesabın başarıyla oluşturuldu!</span>
                    <br />
                    <span className="text-white/80">Artık CloudDrive'ın tüm özelliklerini kullanabilirsin 🚀</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold">Hesabına hoş geldin!</span>
                    <br />
                    <span className="text-white/80">Dosyalarına erişim sağlanıyor ✨</span>
                  </>
                )}
              </p>

              {/* Yükleme çubuğu */}
              <div className="w-full max-w-xs mx-auto">
                <div className="text-sm text-white/70 mb-2">CloudDrive yükleniyor...</div>
                <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
                  <div 
                    className="bg-gradient-to-r from-yellow-300 to-orange-400 h-3 rounded-full shadow-lg"
                    style={{ 
                      width: '0%',
                      animation: 'loadingBar 3s ease-in-out forwards'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* CloudDrive logosu */}
            <div 
              className="flex items-center justify-center space-x-3 mt-12 opacity-80"
              style={{ animation: 'fadeIn 1s ease-out 1s both' }}
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Folder className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-wider">CloudDrive</span>
            </div>
          </div>

          {/* CSS Animasyonları */}
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes successBounce {
                0% { transform: scale(0); opacity: 0; }
                50% { transform: scale(1.1); opacity: 0.8; }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes slideInUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes loadingBar {
                0% { width: 0%; }
                100% { width: 100%; }
              }
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      {/* Sol taraf - Daha dinamik gradient ve animasyonlar */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 relative overflow-hidden">
        {/* Animasyonlu arka plan */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          {/* Yüzen şekiller */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute opacity-10"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            >
              <div 
                className="bg-white rounded-full"
                style={{ 
                  width: `${20 + Math.random() * 40}px`, 
                  height: `${20 + Math.random() * 40}px` 
                }}
              ></div>
            </div>
          ))}
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center space-x-4 mb-12">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-lg border border-white/30 shadow-xl">
              <Folder className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              CloudDrive
            </h1>
          </div>
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            Dosyalarınızı
            <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              bulutta yönetin
            </span>
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Güvenli, hızlı ve sezgisel dosya paylaşımı ile 
            <span className="font-semibold text-yellow-300"> her yerden erişim</span>
          </p>
          
          {/* Özellik listesi */}
          <div className="space-y-3">
            {['🔒 Güvenli depolama', '⚡ Hızlı senkronizasyon', '🌐 Her yerden erişim'].map((feature, i) => (
              <div 
                key={i}
                className="flex items-center space-x-3 text-white/80"
                style={{ animation: `slideIn 0.6s ease-out ${i * 0.1}s both` }}
              >
                <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full"></div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CSS animasyonları */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
            }
            @keyframes slideIn {
              from { opacity: 0; transform: translateX(-20px); }
              to { opacity: 1; transform: translateX(0); }
            }
          `
        }} />
      </div>

      {/* Sağ taraf - Form (orijinal mantık korundu, sadece stil değişti) */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3 lg:hidden">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Folder className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  CloudDrive
                </span>
              </div>
              <button
                onClick={() => {
                  setDarkMode(!darkMode);
                  onDarkModeToggle?.(!darkMode);
                }}
                className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                aria-label="Toggle dark mode"
              >
                {darkMode ? 
                  <Sun className="w-5 h-5 text-amber-500" /> : 
                  <Moon className="w-5 h-5 text-slate-600" />
                }
              </button>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
              {isSignUp ? 'Hesap Oluşturun' : 'Hoş Geldiniz'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {isSignUp ? 'Bulut depolama alanınızı oluşturun' : 'Hesabınıza giriş yapın'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on">
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Ad Soyad
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                  placeholder="Adınızı ve soyadınızı giriniz"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                placeholder="ornek@email.com"
                required
              />
            </div>

            <div>
  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
    Şifre
  </label>
  <div className="relative">
    <input
      id="password"
      type={showPassword ? "text" : "password"}
      name="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      autoComplete={isSignUp ? "new-password" : "current-password"}
      className="w-full px-4 py-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl 
                 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                 transition-all duration-200 shadow-sm hover:shadow-md"
      placeholder="••••••••"
      required
      minLength={6}
    />
    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
    >
      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  </div>
</div>


            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl shadow-sm" role="alert">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-4 focus:ring-purple-500/50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{isSignUp ? 'Hesap Oluşturuluyor...' : 'Giriş Yapılıyor...'}</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Hesap Oluştur' : 'Giriş Yap'}</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setEmail('');
                setPassword('');
                setName('');
              }}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-lg px-3 py-2 transition-all duration-200"
            >
              {isSignUp ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Hesap oluşturun'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;