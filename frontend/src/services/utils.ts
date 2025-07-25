import { ApiError } from '../types';

/**
 * API エラーを人間が読みやすい形式に変換
 */
export const formatApiError = (error: ApiError): string => {
  if (error.details?.error) {
    return error.details.error;
  }
  return error.message;
};

/**
 * FormData を作成するヘルパー関数（人物作成・更新用）
 */
export const createCharacterFormData = (
  data: {
    groupId: string;
    name: string;
    information: string;
    relatedLinks: string[];
  },
  photo?: File
): FormData => {
  const formData = new FormData();
  
  formData.append('groupId', data.groupId);
  formData.append('name', data.name);
  formData.append('information', data.information);
  formData.append('relatedLinks', JSON.stringify(data.relatedLinks));
  
  if (photo) {
    formData.append('photo', photo);
  }
  
  return formData;
};

/**
 * 画像ファイルのバリデーション
 */
export const validateImageFile = (file: File): string | null => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return 'サポートされていないファイル形式です。JPEG、PNG、GIF、WebP形式のファイルを選択してください。';
  }
  
  if (file.size > maxSize) {
    return 'ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。';
  }
  
  return null;
};

/**
 * 色の値をバリデーション（16進数カラーコード）
 */
export const validateHexColor = (color: string): boolean => {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(color);
};

/**
 * 日付文字列を Date オブジェクトに変換
 */
export const parseApiDate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * API レスポンスの日付文字列を Date オブジェクトに変換するヘルパー
 */
export const transformApiResponse = <T extends Record<string, any>>(
  data: T,
  dateFields: (keyof T)[]
): T => {
  const transformed = { ...data };
  
  dateFields.forEach(field => {
    if (transformed[field] && typeof transformed[field] === 'string') {
      transformed[field] = parseApiDate(transformed[field] as string) as T[keyof T];
    }
  });
  
  return transformed;
};

/**
 * 配列データの日付変換
 */
export const transformApiArrayResponse = <T extends Record<string, any>>(
  data: T[],
  dateFields: (keyof T)[]
): T[] => {
  return data.map(item => transformApiResponse(item, dateFields));
};

/**
 * デバウンス関数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * ローディング状態を管理するヘルパー
 */
export class LoadingManager {
  private loadingStates = new Map<string, boolean>();
  private listeners = new Set<() => void>();

  setLoading(key: string, loading: boolean) {
    this.loadingStates.set(key, loading);
    this.notifyListeners();
  }

  isLoading(key: string): boolean {
    return this.loadingStates.get(key) || false;
  }

  isAnyLoading(): boolean {
    return Array.from(this.loadingStates.values()).some(loading => loading);
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const loadingManager = new LoadingManager();