import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Character, CreateCharacterData, UpdateCharacterData, ApiError } from '../types';
import { characterApi } from '../services/api';
import { formatApiError, createCharacterFormData } from '../services/utils';

interface CharacterState {
  // データ
  characters: Character[];
  selectedCharacter: Character | null;

  // ローディング状態
  loading: {
    list: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    addLabel: boolean;
    removeLabel: boolean;
  };

  // エラー状態
  error: string | null;

  // アクション
  fetchCharacters: (groupId?: string) => Promise<void>;
  fetchCharacterById: (id: string) => Promise<void>;
  createCharacter: (data: CreateCharacterData, photo?: File) => Promise<Character | null>;
  updateCharacter: (id: string, data: UpdateCharacterData, photo?: File) => Promise<Character | null>;
  deleteCharacter: (id: string) => Promise<boolean>;
  addLabelToCharacter: (characterId: string, labelId: string) => Promise<boolean>;
  removeLabelFromCharacter: (characterId: string, labelId: string) => Promise<boolean>;
  updateCharacterInStore: (updatedCharacter: Character) => void;
  selectCharacter: (character: Character | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  characters: [],
  selectedCharacter: null,
  loading: {
    list: false,
    create: false,
    update: false,
    delete: false,
    addLabel: false,
    removeLabel: false,
  },
  error: null,
};

export const useCharacterStore = create<CharacterState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchCharacters: async (groupId?: string) => {
        set(state => ({
          ...state,
          loading: { ...state.loading, list: true },
          error: null
        }));

        try {
          const characters = await characterApi.getAll(groupId);
          set(state => ({
            ...state,
            characters,
            loading: { ...state.loading, list: false }
          }));
        } catch (error) {
          set(state => ({
            ...state,
            error: formatApiError(error as ApiError),
            loading: { ...state.loading, list: false }
          }));
        }
      },

      fetchCharacterById: async (id: string) => {
        set(state => ({
          ...state,
          loading: { ...state.loading, list: true },
          error: null
        }));

        try {
          const character = await characterApi.getById(id);
          set(state => ({
            ...state,
            selectedCharacter: character,
            loading: { ...state.loading, list: false }
          }));
        } catch (error) {
          set(state => ({
            ...state,
            error: formatApiError(error as ApiError),
            loading: { ...state.loading, list: false }
          }));
        }
      },

      createCharacter: async (data: CreateCharacterData, photo?: File) => {
        set(state => ({
          ...state,
          loading: { ...state.loading, create: true },
          error: null
        }));

        try {
          let newCharacter: Character;

          if (photo) {
            const formData = createCharacterFormData(data, photo);
            newCharacter = await characterApi.createWithImage(formData);
          } else {
            newCharacter = await characterApi.create(data);
          }

          // 作成後に一覧を再取得して最新の状態を保つ
          const characters = await characterApi.getAll(data.groupId);
          set(state => ({
            ...state,
            characters,
            loading: { ...state.loading, create: false }
          }));
          return newCharacter;
        } catch (error) {
          set(state => ({
            ...state,
            error: formatApiError(error as ApiError),
            loading: { ...state.loading, create: false }
          }));
          return null;
        }
      },

      updateCharacter: async (id: string, data: UpdateCharacterData, photo?: File) => {
        set(state => ({
          ...state,
          loading: { ...state.loading, update: true },
          error: null
        }));

        try {
          let updatedCharacter: Character;

          if (photo) {
            const formData = createCharacterFormData({
              groupId: data.groupId || '',
              name: data.name || '',
              information: data.information || '',
              relatedLinks: data.relatedLinks || []
            }, photo);
            updatedCharacter = await characterApi.updateWithImage(id, formData);
          } else {
            updatedCharacter = await characterApi.update(id, data);
          }

          // 更新後に一覧を再取得して最新の状態を保つ
          const characters = await characterApi.getAll(data.groupId);
          set(state => ({
            ...state,
            characters,
            selectedCharacter: state.selectedCharacter?.id === id ? updatedCharacter : state.selectedCharacter,
            loading: { ...state.loading, update: false }
          }));
          return updatedCharacter;
        } catch (error) {
          set(state => ({
            ...state,
            error: formatApiError(error as ApiError),
            loading: { ...state.loading, update: false }
          }));
          return null;
        }
      },

      deleteCharacter: async (id: string) => {
        set(state => ({
          ...state,
          loading: { ...state.loading, delete: true },
          error: null
        }));

        try {
          await characterApi.delete(id);

          // 削除後に一覧を再取得して最新の状態を保つ
          // 現在のグループIDを取得するために、削除対象のキャラクターから取得
          const deletedCharacter = get().characters.find(c => c.id === id);
          if (deletedCharacter) {
            const characters = await characterApi.getAll(deletedCharacter.groupId);
            set(state => ({
              ...state,
              characters,
              selectedCharacter: state.selectedCharacter?.id === id ? null : state.selectedCharacter,
              loading: { ...state.loading, delete: false }
            }));
          } else {
            set(state => ({
              ...state,
              characters: state.characters.filter(character => character.id !== id),
              selectedCharacter: state.selectedCharacter?.id === id ? null : state.selectedCharacter,
              loading: { ...state.loading, delete: false }
            }));
          }
          return true;
        } catch (error) {
          set(state => ({
            ...state,
            error: formatApiError(error as ApiError),
            loading: { ...state.loading, delete: false }
          }));
          return false;
        }
      },

      addLabelToCharacter: async (characterId: string, labelId: string) => {
        set(state => ({
          ...state,
          loading: { ...state.loading, addLabel: true },
          error: null
        }));

        try {
          await characterApi.addLabel(characterId, labelId);

          // キャラクターを再取得してラベル情報を更新（個別更新）
          const updatedCharacter = await characterApi.getById(characterId);

          set(state => ({
            ...state,
            characters: state.characters.map(character =>
              character.id === characterId ? updatedCharacter : character
            ),
            selectedCharacter: state.selectedCharacter?.id === characterId ? updatedCharacter : state.selectedCharacter,
            loading: { ...state.loading, addLabel: false }
          }));
          return true;
        } catch (error) {
          set(state => ({
            ...state,
            error: formatApiError(error as ApiError),
            loading: { ...state.loading, addLabel: false }
          }));
          return false;
        }
      },

      removeLabelFromCharacter: async (characterId: string, labelId: string) => {
        set(state => ({
          ...state,
          loading: { ...state.loading, removeLabel: true },
          error: null
        }));

        try {
          await characterApi.removeLabel(characterId, labelId);

          // キャラクターを再取得してラベル情報を更新（個別更新）
          const updatedCharacter = await characterApi.getById(characterId);

          set(state => ({
            ...state,
            characters: state.characters.map(character =>
              character.id === characterId ? updatedCharacter : character
            ),
            selectedCharacter: state.selectedCharacter?.id === characterId ? updatedCharacter : state.selectedCharacter,
            loading: { ...state.loading, removeLabel: false }
          }));
          return true;
        } catch (error) {
          set(state => ({
            ...state,
            error: formatApiError(error as ApiError),
            loading: { ...state.loading, removeLabel: false }
          }));
          return false;
        }
      },

      updateCharacterInStore: (updatedCharacter: Character) => {
        set(state => ({
          ...state,
          characters: state.characters.map(character =>
            character.id === updatedCharacter.id ? updatedCharacter : character
          ),
          selectedCharacter: state.selectedCharacter?.id === updatedCharacter.id ? updatedCharacter : state.selectedCharacter,
        }));
      },

      selectCharacter: (character: Character | null) => {
        set(state => ({ ...state, selectedCharacter: character }));
      },

      clearError: () => {
        set(state => ({ ...state, error: null }));
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'character-store',
    }
  )
);
