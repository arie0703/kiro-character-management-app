import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Label, CreateLabelData, UpdateLabelData, ApiError } from '../types';
import { labelApi } from '../services/api';
import { formatApiError } from '../services/utils';

interface LabelState {
  // データ
  labels: Label[];
  selectedLabel: Label | null;
  
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
  fetchLabels: () => Promise<void>;
  fetchLabelById: (id: string) => Promise<void>;
  createLabel: (data: CreateLabelData) => Promise<Label | null>;
  updateLabel: (id: string, data: UpdateLabelData) => Promise<Label | null>;
  deleteLabel: (id: string) => Promise<boolean>;
  selectLabel: (label: Label | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  labels: [],
  selectedLabel: null,
  loading: {
    list: false,
    create: false,
    update: false,
    delete: false,
  },
  error: null,
};

export const useLabelStore = create<LabelState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchLabels: async () => {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, list: true },
          error: null 
        }));

        try {
          const labels = await labelApi.getAll();
          set(state => ({ 
            ...state, 
            labels,
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

      fetchLabelById: async (id: string) => {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, list: true },
          error: null 
        }));

        try {
          const label = await labelApi.getById(id);
          set(state => ({ 
            ...state, 
            selectedLabel: label,
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

      createLabel: async (data: CreateLabelData) => {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, create: true },
          error: null 
        }));

        try {
          const newLabel = await labelApi.create(data);
          set(state => ({ 
            ...state, 
            labels: [...state.labels, newLabel],
            loading: { ...state.loading, create: false }
          }));
          return newLabel;
        } catch (error) {
          set(state => ({ 
            ...state, 
            error: formatApiError(error as ApiError),
            loading: { ...state.loading, create: false }
          }));
          return null;
        }
      },

      updateLabel: async (id: string, data: UpdateLabelData) => {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, update: true },
          error: null 
        }));

        try {
          const updatedLabel = await labelApi.update(id, data);
          set(state => ({ 
            ...state, 
            labels: state.labels.map(label => 
              label.id === id ? updatedLabel : label
            ),
            selectedLabel: state.selectedLabel?.id === id ? updatedLabel : state.selectedLabel,
            loading: { ...state.loading, update: false }
          }));
          return updatedLabel;
        } catch (error) {
          set(state => ({ 
            ...state, 
            error: formatApiError(error as ApiError),
            loading: { ...state.loading, update: false }
          }));
          return null;
        }
      },

      deleteLabel: async (id: string) => {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, delete: true },
          error: null 
        }));

        try {
          await labelApi.delete(id);
          set(state => ({ 
            ...state, 
            labels: state.labels.filter(label => label.id !== id),
            selectedLabel: state.selectedLabel?.id === id ? null : state.selectedLabel,
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

      selectLabel: (label: Label | null) => {
        set(state => ({ ...state, selectedLabel: label }));
      },

      clearError: () => {
        set(state => ({ ...state, error: null }));
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'label-store',
    }
  )
);