import React, { useState, useEffect, useRef } from 'react';
import { Search, UserCircle, LayoutDashboard, Home, MapPin, X, Lock, Check, ChevronRight, LogOut, LogIn, RefreshCw } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NEIGHBORHOODS } from '../constants';
import { showToast } from '../utils/toast';
import { useAuth } from '../context/AuthContext';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Navbar: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/dashboard';
  const isPropertyPage = location.pathname.startsWith('/property/');
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  // State for "Owner Mode" visibility
  const [showProfile, setShowProfile] = useState(false);
  
  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Long press logic variables
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPressing, setIsPressing] = useState(false); // For visual feedback

  useEffect(() => {
    // Check if owner mode was left active from previous session
    const ownerModeActive = localStorage.getItem('airhome_owner_mode') === 'true';
    setShowProfile(ownerModeActive);
  }, []);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleNeighborhoodSelect = (neighborhood: string) => {
    setSearchQuery(neighborhood);
    navigate(`/?search=${encodeURIComponent(neighborhood)}`);
    setIsSearchOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        navigate(`/?search=${encodeURIComponent(searchQuery)}`);
        setIsSearchOpen(false);
    }
  };

  // --- Auth Logic ---
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showToast('تم تسجيل الدخول بنجاح', 'success');
    } catch (error) {
      console.error('Login error:', error);
      showToast('فشل تسجيل الدخول', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowProfile(false);
      localStorage.setItem('airhome_owner_mode', 'false');
      showToast('تم تسجيل الخروج', 'info');
      if (location.pathname === '/dashboard') navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordInput === 'tharghent001') {
          // Success
          setShowProfile(true);
          localStorage.setItem('airhome_owner_mode', 'true');
          setIsAuthModalOpen(false);
          setPasswordInput('');
          setAuthError('');
          
          showToast('تم تفعيل وضع المدير', 'success');
      } else {
          // Error
          setAuthError('كلمة المرور غير صحيحة');
          // Shake effect logic could go here
      }
  };

  // --- Long Press Handler ---
  const handlePressStart = (e: React.TouchEvent | React.MouseEvent) => {
      setIsPressing(true); // Visual feedback

      pressTimer.current = setTimeout(() => {
          // If already enabled, disable it without password
          if (showProfile) {
            setShowProfile(false);
            localStorage.setItem('airhome_owner_mode', 'false');
            
            showToast('وضع المالك: مخفي', 'info');
            
            // If on dashboard, go home
            if (location.pathname === '/dashboard') navigate('/');
          } else {
            // If disabled, open password modal
            setIsAuthModalOpen(true);
            // Haptic Feedback
            if (navigator.vibrate) navigator.vibrate([50]);
          }
          
          setIsPressing(false);
      }, 1000); // 1 Second Long Press
  };

  const handlePressEnd = () => {
      if (pressTimer.current) {
          clearTimeout(pressTimer.current);
          pressTimer.current = null;
      }
      setIsPressing(false);
  };

  const filteredNeighborhoods = NEIGHBORHOODS.filter(n => 
    n.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* --- Desktop Top Navbar --- */}
      <nav className="hidden md:block fixed top-0 w-full z-50 bg-white border-b border-gray-100 h-20">
        <div className="max-w-[1440px] mx-auto px-8 h-full flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-[#FF385C] rounded-xl flex items-center justify-center text-white">
              <svg viewBox="0 0 32 32" fill="currentColor" className="h-6 w-6 block">
                <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 3.162.723 4.691-.263 2.156-1.528 3.991-3.69 5.093-1.638.835-3.328 1.104-5.063.805-1.554-.268-2.936-1.047-4.135-2.336l-.364-.413-.364.413c-1.199 1.289-2.581 2.068-4.135 2.336-1.735.299-3.425.03-5.063-.805-2.162-1.102-3.427-2.937-3.691-5.093-.187-1.529.056-3.1.723-4.691l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.239 0-2.053.539-2.987 2.211l-.523 1.008c-1.926 3.776-6.06 12.43-7.031 14.692l-.345.836c-2.227 5.672 2.138 9.389 5.926 7.749 1.488-.644 2.219-2.278 2.618-4.223l.164-.897h4.358l.164.897c.399 1.945 1.13 3.579 2.618 4.223 3.791 1.643 8.151-2.074 5.926-7.749l-.345-.836c-.971-2.262-5.105-10.916-7.031-14.692l-.523-1.008C18.053 3.539 17.239 3 16 3zm0 14h-3.465l1.096-5.341c.219-1.071.93-1.659 2.369-1.659s2.15.588 2.369 1.659l1.096 5.341H16z"></path>
              </svg>
            </div>
            <span className="text-[#FF385C] font-bold text-xl tracking-tight">airhome</span>
          </Link>

          {/* Desktop Search Bar */}
          {!isDashboard && (
            <div className="flex-1 max-w-md relative" ref={searchRef}>
               <div 
                 onClick={handleSearchClick}
                 className="flex items-center justify-between border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer px-4 py-2 bg-white"
               >
                  <div className="flex-1 text-right px-2">
                     {isSearchOpen ? (
                         <form onSubmit={handleSearchSubmit} className="flex items-center">
                             <input 
                               type="text" 
                               className="w-full bg-transparent outline-none text-gray-900 text-sm"
                               placeholder="إلى أين؟"
                               value={searchQuery}
                               onChange={(e) => setSearchQuery(e.target.value)}
                               autoFocus
                             />
                         </form>
                     ) : (
                         <span className="text-sm font-medium text-gray-900">البحث عن بيوت</span>
                     )}
                  </div>
                  <div className="bg-[#FF385C] p-2 rounded-full text-white">
                    <Search size={16} strokeWidth={2.5} />
                  </div>
               </div>
               
               {/* Search Dropdown */}
               {isSearchOpen && (
                   <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2">
                       {filteredNeighborhoods.map((hood, idx) => (
                           <div key={idx} onClick={() => handleNeighborhoodSelect(hood)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                               <MapPin size={18} className="text-gray-400" />
                               <span className="text-sm font-medium">{hood}</span>
                           </div>
                       ))}
                   </div>
               )}
            </div>
          )}

          {/* Desktop User Menu */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black"
              title="تحديث الصفحة"
            >
              <RefreshCw size={20} />
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                {showProfile && (
                    <Link to={isDashboard ? "/" : "/dashboard"} className="text-xs font-semibold text-gray-600 hover:text-black transition-colors">
                    {isDashboard ? 'وضع الضيف' : 'وضع المضيف'}
                    </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2 p-1 border border-gray-200 rounded-full hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle size={24} className="text-gray-400" />
                      )}
                    </div>
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 hidden group-hover:block">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="text-xs font-bold truncate">{user.displayName}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-start px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      <span>خروج</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-black text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors"
              >
                دخول
              </button>
            )}
            
             <div
                className="w-2 h-2 rounded-full cursor-pointer opacity-0 hover:opacity-10"
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
            ></div>
          </div>
        </div>
      </nav>

      {/* --- Mobile Top Bar --- */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-white pt-4 pb-2 px-4 shadow-sm">
         <div className="flex items-center gap-2">
            <div 
              className="flex-1 bg-white rounded-full shadow-[0_3px_10px_rgb(0,0,0,0.1)] border border-gray-100 h-14 flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
            >
                <div className="flex items-center gap-3 flex-1 h-full justify-center cursor-pointer select-none">
                    <Search size={18} className="text-black" strokeWidth={2.5} onClick={handleSearchClick} />
                    <span 
                        className="font-semibold text-gray-900 text-sm"
                        onClick={handleSearchClick}
                    >
                        البحث عن بيوت
                    </span>
                </div>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-14 h-14 bg-white rounded-full shadow-[0_3px_10px_rgb(0,0,0,0.1)] border border-gray-100 flex items-center justify-center text-gray-500 active:scale-90 transition-transform"
            >
              <RefreshCw size={20} />
            </button>
         </div>
      </div>

      {/* --- Mobile Search Modal --- */}
      {isSearchOpen && (
          <div className="md:hidden fixed inset-0 z-[100] bg-white animate-in slide-in-from-bottom-5">
              <div className="flex items-center gap-2 p-4 border-b">
                  <button onClick={() => setIsSearchOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button>
                  <input 
                      type="text" 
                      className="flex-1 bg-gray-100 rounded-full py-3 px-4 outline-none text-right"
                      placeholder="إلى أين؟"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                  />
                  <button onClick={(e) => handleSearchSubmit(e)} className="p-3 bg-[#FF385C] text-white rounded-full shadow-md"><Search size={20} /></button>
              </div>
              <div className="p-4">
                  <h3 className="font-bold text-gray-500 text-xs mb-4">الأحياء المقترحة</h3>
                  <div className="space-y-4">
                      {filteredNeighborhoods.map((hood, idx) => (
                          <div key={idx} onClick={() => handleNeighborhoodSelect(hood)} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0">
                              <div className="bg-gray-100 p-3 rounded-lg"><MapPin size={20} /></div>
                              <span className="font-medium">{hood}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* --- Mobile Bottom Navigation Bar --- */}
      {!isPropertyPage && (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-[90] pb-safe safe-area-bottom">
            <div className={`flex items-center h-16 justify-around`}>
                
                <Link 
                    to="/" 
                    className={`flex flex-col items-center gap-1 min-w-[64px] select-none transition-transform duration-200 ${location.pathname === '/' ? 'text-[#FF385C]' : 'text-gray-500'}`}
                >
                    <Home size={26} strokeWidth={location.pathname === '/' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">الرئيسية</span>
                </Link>

                {user ? (
                  <>
                    {showProfile && (
                        <Link to="/dashboard" className={`flex flex-col items-center gap-1 min-w-[64px] select-none ${location.pathname === '/dashboard' ? 'text-[#FF385C]' : 'text-gray-500'}`}>
                            <LayoutDashboard size={26} strokeWidth={location.pathname === '/dashboard' ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">لوحة التحكم</span>
                        </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="flex flex-col items-center gap-1 min-w-[64px] text-gray-500"
                    >
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
                        ) : (
                          <UserCircle size={26} />
                        )}
                        <span className="text-[10px] font-medium">خروج</span>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleLogin}
                    className="flex flex-col items-center gap-1 min-w-[64px] text-gray-500"
                  >
                      <LogIn size={26} />
                      <span className="text-[10px] font-medium">دخول</span>
                  </button>
                )}
                
                {/* Hidden long press trigger on Home icon for mobile too */}
                <div
                    className="absolute inset-0 w-16 h-16 opacity-0"
                    onTouchStart={handlePressStart}
                    onTouchEnd={handlePressEnd}
                    onMouseDown={handlePressStart}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                ></div>
            </div>
        </div>
      )}

      {/* --- Password Authentication Modal --- */}
      {isAuthModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center relative">
                  <button 
                    onClick={() => {
                        setIsAuthModalOpen(false);
                        setPasswordInput('');
                        setAuthError('');
                    }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  >
                      <X size={20} />
                  </button>

                  <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                      <Lock size={28} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">تسجيل دخول المدير</h3>
                  <p className="text-gray-500 mb-6 text-sm">أدخل كلمة المرور للوصول إلى لوحة التحكم.</p>
                  
                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                      <div className="relative">
                          <input 
                             type="password" 
                             className={`w-full bg-gray-50 border ${authError ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-black'} rounded-xl px-4 py-3 outline-none focus:ring-2 transition text-center font-bold tracking-widest`}
                             placeholder="••••••••"
                             value={passwordInput}
                             onChange={(e) => setPasswordInput(e.target.value)}
                             autoFocus
                          />
                      </div>
                      
                      {authError && (
                          <p className="text-red-500 text-xs font-bold animate-pulse">{authError}</p>
                      )}

                      <button 
                         type="submit" 
                         className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition active:scale-95 shadow-lg flex items-center justify-center gap-2"
                      >
                          <span>دخول</span>
                          <ChevronRight size={16} className="rotate-180" />
                      </button>
                  </form>
              </div>
          </div>
      )}
    </>
  );
};

export default Navbar;