import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Brain, Eye, Compass } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

const CATEGORY_ICONS = {
  all: LayoutGrid,
  Memory: Brain,
  Attention: Eye,
  Orientation: Compass
};

const CATEGORY_LABEL_KEYS = {
  all: 'categoryAll',
  Memory: 'gameCategoryMemory',
  Attention: 'gameCategoryAttention',
  Orientation: 'gameCategoryOrientation'
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
            className="relative flex items-center gap-1.5 !min-h-8 !px-3.5 !py-1 text-xs font-semibold rounded-full"
            style={{ color: isActive ? '#1a0f08' : 'var(--ink-soft)', border: isActive ? '1px solid var(--ember)' : '1px solid var(--hairline-strong)' }}
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
