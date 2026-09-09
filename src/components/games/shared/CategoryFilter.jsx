import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Brain, Eye } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

const CATEGORY_ICONS = {
  all: LayoutGrid,
  Memory: Brain,
  Attention: Eye
};

const CATEGORY_LABEL_KEYS = {
  all: 'categoryAll',
  Memory: 'gameCategoryMemory',
  Attention: 'gameCategoryAttention'
};

export default function CategoryFilter({ categories, active, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={t('gameLibrary')}>
      {categories.map((cat) => {
        const isActive = active === cat;
        const Icon = CATEGORY_ICONS[cat] || LayoutGrid;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            aria-pressed={isActive}
            className={`relative flex items-center gap-1.5 px-4 text-xs font-semibold rounded-full border ${
              isActive ? 'border-ember text-[#1a0f08]' : 'border-hairline-strong text-ink-soft'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="category-pill-bg"
                className="absolute inset-0 rounded-full"
                style={{ background: 'var(--ember)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <Icon className="relative w-3.5 h-3.5" />
            <span className="relative">{t(CATEGORY_LABEL_KEYS[cat] || cat)}</span>
          </button>
        );
      })}
    </div>
  );
}
