import React, { useState, useEffect } from 'react';
import { CreateRelationshipData } from '../../types';
import { useCharacterStore } from '../../stores/characterStore';
import { useRelationshipStore } from '../../stores/relationshipStore';

interface RelationshipFormProps {
  groupId: string;
  initialData?: {
    id: string;
    character1Id: string;
    character2Id: string;
    relationshipType: string;
    description?: string;
  };
  onSubmit: (data: CreateRelationshipData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const RELATIONSHIP_TYPES = [
  '友人',
  '恋人',
  '夫婦',
  '親子',
  '兄弟姉妹',
  '同僚',
  '上司・部下',
  '師弟',
  '敵対',
  'その他'
];

export const RelationshipForm: React.FC<RelationshipFormProps> = ({
  groupId,
  initialData,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const { characters, fetchCharacters } = useCharacterStore();
  const { loading } = useRelationshipStore();
  
  const [formData, setFormData] = useState({
    character1Id: initialData?.character1Id || '',
    character2Id: initialData?.character2Id || '',
    relationshipType: initialData?.relationshipType || '',
    description: initialData?.description || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // グループの人物一覧を取得
  useEffect(() => {
    if (groupId) {
      fetchCharacters(groupId);
    }
  }, [groupId, fetchCharacters]);

  // フォームデータの変更ハンドラ
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // バリデーション
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.character1Id) {
      newErrors.character1Id = '1人目の人物を選択してください';
    }

    if (!formData.character2Id) {
      newErrors.character2Id = '2人目の人物を選択してください';
    }

    if (formData.character1Id === formData.character2Id) {
      newErrors.character2Id = '同じ人物同士の関係は作成できません';
    }

    if (!formData.relationshipType) {
      newErrors.relationshipType = '関係タイプを選択してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      character1Id: formData.character1Id,
      character2Id: formData.character2Id,
      relationshipType: formData.relationshipType,
      description: formData.description || undefined
    };

    onSubmit(submitData);
  };

  // 選択可能な人物一覧（グループ内の人物のみ）
  const availableCharacters = characters.filter(char => char.groupId === groupId);

  // 2人目の選択肢（1人目で選択した人物を除外）
  const secondCharacterOptions = availableCharacters.filter(
    char => char.id !== formData.character1Id
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1人目の人物選択 */}
        <div>
          <label htmlFor="character1Id" className="block text-sm font-medium text-gray-700 mb-2">
            1人目の人物 *
          </label>
          <select
            id="character1Id"
            value={formData.character1Id}
            onChange={(e) => {
              handleChange('character1Id', e.target.value);
              // 1人目を変更した場合、2人目をリセット
              if (formData.character2Id === e.target.value) {
                handleChange('character2Id', '');
              }
            }}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.character1Id ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading.create || loading.update}
          >
            <option value="">人物を選択してください</option>
            {availableCharacters.map(character => (
              <option key={character.id} value={character.id}>
                {character.name}
              </option>
            ))}
          </select>
          {errors.character1Id && (
            <p className="mt-1 text-sm text-red-600">{errors.character1Id}</p>
          )}
        </div>

        {/* 2人目の人物選択 */}
        <div>
          <label htmlFor="character2Id" className="block text-sm font-medium text-gray-700 mb-2">
            2人目の人物 *
          </label>
          <select
            id="character2Id"
            value={formData.character2Id}
            onChange={(e) => handleChange('character2Id', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.character2Id ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading.create || loading.update || !formData.character1Id}
          >
            <option value="">人物を選択してください</option>
            {secondCharacterOptions.map(character => (
              <option key={character.id} value={character.id}>
                {character.name}
              </option>
            ))}
          </select>
          {errors.character2Id && (
            <p className="mt-1 text-sm text-red-600">{errors.character2Id}</p>
          )}
        </div>
      </div>

      {/* 関係タイプ選択 */}
      <div>
        <label htmlFor="relationshipType" className="block text-sm font-medium text-gray-700 mb-2">
          関係タイプ *
        </label>
        <select
          id="relationshipType"
          value={formData.relationshipType}
          onChange={(e) => handleChange('relationshipType', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.relationshipType ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={loading.create || loading.update}
        >
          <option value="">関係タイプを選択してください</option>
          {RELATIONSHIP_TYPES.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.relationshipType && (
          <p className="mt-1 text-sm text-red-600">{errors.relationshipType}</p>
        )}
      </div>

      {/* 説明（任意） */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          説明（任意）
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="関係の詳細や補足情報を入力してください"
          disabled={loading.create || loading.update}
        />
      </div>

      {/* ボタン */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading.create || loading.update}
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading.create || loading.update}
        >
          {loading.create || loading.update ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isEditing ? '更新中...' : '作成中...'}
            </div>
          ) : (
            isEditing ? '更新' : '作成'
          )}
        </button>
      </div>
    </form>
  );
};