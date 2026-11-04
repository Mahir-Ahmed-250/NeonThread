import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  initialImageIndex?: number;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose, initialImageIndex = 0 }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex);
  const [direction, setDirection] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const navigate = useNavigate();

  const images = React.useMemo(() => {
    if (!product) return [];
    return Array.from(new Set([product.image, ...(product.images || [])])).filter(Boolean);
  }, [product?.id]);

  // Reset index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(initialImageIndex);
      setDirection(0);
      setIsImageLoading(true);
      // Disable body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [product?.id, isOpen, initialImageIndex]);

  if (!product || images.length === 0) return null;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(1);
    setIsImageLoading(true);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(-1);
    setIsImageLoading(true);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : direction < 0 ? -300 : 0,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : direction > 0 ? -300 : 0,
      opacity: 0
    })
  };

  const handleBuyNow = () => {
    onClose();
    navigate(`/product/${product.id}`);
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-[32px] overflow-hidden max-w-5xl w-full h-[90vh] md:h-[600px] shadow-2xl relative flex flex-col md:flex-row z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-30 p-2 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full shadow-lg hover:bg-white dark:hover:bg-black transition-colors group"
              id="quick-view-close"
            >
              <X className="h-5 w-5 text-gray-900 dark:text-white group-hover:scale-110 transition-transform" />
            </button>

            {/* Left: Image Carousel */}
            <div className="md:w-[50%] relative bg-gray-100 dark:bg-gray-800 h-[40vh] sm:h-[50vh] md:h-full overflow-hidden shrink-0">
              {/* Skeleton Loader */}
              {isImageLoading && (
                <div className="absolute inset-0 z-10 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-gray-300 border-t-black dark:border-t-white rounded-full animate-spin opacity-30" />
                </div>
              )}

              <AnimatePresence initial={false} custom={direction}>
                {images[currentImageIndex] ? (
                  <motion.img
                    key={currentImageIndex}
                    src={images[currentImageIndex]}
                    alt={product.name}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    onLoad={() => setIsImageLoading(false)}
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : null}
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/70 dark:bg-black/40 backdrop-blur-md rounded-full shadow-lg hover:bg-white dark:hover:bg-black transition-all z-20"
                    id="quick-view-prev"
                  >
                    <ChevronLeft className="h-5 w-5 dark:text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/70 dark:bg-black/40 backdrop-blur-md rounded-full shadow-lg hover:bg-white dark:hover:bg-black transition-all z-20"
                    id="quick-view-next"
                  >
                    <ChevronRight className="h-5 w-5 dark:text-white" />
                  </button>

                  {/* Thumbnail Strip */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-2 bg-black/30 backdrop-blur-md rounded-2xl z-20 max-w-[90%] overflow-x-auto hide-scrollbar">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (idx !== currentImageIndex) {
                            setDirection(idx > currentImageIndex ? 1 : -1);
                            setIsImageLoading(true);
                            setCurrentImageIndex(idx);
                          }
                        }}
                        className={`relative w-10 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300 border-2 ${
                          idx === currentImageIndex 
                            ? 'border-white scale-110 shadow-lg' 
                            : 'border-transparent opacity-50 hover:opacity-100'
                        }`}
                      >
                        {img ? (
                          <img 
                            src={img} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right: Product Details */}
            <div className="md:w-[45%] p-6 sm:p-8 md:p-10 flex flex-col overflow-y-auto custom-scrollbar">
              <div className="flex-1">
                <div className="mb-3">
                  <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.2em] bg-teal-50 dark:bg-teal-900/30 px-3 py-1.5 rounded-full border border-teal-100 dark:border-teal-800">
                    {product.category}
                  </span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3 leading-[1.1] tracking-tight">
                  {product.name}
                </h2>

                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-black text-gray-900 dark:text-white">
                    ৳{product.price}
                  </span>
                  {product.oldPrice && (
                    <span className="text-lg text-gray-400 line-through font-bold">
                      ৳{product.oldPrice}
                    </span>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <button
                  onClick={handleBuyNow}
                  id="quick-view-buy-now"
                  className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-black py-4.5 rounded-2xl flex items-center justify-center gap-3 hover:bg-black dark:hover:bg-gray-100 transition-all active:scale-[0.98] shadow-xl shadow-gray-200 dark:shadow-none text-base"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Order Now (অর্ডার করুন)</span>
                </button>
                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  View full details for size & stock
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default QuickViewModal;
