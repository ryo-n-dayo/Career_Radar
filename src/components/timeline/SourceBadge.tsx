"use client";

import { useState } from 'react';
import { SourceType } from '@/types/source';

const SOURCE_CONFIG: Record<SourceType, {
  icon: string;
  label: string;
  bgColor: string;
  textColor: string;
}> = {
  X:            { icon: '𝕏',  label: 'X',          bgColor: 'bg-black',       textColor: 'text-white' },
  OFFICIAL_WEB: { icon: '🌐', label: '公式サイト', bgColor: 'bg-emerald-500', textColor: 'text-white' },
};

interface SourceBadgeProps {
  type: SourceType;
  url?: string;
  size?: 'sm' | 'md';
}

const SIZE_CONFIG = {
  sm: {
    container: 'h-6 w-6 text-[11px]',
    icon: 'text-[11px]',
  },
  md: {
    container: 'h-8 w-8 text-sm',
    icon: 'text-sm',
  },
};

export function SourceBadge({ type, url, size = 'sm' }: SourceBadgeProps) {
  const config = SOURCE_CONFIG[type];
  const sizeConfig = SIZE_CONFIG[size];
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={`inline-flex items-center justify-center rounded-full ${config.bgColor} ${config.textColor} ${sizeConfig.container} font-medium transition-opacity hover:opacity-80 cursor-pointer`}
      >
        <span className={sizeConfig.icon}>{config.icon}</span>
      </button>
      
      {showTooltip && (
        <div className="absolute -top-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap">
          <div className="rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md border border-border">
            {config.label}
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-popover border-r border-b border-border"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export function getSourceLabel(type: SourceType): string {
  return SOURCE_CONFIG[type].label;
}
