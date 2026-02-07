'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles } from 'lucide-react';

const FILTER_EMOJIS = ['🕶️', '👑', '🐱', '🦸', '🎉', '🐶', '🐰', '👽'];

export default function IdleMode() {
  const [activeEmoji, setActiveEmoji] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveEmoji(prev => (prev + 1) % FILTER_EMOJIS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 z-10 flex items-center justify-center"
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/90 via-slate-900/90 to-indigo-950/90 backdrop-blur-md" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
        {/* Animated scanning rings */}
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-8">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-violet-400/30"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{
                scale: [0.6, 1.1],
                opacity: [0.6, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.8,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-400/20 flex items-center justify-center"
            >
              <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-violet-300" strokeWidth={1.5} />
            </motion.div>
          </div>
        </div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-5xl font-bold text-white mb-3 tracking-tight"
        >
          Step Into View
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-base sm:text-lg text-violet-200/80 mb-8 font-light"
        >
          Face the camera to try on fun filters
        </motion.p>

        {/* Filter emoji carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center items-center gap-3 sm:gap-4"
        >
          {FILTER_EMOJIS.map((emoji, i) => (
            <motion.div
              key={i}
              animate={{
                scale: activeEmoji === i ? 1.3 : 0.85,
                opacity: activeEmoji === i ? 1 : 0.4,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="text-2xl sm:text-3xl"
            >
              {emoji}
            </motion.div>
          ))}
        </motion.div>

        {/* Subtle features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-10 flex items-center justify-center gap-2 text-xs sm:text-sm text-violet-300/50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Powered by real-time AI face tracking</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
