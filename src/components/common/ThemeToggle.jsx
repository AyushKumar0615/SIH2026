import React from 'react';
import { Sun, Moon } from 'lucide-react';
import Magnetic from './Magnetic';
import { useTranslation } from '../../hooks/useTranslation';

export default function ThemeToggle({ theme, onToggle }) {
  const { t } = useTranslation();
  const isLight = theme === 'light';

  return (
    <Magnetic strength={0.3}>
      <button
        type="button"
        onClick={onToggle}
        className="trigger-btn"
        aria-pressed={isLight}
        aria-label={isLight ? t('switchToDarkMode') : t('switchToLightMode')}
        title={isLight ? t('switchToDarkMode') : t('switchToLightMode')}
      >
        {isLight ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
      </button>
    </Magnetic>
  );
}
