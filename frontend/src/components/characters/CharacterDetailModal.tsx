import React from 'react';
import { Character } from '../../types';
import { Modal } from '../common';
import CharacterDetail from './CharacterDetail';

interface CharacterDetailModalProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({
  character,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  if (!character) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <CharacterDetail
        character={character}
        onEdit={onEdit}
        onDelete={onDelete}
        onClose={onClose}
        isDeleting={isDeleting}
      />
    </Modal>
  );
};

export default CharacterDetailModal;