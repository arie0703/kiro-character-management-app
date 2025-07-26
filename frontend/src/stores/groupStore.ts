import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
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
      name: 'group-store',
    }
  )
);
