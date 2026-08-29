"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Search, Calendar, Tag, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FilterState, ALL_FORMATS, ALL_KINDS } from "@/types/filter";
import {
  EVENT_FORMAT_LABEL,
  EVENT_KIND_LABEL,
  type EventFormat,
  type EventKind
} from "@/features/events/types/eventItem";
import { resolveDatePreset } from "@/lib/filters";

interface FilterBarProps {
  filter: FilterState;
  onUpdate: (updates: Partial<FilterState>) => void;
  onReset: () => void;
  isFiltered: boolean;
  /** 表示中のイベントから実際に存在する都道府県だけを渡す */
  availablePrefectures: string[];
}

const DATE_PRESETS = [
  { value: 'all', label: 'すべて' },
  { value: 'today', label: '今日' },
  { value: 'this_week', label: '今週' },
  { value: 'this_month', label: '今月' },
] as const;

type DropdownKey = 'date' | 'kind' | 'format' | 'prefecture';

/** 種別・形式・地域で共通のチェックボックス式ドロップダウン */
function MultiSelectDropdown<T extends string>({
  icon,
  label,
  options,
  renderLabel,
  selected,
  onChange,
  isOpen,
  onToggleOpen,
  width = 'w-48'
}: {
  icon: React.ReactNode;
  label: string;
  options: readonly T[];
  renderLabel: (value: T) => string;
  selected: T[];
  onChange: (next: T[]) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  width?: string;
}) {
  const toggle = (value: T) => {
    onChange(selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggleOpen}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
      >
        {icon}
        <span>
          {label}
          {selected.length > 0 && (
            <Badge variant="secondary" className="ml-1.5 text-xs">
              {selected.length}件
            </Badge>
          )}
        </span>
      </button>

      {isOpen && (
        <div className={`absolute left-0 top-full z-50 mt-1 ${width} rounded-md border border-border bg-background shadow-lg`}>
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground">{label}を選択</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => onChange([...options])} className="text-xs text-primary hover:underline">
                全選択
              </button>
              <span className="text-xs text-muted-foreground">/</span>
              <button type="button" onClick={() => onChange([])} className="text-xs text-primary hover:underline">
                クリア
              </button>
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {options.length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground">選択肢がありません</div>
            )}
            {options.map(option => (
              <label key={option} className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-muted">
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggle(option)}
                  className="h-4 w-4 rounded border-border"
                />
                <span>{renderLabel(option)}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function FilterBar({ filter, onUpdate, onReset, isFiltered, availablePrefectures }: FilterBarProps) {
  const [localKeyword, setLocalKeyword] = useState(filter.keyword);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);

  const toggleDropdown = (key: DropdownKey) => setOpenDropdown(prev => (prev === key ? null : key));

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
    onUpdate({ datePreset: preset, dateFrom: from, dateTo: to });
    setOpenDropdown(null);
  }, [onUpdate]);

  const currentPresetLabel = DATE_PRESETS.find(p => p.value === filter.datePreset)?.label || 'すべて';

  return (
    <div className="border-b border-border px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* 期間フィルタ */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('date')}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
          >
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>期間: {currentPresetLabel}</span>
          </button>

          {openDropdown === 'date' && (
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

        {/* 種別フィルタ */}
        <MultiSelectDropdown<EventKind>
          icon={<Tag className="h-4 w-4 text-muted-foreground" />}
          label="種別"
          options={ALL_KINDS}
          renderLabel={kind => EVENT_KIND_LABEL[kind]}
          selected={filter.kinds}
          onChange={kinds => onUpdate({ kinds })}
          isOpen={openDropdown === 'kind'}
          onToggleOpen={() => toggleDropdown('kind')}
        />

        {/* 開催形式フィルタ */}
        <MultiSelectDropdown<EventFormat>
          icon={<Globe className="h-4 w-4 text-muted-foreground" />}
          label="形式"
          options={ALL_FORMATS}
          renderLabel={format => EVENT_FORMAT_LABEL[format]}
          selected={filter.formats}
          onChange={formats => onUpdate({ formats })}
          isOpen={openDropdown === 'format'}
          onToggleOpen={() => toggleDropdown('format')}
        />

        {/* 地域フィルタ */}
        <MultiSelectDropdown<string>
          icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
          label="地域"
          options={availablePrefectures}
          renderLabel={pref => pref}
          selected={filter.prefectures}
          onChange={prefectures => onUpdate({ prefectures })}
          isOpen={openDropdown === 'prefecture'}
          onToggleOpen={() => toggleDropdown('prefecture')}
          width="w-52"
        />

        {/* キーワード検索 */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="イベント名・主催・タグで検索..."
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
          <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
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
              <button type="button" onClick={() => handlePresetChange('all')} className="ml-1 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filter.kinds.map(kind => (
            <Badge key={kind} variant="secondary" className="text-xs">
              {EVENT_KIND_LABEL[kind]}
              <button
                type="button"
                onClick={() => onUpdate({ kinds: filter.kinds.filter(k => k !== kind) })}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filter.formats.map(format => (
            <Badge key={format} variant="secondary" className="text-xs">
              {EVENT_FORMAT_LABEL[format]}
              <button
                type="button"
                onClick={() => onUpdate({ formats: filter.formats.filter(f => f !== format) })}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filter.prefectures.map(pref => (
            <Badge key={pref} variant="secondary" className="text-xs">
              {pref}
              <button
                type="button"
                onClick={() => onUpdate({ prefectures: filter.prefectures.filter(p => p !== pref) })}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filter.keyword && (
            <Badge variant="secondary" className="text-xs">
              検索: {filter.keyword}
              <button type="button" onClick={() => setLocalKeyword('')} className="ml-1 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
