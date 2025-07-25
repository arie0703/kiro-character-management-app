import React, { useEffect } from 'react';
import { useGroupStore } from '../../stores/groupStore';
import { Group } from '../../types';
import GroupCard from './GroupCard';

interface GroupListProps {
  onGroupSelect?: (groupId: string) => void;
  onGroupEdit?: (group: Group) => void;
  onGroupDelete?: (group: Group) => void;
}

const GroupList: React.FC<GroupListProps> = ({ onGroupSelect, onGroupEdit, onGroupDelete }) => {
  const { 
    groups, 
    loading, 
    error, 
    fetchGroups, 
    clearError 
  } = useGroupStore();

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleGroupSelect = (groupId: string) => {
    if (onGroupSelect) {
      onGroupSelect(groupId);
    }
  };

  if (loading.list) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">グループを読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              エラーが発生しました
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="bg-red-100 px-2 py-1 text-sm font-medium text-red-800 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={clearError}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">グループがありません</h3>
        <p className="mt-1 text-sm text-gray-500">
          新しいグループを作成して人物の管理を始めましょう。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            onSelect={() => handleGroupSelect(group.id)}
            onEdit={onGroupEdit ? () => onGroupEdit(group) : undefined}
            onDelete={onGroupDelete ? () => onGroupDelete(group) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default GroupList;