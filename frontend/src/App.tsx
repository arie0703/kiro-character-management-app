import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GroupList from './components/groups/GroupList';
import GroupForm from './components/groups/GroupForm';
import Modal from './components/common/Modal';
import ConfirmDialog from './components/common/ConfirmDialog';
import { Group } from './types';
import { useGroupStore } from './stores/groupStore';

function App() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
  
  const { deleteGroup, loading } = useGroupStore();

  const handleGroupSelect = (groupId: string) => {
    console.log('Selected group:', groupId);
    // TODO: Navigate to group detail page
  };

  const handleCreateGroup = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setIsEditModalOpen(true);
  };

  const handleDeleteGroup = (group: Group) => {
    setDeletingGroup(group);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingGroup) {
      const success = await deleteGroup(deletingGroup.id);
      if (success) {
        setIsDeleteDialogOpen(false);
        setDeletingGroup(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeletingGroup(null);
  };

  const handleFormSuccess = (group: Group) => {
    console.log('Group saved:', group);
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setEditingGroup(null);
  };

  const handleFormCancel = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setEditingGroup(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                人物管理アプリ
              </h1>
              <button
                onClick={handleCreateGroup}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                新しいグループ
              </button>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={
              <div className="px-4 py-6 sm:px-0">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    グループ一覧
                  </h2>
                  <GroupList 
                    onGroupSelect={handleGroupSelect}
                    onGroupEdit={handleEditGroup}
                    onGroupDelete={handleDeleteGroup}
                  />
                </div>
              </div>
            } />
          </Routes>
        </main>

        {/* Create Group Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={handleFormCancel}
          size="md"
        >
          <GroupForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </Modal>

        {/* Edit Group Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={handleFormCancel}
          size="md"
        >
          <GroupForm
            group={editingGroup || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="グループを削除"
          message={
            deletingGroup
              ? `「${deletingGroup.name}」を削除しますか？このグループに含まれる人物、関係、ラベルもすべて削除されます。この操作は取り消せません。`
              : ''
          }
          confirmText="削除"
          cancelText="キャンセル"
          type="danger"
          isLoading={loading.delete}
        />
      </div>
    </Router>
  );
}

export default App;