'use client';

import { motion } from 'framer-motion';
import type { FilterDef } from '@/lib/filters';

interface FilterCarouselProps {
  filters: FilterDef[];
  selectedFilter: string;
  onSelect: (id: string) => void;
}

export default function FilterCarousel({ filters, selectedFilter, onSelect }: FilterCarouselProps) {
  return (
    <div className="w-full">
      {/* Filter name label */}
      <div className="text-center mb-2.5">
        <motion.span
          key={selectedFilter}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs sm:text-sm font-medium text-white/70 tracking-wide"
        >
          {filters.find(f => f.id === selectedFilter)?.name || 'No Filter'}
        </motion.span>
      </div>

      {/* Filter buttons - centered, wrapping if needed */}
      <div className="flex flex-wrap justify-center items-center gap-2 px-2 max-w-full">
        {filters.map((filter) => {
          const isActive = filter.id === selectedFilter;
          return (
            <motion.button
              key={filter.id}
              onClick={() => onSelect(filter.id)}
              whileTap={{ scale: 0.9 }}
              className={`
                relative w-12 h-12 sm:w-14 sm:h-14 rounded-full
                flex items-center justify-center text-lg sm:text-xl
                transition-all duration-200 ease-out
                ${isActive
                  ? 'bg-violet-500/30 ring-2 ring-violet-400 scale-110'
                  : 'bg-white/10 hover:bg-white/15 ring-1 ring-white/20'
                }
              `}
              aria-label={filter.name}
              aria-pressed={isActive}
            >
              <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                {filter.emoji}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="activeFilterDot"
                  className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-violet-400"
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
