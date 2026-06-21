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
    // Subscribe to published properties for guests
    const unsubscribe = PropertyService.subscribeToPublished((data) => {
      setProperties(data);
    });
    return () => unsubscribe();
  }, []);

  // Filter Categories: Only show categories that have active properties
  const activeCategories = useMemo(() => {
    const existingCategories = new Set(properties.map(p => p.category));
    return CATEGORIES.filter(cat => existingCategories.has(cat.label));
  }, [properties]);

  // Filter Logic (Category & Search Term)
  const getFilteredProperties = React.useCallback((baseList: Property[]) => {
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
  }, [selectedCategory, searchTerm]);

  const filteredGlobalProperties = useMemo(() => getFilteredProperties(properties), [properties, getFilteredProperties]);

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
        const keywords = hood.split(/[()]/).map(s => s.trim()).filter(s => s.length > 0);

        const matches = filteredGlobalProperties.filter(p => {
            // Check explicit neighborhood field first
            if (p.neighborhood === hood) return true;
            
            const loc = p.location.toLowerCase();
            const title = p.title.toLowerCase();
            
            // Check if property location or title contains ANY of the keywords
            return keywords.some(k => {
                const lowerK = k.toLowerCase();
                return loc.includes(lowerK) || title.includes(lowerK);
            });
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
    <div className="space-y-12 pb-24">
      
      {/* Hero Section */}
      {!searchTerm && !selectedCategory && (
        <section className="relative h-[400px] md:h-[500px] -mx-4 sm:-mx-8 overflow-hidden rounded-3xl mb-12">
          <img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80" 
            className="w-full h-full object-cover"
            alt="Hero"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-center p-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              اكتشف جمال الشمال
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl font-medium">
              أفضل أماكن الإقامة في الحسيمة ونواحيها، مختارة بعناية لتجربة لا تُنسى.
            </p>
          </div>
        </section>
      )}

      {/* Category Filter Bar */}
      <div className="sticky top-16 md:top-20 bg-white/95 backdrop-blur-sm z-30 py-4 -mx-4 px-4 sm:px-8 sm:-mx-8 border-b border-gray-100">
        {/* Search Result Banner */}
        {(searchTerm || selectedCategory) && (
          <div className="mb-4 flex items-center justify-between bg-black text-white px-4 py-2 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-[#FF385C]" />
              <span className="text-sm font-bold">
                {searchTerm ? `نتائج البحث عن: "${searchTerm}"` : `تصفية حسب: ${selectedCategory}`}
              </span>
            </div>
            <button 
              onClick={clearSearch}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
            <button
                onClick={() => setSelectedCategory('')}
                className={`flex flex-col items-center gap-2 min-w-[60px] cursor-pointer transition-colors ${selectedCategory === '' ? 'text-black' : 'text-gray-500 hover:text-black'}`}
            >
                <HomeIcon size={24} />
                <span className="text-xs font-semibold">الكل</span>
                {selectedCategory === '' && <div className="h-0.5 w-full bg-black mt-1" />}
            </button>
            
            {activeCategories.map((cat) => {
                const Icon = IconMap[cat.icon] || HomeIcon;
                const isSelected = selectedCategory === cat.label;
                return (
                <button
                    key={cat.label}
                    onClick={() => setSelectedCategory(cat.label)}
                    className={`flex flex-col items-center gap-2 min-w-[60px] cursor-pointer transition-colors ${isSelected ? 'text-black' : 'text-gray-500 hover:text-black'}`}
                >
                    <Icon size={24} />
                    <span className="text-xs font-semibold whitespace-nowrap">{cat.label}</span>
                    {isSelected && <div className="h-0.5 w-full bg-black mt-1" />}
                </button>
                );
            })}
        </div>
      </div>

      {/* Main Content */}
      {sections.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-2">لا توجد نتائج</h2>
            <p className="text-gray-500">جرب البحث عن منطقة أخرى أو تصفح جميع العقارات.</p>
            <button 
                onClick={clearSearch}
                className="mt-6 px-6 py-2 bg-black text-white rounded-full font-bold"
            >
                عرض الكل
            </button>
          </div>
      ) : (
          <div className="space-y-16">
              {sections.map((section) => (
                  <div key={section.title} className="space-y-6">
                      <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                          <button 
                            onClick={() => setActiveNeighborhood(section.title)}
                            className="text-sm font-bold text-gray-600 hover:underline flex items-center gap-1"
                          >
                              عرض الكل ({section.items.length})
                              <ArrowRight size={16} className="rotate-180" />
                          </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                          {section.items.slice(0, 6).map((property) => (
                              <div key={property.id} className="w-full">
                                  <PropertyCard property={property} />
                              </div>
                          ))}
                      </div>
                      {section.items.length > 6 && (
                          <div className="flex justify-center pt-4">
                              <button 
                                onClick={() => setActiveNeighborhood(section.title)}
                                className="px-8 py-3 border-2 border-black rounded-full font-bold hover:bg-black hover:text-white transition-all active:scale-95"
                              >
                                  عرض المزيد في {section.title}
                              </button>
                          </div>
                      )}
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default Home;
