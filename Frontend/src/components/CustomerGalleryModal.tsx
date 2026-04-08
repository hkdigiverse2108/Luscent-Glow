import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2, Download } from 'lucide-react';
import { getAssetUrl } from '@/lib/api';

interface CustomerGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
}

const CustomerGalleryModal: React.FC<CustomerGalleryModalProps> = ({ 
  isOpen, 
  onClose, 
  images, 
  initialIndex = 0 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, initialIndex]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/95 backdrop-blur-sm p-4 md:p-10"
        onClick={onClose}
      >
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          {/* Header Actions */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 md:p-6 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                <Maximize2 size={16} className="text-white/80" />
              </div>
              <div className="text-white">
                <p className="text-[10px] font-body font-bold uppercase tracking-widest opacity-50">Visual Chronicle</p>
                <p className="text-xs font-display font-medium">{currentIndex + 1} of {images.length}</p>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all group"
            >
              <X size={24} className="text-white group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          {/* Main Image View */}
          <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                src={getAssetUrl(images[currentIndex])}
                alt="Customer Ritual Sanctuary"
                className="max-w-full max-h-[70vh] md:max-h-[80vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </AnimatePresence>

            {/* Navigation Controls */}
            {images.length > 1 && (
              <>
                <button 
                  onClick={handlePrev}
                  className="absolute left-0 md:left-4 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center border border-white/5 transition-all"
                >
                  <ChevronLeft size={32} className="text-white" />
                </button>
                <button 
                  onClick={handleNext}
                  className="absolute right-0 md:right-4 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center border border-white/5 transition-all"
                >
                  <ChevronRight size={32} className="text-white" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails Row */}
          <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center gap-3 overflow-x-auto scrollbar-hide">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`flex-none w-14 h-14 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  currentIndex === idx ? "border-gold scale-110 shadow-lg" : "border-white/10 opacity-40 hover:opacity-100"
                }`}
              >
                <img src={getAssetUrl(img)} alt="Chronicle Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomerGalleryModal;
