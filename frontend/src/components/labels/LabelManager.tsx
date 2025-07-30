import React, { useState, useEffect } from 'react';
import { useLabelStore } from '../../stores/labelStore';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';

interface LabelManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LabelManager: React.FC<LabelManagerProps> = ({ isOpen, onClose }) => {
    const {
        labels,
        loading,
        error,
        fetchLabels,
        deleteLabel,
        clearError
    } = useLabelStore();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLabel, setEditingLabel] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchLabels();
        }
    }, [isOpen, fetchLabels]);

    const handleCreateLabel = () => {
        setEditingLabel(null);
        setIsFormOpen(true);
    };

    const handleEditLabel = (labelId: string) => {
        setEditingLabel(labelId);
        setIsFormOpen(true);
    };

    const handleDeleteLabel = async (labelId: string) => {
        const success = await deleteLabel(labelId);
        if (success) {
            setDeleteConfirm(null);
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingLabel(null);
        // ラベル一覧を再取得
        fetchLabels();
    };

    if (!isOpen) return null;

    return (
        <>
            <Modal isOpen={isOpen && !isFormOpen} onClose={onClose} title="ラベル管理">
                <div className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                            <button
                                onClick={clearError}
                                className="ml-2 text-red-500 hover:text-red-700"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">ラベル一覧</h3>
                        <button
                            onClick={handleCreateLabel}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            disabled={loading.create}
                        >
                            新しいラベル
                        </button>
                    </div>

                    {loading.list ? (
                        <div className="text-center py-4">読み込み中...</div>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {labels.map((label) => (
                                <div
                                    key={label.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                                            style={{ backgroundColor: label.color }}
                                        />
                                        <span className="font-medium">{label.name}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditLabel(label.id)}
                                            className="text-blue-500 hover:text-blue-700 px-2 py-1 text-sm"
                                            disabled={loading.update}
                                        >
                                            編集
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(label.id)}
                                            className="text-red-500 hover:text-red-700 px-2 py-1 text-sm"
                                            disabled={loading.delete}
                                        >
                                            削除
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {labels.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    ラベルがありません
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Modal>

            <LabelForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                editingLabelId={editingLabel}
            />

            {deleteConfirm && (
                <ConfirmDialog
                    isOpen={true}
                    title="ラベルの削除"
                    message="このラベルを削除しますか？この操作は取り消せません。"
                    onConfirm={() => handleDeleteLabel(deleteConfirm)}
                    onClose={() => setDeleteConfirm(null)}
                    confirmText="削除"
                    cancelText="キャンセル"
                />
            )}
        </>
    );
};

interface LabelFormProps {
    isOpen: boolean;
    onClose: () => void;
    editingLabelId?: string | null;
}

const LabelForm: React.FC<LabelFormProps> = ({ isOpen, onClose, editingLabelId }) => {
    const { labels, createLabel, updateLabel, loading } = useLabelStore();
    const [name, setName] = useState('');
    const [color, setColor] = useState('#3B82F6');

    const editingLabel = editingLabelId ? labels.find(l => l.id === editingLabelId) : null;

    // 名前の重複チェック
    const isDuplicateName = name.trim() && labels.some(label =>
        label.name.toLowerCase() === name.trim().toLowerCase() &&
        label.id !== editingLabelId
    );

    useEffect(() => {
        if (editingLabel) {
            setName(editingLabel.name);
            setColor(editingLabel.color);
        } else {
            setName('');
            setColor('#3B82F6');
        }
    }, [editingLabel]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return;

        // クライアントサイドでの重複チェック
        const trimmedName = name.trim();
        const existingLabel = labels.find(label =>
            label.name.toLowerCase() === trimmedName.toLowerCase() &&
            label.id !== editingLabelId
        );

        if (existingLabel) {
            // 重複エラーを表示するため、ストアのエラー状態を更新
            // この場合は直接アラートで表示
            alert(`ラベル名「${trimmedName}」は既に存在します。別の名前を入力してください。`);
            return;
        }

        const labelData = { name: trimmedName, color };

        let success = false;
        if (editingLabelId) {
            const result = await updateLabel(editingLabelId, labelData);
            success = result !== null;
        } else {
            const result = await createLabel(labelData);
            success = result !== null;
        }

        if (success) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingLabelId ? 'ラベルの編集' : '新しいラベル'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        ラベル名
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${isDuplicateName
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                            }`}
                        placeholder="ラベル名を入力"
                        required
                    />
                    {isDuplicateName && (
                        <p className="mt-1 text-sm text-red-600">
                            この名前のラベルは既に存在します
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                        色
                    </label>
                    <div className="flex items-center space-x-3">
                        <input
                            type="color"
                            id="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <div className="flex items-center space-x-2">
                            <div
                                className="w-6 h-6 rounded-full border-2 border-gray-300"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-sm text-gray-600">{color}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                    >
                        キャンセル
                    </button>
                    <button
                        type="submit"
                        disabled={Boolean(loading.create || loading.update || !name.trim() || isDuplicateName)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading.create || loading.update ? '保存中...' : '保存'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};