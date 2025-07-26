import React from 'react';
import { Group } from '../../types';

interface GroupCardProps {
  group: Group;
  onSelect: () => void;
  onShowDetail?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onSelect,
  onShowDetail,
  onEdit,
  onDelete
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div
      className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={onShowDetail}
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                グループ
              </dt>
              <dd className="text-lg font-medium text-gray-900 truncate">
                {group.name}
              </dd>
            </dl>
          </div>
        </div>

        {group.description && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {group.description}
            </p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            作成日: {formatDate(group.createdAt)}
          </div>
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                title="編集"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                title="削除"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-5 py-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="w-full text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
        >
          グループを選択 →
        </button>
      </div>
    </div>
  );
};

export default GroupCard;
