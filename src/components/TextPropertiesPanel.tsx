import React from 'react';
import { t } from '@utils/LangLoader';
import type { ShapeStyle } from '@/types/zentrix';

interface TextPropertiesProps {
  style: ShapeStyle;
  onUpdate: (updates: Partial<ShapeStyle>) => void;
}

export const TextPropertiesPanel: React.FC<TextPropertiesProps> = ({
  style,
  onUpdate
}) => {
  const fontFamilies = [
    { value: 'Noto Sans KR', label: t('fontFamilies.notoSansKR') },
    { value: 'Nanum Gothic', label: t('fontFamilies.nanumGothic') },
    { value: 'Nanum Myeongjo', label: t('fontFamilies.nanumMyeongjo') },
    { value: 'Malgun Gothic', label: t('fontFamilies.malgunGothic') },
    { value: 'Batang', label: t('fontFamilies.batang') },
    { value: 'Dotum', label: t('fontFamilies.dotum') },
    { value: 'Gulim', label: t('fontFamilies.gulim') },
    { value: 'Arial', label: t('fontFamilies.arial') },
    { value: 'Times New Roman', label: t('fontFamilies.timesNewRoman') }
  ];

  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

  return (
    <div className="text-properties-panel">
      <div className="panel-section bg-gradient-to-br from-gray-800/90 to-gray-900/90 
                      rounded-2xl border border-white/10 p-4">
        <div className="flex gap-2 items-center mb-4">
          <select
            value={style.fontFamily || 'Malgun Gothic'}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="w-32 bg-slate-700 text-white p-2 rounded"
          >
            {fontFamilies.map(font => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>
          <select
            value={style.fontSize || 12}
            onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
            className="w-20 bg-slate-700 text-white p-2 rounded"
          >
            {fontSizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            className={`p-2 rounded ${style.bold ? 'bg-blue-500' : 'bg-slate-700'}`}
            onClick={() => onUpdate({ bold: !style.bold })}
            title={t('textProperties.bold')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
            </svg>
          </button>
          <button
            className={`p-2 rounded ${style.italic ? 'bg-blue-500' : 'bg-slate-700'}`}
            onClick={() => onUpdate({ italic: !style.italic })}
            title={t('textProperties.italic')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="4" x2="10" y2="4"/>
              <line x1="14" y1="20" x2="5" y2="20"/>
              <line x1="15" y1="4" x2="9" y2="20"/>
            </svg>
          </button>
          <button
            className={`p-2 rounded ${style.underline ? 'bg-blue-500' : 'bg-slate-700'}`}
            onClick={() => onUpdate({ underline: !style.underline })}
            title={t('textProperties.underline')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/>
              <line x1="4" y1="21" x2="20" y2="21"/>
            </svg>
          </button>
          <button
            className={`p-2 rounded ${style.strikethrough ? 'bg-blue-500' : 'bg-slate-700'}`}
            onClick={() => onUpdate({ strikethrough: !style.strikethrough })}
            title={t('textProperties.strikethrough')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="12" x2="20" y2="12"/>
              <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/>
            </svg>
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            className={`p-2 rounded ${style.textAlign === 'left' ? 'bg-blue-500' : 'bg-slate-700'}`}
            onClick={() => onUpdate({ textAlign: 'left' })}
            title={t('textProperties.alignLeft')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="15" y2="12"/>
              <line x1="3" y1="18" x2="18" y2="18"/>
            </svg>
          </button>
          <button
            className={`p-2 rounded ${style.textAlign === 'center' ? 'bg-blue-500' : 'bg-slate-700'}`}
            onClick={() => onUpdate({ textAlign: 'center' })}
            title={t('textProperties.alignCenter')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="6" y1="12" x2="18" y2="12"/>
              <line x1="4" y1="18" x2="20" y2="18"/>
            </svg>
          </button>
          <button
            className={`p-2 rounded ${style.textAlign === 'right' ? 'bg-blue-500' : 'bg-slate-700'}`}
            onClick={() => onUpdate({ textAlign: 'right' })}
            title={t('textProperties.alignRight')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="9" y1="12" x2="21" y2="12"/>
              <line x1="6" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <button
            className={`p-2 rounded ${style.textAlign === 'justify' ? 'bg-blue-500' : 'bg-slate-700'}`}
            onClick={() => onUpdate({ textAlign: 'justify' })}
            title={t('textProperties.alignJustify')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex gap-4 items-center">
          <div>
            <label className="text-sm text-white/70">{t('textProperties.textColor')}</label>
            <input
              type="color"
              value={style.textColor || '#000000'}
              onChange={(e) => onUpdate({ textColor: e.target.value })}
              className="block mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-white/70">{t('textProperties.backgroundColor')}</label>
            <input
              type="color"
              value={style.backgroundColor || '#ffffff'}
              onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
              className="block mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};