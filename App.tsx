import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PropertyDetails from './pages/PropertyDetails';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-24 pb-24 md:pb-16 px-4 sm:px-8 max-w-[1440px] mx-auto w-full">
        {children}
      </main>
      <footer className="border-t-2 border-gray-50 py-12 bg-white hidden md:block">
        <div className="max-w-[1440px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
                    <svg viewBox="0 0 32 32" fill="white" className="h-5 w-5 block">
                        <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 3.162.723 4.691-.263 2.156-1.528 3.991-3.69 5.093-1.638.835-3.328 1.104-5.063.805-1.554-.268-2.936-1.047-4.135-2.336l-.364-.413-.364.413c-1.199 1.289-2.581 2.068-4.135 2.336-1.735.299-3.425.03-5.063-.805-2.162-1.102-3.427-2.937-3.691-5.093-.187-1.529.056-3.1.723-4.691l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.239 0-2.053.539-2.987 2.211l-.523 1.008c-1.926 3.776-6.06 12.43-7.031 14.692l-.345.836c-2.227 5.672 2.138 9.389 5.926 7.749 1.488-.644 2.219-2.278 2.618-4.223l.164-.897h4.358l.164.897c.399 1.945 1.13 3.579 2.618 4.223 3.791 1.643 8.151-2.074 5.926-7.749l-.345-.836c-.971-2.262-5.105-10.916-7.031-14.692l-.523-1.008C18.053 3.539 17.239 3 16 3zm0 14h-3.465l1.096-5.341c.219-1.071.93-1.659 2.369-1.659s2.15.588 2.369 1.659l1.096 5.341H16z"></path>
                    </svg>
                </div>
                <span className="font-black uppercase tracking-tighter text-xl">airhome</span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">© 2024 AirHome Network Infrastructure.</p>
          </div>
          <div className="flex gap-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black cursor-pointer transition-colors">Privacy / الخصوصية</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black cursor-pointer transition-colors">Terms / الشروط</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black cursor-pointer transition-colors">Sitemap / خريطة الموقع</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors />
      <HashRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
