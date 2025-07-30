import React, { useState } from 'react';
import { Character } from '../../types';
import { LabelBadge } from '../labels/LabelBadge';

interface CharacterDetailProps {
    character: Character;
    onEdit?: () => void;
    onDelete?: () => void;
    onClose?: () => void;
    isDeleting?: boolean;
}

const CharacterDetail: React.FC<CharacterDetailProps> = ({
    character,
    onEdit,
    onDelete,
    onClose,
    isDeleting = false,
}) => {
    const [showAllLinks, setShowAllLinks] = useState(false);

    const displayedLinks = showAllLinks
        ? character.relatedLinks
        : character.relatedLinks.slice(0, 3);

    const handleLinkClick = (url: string) => {
        // URLの形式チェック
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        window.open(fullUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
            {/* ヘッダー */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">人物詳細</h2>
                {onClose && (
                    <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
                        onClick={onClose}
                        aria-label="閉じる"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* コンテンツ */}
            <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* 画像エリア */}
                    <div className="flex-shrink-0">
                        <div className="w-48 h-48 rounded-lg overflow-hidden bg-gray-200">
                            {character.photo ? (
                                <img
                                    className="w-full h-full object-cover"
                                    src={character.photo}
                                    alt={character.name}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            ) : null}
                            {/* 画像がない場合のプレースホルダー */}
                            <div className={`flex items-center justify-center w-full h-full ${character.photo ? 'hidden' : ''}`}>
                                <svg
                                    className="h-16 w-16 text-gray-400"
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
                    </div>

                    {/* 詳細情報エリア */}
                    <div className="flex-1 space-y-4">
                        {/* 名前 */}
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">{character.name}</h3>
                        </div>

                        {/* ラベル */}
                        {character.labels && character.labels.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">ラベル</h4>
                                <div className="flex flex-wrap gap-2">
                                    {character.labels.map((label) => (
                                        <LabelBadge key={label.id} label={label} size="md" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 情報 */}
                        {character.information && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">情報</h4>
                                <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-md p-3">
                                    {character.information}
                                </div>
                            </div>
                        )}

                        {/* 関連リンク */}
                        {character.relatedLinks && character.relatedLinks.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">関連リンク</h4>
                                <div className="space-y-2">
                                    {displayedLinks.map((link, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <button
                                                type="button"
                                                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                                                onClick={() => handleLinkClick(link)}
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                <span className="truncate max-w-xs" title={link}>
                                                    {link}
                                                </span>
                                            </button>
                                        </div>
                                    ))}

                                    {character.relatedLinks.length > 3 && (
                                        <button
                                            type="button"
                                            className="text-sm text-gray-500 hover:text-gray-700"
                                            onClick={() => setShowAllLinks(!showAllLinks)}
                                        >
                                            {showAllLinks
                                                ? '表示を減らす'
                                                : `他 ${character.relatedLinks.length - 3} 件のリンクを表示`
                                            }
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 作成・更新日時 */}
                        <div className="text-xs text-gray-500 space-y-1">
                            <div>作成: {new Date(character.createdAt).toLocaleString('ja-JP')}</div>
                            <div>更新: {new Date(character.updatedAt).toLocaleString('ja-JP')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* アクションボタン */}
            <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
                {onEdit && (
                    <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={onEdit}
                        disabled={isDeleting}
                    >
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        編集
                    </button>
                )}
                {onDelete && (
                    <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={onDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                                削除中...
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                削除
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default CharacterDetail;