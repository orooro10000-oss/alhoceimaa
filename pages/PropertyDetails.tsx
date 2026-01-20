import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PropertyService, BookingService } from '../services/storage';
import { Property, Booking } from '../types';
import { Calendar } from '../components/Calendar';
import { Star, MapPin, Share, Heart, ChevronLeft, ChevronRight, ArrowRight, X, BedDouble, Bath, Armchair, Utensils, AlertCircle, CheckCircle2, Phone, MessageCircle, ArrowDown, Wifi, Tv, Car, Wind, Waves, Coffee, Mountain, CalendarDays, Users } from 'lucide-react';
import { HOST_PHONE_NUMBER } from '../constants';

// --- Improved Booking Form Component ---
interface BookingFormProps {
    startDate: string;
    endDate: string;
    guests: number;
    guestName: string;
    guestPhone: string;
    maxGuests: number;
    bookings: Booking[];
    showCalendar: boolean;
    activeField: 'date' | 'guests' | 'name' | 'phone' | null;
    showInlineCalendar: boolean;
    onDateChange: (start: string, end: string) => void;
    onGuestsChange: (val: number) => void;
    onNameChange: (val: string) => void;
    onPhoneChange: (val: string) => void;
    onToggleCalendar: () => void;
    onSetActiveField: (field: 'date' | 'guests' | 'name' | 'phone' | null) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
    startDate, endDate, guests, guestName, guestPhone, maxGuests,
    bookings, showCalendar, activeField, showInlineCalendar,
    onDateChange, onGuestsChange, onNameChange, onPhoneChange,
    onToggleCalendar, onSetActiveField
}) => {
    return (
        <div className="space-y-4">
            {/* Premium Date Picker Container */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm ring-1 ring-gray-100">
                <div 
                    className="grid grid-cols-2 relative bg-white"
                    onClick={() => {
                        onToggleCalendar();
                        onSetActiveField('date');
                    }}
                >
                    <div className={`p-4 border-l border-gray-200 cursor-pointer transition-colors relative group ${activeField === 'date' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <CalendarDays size={14} className="text-gray-500" />
                            <label className="text-[10px] font-bold uppercase text-gray-600 tracking-wider">الوصول</label>
                        </div>
                        <div className={`text-sm font-semibold truncate ${startDate ? 'text-gray-900' : 'text-gray-400'}`}>
                            {startDate || 'يوم/شهر/سنة'}
                        </div>
                    </div>
                    <div className={`p-4 cursor-pointer transition-colors relative group ${activeField === 'date' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                         <div className="flex items-center gap-2 mb-1">
                            <CalendarDays size={14} className="text-gray-500" />
                            <label className="text-[10px] font-bold uppercase text-gray-600 tracking-wider">المغادرة</label>
                        </div>
                        <div className={`text-sm font-semibold truncate ${endDate ? 'text-gray-900' : 'text-gray-400'}`}>
                            {endDate || 'يوم/شهر/سنة'}
                        </div>
                    </div>
                </div>

                {/* Guests Dropdown */}
                <div className="border-t border-gray-200 bg-white relative">
                    <div className="p-4 hover:bg-gray-50 transition cursor-pointer flex justify-between items-center group">
                        <div className="w-full">
                            <div className="flex items-center gap-2 mb-1">
                                <Users size={14} className="text-gray-500" />
                                <label className="text-[10px] font-bold uppercase text-gray-600 tracking-wider">الضيوف</label>
                            </div>
                            <select 
                                value={guests}
                                onChange={(e) => onGuestsChange(Number(e.target.value))}
                                className="w-full bg-transparent outline-none text-sm font-semibold text-gray-900 cursor-pointer appearance-none"
                            >
                                {[...Array(maxGuests || 1)].map((_, i) => (
                                    <option key={i} value={i + 1}>{i + 1} ضيف</option>
                                ))}
                            </select>
                        </div>
                        <ArrowDown size={16} className="text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-gray-600 transition-colors" />
                    </div>
                </div>
            </div>

            {/* Input Fields with Floating Labels */}
            <div className="space-y-3">
                <div className="relative group">
                    <input
                        type="text"
                        id="guestName"
                        className="block px-4 pb-2.5 pt-5 w-full text-sm text-gray-900 bg-gray-50 rounded-xl border border-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-black focus:bg-white focus:border-transparent peer transition-all"
                        placeholder=" "
                        value={guestName}
                        onChange={(e) => onNameChange(e.target.value)}
                        onFocus={() => onSetActiveField('name')}
                        autoComplete="name"
                    />
                    <label 
                        htmlFor="guestName"
                        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[100%] right-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:origin-[100%] bg-transparent pointer-events-none"
                    >
                        الاسم الكامل
                    </label>
                </div>

                <div className="relative group">
                    <input
                        type="tel"
                        id="guestPhone"
                        className="block px-4 pb-2.5 pt-5 w-full text-sm text-gray-900 bg-gray-50 rounded-xl border border-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-black focus:bg-white focus:border-transparent peer transition-all"
                        placeholder=" "
                        value={guestPhone}
                        onChange={(e) => onPhoneChange(e.target.value)}
                        onFocus={() => onSetActiveField('phone')}
                        autoComplete="tel"
                    />
                    <label 
                        htmlFor="guestPhone"
                        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[100%] right-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:origin-[100%] bg-transparent pointer-events-none"
                    >
                        رقم الهاتف
                    </label>
                </div>
            </div>

            {/* Inline Calendar for Mobile */}
            {showInlineCalendar && showCalendar && (
                <div className="w-full mb-4 border border-gray-100 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 shadow-lg">
                    <Calendar 
                        bookings={bookings}
                        selectedStart={startDate}
                        selectedEnd={endDate}
                        onChange={onDateChange}
                    />
                </div>
            )}
        </div>
    );
};

// --- Main Component ---
const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | undefined>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Booking State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [guestName, setGuestName] = useState(''); 
  const [guestPhone, setGuestPhone] = useState(''); 
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeField, setActiveField] = useState<'date' | 'guests' | 'name' | 'phone' | null>(null);
  
  // Mobile Booking Sheet State
  const [isMobileBookingOpen, setIsMobileBookingOpen] = useState(false);

  // Drag State
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);

  useEffect(() => {
    if (id) {
      const data = PropertyService.getById(id);
      setProperty(data);
      // Load existing bookings for availability check
      const bookings = BookingService.getByProperty(id);
      setExistingBookings(bookings);
    }
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, property, currentImageIndex]);

  // Close calendar if clicked outside - IMPROVED with Class Check
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        // Check if click is inside any booking calendar wrapper (supports multiple instances)
        if (!target.closest('.booking-calendar-wrapper')) {
            setShowCalendar(false);
            setActiveField(null);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Booking Logic ---
  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays > 0 ? diffDays : 0;
  };

  const nights = calculateNights();
  
  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setBookingStatus('idle');
    if (start && end) {
        setShowCalendar(false); // Close calendar when range selected
        setActiveField(null);
    }
  };

  const handleBookNow = () => {
    // Validate Dates
    if (!startDate || !endDate) {
        setBookingStatus('error');
        setErrorMessage('يرجى اختيار تواريخ الوصول والمغادرة');
        return;
    }

    // Validate Contact Info
    if (!guestName.trim()) {
        setBookingStatus('error');
        setErrorMessage('يرجى إدخال الاسم الكامل');
        return;
    }

    if (!guestPhone.trim() || guestPhone.length < 8) {
        setBookingStatus('error');
        setErrorMessage('يرجى إدخال رقم هاتف صحيح');
        return;
    }

    if (!property) return;

    // Check validity
    if (new Date(startDate) >= new Date(endDate)) {
        setBookingStatus('error');
        setErrorMessage('تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول');
        return;
    }

    // Check Availability using Service (Double Check)
    const isAvailable = BookingService.isRangeAvailable(property.id, startDate, endDate);

    if (!isAvailable) {
        setBookingStatus('error');
        setErrorMessage('عذراً، هذه التواريخ محجوزة مسبقاً.');
        return;
    }

    // Create Booking
    const newBooking: Booking = {
        id: Date.now().toString(),
        propertyId: property.id,
        propertyTitle: property.title,
        guestId: 'guest_user',
        guestName: guestName, 
        guestPhone: guestPhone,
        startDate,
        endDate,
        totalPrice: 0, // No price calculation
        status: 'pending', // Pending approval
        createdAt: Date.now()
    };

    const success = BookingService.create(newBooking);
    
    if (success) {
        setBookingStatus('success');
        setExistingBookings(BookingService.getByProperty(property.id));
        
        // Prepare WhatsApp Message - Professional & Pure Arabic
        let message = `
✨ *طلب حجز جديد* ✨

السلام عليكم، أرغب بحجز عقاركم المميز:
🏠 *${property.title}*

📋 *تفاصيل الحجز:*
👤 الضيف: ${guestName}
📱 الهاتف: ${guestPhone}
📅 الوصول: ${startDate}
📅 المغادرة: ${endDate}
🌙 المدة: ${nights} ليالٍ
👥 العدد: ${guests} ضيوف
`.trim();

        message += `\n\nبانتظار تأكيدكم لمعرفة السعر والتفاصيل، شكراً جزيلاً.`;

        const cleanPhone = HOST_PHONE_NUMBER.replace(/^00/, '').replace(/^\+/, '');
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');

        // Reset fields
        setStartDate('');
        setEndDate('');
        setGuestName('');
        setGuestPhone('');
        setIsMobileBookingOpen(false); 

    } else {
        setBookingStatus('error');
        setErrorMessage('حدث خطأ أثناء الحجز.');
    }
  };

  const handleContactWhatsApp = () => {
      const message = `السلام عليكم، بخصوص العقار: ${property?.title || ''}...`;
      const cleanPhone = HOST_PHONE_NUMBER.replace(/^00/, '').replace(/^\+/, '');
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCallHost = () => {
      window.location.href = `tel:${HOST_PHONE_NUMBER}`;
  };

  // --- Image Slider Logic ---
  const images = property?.images && property.images.length > 0 
    ? property.images 
    : ['https://picsum.photos/800/600'];

  const getCategoryLabel = (imgUrl: string) => {
    if (!property?.imageCategories) return '';
    const catCode = property.imageCategories[imgUrl];
    if (!catCode) return '';
    if (catCode === 'cover') return 'صورة الغلاف';
    if (catCode === 'living') return 'غرفة المعيشة';
    if (catCode === 'exterior') return 'الخارج / المرافق';
    if (catCode.startsWith('bedroom_')) {
        const num = catCode.split('_')[1];
        return `غرفة النوم ${num}`;
    }
    if (catCode.startsWith('kitchen_')) {
        const num = catCode.split('_')[1];
        return `المطبخ ${num}`;
    }
    if (catCode.startsWith('bathroom_')) {
        const num = catCode.split('_')[1];
        return `الحمام ${num}`;
    }
    return '';
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentImageIndex < images.length - 1) {
        setCurrentImageIndex(prev => prev + 1);
    } else {
        setCurrentImageIndex(0); 
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentImageIndex > 0) {
        setCurrentImageIndex(prev => prev - 1);
    } else {
        setCurrentImageIndex(images.length - 1); 
    }
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
    setCurrentTranslate(0);
    setIsDragging(false);
  };

  const getPositionX = (event: React.MouseEvent | React.TouchEvent) => {
    return event.type.includes('mouse') 
      ? (event as React.MouseEvent).pageX 
      : (event as React.TouchEvent).touches[0].clientX;
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    setStartPos(getPositionX(e));
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const currentPosition = getPositionX(e);
    const diff = currentPosition - startPos;
    setCurrentTranslate(diff);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    const movedBy = currentTranslate;
    if (movedBy < -75) nextImage();
    else if (movedBy > 75) prevImage();
    setCurrentTranslate(0);
  };

  // Helper for Amenity Icons
  const getAmenityIcon = (label: string) => {
      if (label.includes('واي فاي')) return Wifi;
      if (label.includes('تلفاز')) return Tv;
      if (label.includes('مطبخ')) return Utensils;
      if (label.includes('تكييف')) return Wind;
      if (label.includes('موقف')) return Car;
      if (label.includes('مسبح')) return Waves;
      if (label.includes('قهوة')) return Coffee;
      if (label.includes('إطلالة')) return Mountain;
      return CheckCircle2; 
  };

  if (!property) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">العقار غير موجود</h2>
        <Link to="/" className="text-black underline">العودة للرئيسية</Link>
      </div>
    );
  }

  // Common Props for both form instances
  const formProps = {
      startDate,
      endDate,
      guests,
      guestName,
      guestPhone,
      maxGuests: property.maxGuests || 2,
      bookings: existingBookings,
      showCalendar,
      activeField,
      onDateChange: handleDateChange,
      onGuestsChange: setGuests,
      onNameChange: setGuestName,
      onPhoneChange: setGuestPhone,
      onToggleCalendar: () => setShowCalendar(!showCalendar),
      onSetActiveField: setActiveField
  };

  return (
    <div className="animate-in fade-in duration-500 pb-28 md:pb-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 md:hidden mb-4 text-gray-800 cursor-pointer" onClick={() => window.history.back()}>
            <ArrowRight size={20} />
            <span className="font-semibold">رجوع</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 hidden md:block">{property.title}</h1>
        <div className="hidden md:flex flex-wrap justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-4 font-medium underline">
             <span className="flex items-center gap-1"><Star size={14} className="fill-black" /> {property.rating} . 5 تعليقات</span>
             <span className="flex items-center gap-1 text-gray-600"><MapPin size={14} /> {property.location}</span>
          </div>
          <div className="flex gap-4">
             <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition underline decoration-1 underline-offset-2"><Share size={16} /> مشاركة</button>
             <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition underline decoration-1 underline-offset-2"><Heart size={16} /> حفظ</button>
          </div>
        </div>
      </div>

      {/* --- Mobile/Tablet Swipeable Slider --- */}
      <div 
        className="md:hidden relative aspect-[4/3] -mx-4 sm:-mx-8 mb-6 overflow-hidden group bg-gray-100 select-none shadow-sm"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={() => isDragging && handleDragEnd()}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
         <div className="w-full h-full" dir="ltr">
            <div 
                className="w-full h-full flex"
                style={{ 
                    transform: `translateX(calc(-${currentImageIndex * 100}% + ${currentTranslate}px))`,
                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                    cursor: isDragging ? 'grabbing' : 'grab'
                }}
            >
            {images.map((img, idx) => (
                <img 
                key={idx}
                src={img} 
                draggable="false"
                alt={`View ${idx}`} 
                className="w-full h-full object-cover flex-shrink-0 pointer-events-none"
                />
            ))}
            </div>
         </div>
         <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-bold tracking-wide pointer-events-none border border-white/10">
            {currentImageIndex + 1} / {images.length}
         </div>
      </div>

      {/* --- Desktop Grid --- */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-8 relative shadow-sm">
        <div className="col-span-2 row-span-2 h-full cursor-pointer relative group" onClick={() => openLightbox(0)}>
           <img src={images[0]} className="w-full h-full object-cover hover:opacity-95 transition duration-500" alt="Main" />
           <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-300"></div>
        </div>
        {images.slice(1, 5).map((img, idx) => (
            <div 
                key={idx + 1} 
                className={`h-full cursor-pointer relative group ${idx === 1 ? 'rounded-tr-2xl' : ''} ${idx === 3 ? 'rounded-br-2xl' : ''}`} 
                onClick={() => openLightbox(idx + 1)}
            >
                <img src={img || images[0]} className="w-full h-full object-cover hover:opacity-95 transition duration-500" alt={`Sub ${idx}`} />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-300"></div>
            </div>
        ))}
      </div>

      {/* --- LIGHTBOX MODAL --- */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 text-white flex flex-col animate-in fade-in duration-300" dir="ltr">
            <div className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
                <button onClick={() => setIsLightboxOpen(false)} className="p-3 hover:bg-white/10 rounded-full transition bg-black/20 backdrop-blur-md">
                  <X size={24} />
                </button>
                <span className="font-semibold text-sm md:text-base tracking-widest opacity-90 uppercase">{currentImageIndex + 1} / {images.length}</span>
                <div className="w-10"></div>
            </div>
            <div className="flex-1 relative overflow-hidden select-none flex flex-col items-center justify-center p-4">
                 <img 
                     src={images[currentImageIndex]} 
                     className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm"
                     alt={`Gallery ${currentImageIndex}`}
                 />
                 <div className="mt-6 text-center">
                     <p className="text-xl font-medium text-white/90">{getCategoryLabel(images[currentImageIndex])}</p>
                 </div>
                 <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-white/20 transition text-white backdrop-blur-md hidden md:flex items-center justify-center border border-white/10">
                     <ChevronLeft size={32} />
                 </button>
                 <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-white/20 transition text-white backdrop-blur-md hidden md:flex items-center justify-center border border-white/10">
                     <ChevronRight size={32} />
                 </button>
            </div>
        </div>
      )}

      {/* Mobile Title */}
      <div className="md:hidden mb-6 px-1">
         <h1 className="text-2xl font-bold mb-2 text-gray-900 leading-tight">{property.title}</h1>
         <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
             <Star size={16} className="fill-black text-black" />
             <span className="font-bold text-black text-base">{property.rating}</span>
             <span className="w-1 h-1 rounded-full bg-gray-400"></span>
             <span className="underline font-medium">{property.location}</span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
           <div className="pb-8 border-b border-gray-100 flex justify-between items-center">
             <div>
                <h2 className="text-xl md:text-2xl font-bold mb-1 text-gray-900">مسكن مستضاف بواسطة HAMZA</h2>
                <div className="flex gap-4 text-sm text-gray-500 mt-2 font-medium">
                    <span>{property.maxGuests || 2} ضيوف</span>
                    <span>•</span>
                    <span>{property.bedrooms || 1} غرف نوم</span>
                    <span>•</span>
                    <span>{property.bathrooms || 1} حمامات</span>
                </div>
             </div>
             <div className="flex gap-3">
                 <button 
                    onClick={handleContactWhatsApp}
                    className="h-12 w-12 rounded-full bg-[#25D366] hover:bg-[#20b85a] text-white flex items-center justify-center transition shadow-lg hover:shadow-green-200 hover:-translate-y-1"
                    title="تواصل واتساب"
                 >
                     <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382C17.175 14.233 15.714 13.515 15.442 13.415C15.169 13.316 14.971 13.267 14.772 13.565C14.575 13.862 14.005 14.531 13.832 14.729C13.659 14.928 13.485 14.952 13.188 14.804C12.891 14.654 11.933 14.341 10.798 13.329C9.915 12.541 9.319 11.568 9.146 11.27C8.973 10.973 9.128 10.812 9.277 10.665C9.411 10.532 9.575 10.318 9.723 10.144C9.872 9.97 9.921 9.846 10.02 9.648C10.12 9.45 10.07 9.276 9.996 9.127C9.921 8.978 9.327 7.516 9.08 6.921C8.832 6.326 8.587 6.406 8.405 6.398C8.232 6.39 8.034 6.388 7.835 6.388C7.637 6.388 7.315 6.462 7.043 6.76C6.771 7.058 6.004 7.777 6.004 9.239C6.004 10.701 7.068 12.114 7.217 12.312C7.365 12.511 9.32 15.526 12.306 16.816C13.016 17.123 13.569 17.306 14.001 17.443C14.816 17.701 15.56 17.668 16.148 17.58C16.802 17.482 18.163 16.756 18.446 15.963C18.729 15.17 18.729 14.499 18.644 14.35C18.559 14.202 18.361 14.128 18.064 13.979H17.472V14.382ZM12.042 24C9.916 24 7.854 23.464 6.027 22.38L6.023 22.378L1.5 23.564L2.686 19.143C1.527 17.226 0.916 15.029 0.916 12.784C0.916 6.647 5.909 1.655 12.046 1.655C15.019 1.656 17.813 2.813 19.914 4.914C22.015 7.016 23.172 9.811 23.172 12.787C23.172 18.924 18.179 24 12.042 24Z" />
                     </svg>
                 </button>
                 <button 
                    onClick={handleCallHost}
                    className="h-12 w-12 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center transition shadow-lg hover:shadow-gray-300 hover:-translate-y-1"
                    title="اتصال هاتفي"
                 >
                     <Phone size={22} />
                 </button>
             </div>
           </div>

           {/* Room Details */}
           <div className="pb-8 border-b border-gray-100">
             <h2 className="text-xl font-bold mb-6">تفاصيل الغرف</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                    { icon: BedDouble, val: property.bedrooms, label: 'غرف نوم' },
                    { icon: Armchair, val: property.livingRooms, label: 'غرف جلوس' },
                    { icon: Utensils, val: property.kitchens, label: 'مطابخ' },
                    { icon: Bath, val: property.bathrooms, label: 'حمامات' }
                 ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center gap-2 border border-gray-100 bg-gray-50/50 rounded-2xl p-4 hover:border-black/10 transition-colors">
                        <item.icon size={28} className="text-gray-700" strokeWidth={1.5} />
                        <div className="text-center">
                            <div className="font-bold text-xl text-gray-900">{item.val || 0}</div>
                            <div className="text-xs text-gray-500 font-medium">{item.label}</div>
                        </div>
                    </div>
                 ))}
             </div>
           </div>
           
           {/* Amenities */}
           {property.amenities && property.amenities.length > 0 && (
               <div className="pb-8 border-b border-gray-100">
                 <h2 className="text-xl font-bold mb-6">ما يقدمه هذا المسكن</h2>
                 <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    {property.amenities.map((amenity, idx) => {
                        const Icon = getAmenityIcon(amenity);
                        return (
                            <div key={idx} className="flex items-center gap-4 text-gray-700">
                                <Icon size={24} className="text-gray-900" strokeWidth={1.5} />
                                <span className="font-medium">{amenity}</span>
                            </div>
                        );
                    })}
                 </div>
               </div>
           )}

           <div className="pb-8 border-b border-gray-100">
             <h2 className="text-xl font-bold mb-4">عن هذا المكان</h2>
             <p className="text-gray-600 leading-relaxed text-lg tracking-wide">
                {property.description}
             </p>
           </div>
           
           {/* Map section removed as per request */}

        </div>

        {/* Desktop Sidebar Booking Card */}
        <div className="hidden lg:block lg:col-span-1 relative">
           <div className="sticky top-28 bg-white border border-gray-200 shadow-[0_6px_16px_rgba(0,0,0,0.12)] rounded-2xl p-6 booking-calendar-wrapper">
              <div className="flex justify-between items-end mb-6">
                 <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-900">تواصل للحجز</span>
                 </div>
                 <div className="flex items-center gap-1 text-sm font-bold text-gray-800">
                    <Star size={14} className="fill-black" /> {property.rating}
                 </div>
              </div>

              {/* Booking Form (Desktop) */}
              <div className="relative mb-4">
                 <BookingForm 
                     {...formProps} 
                     showInlineCalendar={false} 
                 />
                 
                 {/* Desktop Calendar Popover Logic */}
                 {showCalendar && (
                    <div className="absolute top-16 right-0 w-[350px] z-50 mt-2 shadow-2xl rounded-2xl animate-in fade-in slide-in-from-top-2 border border-gray-100 ring-1 ring-black/5 bg-white">
                        <Calendar 
                            bookings={existingBookings}
                            selectedStart={startDate}
                            selectedEnd={endDate}
                            onChange={handleDateChange}
                        />
                    </div>
                 )}
              </div>

              {/* Status Messages */}
              {bookingStatus === 'error' && (
                  <div className="mb-4 p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-start gap-3 border border-red-100 animate-in fade-in">
                      <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                      <span className="font-medium">{errorMessage}</span>
                  </div>
              )}

              {bookingStatus === 'success' ? (
                  <div className="mb-4 p-6 bg-green-50 text-green-800 rounded-xl text-center border border-green-200 animate-in fade-in zoom-in-95">
                      <div className="flex justify-center mb-3"><div className="bg-white p-2 rounded-full border border-green-100"><CheckCircle2 size={32} className="text-green-600" /></div></div>
                      <h3 className="font-bold text-lg mb-1">تم إرسال الطلب!</h3>
                      <p className="text-sm opacity-90">تم تحويلك إلى واتساب لتأكيد الحجز.</p>
                      <button 
                        onClick={() => setBookingStatus('idle')}
                        className="mt-4 text-sm font-bold underline hover:text-green-900"
                      >
                        حجز جديد
                      </button>
                  </div>
              ) : (
                  <>
                    <button 
                        onClick={handleBookNow}
                        className="w-full bg-gradient-to-r from-[#FF385C] to-[#E31C5F] hover:from-[#d9324e] hover:to-[#c0164c] text-white font-bold py-3.5 rounded-xl transition-all mb-4 text-lg active:scale-[0.98] transform shadow-lg shadow-rose-200 flex items-center justify-center gap-2 group"
                    >
                        <span>تأكيد الحجز</span>
                        <div className="w-0 overflow-hidden group-hover:w-5 transition-all duration-300">
                             <ArrowRight size={20} className="rotate-180" />
                        </div>
                    </button>

                    <div className="text-center text-xs font-medium text-gray-500 mb-6 flex items-center justify-center gap-1.5 opacity-80">
                        <MessageCircle size={14} />
                        <span>لن يتم خصم أي مبلغ الآن</span>
                    </div>
                  </>
              )}
           </div>
        </div>
      </div>

      {/* --- Mobile Fixed Bottom Bar (Replaces Floating Island) --- */}
      <div className="fixed bottom-0 left-0 w-full md:hidden z-[100] bg-white border-t border-gray-200 shadow-[0_-5px_15px_rgba(0,0,0,0.08)] pb-safe animate-in slide-in-from-bottom-full duration-500">
          <div className="p-4 flex items-center justify-between">
            <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                    <span className="font-bold text-lg text-gray-900">تواصل للحجز</span>
                </div>
                <button 
                   onClick={() => setIsMobileBookingOpen(true)}
                   className="text-xs font-semibold text-gray-900 underline decoration-gray-300 mt-1 text-right"
                >
                    {startDate ? `${startDate} - ${endDate}` : 'أدخل التواريخ'}
                </button>
            </div>
            <button 
                onClick={() => setIsMobileBookingOpen(true)}
                className="bg-[#FF385C] hover:bg-[#d9324e] text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-rose-100 active:scale-[0.96] transition-transform min-w-[140px]"
            >
                حجز
            </button>
          </div>
      </div>

      {/* --- Mobile Booking Sheet/Modal --- */}
      {isMobileBookingOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileBookingOpen(false)}></div>
              <div className="absolute bottom-0 left-0 w-full bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] overflow-y-auto booking-calendar-wrapper shadow-2xl">
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
                  
                  <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="font-bold text-2xl text-gray-900">إتمام الحجز</h3>
                        <p className="text-gray-500 text-sm mt-1">خطوة واحدة تفصلك عن عطلتك</p>
                      </div>
                      <button onClick={() => setIsMobileBookingOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"><X size={20} /></button>
                  </div>
                  
                  <BookingForm 
                     {...formProps} 
                     showInlineCalendar={true} 
                  />

                  {/* Mobile Booking Action Button */}
                  {bookingStatus === 'success' ? (
                     <div className="mb-4 p-5 bg-green-50 text-green-800 rounded-2xl text-center border border-green-200">
                        <div className="flex justify-center mb-3"><div className="bg-white p-3 rounded-full shadow-sm"><CheckCircle2 size={32} className="text-green-600" /></div></div>
                        <h3 className="font-bold text-lg mb-1">تم إرسال الطلب!</h3>
                        <p className="text-sm opacity-80 mb-4">تواصل مع المضيف عبر واتساب.</p>
                        <button 
                            onClick={() => {
                                setBookingStatus('idle');
                                setIsMobileBookingOpen(false);
                            }}
                            className="w-full py-3 bg-green-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-200 active:scale-95 transition"
                        >
                            إغلاق
                        </button>
                     </div>
                  ) : (
                    <>
                        {bookingStatus === 'error' && (
                            <div className="mb-4 p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-start gap-3 border border-red-100">
                                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                                <span className="font-medium">{errorMessage}</span>
                            </div>
                        )}
                        
                        <button 
                            onClick={handleBookNow}
                            className="w-full bg-gradient-to-r from-[#FF385C] to-[#E31C5F] text-white font-bold py-4 rounded-xl transition-all text-lg shadow-xl shadow-rose-200 active:scale-[0.98]"
                        >
                            تأكيد وإرسال
                        </button>
                    </>
                  )}
              </div>
          </div>
      )}

    </div>
  );
};

export default PropertyDetails;