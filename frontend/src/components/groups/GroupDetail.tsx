import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Group, Character, CreateRelationshipData } from '../../types';
import { useGroupStore } from '../../stores/groupStore';
import { useCharacterStore } from '../../stores/characterStore';
import { useRelationshipStore } from '../../stores/relationshipStore';
import CharacterList from '../characters/CharacterList';
import CharacterForm from '../characters/CharacterForm';
import { RelationshipForm, RelationshipList } from '../relationships';
import { Modal, ConfirmDialog } from '../common';

const GroupDetail: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const { groups, fetchGroupById, deleteGroup, loading: groupLoading } = useGroupStore();
  const {
    characters,
    fetchCharacters,
    deleteCharacter,
    loading: characterLoading
  } = useCharacterStore();
  const {
    relationships,
    fetchRelationships,
    createRelationship,
    loading: relationshipLoading,
    error: relationshipError,
    clearError
  } = useRelationshipStore();

  const [group, setGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState<'characters' | 'relationships'>('characters');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isGroupDeleteDialogOpen, setIsGroupDeleteDialogOpen] = useState(false);
  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [deletingCharacter, setDeletingCharacter] = useState<Character | null>(null);

  // グループ情報と人物一覧、関係一覧を取得
  useEffect(() => {
    if (groupId) {
      const fetchData = async () => {
        await fetchGroupById(groupId);
        await fetchCharacters(groupId);
        await fetchRelationships(groupId);

        // グループ情報を設定
        const groupData = groups.find(g => g.id === groupId);
        if (groupData) {
          setGroup(groupData);
        } else {
          // グループが見つからない場合はホームに戻る
          navigate('/', { replace: true });
        }
      };
      fetchData();
    }
  }, [groupId, fetchGroupById, fetchCharacters, fetchRelationships, groups, navigate]);

  // グループ削除処理
  const handleDeleteGroup = async () => {
    if (group) {
      const success = await deleteGroup(group.id);
      if (success) {
        navigate('/', { replace: true });
      }
    }
  };

  // 人物作成処理
  const handleCreateCharacter = () => {
    setIsCreateModalOpen(true);
  };

  // 関係作成処理
  const handleCreateRelationship = () => {
    clearError();
    setIsRelationshipModalOpen(true);
  };

  // 関係作成フォーム送信
  const handleRelationshipSubmit = async (data: CreateRelationshipData) => {
    const result = await createRelationship(data as CreateRelationshipData);
    if (result) {
      setIsRelationshipModalOpen(false);
      // 関係一覧を再取得
      if (groupId) {
        await fetchRelationships(groupId);
      }
    }
  };

  // 関係作成フォームキャンセル
  const handleRelationshipCancel = () => {
    clearError();
    setIsRelationshipModalOpen(false);
  };

  // 人物編集処理
  const handleEditCharacter = (character: Character) => {
    setEditingCharacter(character);
    setIsEditModalOpen(true);
  };

  // 人物削除処理
  const handleDeleteCharacter = (character: Character) => {
    setDeletingCharacter(character);
    setIsDeleteDialogOpen(true);
  };

  // 人物削除確認
  const handleConfirmDeleteCharacter = async () => {
    if (deletingCharacter) {
      const success = await deleteCharacter(deletingCharacter.id);
      if (success) {
        setIsDeleteDialogOpen(false);
        setDeletingCharacter(null);
      }
    }
  };

  // フォーム成功時の処理
  const handleFormSuccess = (character: Character) => {
    console.log('Character saved:', character);
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setEditingCharacter(null);
  };

  // フォームキャンセル時の処理
  const handleFormCancel = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setEditingCharacter(null);
  };

  // 削除キャンセル時の処理
  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeletingCharacter(null);
  };

  if (!group) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              戻る
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
              {group.description && (
                <p className="mt-1 text-sm text-gray-600">{group.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {activeTab === 'characters' && (
              <button
                onClick={handleCreateCharacter}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                人物を追加
              </button>
            )}
            {activeTab === 'relationships' && characters.length >= 2 && (
              <button
                onClick={handleCreateRelationship}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                関係を追加
              </button>
            )}
            <button
              onClick={() => setIsGroupDeleteDialogOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={groupLoading.delete}
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              グループを削除
            </button>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      登録人物数
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {characters.length}人
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      関係数
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {relationships.length}件
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('characters')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'characters'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              人物管理
            </button>
            <button
              onClick={() => setActiveTab('relationships')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'relationships'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              関係管理
            </button>
          </nav>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {activeTab === 'characters' && (
            <>
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-900">人物一覧</h2>
                <p className="mt-1 text-sm text-gray-500">
                  このグループに登録されている人物を管理できます。
                </p>
              </div>

              {characterLoading.list ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : characters.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">人物が登録されていません</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    最初の人物を追加してグループを始めましょう。
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleCreateCharacter}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      人物を追加
                    </button>
                  </div>
                </div>
              ) : (
                <CharacterList
                  groupId={groupId}
                  onCharacterEdit={(characterId) => {
                    const character = characters.find(c => c.id === characterId);
                    if (character) {
                      handleEditCharacter(character);
                    }
                  }}
                  onCharacterDelete={(characterId) => {
                    const character = characters.find(c => c.id === characterId);
                    if (character) {
                      handleDeleteCharacter(character);
                    }
                  }}
                />
              )}
            </>
          )}

          {activeTab === 'relationships' && (
            <>
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-900">関係一覧</h2>
                <p className="mt-1 text-sm text-gray-500">
                  このグループ内の人物間の関係を管理できます。
                </p>
              </div>

              {relationshipLoading.list ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : characters.length < 2 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">関係を作成するには2人以上の人物が必要です</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    まず人物を追加してから関係を作成してください。
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setActiveTab('characters')}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      人物管理に移動
                    </button>
                  </div>
                </div>
              ) : relationships.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">関係が登録されていません</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    人物間の関係を追加して関係図を作成しましょう。
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleCreateRelationship}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      関係を追加
                    </button>
                  </div>
                </div>
              ) : (
                <RelationshipList
                  groupId={groupId!}
                  relationships={relationships}
                  characters={characters}
                  onRefresh={() => {
                    if (groupId) {
                      fetchRelationships(groupId);
                    }
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* 人物作成モーダル */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleFormCancel}
        size="lg"
      >
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">人物を追加</h2>
          <CharacterForm
            groupId={groupId}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      </Modal>

      {/* 人物編集モーダル */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleFormCancel}
        size="lg"
      >
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">人物を編集</h2>
          <CharacterForm
            character={editingCharacter || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      </Modal>

      {/* 関係作成モーダル */}
      <Modal
        isOpen={isRelationshipModalOpen}
        onClose={handleRelationshipCancel}
        size="lg"
      >
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">関係を追加</h2>
          {relationshipError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{relationshipError}</p>
                </div>
              </div>
            </div>
          )}
          <RelationshipForm
            groupId={groupId!}
            onSubmit={handleRelationshipSubmit}
            onCancel={handleRelationshipCancel}
          />
        </div>
      </Modal>

      {/* 人物削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDeleteCharacter}
        title="人物を削除"
        message={
          deletingCharacter
            ? `「${deletingCharacter.name}」を削除しますか？この人物に関連する関係データもすべて削除されます。この操作は取り消せません。`
            : ''
        }
        confirmText="削除"
        cancelText="キャンセル"
        type="danger"
        isLoading={characterLoading.delete}
      />

      {/* グループ削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={isGroupDeleteDialogOpen}
        onClose={() => setIsGroupDeleteDialogOpen(false)}
        onConfirm={handleDeleteGroup}
        title="グループを削除"
        message={
          group
            ? `「${group.name}」を削除しますか？このグループに含まれる人物、関係、ラベルもすべて削除されます。この操作は取り消せません。`
            : ''
        }
        confirmText="削除"
        cancelText="キャンセル"
        type="danger"
        isLoading={groupLoading.delete}
      />
    </div>
  );
};

export default GroupDetail; 
