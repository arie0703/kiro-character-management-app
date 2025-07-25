import React, { useState, useEffect } from 'react';
import { Group, CreateGroupData, UpdateGroupData } from '../../types';
import { useGroupStore } from '../../stores/groupStore';

interface GroupFormProps {
  group?: Group; // 編集時に渡される既存グループ
  onSuccess?: (group: Group) => void;
  onCancel?: () => void;
}

const GroupForm: React.FC<GroupFormProps> = ({ 
  group, 
  onSuccess, 
  onCancel 
}) => {
  const { createGroup, updateGroup, loading, error, clearError } = useGroupStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  const isEditing = !!group;

  // 編集時の初期値設定
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        description: group.description || '',
      });
    }
  }, [group]);

  // エラークリア
  useEffect(() => {
    clearError();
  }, [clearError]);

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'グループ名は必須です';
    } else if (formData.name.length > 255) {
      errors.name = 'グループ名は255文字以内で入力してください';
    }
    
    if (formData.description && formData.description.length > 1000) {
      errors.description = '説明は1000文字以内で入力してください';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    };

    let result: Group | null = null;

    if (isEditing && group) {
      result = await updateGroup(group.id, submitData as UpdateGroupData);
    } else {
      result = await createGroup(submitData as CreateGroupData);
    }

    if (result && onSuccess) {
      onSuccess(result);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // リアルタイムバリデーション
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const isSubmitting = isEditing ? loading.update : loading.create;

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          {isEditing ? 'グループを編集' : '新しいグループを作成'}
        </h3>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
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
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              グループ名 <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  validationErrors.name ? 'border-red-300' : ''
                }`}
                placeholder="例: 歴史上の人物"
                maxLength={255}
              />
              {validationErrors.name && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              説明
            </label>
            <div className="mt-1">
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  validationErrors.description ? 'border-red-300' : ''
                }`}
                placeholder="このグループについての説明を入力してください（任意）"
                maxLength={1000}
              />
              {validationErrors.description && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.description}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                {formData.description.length}/1000文字
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                キャンセル
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? '更新中...' : '作成中...'}
                </>
              ) : (
                isEditing ? '更新' : '作成'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupForm;