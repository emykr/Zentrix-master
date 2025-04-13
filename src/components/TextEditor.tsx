import React, { useRef, useEffect, useState } from 'react';
import { FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight } from 'react-icons/fa';
import type { Point, Size, ShapeStyle } from '@/types/zentrix';

interface TextEditorProps {
  text: string;
  position: Point;
  size: Size;
  style: ShapeStyle;
  onComplete: (text: string, style: Partial<ShapeStyle>) => void;
  onCancel: () => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  position,
  size,
  style,
  onComplete,
  onCancel
}) => {
  const [currentText, setCurrentText] = useState(text);
  const [currentStyle, setCurrentStyle] = useState(style);
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleStyleChange = (updates: Partial<ShapeStyle>) => {
    setCurrentStyle((prev: ShapeStyle) => ({
      ...prev,
      ...updates
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onComplete(currentText, currentStyle);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <>
      <div 
        ref={editorRef}
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`
        }}
      >
        <textarea
          ref={textareaRef}
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            height: '100%',
            resize: 'none',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            font: `${currentStyle.bold ? 'bold' : ''} ${currentStyle.fontSize}px ${currentStyle.fontFamily}`,
            color: currentStyle.textColor || '#000000',
            textAlign: currentStyle.textAlign || 'left'
          }}
        />
      </div>
      <div 
        className="text-properties-panel"
        style={{
          position: 'fixed',
          top: `${position.y - 50}px`,
          left: `${position.x}px`,
        }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStyleChange({ bold: !currentStyle.bold })}
            className={`p-2 rounded ${currentStyle.bold ? 'bg-blue-500' : 'bg-gray-700'}`}
          >
            <FaBold />
          </button>
          <button
            onClick={() => handleStyleChange({ italic: !currentStyle.italic })}
            className={`p-2 rounded ${currentStyle.italic ? 'bg-blue-500' : 'bg-gray-700'}`}
          >
            <FaItalic />
          </button>
          <button
            onClick={() => handleStyleChange({ underline: !currentStyle.underline })}
            className={`p-2 rounded ${currentStyle.underline ? 'bg-blue-500' : 'bg-gray-700'}`}
          >
            <FaUnderline />
          </button>
          <div className="h-6 w-px bg-gray-600 mx-2" />
          <button
            onClick={() => handleStyleChange({ textAlign: 'left' })}
            className={`p-2 rounded ${currentStyle.textAlign === 'left' ? 'bg-blue-500' : 'bg-gray-700'}`}
          >
            <FaAlignLeft />
          </button>
          <button
            onClick={() => handleStyleChange({ textAlign: 'center' })}
            className={`p-2 rounded ${currentStyle.textAlign === 'center' ? 'bg-blue-500' : 'bg-gray-700'}`}
          >
            <FaAlignCenter />
          </button>
          <button
            onClick={() => handleStyleChange({ textAlign: 'right' })}
            className={`p-2 rounded ${currentStyle.textAlign === 'right' ? 'bg-blue-500' : 'bg-gray-700'}`}
          >
            <FaAlignRight />
          </button>
          <div className="h-6 w-px bg-gray-600 mx-2" />
          <select
            value={currentStyle.fontSize || 16}
            onChange={(e) => handleStyleChange({ fontSize: Number(e.target.value) })}
            className="bg-gray-700 rounded p-1"
          >
            {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map(size => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
          <input
            type="color"
            value={currentStyle.textColor || '#000000'}
            onChange={(e) => handleStyleChange({ textColor: e.target.value })}
            className="w-8 h-8"
          />
        </div>
      </div>
    </>
  );
};