import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Relationship, CreateRelationshipData, UpdateRelationshipData, ApiError } from '../types';
import { relationshipApi } from '../services/api';
import { formatApiError } from '../services/utils';

interface RelationshipState {
  // データ
  relationships: Relationship[];
  selectedRelationship: Relationship | null;
  
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
  fetchRelationships: (groupId?: string, characterId?: string) => Promise<void>;
  fetchRelationshipById: (id: string) => Promise<void>;
  createRelationship: (data: CreateRelationshipData) => Promise<Relationship | null>;
  updateRelationship: (id: string, data: UpdateRelationshipData) => Promise<Relationship | null>;
  deleteRelationship: (id: string) => Promise<boolean>;
  selectRelationship: (relationship: Relationship | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  relationships: [],
  selectedRelationship: null,
  loading: {
    list: false,
    create: false,
    update: false,
    delete: false,
  },
  error: null,
};

export const useRelationshipStore = create<RelationshipState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchRelationships: async (groupId?: string, characterId?: string) => {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, list: true },
          error: null 
        }));

        try {
          const relationships = await relationshipApi.getAll(groupId, characterId);
          set(state => ({ 
            ...state, 
            relationships,
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

      fetchRelationshipById: async (id: string) => {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, list: true },
          error: null 
        }));

        try {
          const relationship = await relationshipApi.getById(id);
          set(state => ({ 
            ...state, 
            selectedRelationship: relationship,
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

      createRelationship: async (data: CreateRelationshipData) => {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, create: true },
          error: null 
        }));

        try {
          const newRelationship = await relationshipApi.create(data);
          set(state => ({ 
            ...state, 
            relationships: [...state.relationships, newRelationship],
            loading: { ...state.loading, create: false }
          }));
          return newRelationship;
        } catch (error) {
          set(state => ({ 
            ...state, 
            error: formatApiError(error as ApiError),
            loading: { ...state.loading, create: false }
          }));
          return null;
        }
      },

      updateRelationship: async (id: string, data: UpdateRelationshipData) => {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, update: true },
          error: null 
        }));

        try {
          const updatedRelationship = await relationshipApi.update(id, data);
          set(state => ({ 
            ...state, 
            relationships: state.relationships.map(relationship => 
              relationship.id === id ? updatedRelationship : relationship
            ),
            selectedRelationship: state.selectedRelationship?.id === id ? updatedRelationship : state.selectedRelationship,
            loading: { ...state.loading, update: false }
          }));
          return updatedRelationship;
        } catch (error) {
          set(state => ({ 
            ...state, 
            error: formatApiError(error as ApiError),
            loading: { ...state.loading, update: false }
          }));
          return null;
        }
      },

      deleteRelationship: async (id: string) => {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, delete: true },
          error: null 
        }));

        try {
          await relationshipApi.delete(id);
          set(state => ({ 
            ...state, 
            relationships: state.relationships.filter(relationship => relationship.id !== id),
            selectedRelationship: state.selectedRelationship?.id === id ? null : state.selectedRelationship,
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

      selectRelationship: (relationship: Relationship | null) => {
        set(state => ({ ...state, selectedRelationship: relationship }));
      },

      clearError: () => {
        set(state => ({ ...state, error: null }));
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'relationship-store',
    }
  )
);