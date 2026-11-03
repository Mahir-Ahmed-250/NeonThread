import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function PageLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dismiss initial loader promptly on page mount with zero external network delays
    const timer = setTimeout(() => {
      setLoading(false);
    }, 120);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          id="page-loader-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[99999] pointer-events-none"
        >
          <div className="flex flex-col items-center gap-3">
            <svg 
              id="page-loader-svg" 
              className="animate-spin h-9 w-9 text-black" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-20" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="3.5"
              />
              <path 
                className="opacity-90" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
              TRENDY CART BD
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
