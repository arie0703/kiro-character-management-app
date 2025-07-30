import React, { useState, useEffect } from 'react';
import { useLabelStore } from '../../stores/labelStore';
import { Label } from '../../types';
import { LabelBadge } from './LabelBadge';

interface LabelSelectorProps {
  selectedLabels: Label[];
  onLabelsChange: (labels: Label[]) => void;
  maxLabels?: number;
  className?: string;
}

export const LabelSelector: React.FC<LabelSelectorProps> = ({
  selectedLabels,
  onLabelsChange,
  maxLabels = 5,
  className = ''
}) => {
  const { labels, fetchLabels, loading } = useLabelStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  const filteredLabels = labels.filter(label =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedLabels.some(selected => selected.id === label.id)
  );

  const handleLabelSelect = (label: Label) => {
    if (selectedLabels.length >= maxLabels) {
      // 制限に達している場合は何もしない
      return;
    }
    onLabelsChange([...selectedLabels, label]);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleLabelRemove = (labelId: string) => {
    onLabelsChange(selectedLabels.filter(label => label.id !== labelId));
  };

  const canAddMore = selectedLabels.length < maxLabels;

  return (
    <div className={`relative ${className}`}>
      <div className="space-y-2">
        {/* 選択されたラベル */}
        {selectedLabels.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedLabels.map((label) => (
              <LabelBadge
                key={label.id}
                label={label}
                removable
                onRemove={() => handleLabelRemove(label.id)}
              />
            ))}
          </div>
        )}

        {/* ラベル追加ボタン */}
        {canAddMore ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center px-3 py-1 text-sm border border-dashed border-gray-300 rounded-full text-gray-600 hover:border-gray-400 hover:text-gray-700"
            >
              + ラベルを追加
            </button>

            {/* ドロップダウン */}
            {isOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-3">
                  <input
                    type="text"
                    placeholder="ラベルを検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>

                <div className="max-h-48 overflow-y-auto">
                  {loading.list ? (
                    <div className="p-3 text-center text-gray-500">読み込み中...</div>
                  ) : filteredLabels.length > 0 ? (
                    filteredLabels.map((label) => (
                      <button
                        key={label.id}
                        onClick={() => handleLabelSelect(label)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="text-sm">{label.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">
                      {searchTerm ? '該当するラベルがありません' : '利用可能なラベルがありません'}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 p-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <button
              type="button"
              disabled
              className="inline-flex items-center px-3 py-1 text-sm border border-dashed border-gray-200 rounded-full text-gray-400 cursor-not-allowed"
              title={`最大${maxLabels}個のラベルまで選択できます`}
            >
              + ラベルを追加
            </button>
          </div>
        )}

        {/* 制限表示 */}
        <div className="flex items-center justify-between text-sm">
          <span className={selectedLabels.length >= maxLabels ? 'text-orange-600' : 'text-gray-500'}>
            {selectedLabels.length}/{maxLabels} ラベル選択中
          </span>
          {selectedLabels.length >= maxLabels && (
            <span className="text-orange-600 font-medium">
              制限に達しました
            </span>
          )}
        </div>
      </div>

      {/* 背景クリックで閉じる */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};