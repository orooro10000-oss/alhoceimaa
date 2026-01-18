import React, { useState, useEffect, useRef } from 'react';
import { Search, UserCircle, LayoutDashboard, Home, MapPin, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NEIGHBORHOODS } from '../constants';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/dashboard';
  const isPropertyPage = location.pathname.startsWith('/property/');
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  // State for "Owner Mode" visibility
  const [showProfile, setShowProfile] = useState(false);
  
  // Security: Only authorized devices can use the long-press feature
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [secretTapCount, setSecretTapCount] = useState(0);

  // Long press logic variables
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPressing, setIsPressing] = useState(false); // For visual feedback

  useEffect(() => {
    // 1. Check if device is already authorized
    const authorized = localStorage.getItem('airhome_device_authorized') === 'true';
    setIsAuthorized(authorized);

    // 2. If authorized, check if owner mode was left active
    if (authorized) {
        const ownerModeActive = localStorage.getItem('airhome_owner_mode') === 'true';
        setShowProfile(ownerModeActive);
    }
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

  // --- 1. Secret Handshake: Tap "Search" text 5 times to authorize device ---
  const handleSecretTap = (e: React.MouseEvent) => {
      e.stopPropagation();
      
      // If already authorized, no need to count
      if (isAuthorized) return;

      setSecretTapCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 5) {
              // Authorize this device permanently
              localStorage.setItem('airhome_device_authorized', 'true');
              setIsAuthorized(true);
              
              // Enable owner mode immediately
              setShowProfile(true);
              localStorage.setItem('airhome_owner_mode', 'true');
              
              alert("✅ تم تعريف هذا الجهاز كجهاز المالك!\nيمكنك الآن استخدام الضغط المطول على أيقونة المنزل.");
              return 0;
          }
          return newCount;
      });
      // Reset counter if user stops tapping for 1 second
      setTimeout(() => setSecretTapCount(0), 1000);
  };

  // --- 2. Long Press Handler (Works ONLY if authorized) ---
  const handlePressStart = (e: React.TouchEvent | React.MouseEvent) => {
      // Security Check: If not authorized, do nothing (act like normal user)
      if (!isAuthorized) return;

      setIsPressing(true); // Visual feedback

      pressTimer.current = setTimeout(() => {
          // Toggle Owner Mode
          const newState = !showProfile;
          setShowProfile(newState);
          localStorage.setItem('airhome_owner_mode', String(newState));
          
          // Haptic Feedback
          if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
          
          // Visual Feedback
          const msg = newState ? "👁️ وضع المالك: مفعل" : "🙈 وضع المالك: مخفي";
          const toast = document.createElement('div');
          toast.textContent = msg;
          toast.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.8);color:white;padding:15px 25px;border-radius:25px;z-index:9999;font-weight:bold;pointer-events:none;";
          document.body.appendChild(toast);
          setTimeout(() => document.body.removeChild(toast), 2000);
          
          setIsPressing(false);
      }, 2000); // 2 Seconds
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
      <nav className="hidden md:block fixed top-0 w-full z-50 bg-white border-b border-gray-100 h-20 shadow-sm transition-all">
        <div className="max-w-[1440px] mx-auto px-8 h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 flex-shrink-0">
            <svg viewBox="0 0 32 32" fill="#FF385C" className="h-8 w-8 block" aria-label="AirHome logo">
              <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 3.162.723 4.691-.263 2.156-1.528 3.991-3.69 5.093-1.638.835-3.328 1.104-5.063.805-1.554-.268-2.936-1.047-4.135-2.336l-.364-.413-.364.413c-1.199 1.289-2.581 2.068-4.135 2.336-1.735.299-3.425.03-5.063-.805-2.162-1.102-3.427-2.937-3.691-5.093-.187-1.529.056-3.1.723-4.691l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.239 0-2.053.539-2.987 2.211l-.523 1.008c-1.926 3.776-6.06 12.43-7.031 14.692l-.345.836c-2.227 5.672 2.138 9.389 5.926 7.749 1.488-.644 2.219-2.278 2.618-4.223l.164-.897h4.358l.164.897c.399 1.945 1.13 3.579 2.618 4.223 3.791 1.643 8.151-2.074 5.926-7.749l-.345-.836c-.971-2.262-5.105-10.916-7.031-14.692l-.523-1.008C18.053 3.539 17.239 3 16 3zm0 14h-3.465l1.096-5.341c.219-1.071.93-1.659 2.369-1.659s2.15.588 2.369 1.659l1.096 5.341H16z"></path>
            </svg>
            <span className="text-[#FF385C] font-bold text-xl hidden lg:block tracking-tighter">airhome</span>
          </Link>

          {/* Desktop Search Bar */}
          {!isDashboard && (
            <div className={`flex-1 max-w-lg relative transition-all duration-300 ${isSearchOpen ? 'w-full' : ''}`} ref={searchRef}>
               <div 
                 onClick={handleSearchClick}
                 className={`flex items-center justify-between border rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer px-2 py-2 ps-6 bg-white ${isSearchOpen ? 'ring-2 ring-black border-transparent bg-gray-50' : ''}`}
               >
                  <div className="flex-1 text-right overflow-hidden">
                     {isSearchOpen ? (
                         <form onSubmit={handleSearchSubmit} className="flex items-center">
                             <input 
                               type="text" 
                               className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium"
                               placeholder="أين تريد الذهاب؟"
                               value={searchQuery}
                               onChange={(e) => setSearchQuery(e.target.value)}
                               autoFocus
                             />
                             {searchQuery && (
                                <button type="button" onClick={() => setSearchQuery('')} className="p-1 text-gray-400">
                                   <X size={16} />
                                </button>
                             )}
                         </form>
                     ) : (
                         <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800 text-sm">البحث عن البيوت</span>
                         </div>
                     )}
                  </div>
                  
                  <button 
                    onClick={(e) => {
                        if(isSearchOpen) handleSearchSubmit(e);
                    }}
                    className="bg-[#FF385C] p-2.5 rounded-full text-white hover:bg-[#d9324e] transition flex-shrink-0"
                  >
                    <Search size={16} strokeWidth={3} />
                  </button>
               </div>
               
               {/* Search Dropdown (Desktop) */}
               {isSearchOpen && (
                   <div className="absolute top-full left-0 w-full mt-3 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden py-4 animate-in fade-in slide-in-from-top-2">
                       <div className="px-6 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                           أحياء الحسيمة
                       </div>
                       <div className="max-h-[300px] overflow-y-auto">
                          {filteredNeighborhoods.map((hood, idx) => (
                              <div key={idx} onClick={() => handleNeighborhoodSelect(hood)} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 cursor-pointer transition">
                                  <div className="bg-gray-100 p-2.5 rounded-xl text-gray-600"><MapPin size={20} /></div>
                                  <span className="font-medium text-gray-700">{hood}</span>
                              </div>
                          ))}
                       </div>
                   </div>
               )}
            </div>
          )}

          {/* Desktop User Menu */}
          <div className="flex items-center gap-4 flex-shrink-0 justify-end">
            {showProfile && (
                <Link to={isDashboard ? "/" : "/dashboard"} className="text-sm font-semibold hover:bg-gray-100 px-4 py-2 rounded-full transition flex items-center gap-2 group">
                {isDashboard ? <Home size={18} /> : <LayoutDashboard size={18} />}
                <span>{isDashboard ? 'وضع المسافر' : 'وضع المضيف'}</span>
                </Link>
            )}
          </div>
        </div>
      </nav>

      {/* --- Mobile Top Bar --- */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-white pt-4 pb-2 px-4 shadow-sm">
         <div 
           className="w-full bg-white rounded-full shadow-[0_3px_10px_rgb(0,0,0,0.1)] border border-gray-100 h-14 flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
         >
             <div className="flex items-center gap-3 flex-1 h-full justify-center cursor-pointer select-none">
                 <Search size={18} className="text-black" strokeWidth={2.5} onClick={handleSearchClick} />
                 {/* 
                    SECRET TRIGGER: 
                    Tap "البحث عن بيوت" 5 times to authorize this device as Owner Device.
                 */}
                 <span 
                    className="font-semibold text-gray-900 text-sm"
                    onClick={(e) => {
                        handleSearchClick(); // Also open search
                        handleSecretTap(e);  // Count taps
                    }}
                 >
                     البحث عن بيوت
                 </span>
             </div>
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
            <div className={`flex items-center h-16 ${showProfile ? 'justify-around' : 'justify-center'}`}>
                
                {/* 
                    Home Icon:
                    - Normal Click: Go to Home
                    - Long Press (2s): Toggle Owner Mode (ONLY if authorized)
                */}
                <div
                    className="relative"
                    onTouchStart={handlePressStart}
                    onTouchEnd={handlePressEnd}
                    onMouseDown={handlePressStart}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <Link 
                        to="/" 
                        className={`flex flex-col items-center gap-1 min-w-[64px] select-none transition-transform duration-200 ${location.pathname === '/' ? 'text-[#FF385C]' : 'text-gray-500'} ${isPressing ? 'scale-90 opacity-70' : 'scale-100'}`}
                    >
                        <Home size={26} strokeWidth={location.pathname === '/' ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">الرئيسية</span>
                    </Link>
                </div>
                
                {/* Profile/Dashboard Link (Visible only if enabled) */}
                {showProfile && (
                    <Link to="/dashboard" className={`flex flex-col items-center gap-1 min-w-[64px] select-none ${location.pathname === '/dashboard' ? 'text-[#FF385C]' : 'text-gray-500'}`}>
                        <UserCircle size={26} strokeWidth={location.pathname === '/dashboard' ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">الملف</span>
                    </Link>
                )}
            </div>
        </div>
      )}
    </>
  );
};

export default Navbar;