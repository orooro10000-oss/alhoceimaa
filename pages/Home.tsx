import React, { useState, useEffect, useMemo } from 'react';
import { CATEGORIES, NEIGHBORHOODS } from '../constants';
import { PropertyService } from '../services/storage';
import { Property } from '../types';
import PropertyCard from '../components/PropertyCard';
import { Trees, Umbrella, Mountain, Castle, Tent, Home as HomeIcon, Building2, Snowflake, Flame, Waves, Sun, XCircle, Tag, ArrowRight, ChevronLeft, MapPin } from "lucide-react";
import { useSearchParams } from 'react-router-dom';

// Helper to map string to icon component
const IconMap: Record<string, React.ElementType> = {
  Trees, Umbrella, Mountain, Castle, Tent, Home: HomeIcon, Building2, Snowflake, Flame, Waves, Sun
};

const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [properties, setProperties] = useState<Property[]>([]);
  
  // State for "Drill Down" view (Specific Neighborhood)
  const [activeNeighborhood, setActiveNeighborhood] = useState<string | null>(null);

  useEffect(() => {
    // Load only published properties for guests
    const data = PropertyService.getPublished();
    setProperties(data);
  }, []);

  // Filter Categories: Only show categories that have active properties
  const activeCategories = useMemo(() => {
    const existingCategories = new Set(properties.map(p => p.category));
    return CATEGORIES.filter(cat => existingCategories.has(cat.label));
  }, [properties]);

  // Filter Logic (Category & Search Term)
  const getFilteredProperties = (baseList: Property[]) => {
    let filtered = baseList;

    if (selectedCategory) {
        filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(p => 
            p.location.toLowerCase().includes(lowerTerm) || 
            p.title.toLowerCase().includes(lowerTerm) || 
            p.description.toLowerCase().includes(lowerTerm)
        );
    }
    return filtered;
  };

  const filteredGlobalProperties = useMemo(() => getFilteredProperties(properties), [properties, selectedCategory, searchTerm]);

  const clearSearch = () => {
      setSearchParams({});
      setActiveNeighborhood(null);
  };

  // Group properties by Neighborhood strictly based on NEIGHBORHOODS constant order
  const sections = useMemo(() => {
    const grouped: { title: string; items: Property[] }[] = [];
    const usedPropertyIds = new Set<string>();
    
    // 1. Iterate through the strict list of NEIGHBORHOODS to maintain vertical order
    NEIGHBORHOODS.forEach(hood => {
        // Prepare keywords: "ميرادور (Mirador)" -> ["ميرادور", "Mirador"]
        const keywords = hood.split(/[\(\)]/).map(s => s.trim()).filter(s => s.length > 0);

        const matches = filteredGlobalProperties.filter(p => {
            const loc = p.location.toLowerCase();
            // Check if property location contains ANY of the keywords
            return keywords.some(k => loc.includes(k.toLowerCase()));
        });

        if (matches.length > 0) {
            grouped.push({ title: hood, items: matches });
            matches.forEach(p => usedPropertyIds.add(p.id));
        }
    });

    // 2. Catch-all for properties that don't match strict neighborhood names
    const others = filteredGlobalProperties.filter(p => !usedPropertyIds.has(p.id));
    if (others.length > 0) {
        grouped.push({ title: 'أماكن أخرى مميزة', items: others });
    }
    
    return grouped;
  }, [filteredGlobalProperties]);

  // --- View: Specific Neighborhood (Vertical Feed Layout) ---
  // This triggers when user clicks "See All" or the neighborhood title
  if (activeNeighborhood) {
      // Find the specific section properties
      const section = sections.find(s => s.title === activeNeighborhood);
      const neighborhoodProps = section ? section.items : [];
      
      return (
          <div className="pb-20 min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Sticky Header for Neighborhood View */}
              <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md py-4 mb-6 border-b border-gray-100 -mx-4 px-4 sm:mx-0 sm:px-0">
                  <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setActiveNeighborhood(null)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-gray-200 group"
                    >
                        <ArrowRight size={20} className="text-gray-600 group-hover:text-black" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{activeNeighborhood}</h1>
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                            {neighborhoodProps.length} أماكن للإقامة
                        </p>
                    </div>
                  </div>
              </div>

              {/* Full Width Vertical Feed View (1 Column on Mobile, Grid on Desktop) */}
              <div className="flex flex-col gap-10 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
                  {neighborhoodProps.map((property, index) => (
                      <div key={property.id} className="w-full">
                          <PropertyCard property={property} index={index} />
                      </div>
                  ))}
              </div>
          </div>
      );
  }

  // --- View: Main Home (Vertical Sections) ---
  return (
    <div className="space-y-6 pb-20 relative min-h-screen">
      
      {/* Category Filter Bar - Sticky */}
      <div className="sticky top-16 md:top-20 bg-white/95 backdrop-blur-md z-30 pt-4 pb-2 -mx-4 px-4 sm:px-8 sm:-mx-8 border-b border-gray-100/50 shadow-sm transition-all duration-300">
        {/* Search Result Banner */}
        {searchTerm && (
            <div className="mb-4 flex items-center justify-between bg-black text-white px-6 py-3 rounded-xl shadow-xl animate-in slide-in-from-top-4 duration-500">
                <span className="font-medium text-sm md:text-base">
                    نتائج البحث عن: <span className="font-bold underline text-yellow-400">{searchTerm}</span>
                </span>
                <button 
                    onClick={clearSearch} 
                    className="flex items-center gap-1 hover:bg-white/20 px-2 py-1 rounded transition text-sm"
                >
                    <XCircle size={16} />
                    <span className="hidden sm:inline">إلغاء</span>
                </button>
            </div>
        )}

        <div className="flex items-center gap-6 md:gap-8 overflow-x-auto no-scrollbar pb-2">
            <button
                onClick={() => setSelectedCategory('')}
                className={`flex flex-col items-center gap-2 min-w-[64px] cursor-pointer group transition-all duration-300 ${selectedCategory === '' ? 'text-black border-b-2 border-black scale-105' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg p-1 hover:-translate-y-1'}`}
            >
                <div className="text-2xl drop-shadow-sm transition-transform group-hover:scale-110">🏠</div>
                <span className="text-xs font-bold whitespace-nowrap pb-1">الكل</span>
            </button>
            {activeCategories.map((cat, idx) => {
                const Icon = IconMap[cat.icon] || HomeIcon;
                const isSelected = selectedCategory === cat.label;
                return (
                <button
                    key={cat.label}
                    onClick={() => setSelectedCategory(cat.label)}
                    style={{ transitionDelay: `${idx * 50}ms` }}
                    className={`flex flex-col items-center gap-2 min-w-[64px] cursor-pointer group transition-all duration-300 ${
                    isSelected 
                        ? 'text-black opacity-100 border-b-2 border-black scale-105' 
                        : 'text-gray-500 opacity-70 hover:opacity-100 hover:bg-gray-50 rounded-lg p-1 hover:-translate-y-1'
                    }`}
                >
                    <Icon size={24} strokeWidth={isSelected ? 2.5 : 1.5} className="drop-shadow-sm transition-transform group-hover:scale-110" />
                    <span className={`text-xs font-medium whitespace-nowrap pb-1 ${isSelected ? 'font-bold' : ''}`}>
                    {cat.label}
                    </span>
                </button>
                );
            })}
        </div>
      </div>

      {/* Main Content: Vertical Sections of Neighborhoods */}
      {sections.length === 0 ? (
          <div className="text-center py-20 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-6xl mb-4 grayscale opacity-50">🏠</div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">لا توجد نتائج</h2>
            <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm 
                    ? `لا توجد بيوت متاحة في "${searchTerm}" حالياً. حاول البحث في منطقة أخرى.` 
                    : 'لم نجد أي عقارات متاحة حالياً. تأكد من إضافة عقارات ونشرها من لوحة التحكم.'}
            </p>
            {(selectedCategory || searchTerm) && (
                <button 
                    onClick={() => {
                        setSelectedCategory('');
                        clearSearch();
                    }}
                    className="mt-6 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 hover:scale-105 transition-all shadow-lg active:scale-95"
                >
                    عرض كل العقارات
                </button>
            )}
          </div>
      ) : (
          <div className="space-y-12 pb-8">
              {sections.map((section, sectionIdx) => (
                  <div key={section.title} className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${sectionIdx * 0.1}s` }}>
                      
                      {/* 1. Section Header: Clearly separates "Mirador" from others */}
                      <div 
                        className="flex items-center justify-between px-1 cursor-pointer group"
                        onClick={() => setActiveNeighborhood(section.title)}
                      >
                          <div>
                            <h2 className="text-lg md:text-2xl font-bold text-gray-900 group-hover:text-[#FF385C] transition-colors flex items-center gap-2">
                                {section.title}
                                <ChevronLeft size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-[#FF385C]" />
                            </h2>
                            <p className="text-xs md:text-sm text-gray-500 font-medium">
                                {section.title === 'أماكن أخرى مميزة' ? 'اكتشف المزيد' : `بيوت في ${section.title.split('(')[0].trim()}`}
                            </p>
                          </div>
                          
                          {/* "See All" Button */}
                          <button className="text-xs md:text-sm font-semibold underline decoration-gray-300 hover:text-[#FF385C] transition flex items-center gap-1">
                              عرض الكل 
                              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md text-[10px]">{section.items.length}</span>
                          </button>
                      </div>

                      {/* 2. Horizontal List: Reduced Card Width for "Ad near Ad" effect (160px min-width) */}
                      <div className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4 sm:px-0 sm:mx-0 no-scrollbar snap-x snap-mandatory scroll-pl-4">
                          {section.items.map((property, idx) => (
                              <div 
                                key={property.id} 
                                className="min-w-[160px] sm:min-w-[200px] md:min-w-[240px] snap-center"
                              >
                                  <PropertyCard property={property} index={idx} />
                              </div>
                          ))}
                          
                          {/* "See More" Card at the end of the strip */}
                          <div className="min-w-[100px] sm:min-w-[140px] flex items-center justify-center snap-center">
                              <button 
                                onClick={() => setActiveNeighborhood(section.title)}
                                className="group flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#FF385C] hover:bg-rose-50 transition-all duration-300 w-full h-[70%]"
                              >
                                  <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center transition-colors shadow-sm group-hover:shadow-md">
                                      <ArrowRight size={20} className="text-gray-400 group-hover:text-[#FF385C]" />
                                  </div>
                                  <span className="font-bold text-gray-400 group-hover:text-[#FF385C] text-center text-xs">المزيد</span>
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* Floating Price Notification */}
      <div className="fixed bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-12 fade-in duration-1000 pointer-events-none delay-1000">
         <div className="bg-[#222222] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 pointer-events-auto cursor-pointer hover:scale-105 hover:bg-black transition-all group border border-white/10 backdrop-blur-md">
             <span className="text-xs md:text-sm font-semibold tracking-wide">الأسعار شاملة جميع الرسوم</span>
             <Tag size={14} className="fill-white text-white rotate-90 group-hover:rotate-45 transition-transform duration-300" />
         </div>
      </div>

    </div>
  );
};

export default Home;