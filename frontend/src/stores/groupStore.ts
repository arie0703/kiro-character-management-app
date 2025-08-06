import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Group, CreateGroupData, UpdateGroupData, ApiError } from '../types';
import { groupApi } from '../services/api';
import { formatApiError } from '../services/utils';

interface GroupState {
  // データ
  groups: Group[];
  selectedGroup: Group | null;

  // ローディング状態
  loading: {
    list: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };

  // エラー状態
  error: string | null;

  // アクション
  fetchGroups: () => Promise<void>;
  fetchGroupById: (id: string) => Promise<void>;
  createGroup: (data: CreateGroupData) => Promise<Group | null>;
  updateGroup: (id: string, data: UpdateGroupData) => Promise<Group | null>;
  deleteGroup: (id: string) => Promise<boolean>;
  selectGroup: (group: Group | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  groups: [],
  selectedGroup: null,
  loading: {
    list: false,
    create: false,
    update: false,
    delete: false,
  },
  error: null,
};

export const useGroupStore = create<GroupState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

      fetchGroups: async () => {
        set(state => ({
          ...state,
          loading: { ...state.loading, list: true },
          error: null
        }));

        try {
          const groups = await groupApi.getAll();
          set(state => ({
            ...state,
            groups,
            loading: { ...state.loading, list: false }
          }));
        } catch (error) {
          console.log(error);
          set(state => ({
            ...state,
            error: formatApiError(error as ApiError),
            loading: { ...state.loading, list: false }
          }));
        }
      },

      fetchGroupById: async (id: string) => {
        set(state => ({
          ...state,
          loading: { ...state.loading, list: true },
          error: null
        }));

        try {
          const group = await groupApi.getById(id);
          set(state => ({
            ...state,
            selectedGroup: group,
            // groupsにも追加/更新してキャッシュを維持
            groups: state.groups.some(g => g.id === id) 
              ? state.groups.map(g => g.id === id ? group : g)
              : [...state.groups, group],
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

      createGroup: async (data: CreateGroupData) => {
        set(state => ({
          ...state,
          loading: { ...state.loading, create: true },
          error: null
        }));

        try {
          const newGroup = await groupApi.create(data);
          set(state => ({
            ...state,
            groups: [...state.groups, newGroup],
            loading: { ...state.loading, create: false }
          }));
          return newGroup;
        } catch (error) {
          set(state => ({
            ...state,
            error: formatApiError(error as ApiError),
            loading: { ...state.loading, create: false }
          }));
          return null;
        }
      },

      updateGroup: async (id: string, data: UpdateGroupData) => {
        set(state => ({
          ...state,
          loading: { ...state.loading, update: true },
          error: null
        }));

        try {
          const updatedGroup = await groupApi.update(id, data);
          set(state => ({
            ...state,
            groups: state.groups.map(group =>
              group.id === id ? updatedGroup : group
            ),
            selectedGroup: state.selectedGroup?.id === id ? updatedGroup : state.selectedGroup,
            loading: { ...state.loading, update: false }
          }));
          return updatedGroup;
        } catch (error) {
          set(state => ({
            ...state,
            error: formatApiError(error as ApiError),
            loading: { ...state.loading, update: false }
          }));
          return null;
        }
      },

      deleteGroup: async (id: string) => {
        set(state => ({
          ...state,
          loading: { ...state.loading, delete: true },
          error: null
        }));

        try {
          await groupApi.delete(id);
          set(state => ({
            ...state,
            groups: state.groups.filter(group => group.id !== id),
            selectedGroup: state.selectedGroup?.id === id ? null : state.selectedGroup,
            loading: { ...state.loading, delete: false }
          }));
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

      selectGroup: (group: Group | null) => {
        set(state => ({ ...state, selectedGroup: group }));
      },

      clearError: () => {
        set(state => ({ ...state, error: null }));
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'group-storage', // localStorage key
      partialize: (state) => ({ 
        groups: state.groups,
        selectedGroup: state.selectedGroup 
      }), // キャッシュする部分を指定
      onRehydrateStorage: () => (state) => {
        // キャッシュから復元時に日付文字列をDateオブジェクトに変換
        if (state) {
          state.groups = state.groups.map(group => ({
            ...group,
            createdAt: typeof group.createdAt === 'string' ? new Date(group.createdAt) : group.createdAt,
            updatedAt: typeof group.updatedAt === 'string' ? new Date(group.updatedAt) : group.updatedAt,
          }));
          if (state.selectedGroup) {
            console.log(state.selectedGroup)
            state.selectedGroup = {
              ...state.selectedGroup,
              createdAt: typeof state.selectedGroup.createdAt === 'string' ? new Date(state.selectedGroup.createdAt) : state.selectedGroup.createdAt,
              updatedAt: typeof state.selectedGroup.updatedAt === 'string' ? new Date(state.selectedGroup.updatedAt) : state.selectedGroup.updatedAt,
            };
          }
        }
      },
    }
  ),
  {
    name: 'group-store',
  }
)
);
