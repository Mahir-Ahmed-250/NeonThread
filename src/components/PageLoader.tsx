import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useShop } from '../ShopContext';

export default function PageLoader() {
  const { isDbLoaded } = useShop();
  const [progress, setProgress] = useState(0);
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    let interval: any;
    if (!isDbLoaded) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + Math.floor(Math.random() * 3) + 1;
          return prev;
        });
      }, 30);
    } else {
      setProgress(100);
      const timer = setTimeout(() => {
        setShouldShow(false);
      }, 800);
      return () => clearTimeout(timer);
    }
    return () => clearInterval(interval);
  }, [isDbLoaded]);

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center overflow-hidden"
        >
          <div className="relative flex flex-col items-center">
            {/* Branding */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.div 
                  animate={{ 
                    rotate: [0, 90, 180, 270, 360],
                    borderRadius: ["20%", "50%", "20%"]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3, 
                    ease: "linear" 
                  }}
                  className="w-10 h-10 border-4 border-black flex items-center justify-center font-black text-xl"
                >
                  T
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black flex flex-col leading-none">
                  <span>Trendy Cart</span>
                  <span className="text-gray-300">BD</span>
                </h1>
              </div>

              {/* Progress Container */}
              <div className="flex flex-col items-center w-full max-w-[280px]">
                <div className="relative w-full h-[3px] bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-black"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
                
                <div className="mt-4 flex items-center justify-between w-full">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Loading Experience</span>
                  <motion.span 
                    key={progress}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-black tracking-widest text-black min-w-[40px] text-right"
                  >
                    {progress}%
                  </motion.span>
                </div>
              </div>
            </motion.div>

            {/* Background elements for depth */}
            <div className="absolute -z-10 opacity-[0.03] select-none pointer-events-none">
              <h2 className="text-[20vw] font-black uppercase whitespace-nowrap">PREMIUM APPAREL</h2>
            </div>
          </div>

          {/* Bottom Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-12 flex flex-col items-center gap-2"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 bg-black rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
