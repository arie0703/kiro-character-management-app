import React from 'react';
import { Label } from '../../types';

interface LabelBadgeProps {
  label: Label;
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export const LabelBadge: React.FC<LabelBadgeProps> = ({
  label,
  size = 'md',
  removable = false,
  onRemove,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const textColor = getContrastColor(label.color);

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: label.color,
        color: textColor
      }}
    >
      {label.name}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:opacity-70 focus:outline-none"
          style={{ color: textColor }}
        >
          ×
        </button>
      )}
    </span>
  );
};

// 背景色に対して適切なテキスト色を計算する関数
function getContrastColor(hexColor: string): string {
  // HEX色を RGB に変換
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // 輝度を計算 (0-255)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // 輝度が128以上なら黒、未満なら白
  return brightness >= 128 ? '#000000' : '#FFFFFF';
}