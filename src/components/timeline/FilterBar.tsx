"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Search, Calendar, Tag, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FilterState, ALL_CATEGORIES, Category } from "@/types/filter";
import { SourceType, SOURCE_TYPES } from "@/types/source";
import { resolveDatePreset } from "@/lib/filters";
import { getSourceLabel } from "@/components/timeline/SourceBadge";

interface FilterBarProps {
  filter: FilterState;
  onUpdate: (updates: Partial<FilterState>) => void;
  onReset: () => void;
  isFiltered: boolean;
}

const DATE_PRESETS = [
  { value: 'all', label: 'すべて' },
  { value: 'today', label: '今日' },
  { value: 'this_week', label: '今週' },
  { value: 'this_month', label: '今月' },
] as const;

const SOURCE_GROUPS: { label: string; sources: SourceType[] }[] = [
  {
    label: 'ソース',
    sources: ['X', 'OFFICIAL_WEB']
  }
];

export function FilterBar({ filter, onUpdate, onReset, isFiltered }: FilterBarProps) {
  const [localKeyword, setLocalKeyword] = useState(filter.keyword);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localKeyword !== filter.keyword) {
        onUpdate({ keyword: localKeyword });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localKeyword, filter.keyword, onUpdate]);

  useEffect(() => {
    setLocalKeyword(filter.keyword);
  }, [filter.keyword]);

  const handlePresetChange = useCallback((preset: FilterState['datePreset']) => {
    const { from, to } = resolveDatePreset(preset);
    onUpdate({ 
      datePreset: preset,
      dateFrom: from,
      dateTo: to 
    });
    setShowDatePicker(false);
  }, [onUpdate]);

  const toggleCategory = useCallback((category: Category) => {
    const current = filter.categories;
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    onUpdate({ categories: updated });
  }, [filter.categories, onUpdate]);

  const toggleSource = useCallback((source: SourceType) => {
    const current = filter.sources;
    const updated = current.includes(source)
      ? current.filter(s => s !== source)
      : [...current, source];
    onUpdate({ sources: updated });
  }, [filter.sources, onUpdate]);

  const selectAllCategories = useCallback(() => {
    onUpdate({ categories: [...ALL_CATEGORIES] });
  }, [onUpdate]);

  const clearAllCategories = useCallback(() => {
    onUpdate({ categories: [] });
  }, [onUpdate]);

  const selectAllSources = useCallback(() => {
    onUpdate({ sources: [...SOURCE_TYPES] });
  }, [onUpdate]);

  const clearAllSources = useCallback(() => {
    onUpdate({ sources: [] });
  }, [onUpdate]);

  const currentPresetLabel = DATE_PRESETS.find(p => p.value === filter.datePreset)?.label || 'すべて';

  return (
    <div className="border-b border-border px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* 期間フィルタ */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowDatePicker(!showDatePicker);
              setShowCategoryDropdown(false);
              setShowSourceDropdown(false);
            }}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
          >
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>期間: {currentPresetLabel}</span>
          </button>
          
          {showDatePicker && (
            <div className="absolute left-0 top-full z-50 mt-1 w-40 rounded-md border border-border bg-background shadow-lg">
              {DATE_PRESETS.map(preset => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetChange(preset.value as FilterState['datePreset'])}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-muted ${
                    filter.datePreset === preset.value ? 'bg-muted font-medium' : ''
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* カテゴリフィルタ */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowCategoryDropdown(!showCategoryDropdown);
              setShowDatePicker(false);
              setShowSourceDropdown(false);
            }}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
          >
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span>
              カテゴリ
              {filter.categories.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs">
                  {filter.categories.length}件
                </Badge>
              )}
            </span>
          </button>
          
          {showCategoryDropdown && (
            <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-md border border-border bg-background shadow-lg">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground">カテゴリ選択</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={selectAllCategories}
                    className="text-xs text-primary hover:underline"
                  >
                    全選択
                  </button>
                  <span className="text-xs text-muted-foreground">/</span>
                  <button
                    type="button"
                    onClick={clearAllCategories}
                    className="text-xs text-primary hover:underline"
                  >
                    クリア
                  </button>
                </div>
              </div>
              {ALL_CATEGORIES.map(category => (
                <label
                  key={category}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    checked={filter.categories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* ソースフィルタ */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowSourceDropdown(!showSourceDropdown);
              setShowDatePicker(false);
              setShowCategoryDropdown(false);
            }}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
          >
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span>
              ソース
              {filter.sources.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs">
                  {filter.sources.length}件
                </Badge>
              )}
            </span>
          </button>
          
          {showSourceDropdown && (
            <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-md border border-border bg-background shadow-lg">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground">ソース選択</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={selectAllSources}
                    className="text-xs text-primary hover:underline"
                  >
                    全選択
                  </button>
                  <span className="text-xs text-muted-foreground">/</span>
                  <button
                    type="button"
                    onClick={clearAllSources}
                    className="text-xs text-primary hover:underline"
                  >
                    クリア
                  </button>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {SOURCE_GROUPS.map(group => (
                  <div key={group.label}>
                    <div className="bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                      {group.label}
                    </div>
                    {group.sources.map(source => (
                      <label
                        key={source}
                        className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                      >
                        <input
                          type="checkbox"
                          checked={filter.sources.includes(source)}
                          onChange={() => toggleSource(source)}
                          className="h-4 w-4 rounded border-border"
                        />
                        <span>{getSourceLabel(source)}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* キーワード検索 */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="キーワード検索..."
            value={localKeyword}
            onChange={(e) => setLocalKeyword(e.target.value)}
            className="pl-9 h-9"
          />
          {localKeyword && (
            <button
              type="button"
              onClick={() => setLocalKeyword('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* リセットボタン */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            リセット
          </Button>
        )}
      </div>

      {/* アクティブフィルタ表示 */}
      {isFiltered && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">アクティブフィルタ:</span>
          {filter.datePreset !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              期間: {currentPresetLabel}
              <button
                type="button"
                onClick={() => handlePresetChange('all')}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filter.categories.map(cat => (
            <Badge key={cat} variant="secondary" className="text-xs">
              {cat}
              <button
                type="button"
                onClick={() => toggleCategory(cat)}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filter.sources.map(src => (
            <Badge key={src} variant="secondary" className="text-xs">
              {getSourceLabel(src)}
              <button
                type="button"
                onClick={() => toggleSource(src)}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filter.keyword && (
            <Badge variant="secondary" className="text-xs">
              検索: {filter.keyword}
              <button
                type="button"
                onClick={() => setLocalKeyword('')}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
