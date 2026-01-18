import React, { useState, useRef } from 'react';
import { Property } from '../types';
import { Star, ChevronLeft, ChevronRight, Crown, Trophy, Gem, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  property: Property;
  index?: number; // Added index for staggered animation
}

const PropertyCard: React.FC<Props> = ({ property, index = 0 }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Drag Physics State
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['https://picsum.photos/800/600'];

  // "Guest Favorite" logic
  const isGuestFavorite = property.rating >= 4.8;

  const nextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else {
      setCurrentImageIndex(0);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    } else {
      setCurrentImageIndex(images.length - 1);
    }
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    nextImage();
  };

  const handlePrevClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    prevImage();
  };

  // --- Drag Logic ---
  const getPositionX = (event: React.MouseEvent | React.TouchEvent) => {
    return event.type.includes('mouse') 
      ? (event as React.MouseEvent).pageX 
      : (event as React.TouchEvent).touches[0].clientX;
  };

  const touchStart = (index: number) => {
    return (event: React.TouchEvent | React.MouseEvent) => {
      setIsDragging(true);
      setStartPos(getPositionX(event));
    }
  }

  const touchMove = (event: React.TouchEvent | React.MouseEvent) => {
    if (isDragging) {
      const currentPosition = getPositionX(event);
      const currentDrag = currentPosition - startPos;
      setCurrentTranslate(currentDrag);
    }
  }

  const touchEnd = () => {
    setIsDragging(false);
    const movedBy = currentTranslate;
    if (movedBy < -75) nextImage();
    else if (movedBy > 75) prevImage();
    setCurrentTranslate(0);
  }

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  }

  // --- Badge Logic ---
  const renderBadge = () => {
      if (!property.badge || property.badge === 'none') return null;
      
      return (
          <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm p-1.5 rounded-full shadow-md animate-in zoom-in spin-in-12 duration-500">
               {property.badge === 'crown' && <Crown size={18} className="text-yellow-500 fill-yellow-500" />}
               {property.badge === 'trophy' && <Trophy size={18} className="text-yellow-500 fill-yellow-500" />}
               {property.badge === 'diamond' && <Gem size={18} className="text-blue-400 fill-blue-400" />}
               {property.badge === 'verified' && <ShieldCheck size={18} className="text-blue-600 fill-blue-600" />}
          </div>
      );
  };

  return (
    <div 
      className="group cursor-pointer relative select-none animate-card-entry transition-gpu"
      style={{ animationDelay: `${index * 0.1}s` }} // Staggered delay logic
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if(isDragging) touchEnd(); 
      }}
    >
      <Link to={`/property/${property.id}`} className="block" draggable="false">
        {/* Main Card Container with elastic scale on click */}
        <div className="transition-transform duration-300 active:scale-[0.98]">
            
            {/* Image Container */}
            <div 
              className="relative aspect-square overflow-hidden rounded-xl bg-gray-200 mb-2 shadow-sm group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-500"
              onMouseDown={touchStart(currentImageIndex)}
              onMouseMove={touchMove}
              onMouseUp={touchEnd}
              onMouseLeave={() => isDragging && touchEnd()}
              onTouchStart={touchStart(currentImageIndex)}
              onTouchMove={touchMove}
              onTouchEnd={touchEnd}
            >
              {/* Image Slider Container */}
              <div className="w-full h-full" dir="ltr">
                <div 
                  ref={sliderRef}
                  className="w-full h-full flex"
                  style={{ 
                    transform: `translateX(calc(-${currentImageIndex * 100}% + ${currentTranslate}px))`,
                    transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                >
                  {images.map((img, idx) => (
                    <div key={idx} className="h-full w-full flex-shrink-0 overflow-hidden relative">
                        {/* The Alive Effect: Slow Zoom on Hover */}
                        <img 
                          src={img} 
                          draggable="false"
                          alt={`${property.title} - ${idx + 1}`} 
                          className={`h-full w-full object-cover select-none pointer-events-none transition-transform duration-[3000ms] ease-out ${
                              isHovered && idx === currentImageIndex ? 'scale-110' : 'scale-100'
                          }`}
                        />
                        {/* Subtle dark gradient at top for icon visibility */}
                        <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-black/20 to-transparent opacity-60"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guest Favorite Badge */}
              {isGuestFavorite && (
                  <div className="absolute top-2 left-2 z-10 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm transform transition-transform duration-300 group-hover:scale-105">
                      <span className="text-[10px] font-bold text-gray-900">مفضّل</span>
                  </div>
              )}

              {/* Special Badge (Crown, Trophy, etc.) - REPLACES HEART */}
              {renderBadge()}

              {/* Navigation Arrows (Desktop) - Pop in on hover */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevClick}
                    className={`hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-1 rounded-full shadow-lg z-10 items-center justify-center border border-gray-100 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                  >
                    <ChevronLeft size={14} strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={handleNextClick}
                    className={`hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-1 rounded-full shadow-lg z-10 items-center justify-center border border-gray-100 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                  >
                    <ChevronRight size={14} strokeWidth={2.5} />
                  </button>
                </>
              )}

              {/* Dots Indicator - Fade in on hover */}
              {images.length > 1 && (
                 <div 
                    className={`absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10 p-1 rounded-full transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    dir="ltr"
                 >
                    {images.slice(0, 5).map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={(e) => handleDotClick(e, idx)}
                        className={`rounded-full transition-all duration-300 shadow-sm box-content border border-transparent/10 ${
                          idx === currentImageIndex 
                            ? 'bg-white w-1.5 h-1.5 opacity-100 scale-110' 
                            : 'bg-white/60 w-1 h-1 hover:bg-white/90'
                        }`}
                      />
                    ))}
                 </div>
              )}
            </div>

            {/* Card Content with subtle hover shifts */}
            <div className="flex flex-col gap-0 px-1">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1 group-hover:text-black transition-colors">{property.location || property.title}</h3>
                <div className="flex items-center gap-0.5 text-xs">
                   <Star size={10} className="fill-black text-black" />
                   <span>{property.rating}</span>
                </div>
              </div>
              
              <p className="text-gray-500 text-xs leading-snug line-clamp-1 group-hover:text-gray-700 transition-colors mt-0.5">{property.category}</p>
              
              <div className="mt-1 flex items-center gap-1">
                <span className="font-semibold text-gray-900 text-sm">MAD{property.price}</span>
                <span className="text-gray-900 text-xs">لليلة</span>
              </div>
            </div>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;