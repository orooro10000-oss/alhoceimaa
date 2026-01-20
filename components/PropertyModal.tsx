import React, { useState, useEffect, useRef } from 'react';
import { Property } from '../types';
import { CATEGORIES, NEIGHBORHOODS, SUGGESTED_TITLES } from '../constants';
import { generateDescription, classifyImage } from '../services/geminiService';
import { X, Sparkles, Loader2, Upload, Trash2, Camera, Minus, Plus, BedDouble, Bath, Armchair, Utensils, Users, Image as ImageIcon, Star, FolderOpen, ArrowDown, Wifi, Tv, Car, Wind, Waves, Snowflake, WashingMachine, Coffee, Mountain, MapPin, Crown, Trophy, Gem, ShieldCheck, Ban } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Property) => void;
  initialData?: Property | null;
}

interface SpaceSection {
    id: string;
    label: string;
    icon: React.ElementType;
}

// Common Amenities List
const AMENITIES_LIST = [
    { id: 'wifi', label: 'واي فاي', icon: Wifi },
    { id: 'tv', label: 'تلفاز', icon: Tv },
    { id: 'kitchen', label: 'مطبخ مجهز', icon: Utensils },
    { id: 'ac', label: 'تكييف', icon: Wind },
    { id: 'parking', label: 'موقف سيارات', icon: Car },
    { id: 'pool', label: 'مسبح', icon: Waves },
    { id: 'washer', label: 'غسالة', icon: WashingMachine }, 
    { id: 'view', label: 'إطلالة', icon: Mountain },
    { id: 'coffee', label: 'آلة قهوة', icon: Coffee },
];

const BADGE_OPTIONS = [
    { id: 'none', label: 'بدون', icon: Ban, color: 'text-gray-400' },
    { id: 'crown', label: 'تاج ذهبي', icon: Crown, color: 'text-yellow-500 fill-yellow-500' },
    { id: 'trophy', label: 'كأس ذهبية', icon: Trophy, color: 'text-yellow-500 fill-yellow-500' },
    { id: 'diamond', label: 'ماسي', icon: Gem, color: 'text-blue-400 fill-blue-400' },
    { id: 'verified', label: 'موثوق', icon: ShieldCheck, color: 'text-blue-600 fill-blue-600' },
];

// Image Compression Helper
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024; // Limit width to 1024px
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Compress to JPEG with 0.7 quality
        resolve(canvas.toDataURL('image/jpeg', 0.7)); 
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const PropertyModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    location: '',
    price: 0,
    category: 'شاطئية',
    description: '',
    images: [],
    imageCategories: {}, // Initialize empty map
    status: 'published',
    rating: 5.0,
    ownerId: 'host_123',
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    livingRooms: 1,
    kitchens: 1,
    amenities: [],
    badge: 'none'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // State for image analysis
  const [isSaving, setIsSaving] = useState(false); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Suggestions State
  const [activeSuggestionField, setActiveSuggestionField] = useState<'title' | 'location' | null>(null);

  const getDraftKey = () => {
    return initialData?.id ? `airhome_draft_edit_${initialData.id}` : 'airhome_draft_new';
  };

  useEffect(() => {
    if (isOpen) {
      let startingData: Partial<Property> = initialData ? { ...initialData } : {
        title: '',
        location: '',
        price: 0,
        category: 'شاطئية',
        description: '',
        images: [],
        imageCategories: {},
        status: 'published',
        rating: 5.0,
        ownerId: 'host_123',
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        livingRooms: 1,
        kitchens: 1,
        amenities: [],
        badge: 'none'
      };

      const draftKey = getDraftKey();
      const draft = localStorage.getItem(draftKey);
      
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          startingData = { ...startingData, ...parsed };
        } catch (e) {
          console.error("Error parsing draft", e);
        }
      }
      
      // Ensure imageCategories exists
      if (!startingData.imageCategories) {
          startingData.imageCategories = {};
          if (startingData.images && startingData.images.length > 0) {
              startingData.images.forEach((img: string, idx: number) => {
                  startingData.imageCategories![img] = idx === 0 ? 'cover' : 'other';
              });
          }
      }
      
      // Ensure amenities array exists
      if (!startingData.amenities) {
          startingData.amenities = [];
      }

      setFormData(startingData);
    }
  }, [initialData, isOpen]);

  // Handle closing suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.suggestion-container')) {
            setActiveSuggestionField(null);
        }
    };
    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Generate dynamic spaces based on room counts
  const getSpaces = (): SpaceSection[] => {
      const spaces: SpaceSection[] = [
          { id: 'cover', label: 'صورة الغلاف', icon: Star },
          { id: 'living', label: 'غرفة المعيشة', icon: Armchair },
      ];

      for (let i = 0; i < (formData.bedrooms || 0); i++) {
          spaces.push({ id: `bedroom_${i + 1}`, label: `غرفة النوم ${i + 1}`, icon: BedDouble });
      }

      for (let i = 0; i < (formData.kitchens || 0); i++) {
          spaces.push({ id: `kitchen_${i + 1}`, label: `المطبخ ${i + 1}`, icon: Utensils });
      }

      for (let i = 0; i < (formData.bathrooms || 0); i++) {
          spaces.push({ id: `bathroom_${i + 1}`, label: `الحمام ${i + 1}`, icon: Bath });
      }

      spaces.push({ id: 'exterior', label: 'الخارج / المرافق', icon: ImageIcon });
      spaces.push({ id: 'other', label: 'صور أخرى / غير مصنف', icon: FolderOpen });

      return spaces;
  };

  const handleBulkUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      setIsAnalyzing(true);
      
      try {
        const base64Images = await Promise.all(files.map(file => compressImage(file)));
        
        // Parallel classification using Gemini
        const classifications = await Promise.all(base64Images.map(img => classifyImage(img)));
        
        setFormData(prev => {
            let newImages = [...(prev.images || [])];
            const newCategories = { ...(prev.imageCategories || {}) };

            base64Images.forEach((img, idx) => {
                newImages.push(img);
                const type = classifications[idx];
                
                // Smart mapping logic
                let category = 'other';
                if (type === 'living') category = 'living';
                else if (type === 'exterior') category = 'exterior';
                else if (type === 'bedroom') category = 'bedroom_1'; // Default to first bedroom
                else if (type === 'kitchen') category = 'kitchen_1'; // Default to first kitchen
                else if (type === 'bathroom') category = 'bathroom_1'; // Default to first bathroom
                
                newCategories[img] = category;
            });

            return {
                ...prev,
                images: newImages,
                imageCategories: newCategories
            };
        });
      } catch (err) {
        console.error("Image processing error:", err);
        alert("حدث خطأ أثناء معالجة الصور.");
      } finally {
        setIsAnalyzing(false);
      }

      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (imageToRemove: string) => {
    setFormData(prev => {
        const newImages = prev.images?.filter(img => img !== imageToRemove) || [];
        const newCategories = { ...(prev.imageCategories || {}) };
        delete newCategories[imageToRemove];
        return { ...prev, images: newImages, imageCategories: newCategories };
    });
  };

  const changeImageCategory = (image: string, newCategory: string) => {
      setFormData(prev => ({
          ...prev,
          imageCategories: {
              ...(prev.imageCategories || {}),
              [image]: newCategory
          }
      }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.title || !formData.location || !formData.category) {
      alert("يرجى ملء العنوان والموقع والفئة أولاً.");
      return;
    }
    setIsGenerating(true);
    
    const desc = await generateDescription(formData.title!, formData.location!, formData.category!);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };
  
  const toggleAmenity = (amenityLabel: string) => {
      setFormData(prev => {
          const current = prev.amenities || [];
          if (current.includes(amenityLabel)) {
              return { ...prev, amenities: current.filter(a => a !== amenityLabel) };
          } else {
              return { ...prev, amenities: [...current, amenityLabel] };
          }
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Validation
    if (!formData.title?.trim()) { alert("يرجى كتابة عنوان العقار"); setIsSaving(false); return; }
    if (!formData.location?.trim()) { alert("يرجى تحديد الموقع"); setIsSaving(false); return; }
    
    let finalImages = [...(formData.images || [])];
    const categories = formData.imageCategories || {};

    finalImages.sort((a, b) => {
        const catA = categories[a];
        const catB = categories[b];
        if (catA === 'cover') return -1;
        if (catB === 'cover') return 1;
        return 0;
    });

    if (finalImages.length === 0) {
        finalImages = [`https://picsum.photos/800/600?random=${Date.now()}`];
    }

    const finalData = {
        ...formData,
        price: 0, // Set price to 0 or remove it from display logic
        rating: Number(formData.rating), 
        images: finalImages,
        id: initialData?.id || Date.now().toString(),
        status: formData.status || 'published',
        badge: formData.badge || 'none'
    }

    try {
        onSave(finalData as Property);
        localStorage.removeItem(getDraftKey());
    } catch (error: any) {
        console.error("Save Error:", error);
        if (error.name === 'QuotaExceededError' || error.message?.includes('quota')) {
            alert("عذراً، مساحة التخزين ممتلئة! الصور تستهلك مساحة كبيرة. يرجى حذف بعض الصور أو العقارات القديمة والمحاولة مرة أخرى.");
        } else {
            alert("حدث خطأ أثناء حفظ العقار. يرجى المحاولة مرة أخرى.");
        }
    } finally {
        setIsSaving(false);
    }
  };

  const handleClose = () => {
    localStorage.removeItem(getDraftKey());
    onClose();
  };

  // Helper for Suggestions Logic
  const filteredTitles = SUGGESTED_TITLES.filter(t => t.toLowerCase().includes((formData.title || '').toLowerCase()));
  const filteredNeighborhoods = NEIGHBORHOODS.filter(n => n.toLowerCase().includes((formData.location || '').toLowerCase()));

  const Counter = ({ label, value, field, icon: Icon }: { label: string, value: number, field: keyof Property, icon: React.ElementType }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
        <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full border border-gray-200 text-gray-600">
                <Icon size={18} />
            </div>
            <span className="font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-center gap-3">
            <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, [field]: Math.max(0, (prev[field] as number || 0) - 1) }))}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:border-black hover:bg-gray-50 disabled:opacity-50 transition"
                disabled={value <= 0}
            >
                <Minus size={14} />
            </button>
            <span className="w-4 text-center font-semibold">{value || 0}</span>
            <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, [field]: (prev[field] as number || 0) + 1 }))}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:border-black hover:bg-gray-50 transition"
            >
                <Plus size={14} />
            </button>
        </div>
    </div>
  );

  const spaces = getSpaces();
  const unsortedSpace = spaces.find(s => s.id === 'other');
  const otherSpaces = spaces.filter(s => s.id !== 'other');
  const displaySpaces = unsortedSpace ? [unsortedSpace, ...otherSpaces] : otherSpaces;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200 border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-20">
          <h2 className="text-xl font-bold">{initialData ? 'تعديل العقار' : 'إضافة عقار جديد'}</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
             <h3 className="text-lg font-bold border-b pb-2">معلومات أساسية</h3>
             
             {/* Badge Selection */}
             <div className="space-y-3 pb-4">
                 <label className="text-sm font-medium text-gray-700 block">شعار مميز للعقار (يظهر في الإعلان)</label>
                 <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {BADGE_OPTIONS.map(opt => (
                        <button
                        type="button"
                        key={opt.id}
                        onClick={() => setFormData(prev => ({ ...prev, badge: opt.id as any }))}
                        className={`flex flex-col items-center justify-center p-3 min-w-[80px] rounded-xl border-2 transition-all ${
                            formData.badge === opt.id 
                            ? 'border-black bg-gray-50 shadow-sm scale-105' 
                            : 'border-gray-100 hover:border-gray-300 bg-white'
                        }`}
                        >
                        <opt.icon className={opt.color} size={24} />
                        <span className="text-[10px] mt-2 font-bold text-gray-600">{opt.label}</span>
                        </button>
                    ))}
                 </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title Input with Suggestions */}
                <div className="space-y-2 relative suggestion-container">
                    <label className="text-sm font-medium text-gray-700">العنوان <span className="text-red-500">*</span></label>
                    <input 
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black outline-none transition"
                        value={formData.title} 
                        onChange={e => setFormData({ ...formData, title: e.target.value })} 
                        onFocus={() => setActiveSuggestionField('title')}
                        placeholder="مثال: فيلا فاخرة على البحر"
                        autoComplete="off"
                    />
                    {activeSuggestionField === 'title' && filteredTitles.length > 0 && (
                        <div className="absolute top-full left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 mt-1 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                             <div className="bg-gray-50 px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider sticky top-0">عناوين مقترحة</div>
                             {filteredTitles.map((title, idx) => (
                                 <div 
                                    key={idx}
                                    onMouseDown={() => {
                                        setFormData(prev => ({ ...prev, title }));
                                        setActiveSuggestionField(null);
                                    }}
                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm text-gray-700 transition-colors"
                                 >
                                    <Sparkles size={14} className="text-yellow-500" />
                                    {title}
                                 </div>
                             ))}
                        </div>
                    )}
                </div>

                {/* Location Input with Suggestions */}
                <div className="space-y-2 relative suggestion-container">
                    <label className="text-sm font-medium text-gray-700">الموقع (الحي) <span className="text-red-500">*</span></label>
                    <input 
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black outline-none transition"
                        value={formData.location} 
                        onChange={e => setFormData({ ...formData, location: e.target.value })} 
                        onFocus={() => setActiveSuggestionField('location')}
                        placeholder="اختر الحي أو المنطقة"
                        autoComplete="off"
                    />
                    {activeSuggestionField === 'location' && filteredNeighborhoods.length > 0 && (
                        <div className="absolute top-full left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 mt-1 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                             <div className="bg-gray-50 px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider sticky top-0">الأحياء المتوفرة</div>
                             {filteredNeighborhoods.map((hood, idx) => (
                                 <div 
                                    key={idx}
                                    onMouseDown={() => {
                                        setFormData(prev => ({ ...prev, location: hood }));
                                        setActiveSuggestionField(null);
                                    }}
                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm text-gray-700 transition-colors"
                                 >
                                    <MapPin size={16} className="text-gray-400" />
                                    {hood}
                                 </div>
                             ))}
                        </div>
                    )}
                </div>
            </div>

             <div className="grid grid-cols-2 gap-6">
                {/* Rating Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">التقييم (0-5)</label>
                    <div className="relative">
                        <input type="number" step="0.1" min="0" max="5" className="w-full bg-white border border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-black outline-none transition"
                            value={formData.rating} onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })} />
                        <Star size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="#9ca3af" />
                    </div>
                </div>

                 <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">الفئة</label>
                    <select className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black outline-none transition"
                        value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                        {CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
                    </select>
                </div>
            </div>
          </div>

          {/* Section 2: Rooms & Spaces */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b pb-2">توزيع الغرف</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Counter label="الضيوف (العدد الأقصى)" value={formData.maxGuests || 0} field="maxGuests" icon={Users} />
                <Counter label="غرف النوم" value={formData.bedrooms || 0} field="bedrooms" icon={BedDouble} />
                <Counter label="غرف الجلوس" value={formData.livingRooms || 0} field="livingRooms" icon={Armchair} />
                <Counter label="المطابخ" value={formData.kitchens || 0} field="kitchens" icon={Utensils} />
                <Counter label="دورات المياه" value={formData.bathrooms || 0} field="bathrooms" icon={Bath} />
            </div>
          </div>
          
          {/* Section 2.5: Amenities (What this place offers) */}
          <div className="space-y-4">
             <h3 className="text-lg font-bold border-b pb-2">ما يقدمه هذا المسكن</h3>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                 {AMENITIES_LIST.map((item) => (
                     <div 
                        key={item.id}
                        onClick={() => toggleAmenity(item.label)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition select-none ${
                            formData.amenities?.includes(item.label) 
                            ? 'bg-black text-white border-black' 
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                     >
                         <item.icon size={20} />
                         <span className="text-sm font-medium">{item.label}</span>
                     </div>
                 ))}
             </div>
          </div>

          {/* Section 3: Photos Manager */}
          <div className="space-y-6">
             <div className="flex justify-between items-center border-b pb-2">
                <div>
                    <h3 className="text-lg font-bold">صور العقار</h3>
                    <p className="text-xs text-gray-500 mt-1">ارفع الصور أولاً ثم قم بتوزيعها على الغرف</p>
                </div>
                <button
                    type="button"
                    onClick={handleBulkUploadClick}
                    disabled={isAnalyzing}
                    className="bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-md"
                >
                    {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {isAnalyzing ? 'جارٍ التحليل...' : 'رفع صور جماعي'}
                </button>
             </div>
             
             <div className="space-y-6">
                {displaySpaces.map((space) => {
                    const SpaceIcon = space.icon;
                    // Filter images belonging to this category
                    // Also handle legacy images that have no category -> treat as 'other'
                    const spaceImages = formData.images?.filter(img => {
                        const cat = formData.imageCategories?.[img];
                        if (space.id === 'other') {
                            return cat === 'other' || !cat || !spaces.some(s => s.id === cat);
                        }
                        return cat === space.id;
                    }) || [];

                    // Don't show empty sections except "Other/Unsorted" if it has upload prompt
                    if (space.id !== 'other' && spaceImages.length === 0) return null;

                    return (
                        <div key={space.id} className={`rounded-xl border p-4 transition ${space.id === 'other' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className={`p-2 rounded-full ${space.id === 'cover' ? 'bg-yellow-100 text-yellow-600' : 'bg-white border text-gray-600'}`}>
                                    <SpaceIcon size={18} />
                                </div>
                                <span className="font-bold text-gray-800">{space.label}</span>
                                <span className="text-xs font-mono bg-white border px-2 py-0.5 rounded text-gray-500">{spaceImages.length}</span>
                            </div>

                            {space.id === 'other' && spaceImages.length === 0 && (
                                <div 
                                    onClick={handleBulkUploadClick}
                                    className="border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-lg p-8 flex flex-col items-center justify-center text-blue-400 cursor-pointer hover:bg-blue-100/50 transition"
                                >
                                    <Camera size={32} className="mb-2 opacity-50" />
                                    <span className="text-sm font-medium">اضغط لرفع الصور هنا</span>
                                    <span className="text-xs opacity-70 mt-1">يمكنك رفع صور متعددة دفعة واحدة</span>
                                </div>
                            )}

                            {spaceImages.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                    {spaceImages.map((img, idx) => (
                                        <div key={idx} className="flex flex-col gap-2">
                                            <div className="relative aspect-square rounded-lg overflow-hidden group border bg-white shadow-sm">
                                                <img src={img} alt={space.label} className="w-full h-full object-cover" />
                                                <button 
                                                    type="button"
                                                    onClick={() => removeImage(img)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                                {space.id === 'cover' && idx === 0 && (
                                                    <div className="absolute bottom-0 w-full bg-yellow-500 text-white text-[10px] py-1 text-center font-bold">
                                                        الغلاف الرئيسي
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Dropdown to distribute image */}
                                            <div className="relative">
                                                <select
                                                    value={space.id}
                                                    onChange={(e) => changeImageCategory(img, e.target.value)}
                                                    className="w-full appearance-none text-xs border border-gray-300 rounded bg-white py-1.5 px-2 pr-6 focus:ring-1 focus:ring-black outline-none cursor-pointer hover:border-gray-400"
                                                >
                                                    {spaces.map(s => (
                                                        <option key={s.id} value={s.id}>{s.label}</option>
                                                    ))}
                                                </select>
                                                <ArrowDown size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
             </div>
             
             {/* Hidden File Input */}
             <input 
                 ref={fileInputRef}
                 type="file" 
                 multiple 
                 accept="image/*" 
                 className="hidden" 
                 onChange={handleFileChange} 
             />
          </div>

          {/* Section 4: Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold border-b pb-2">عن هذا المكان</h3>
            <div className="flex justify-between items-center mt-2">
              <label className="text-sm font-medium text-gray-700">وصف العقار <span className="text-red-500">*</span></label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGenerating}
                className="text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                توليد بالذكاء الاصطناعي
              </button>
            </div>
            <p className="text-xs text-gray-500">يمكنك تعديل النص أدناه بعد التوليد.</p>
            <textarea
              rows={4}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black outline-none transition resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="اكتب وصفاً جذاباً للعقار..."
            />
          </div>
          
           {/* Status Toggle */}
           <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="status"
                    className="sr-only peer"
                    checked={formData.status === 'published'}
                    onChange={e => setFormData({...formData, status: e.target.checked ? 'published' : 'hidden'})}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </div>
              <label htmlFor="status" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                 {formData.status === 'published' ? 'العقار منشور (يظهر للجميع)' : 'العقار مخفي (مسودة)'}
              </label>
           </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <button type="button" onClick={handleClose} className="px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">إلغاء</button>
            <button 
                type="submit" 
                disabled={isSaving}
                className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition shadow-lg shadow-gray-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              {initialData ? 'حفظ التعديلات' : 'نشر العقار'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyModal;