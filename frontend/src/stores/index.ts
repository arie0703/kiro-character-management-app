// Store exports
export { useGroupStore } from './groupStore';
export { useCharacterStore } from './characterStore';
export { useLabelStore } from './labelStore';
export { useRelationshipStore } from './relationshipStore';

// Store types
export type {
  GroupState,
  CharacterState,
  LabelState,
  RelationshipState,
} from './types';

// Utility hooks for common operations
import { useGroupStore } from './groupStore';
import { useCharacterStore } from './characterStore';
import { useLabelStore } from './labelStore';
import { useRelationshipStore } from './relationshipStore';

/**
 * 全ストアをリセットするユーティリティフック
 */
export const useResetAllStores = () => {
  const resetGroups = useGroupStore(state => state.reset);
  const resetCharacters = useCharacterStore(state => state.reset);
  const resetLabels = useLabelStore(state => state.reset);
  const resetRelationships = useRelationshipStore(state => state.reset);

  return () => {
    resetGroups();
    resetCharacters();
    resetLabels();
    resetRelationships();
  };
};

/**
 * 全ストアのエラーをクリアするユーティリティフック
 */
export const useClearAllErrors = () => {
  const clearGroupError = useGroupStore(state => state.clearError);
  const clearCharacterError = useCharacterStore(state => state.clearError);
  const clearLabelError = useLabelStore(state => state.clearError);
  const clearRelationshipError = useRelationshipStore(state => state.clearError);

  return () => {
    clearGroupError();
    clearCharacterError();
    clearLabelError();
    clearRelationshipError();
  };
};

/**
 * 全ストアのローディング状態を取得するユーティリティフック
 */
export const useGlobalLoading = () => {
  const groupLoading = useGroupStore(state => 
    Object.values(state.loading).some(loading => loading)
  );
  const characterLoading = useCharacterStore(state => 
    Object.values(state.loading).some(loading => loading)
  );
  const labelLoading = useLabelStore(state => 
    Object.values(state.loading).some(loading => loading)
  );
  const relationshipLoading = useRelationshipStore(state => 
    Object.values(state.loading).some(loading => loading)
  );

  return groupLoading || characterLoading || labelLoading || relationshipLoading;
};

/**
 * 全ストアのエラー状態を取得するユーティリティフック
 */
export const useGlobalErrors = () => {
  const groupError = useGroupStore(state => state.error);
  const characterError = useCharacterStore(state => state.error);
  const labelError = useLabelStore(state => state.error);
  const relationshipError = useRelationshipStore(state => state.error);

  const errors = [groupError, characterError, labelError, relationshipError]
    .filter(error => error !== null);

  return errors;
};

/**
 * 初期データを読み込むユーティリティフック
 */
export const useInitializeData = () => {
  const fetchGroups = useGroupStore(state => state.fetchGroups);
  const fetchLabels = useLabelStore(state => state.fetchLabels);

  return async () => {
    await Promise.all([
      fetchGroups(),
      fetchLabels(),
    ]);
  };
};