"use client";

import { SourceInfo } from '@/types/source';
import { SourceBadge } from './SourceBadge';

interface SourceListProps {
  sources: SourceInfo[];
  size?: 'sm' | 'md';
  maxDisplay?: number;
}

export function SourceList({ sources, size = 'sm', maxDisplay = 3 }: SourceListProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  const displaySources = sources.slice(0, maxDisplay);
  const remainingCount = sources.length - maxDisplay;

  return (
    <div className="flex items-center gap-1">
      {displaySources.map((source, index) => (
        <SourceBadge
          key={`${source.type}-${index}`}
          type={source.type}
          url={source.url}
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <div className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-muted px-1.5 text-[10px] text-muted-foreground">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
