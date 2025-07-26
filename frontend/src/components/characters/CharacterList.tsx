import React, { useEffect } from 'react';
import { useCharacterStore } from '../../stores/characterStore';
import { useGroupStore } from '../../stores/groupStore';
import CharacterCard from './CharacterCard';

interface CharacterListProps {
  groupId?: string;
  onCharacterSelect?: (characterId: string) => void;
  onCharacterEdit?: (characterId: string) => void;
  onCharacterDelete?: (characterId: string) => void;
}

const CharacterList: React.FC<CharacterListProps> = ({
  groupId,
  onCharacterSelect,
  onCharacterEdit,
  onCharacterDelete,
}) => {
  const {
    characters,
    loading,
    error,
    fetchCharacters,
    deleteCharacter,
    clearError,
  } = useCharacterStore();

  const { selectedGroup } = useGroupStore();

  // グループIDが変更されたときに人物一覧を取得
  useEffect(() => {
    const targetGroupId = groupId || selectedGroup?.id;
    if (targetGroupId) {
      fetchCharacters(targetGroupId);
    }
  }, [groupId, selectedGroup?.id, fetchCharacters]);

  // エラーをクリア
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleCharacterDelete = async (characterId: string) => {
    if (window.confirm('この人物を削除しますか？関連する関係データも削除されます。')) {
      const success = await deleteCharacter(characterId);
      if (success && onCharacterDelete) {
        onCharacterDelete(characterId);
      }
    }
  };

  if (loading.list) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">人物を読み込み中...</span>
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
            <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="bg-red-100 px-2 py-1 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={clearError}
              >
                エラーを閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">人物がありません</h3>
        <p className="mt-1 text-sm text-gray-500">
          {selectedGroup ? `${selectedGroup.name}グループに` : ''}人物を追加して始めましょう。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          人物一覧
          {selectedGroup && (
            <span className="ml-2 text-sm text-gray-500">
              ({selectedGroup.name})
            </span>
          )}
        </h2>
        <span className="text-sm text-gray-500">
          {characters.length}人
        </span>
      </div>

      {/* 人物カード一覧 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            onSelect={onCharacterSelect ? () => onCharacterSelect(character.id) : undefined}
            onEdit={onCharacterEdit ? () => onCharacterEdit(character.id) : undefined}
            onDelete={() => handleCharacterDelete(character.id)}
            isDeleting={loading.delete}
          />
        ))}
      </div>
    </div>
  );
};

export default CharacterList;