import React from 'react';
import { Character } from '../../types';
import { Modal } from '../common';

interface CharacterDetailModalProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({
  character,
  isOpen,
  onClose
}) => {
  if (!character) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* 人物画像 */}
          <div className="flex-shrink-0">
            {character.photo ? (
              <img
                src={character.photo}
                alt={character.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>

          {/* 人物情報 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                {character.name}
              </h2>
              <button
                onClick={onClose}
                className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ラベル */}
            {character.labels && character.labels.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {character.labels.map((label) => (
                  <span
                    key={label.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: label.color }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}

            {/* 人物情報 */}
            {character.information && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">詳細情報</h3>
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                  {character.information}
                </div>
              </div>
            )}

            {/* 関連リンク */}
            {character.relatedLinks && character.relatedLinks.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">関連リンク</h3>
                <div className="space-y-1">
                  {character.relatedLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 作成・更新日時 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-xs text-gray-500">
                <span>作成日: {new Date(character.createdAt).toLocaleDateString('ja-JP')}</span>
                <span>更新日: {new Date(character.updatedAt).toLocaleDateString('ja-JP')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};