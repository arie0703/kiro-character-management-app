import React, { useState } from 'react';
import { Relationship, Character, UpdateRelationshipData } from '../../types';
import { useRelationshipStore } from '../../stores/relationshipStore';
import { Modal, ConfirmDialog } from '../common';
import { RelationshipForm } from './RelationshipForm';

interface RelationshipListProps {
  groupId: string;
  relationships: Relationship[];
  characters: Character[];
  onRefresh: () => void;
}

export const RelationshipList: React.FC<RelationshipListProps> = ({
  groupId,
  relationships,
  characters,
  onRefresh
}) => {
  const { updateRelationship, deleteRelationship, loading, error, clearError } = useRelationshipStore();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<Relationship | null>(null);
  const [deletingRelationship, setDeletingRelationship] = useState<Relationship | null>(null);

  // 関係編集処理
  const handleEditRelationship = (relationship: Relationship) => {
    setEditingRelationship(relationship);
    clearError();
    setIsEditModalOpen(true);
  };

  // 関係削除処理
  const handleDeleteRelationship = (relationship: Relationship) => {
    setDeletingRelationship(relationship);
    setIsDeleteDialogOpen(true);
  };

  // 関係編集フォーム送信
  const handleEditSubmit = async (data: UpdateRelationshipData) => {
    if (!editingRelationship) return;
    
    const result = await updateRelationship(editingRelationship.id, data);
    if (result) {
      setIsEditModalOpen(false);
      setEditingRelationship(null);
      onRefresh();
    }
  };

  // 関係編集キャンセル
  const handleEditCancel = () => {
    clearError();
    setIsEditModalOpen(false);
    setEditingRelationship(null);
  };

  // 関係削除確認
  const handleConfirmDelete = async () => {
    if (!deletingRelationship) return;
    
    const success = await deleteRelationship(deletingRelationship.id);
    if (success) {
      setIsDeleteDialogOpen(false);
      setDeletingRelationship(null);
      onRefresh();
    }
  };

  // 関係削除キャンセル
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeletingRelationship(null);
  };

  // 人物名を取得するヘルパー関数
  const getCharacterName = (characterId: string): string => {
    const character = characters.find(c => c.id === characterId);
    return character?.name || '不明';
  };

  if (relationships.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">関係が登録されていません</h3>
        <p className="mt-1 text-sm text-gray-500">
          人物間の関係を追加して関係図を作成しましょう。
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                人物1
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                関係
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                人物2
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                説明
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作成日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {relationships.map((relationship) => (
              <tr key={relationship.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {getCharacterName(relationship.character1Id)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {relationship.relationshipType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {getCharacterName(relationship.character2Id)}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="max-w-xs truncate" title={relationship.description || ''}>
                    {relationship.description || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(relationship.createdAt).toLocaleDateString('ja-JP')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditRelationship(relationship)}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading.update || loading.delete}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteRelationship(relationship)}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading.update || loading.delete}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 関係編集モーダル */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleEditCancel}
        size="lg"
      >
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">関係を編集</h2>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}
          {editingRelationship && (
            <RelationshipForm
              groupId={groupId}
              initialData={{
                id: editingRelationship.id,
                character1Id: editingRelationship.character1Id,
                character2Id: editingRelationship.character2Id,
                relationshipType: editingRelationship.relationshipType,
                description: editingRelationship.description
              }}
              onSubmit={handleEditSubmit}
              onCancel={handleEditCancel}
              isEditing={true}
            />
          )}
        </div>
      </Modal>

      {/* 関係削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleConfirmDelete}
        title="関係を削除"
        message={
          deletingRelationship
            ? `「${getCharacterName(deletingRelationship.character1Id)}」と「${getCharacterName(deletingRelationship.character2Id)}」の関係（${deletingRelationship.relationshipType}）を削除しますか？この操作は取り消せません。`
            : ''
        }
        confirmText="削除"
        cancelText="キャンセル"
        type="danger"
        isLoading={loading.delete}
      />
    </>
  );
};