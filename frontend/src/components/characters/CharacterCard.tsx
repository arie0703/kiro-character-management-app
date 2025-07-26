import React from 'react';
import { Character } from '../../types';

interface CharacterCardProps {
  character: Character;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onSelect,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // ボタンクリック時はカード選択を無効化
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${
        onSelect ? 'cursor-pointer' : ''
      } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={handleCardClick}
    >
      {/* 画像エリア */}
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
        {character.photo ? (
          <img
            className="h-48 w-full object-cover object-center"
            src={character.photo}
            alt={character.name}
            onError={(e) => {
              // 画像読み込みエラー時のフォールバック
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        {/* 画像がない場合のプレースホルダー */}
        <div className={`flex items-center justify-center h-48 ${character.photo ? 'hidden' : ''}`}>
          <svg
            className="h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="p-4">
        {/* 名前 */}
        <h3 className="text-lg font-medium text-gray-900 truncate" title={character.name}>
          {character.name}
        </h3>

        {/* 情報（省略表示） */}
        {character.information && (
          <p className="mt-1 text-sm text-gray-600 line-clamp-2" title={character.information}>
            {character.information}
          </p>
        )}

        {/* ラベル */}
        {character.labels && character.labels.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {character.labels.slice(0, 3).map((label) => (
              <span
                key={label.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${label.color}20`,
                  color: label.color,
                  borderColor: `${label.color}40`,
                  borderWidth: '1px',
                }}
              >
                {label.name}
              </span>
            ))}
            {character.labels.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{character.labels.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 関連リンク数 */}
        {character.relatedLinks && character.relatedLinks.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            <svg className="inline h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {character.relatedLinks.length}個のリンク
          </div>
        )}

        {/* アクションボタン */}
        <div className="mt-4 flex justify-end space-x-2">
          {onEdit && (
            <button
              type="button"
              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={onEdit}
            >
              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              編集
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="inline-flex items-center px-2.5 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                  削除中...
                </>
              ) : (
                <>
                  <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  削除
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 作成日時 */}
      <div className="px-4 pb-2 text-xs text-gray-400">
        作成: {new Date(character.createdAt).toLocaleDateString('ja-JP')}
      </div>
    </div>
  );
};

export default CharacterCard;