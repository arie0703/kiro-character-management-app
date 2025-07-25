import { Group, Character, Label, Relationship } from '../types';

// Group Store Types
export interface GroupState {
  groups: Group[];
  selectedGroup: Group | null;
  loading: {
    list: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  error: string | null;
}

// Character Store Types
export interface CharacterState {
  characters: Character[];
  selectedCharacter: Character | null;
  loading: {
    list: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    addLabel: boolean;
    removeLabel: boolean;
  };
  error: string | null;
}

// Label Store Types
export interface LabelState {
  labels: Label[];
  selectedLabel: Label | null;
  loading: {
    list: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  error: string | null;
}

// Relationship Store Types
export interface RelationshipState {
  relationships: Relationship[];
  selectedRelationship: Relationship | null;
  loading: {
    list: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  error: string | null;
}

// Common loading states
export type LoadingState = {
  [key: string]: boolean;
};

// Store action result types
export type StoreActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};