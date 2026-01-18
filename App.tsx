import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PropertyDetails from './pages/PropertyDetails';
import { useEffect } from 'react';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-20 md:pb-12 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
      <footer className="border-t py-6 text-center text-sm text-gray-500 bg-gray-50 hidden md:block">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2024 AirHome, Inc.</p>
          <div className="flex gap-4">
            <span>الخصوصية</span>
            <span>الشروط</span>
            <span>خريطة الموقع</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
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
  );
};

export default App;