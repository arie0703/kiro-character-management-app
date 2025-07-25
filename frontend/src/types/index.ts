// 基本データ型の定義
export interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Character {
  id: string;
  groupId: string;
  name: string;
  photo?: string;
  information: string;
  relatedLinks: string[];
  labels: Label[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Relationship {
  id: string;
  groupId: string;
  character1Id: string;
  character2Id: string;
  relationshipType: string;
  description?: string;
  createdAt: Date;
}

// API リクエスト用の型
export interface CreateGroupData {
  name: string;
  description?: string;
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
}

export interface CreateCharacterData {
  groupId: string;
  name: string;
  information: string;
  relatedLinks: string[];
}

export interface UpdateCharacterData {
  groupId?: string;
  name?: string;
  information?: string;
  relatedLinks?: string[];
}

export interface CreateLabelData {
  name: string;
  color: string;
}

export interface UpdateLabelData {
  name?: string;
  color?: string;
}

export interface CreateRelationshipData {
  character1Id: string;
  character2Id: string;
  relationshipType: string;
  description?: string;
}

export interface UpdateRelationshipData {
  character1Id?: string;
  character2Id?: string;
  relationshipType?: string;
  description?: string;
}

// API レスポンス用の型
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}