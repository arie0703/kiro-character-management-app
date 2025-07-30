import axios, { AxiosResponse, AxiosError } from 'axios';
import {
  Group,
  Character,
  Label,
  Relationship,
  CreateGroupData,
  UpdateGroupData,
  CreateCharacterData,
  UpdateCharacterData,
  CreateLabelData,
  UpdateLabelData,
  CreateRelationshipData,
  UpdateRelationshipData,
  ApiError,
  ApiResponse
} from '../types';
import { transformApiResponse, transformApiArrayResponse } from './utils';

// Axios インスタンスの作成
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      details: error.response?.data,
    };

    // HTTP ステータスコードに基づくエラーメッセージの設定
    if (error.response) {
      switch (error.response.status) {
        case 400:
          apiError.message = 'Bad Request: Invalid data provided';
          break;
        case 401:
          apiError.message = 'Unauthorized: Authentication required';
          break;
        case 403:
          apiError.message = 'Forbidden: Access denied';
          break;
        case 404:
          apiError.message = 'Not Found: Resource not found';
          break;
        case 409:
          apiError.message = 'Conflict: Resource already exists';
          break;
        case 500:
          apiError.message = 'Internal Server Error: Please try again later';
          break;
        default:
          apiError.message = `HTTP ${error.response.status}: ${error.response.statusText}`;
      }
    } else if (error.request) {
      apiError.message = 'Network Error: Unable to connect to server';
    }

    return Promise.reject(apiError);
  }
);

// グループ API
export const groupApi = {
  // グループ一覧取得
  getAll: (): Promise<Group[]> =>
    api.get<ApiResponse<Group[]>>('/groups').then(response =>
      transformApiArrayResponse(response.data.data, ['createdAt', 'updatedAt'])
    ),

  // グループ詳細取得
  getById: (id: string): Promise<Group> =>
    api.get<ApiResponse<Group>>(`/groups/${id}`).then(response =>
      transformApiResponse(response.data.data, ['createdAt', 'updatedAt'])
    ),

  // グループ作成
  create: (data: CreateGroupData): Promise<Group> =>
    api.post<ApiResponse<Group>>('/groups', data).then(response =>
      transformApiResponse(response.data.data, ['createdAt', 'updatedAt'])
    ),

  // グループ更新
  update: (id: string, data: UpdateGroupData): Promise<Group> =>
    api.put<ApiResponse<Group>>(`/groups/${id}`, data).then(response =>
      transformApiResponse(response.data.data, ['createdAt', 'updatedAt'])
    ),

  // グループ削除
  delete: (id: string): Promise<void> =>
    api.delete(`/groups/${id}`).then(() => undefined),
};

// 人物 API
export const characterApi = {
  // 人物一覧取得（グループIDでフィルタ可能）
  getAll: (groupId?: string): Promise<Character[]> => {
    const params = groupId ? { groupId } : {};
    return api.get<ApiResponse<Character[]>>('/characters', { params }).then(response =>
      transformApiArrayResponse(response.data, ['createdAt', 'updatedAt'])
    );
  },

  // 人物詳細取得
  getById: (id: string): Promise<Character> =>
    api.get<ApiResponse<Character>>(`/characters/${id}`).then(response =>
      transformApiResponse(response.data.data, ['createdAt', 'updatedAt'])
    ),

  // 人物作成（JSON）
  create: (data: CreateCharacterData): Promise<Character> =>
    api.post<ApiResponse<Character>>('/characters', data).then(response => {
      console.log(response.data);
      return transformApiResponse(response.data.data, ['createdAt', 'updatedAt']);
    }),

  // 人物作成（FormData - 画像付き）
  createWithImage: (data: FormData): Promise<Character> =>
    api.post<ApiResponse<Character>>('/characters', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(response =>
      transformApiResponse(response.data.data, ['createdAt', 'updatedAt'])
    ),

  // 人物更新（JSON）
  update: (id: string, data: UpdateCharacterData): Promise<Character> =>
    api.put<ApiResponse<Character>>(`/characters/${id}`, data).then(response =>
      transformApiResponse(response.data.data, ['createdAt', 'updatedAt'])
    ),

  // 人物更新（FormData - 画像付き）
  updateWithImage: (id: string, data: FormData): Promise<Character> =>
    api.put<ApiResponse<Character>>(`/characters/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(response =>
      transformApiResponse(response.data.data, ['createdAt', 'updatedAt'])
    ),

  // 人物削除
  delete: (id: string): Promise<void> =>
    api.delete(`/characters/${id}`).then(() => undefined),

  // 人物にラベル追加
  addLabel: (characterId: string, labelId: string): Promise<void> =>
    api.post(`/characters/${characterId}/labels/${labelId}`).then(() => undefined),

  // 人物からラベル削除
  removeLabel: (characterId: string, labelId: string): Promise<void> =>
    api.delete(`/characters/${characterId}/labels/${labelId}`).then(() => undefined),
};

// ラベル API
export const labelApi = {
  // ラベル一覧取得
  getAll: (): Promise<Label[]> =>
    api.get<ApiResponse<Label[]>>('/labels').then(response => {
      const data = response.data;
      return transformApiArrayResponse(data || [], ['createdAt']);
    }),

  // ラベル詳細取得
  getById: (id: string): Promise<Label> =>
    api.get<ApiResponse<Label>>(`/labels/${id}`).then(response => {
      const data = response.data?.data;
      if (!data) throw new Error('Label not found');
      return transformApiResponse(data, ['createdAt']);
    }),

  // ラベル作成
  create: (data: CreateLabelData): Promise<Label> =>
    api.post<ApiResponse<Label>>('/labels', data).then(response => {
      const data = response.data?.data;
      if (!data) throw new Error('Failed to create label');
      return transformApiResponse(data, ['createdAt']);
    }),

  // ラベル更新
  update: (id: string, data: UpdateLabelData): Promise<Label> =>
    api.put<ApiResponse<Label>>(`/labels/${id}`, data).then(response => {
      const responseData = response.data?.data;
      if (!responseData) throw new Error('Failed to update label');
      return transformApiResponse(responseData, ['createdAt']);
    }),

  // ラベル削除
  delete: (id: string): Promise<void> =>
    api.delete(`/labels/${id}`).then(() => undefined),
};

// 関係 API
export const relationshipApi = {
  // 関係一覧取得（グループIDまたは人物IDでフィルタ可能）
  getAll: (groupId?: string, characterId?: string): Promise<Relationship[]> => {
    const params: any = {};
    if (groupId) params.groupId = groupId;
    if (characterId) params.characterId = characterId;
    return api.get<ApiResponse<Relationship[]>>('/relationships', { params }).then(response =>
      transformApiArrayResponse(response.data.data, ['createdAt'])
    );
  },

  // 関係詳細取得
  getById: (id: string): Promise<Relationship> =>
    api.get<ApiResponse<Relationship>>(`/relationships/${id}`).then(response =>
      transformApiResponse(response.data.data, ['createdAt'])
    ),

  // 関係作成
  create: (data: CreateRelationshipData): Promise<Relationship> =>
    api.post<ApiResponse<Relationship>>('/relationships', data).then(response =>
      transformApiResponse(response.data.data, ['createdAt'])
    ),

  // 関係更新
  update: (id: string, data: UpdateRelationshipData): Promise<Relationship> =>
    api.put<ApiResponse<Relationship>>(`/relationships/${id}`, data).then(response =>
      transformApiResponse(response.data.data, ['createdAt'])
    ),

  // 関係削除
  delete: (id: string): Promise<void> =>
    api.delete(`/relationships/${id}`).then(() => undefined),
};

// ヘルスチェック API
export const healthApi = {
  check: (): Promise<{ status: string; message: string }> =>
    api.get('/health').then(response => response.data),
};

export default api;
