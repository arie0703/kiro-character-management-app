import React, { useState, useEffect } from 'react';
import { Character, CreateCharacterData, UpdateCharacterData } from '../../types';
import { useCharacterStore } from '../../stores/characterStore';
import { useGroupStore } from '../../stores/groupStore';

interface CharacterFormProps {
  character?: Character; // 編集時に渡される
  groupId?: string; // 新規作成時のグループID
  onSuccess?: (character: Character) => void;
  onCancel?: () => void;
}

const CharacterForm: React.FC<CharacterFormProps> = ({
  character,
  groupId,
  onSuccess,
  onCancel,
}) => {
  const { createCharacter, updateCharacter, loading, error, clearError } = useCharacterStore();
  const { selectedGroup, groups } = useGroupStore();

  // フォームの状態
  const [formData, setFormData] = useState({
    name: character?.name || '',
    information: character?.information || '',
    relatedLinks: character?.relatedLinks || [''],
    groupId: character?.groupId || groupId || selectedGroup?.id || '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(character?.photo || null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // エラーをクリア
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // ファイル選択時の処理
  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(character?.photo || null);
    }
  };

  // フォーム入力の処理
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // バリデーションエラーをクリア
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 関連リンクの追加
  const addRelatedLink = () => {
    setFormData(prev => ({
      ...prev,
      relatedLinks: [...prev.relatedLinks, '']
    }));
  };

  // 関連リンクの削除
  const removeRelatedLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      relatedLinks: prev.relatedLinks.filter((_, i) => i !== index)
    }));
  };

  // 関連リンクの更新
  const updateRelatedLink = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      relatedLinks: prev.relatedLinks.map((link, i) => i === index ? value : link)
    }));
  };

  // バリデーション
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = '名前は必須です';
    } else if (formData.name.length > 255) {
      errors.name = '名前は255文字以内で入力してください';
    }

    if (!formData.groupId) {
      errors.groupId = 'グループを選択してください';
    }

    if (formData.information.length > 10000) {
      errors.information = '情報は10000文字以内で入力してください';
    }

    // 関連リンクのバリデーション（空でないもののみ）
    const validLinks = formData.relatedLinks.filter(link => link.trim());
    for (let i = 0; i < validLinks.length; i++) {
      const link = validLinks[i];
      try {
        new URL(link);
      } catch {
        errors[`relatedLink_${i}`] = '有効なURLを入力してください';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // 空の関連リンクを除去
    const cleanedLinks = formData.relatedLinks.filter(link => link.trim());

    try {
      let result: Character | null = null;

      if (character) {
        // 更新
        const updateData: UpdateCharacterData = {
          name: formData.name,
          information: formData.information,
          relatedLinks: cleanedLinks,
          groupId: formData.groupId,
        };
        result = await updateCharacter(character.id, updateData, selectedFile || undefined);
      } else {
        // 新規作成
        const createData: CreateCharacterData = {
          name: formData.name,
          information: formData.information,
          relatedLinks: cleanedLinks,
          groupId: formData.groupId,
        };
        result = await createCharacter(createData, selectedFile || undefined);
      }

      if (result && onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Character form submission error:', error);
    }
  };

  const isLoading = loading.create || loading.update;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* エラー表示 */}
      {error && (
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
            </div>
          </div>
        </div>
      )}

      {/* グループ選択 */}
      <div>
        <label htmlFor="groupId" className="block text-sm font-medium text-gray-700">
          グループ <span className="text-red-500">*</span>
        </label>
        <select
          id="groupId"
          value={formData.groupId}
          onChange={(e) => handleInputChange('groupId', e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            validationErrors.groupId ? 'border-red-300' : ''
          }`}
          disabled={isLoading}
        >
          <option value="">グループを選択してください</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
        {validationErrors.groupId && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.groupId}</p>
        )}
      </div>

      {/* 名前 */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          名前 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            validationErrors.name ? 'border-red-300' : ''
          }`}
          placeholder="人物の名前を入力してください"
          disabled={isLoading}
        />
        {validationErrors.name && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
        )}
      </div>

      {/* 画像アップロード */}
      <div>
        <label className="block text-sm font-medium text-gray-700">写真</label>
        <div className="mt-1 flex items-center space-x-4">
          {/* プレビュー */}
          <div className="flex-shrink-0">
            {previewUrl ? (
              <img
                className="h-20 w-20 rounded-lg object-cover"
                src={previewUrl}
                alt="プレビュー"
              />
            ) : (
              <div className="h-20 w-20 rounded-lg bg-gray-200 flex items-center justify-center">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* ファイル選択ボタン */}
          <div>
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              className="hidden"
              disabled={isLoading}
            />
            <label
              htmlFor="photo"
              className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              画像を選択
            </label>
            {selectedFile && (
              <button
                type="button"
                onClick={() => handleFileSelect(null)}
                className="ml-2 text-sm text-red-600 hover:text-red-800"
                disabled={isLoading}
              >
                削除
              </button>
            )}
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          JPG、PNG、GIF形式の画像をアップロードできます。
        </p>
      </div>

      {/* 情報 */}
      <div>
        <label htmlFor="information" className="block text-sm font-medium text-gray-700">
          情報
        </label>
        <textarea
          id="information"
          rows={4}
          value={formData.information}
          onChange={(e) => handleInputChange('information', e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            validationErrors.information ? 'border-red-300' : ''
          }`}
          placeholder="人物に関する情報を入力してください"
          disabled={isLoading}
        />
        {validationErrors.information && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.information}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {formData.information.length}/10000文字
        </p>
      </div>

      {/* 関連リンク */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">関連リンク</label>
          <button
            type="button"
            onClick={addRelatedLink}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={isLoading}
          >
            + リンクを追加
          </button>
        </div>
        <div className="mt-1 space-y-2">
          {formData.relatedLinks.map((link, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="url"
                value={link}
                onChange={(e) => updateRelatedLink(index, e.target.value)}
                className={`flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  validationErrors[`relatedLink_${index}`] ? 'border-red-300' : ''
                }`}
                placeholder="https://example.com"
                disabled={isLoading}
              />
              {formData.relatedLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRelatedLink(index)}
                  className="text-red-600 hover:text-red-800"
                  disabled={isLoading}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          人物に関連するWebサイトやSNSのURLを追加できます。
        </p>
      </div>

      {/* アクションボタン */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
              {character ? '更新中...' : '作成中...'}
            </>
          ) : (
            character ? '更新' : '作成'
          )}
        </button>
      </div>
    </form>
  );
};

export default CharacterForm;