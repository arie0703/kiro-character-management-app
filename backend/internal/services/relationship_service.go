package services

import (
	"character-management-app/internal/models"
	"character-management-app/internal/repositories"
	"errors"
	"fmt"
	"log"
)

// RelationshipService 関係サービスのインターフェース
type RelationshipService interface {
	CreateRelationship(relationship *models.Relationship) (*models.Relationship, error)
	GetRelationshipByID(id string) (*models.Relationship, error)
	GetAllRelationships() ([]models.Relationship, error)
	GetRelationshipsByGroupID(groupID string) ([]models.Relationship, error)
	GetRelationshipsByCharacterID(characterID string) ([]models.Relationship, error)
	UpdateRelationship(id string, relationship *models.Relationship) (*models.Relationship, error)
	DeleteRelationship(id string) error
}

// relationshipService 関係サービスの実装
type relationshipService struct {
	relationshipRepo repositories.RelationshipRepository
	characterRepo    repositories.CharacterRepository
}

// NewRelationshipService 関係サービスのコンストラクタ
func NewRelationshipService(relationshipRepo repositories.RelationshipRepository, characterRepo repositories.CharacterRepository) RelationshipService {
	return &relationshipService{
		relationshipRepo: relationshipRepo,
		characterRepo:    characterRepo,
	}
}

// CreateRelationship 関係を作成
func (s *relationshipService) CreateRelationship(relationship *models.Relationship) (*models.Relationship, error) {
	// 同じ人物同士の関係は作成できない
	if relationship.Character1ID == relationship.Character2ID {
		return nil, errors.New("cannot create relationship between the same character")
	}

	// 両方の人物が存在するかチェック
	exists1, err := s.characterRepo.ExistsByID(relationship.Character1ID)
	if err != nil {
		return nil, fmt.Errorf("failed to check character1 existence: %w", err)
	}
	if !exists1 {
		return nil, errors.New("character1 not found")
	}

	exists2, err := s.characterRepo.ExistsByID(relationship.Character2ID)
	if err != nil {
		return nil, fmt.Errorf("failed to check character2 existence: %w", err)
	}
	if !exists2 {
		return nil, errors.New("character2 not found")
	}

	// 両方の人物が同じグループに属しているかチェック
	char1, err := s.characterRepo.GetByID(relationship.Character1ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get character1: %w", err)
	}

	char2, err := s.characterRepo.GetByID(relationship.Character2ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get character2: %w", err)
	}

	if char1.GroupID != char2.GroupID {
		return nil, errors.New("characters must be in the same group")
	}

	// グループIDを設定
	relationship.GroupID = char1.GroupID

	// 既に関係が存在するかチェック
	exists, err := s.relationshipRepo.ExistsBetweenCharacters(relationship.Character1ID, relationship.Character2ID)
	if err != nil {
		return nil, fmt.Errorf("failed to check relationship existence: %w", err)
	}
	if exists {
		return nil, errors.New("relationship already exists between these characters")
	}

	// 関係を作成
	if err := s.relationshipRepo.Create(relationship); err != nil {
		return nil, fmt.Errorf("failed to create relationship: %w", err)
	}

	// 作成された関係を取得して返す
	return s.relationshipRepo.GetByID(relationship.ID)
}

// GetRelationshipByID IDで関係を取得
func (s *relationshipService) GetRelationshipByID(id string) (*models.Relationship, error) {
	relationship, err := s.relationshipRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get relationship: %w", err)
	}
	return relationship, nil
}

// GetAllRelationships 全ての関係を取得
func (s *relationshipService) GetAllRelationships() ([]models.Relationship, error) {
	relationships, err := s.relationshipRepo.GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to get all relationships: %w", err)
	}
	return relationships, nil
}

// GetRelationshipsByGroupID グループIDで関係を取得
func (s *relationshipService) GetRelationshipsByGroupID(groupID string) ([]models.Relationship, error) {
	relationships, err := s.relationshipRepo.GetByGroupID(groupID)
	if err != nil {
		return nil, fmt.Errorf("failed to get relationships by group: %w", err)
	}
	return relationships, nil
}

// GetRelationshipsByCharacterID 人物IDで関係を取得
func (s *relationshipService) GetRelationshipsByCharacterID(characterID string) ([]models.Relationship, error) {
	// 人物の存在確認
	exists, err := s.characterRepo.ExistsByID(characterID)
	if err != nil {
		return nil, fmt.Errorf("failed to check character existence: %w", err)
	}
	if !exists {
		return nil, errors.New("character not found")
	}

	relationships, err := s.relationshipRepo.GetByCharacterID(characterID)
	if err != nil {
		return nil, fmt.Errorf("failed to get relationships by character: %w", err)
	}
	return relationships, nil
}

// UpdateRelationship 関係を更新
func (s *relationshipService) UpdateRelationship(id string, relationship *models.Relationship) (*models.Relationship, error) {
	// 既存の関係を取得
	existing, err := s.relationshipRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("relationship not found: %w", err)
	}

	// 同じ人物同士の関係は作成できない
	if relationship.Character1ID == relationship.Character2ID {
		return nil, errors.New("cannot create relationship between the same character")
	}

	// 人物IDが変更される場合の検証
	if relationship.Character1ID != existing.Character1ID || relationship.Character2ID != existing.Character2ID {
		// 両方の人物が存在するかチェック
		exists1, err := s.characterRepo.ExistsByID(relationship.Character1ID)
		if err != nil {
			return nil, fmt.Errorf("failed to check character1 existence: %w", err)
		}
		if !exists1 {
			return nil, errors.New("character1 not found")
		}

		exists2, err := s.characterRepo.ExistsByID(relationship.Character2ID)
		if err != nil {
			return nil, fmt.Errorf("failed to check character2 existence: %w", err)
		}
		if !exists2 {
			return nil, errors.New("character2 not found")
		}

		// 両方の人物が同じグループに属しているかチェック
		char1, err := s.characterRepo.GetByID(relationship.Character1ID)
		if err != nil {
			return nil, fmt.Errorf("failed to get character1: %w", err)
		}

		char2, err := s.characterRepo.GetByID(relationship.Character2ID)
		if err != nil {
			return nil, fmt.Errorf("failed to get character2: %w", err)
		}

		if char1.GroupID != char2.GroupID {
			return nil, errors.New("characters must be in the same group")
		}

		// グループIDを設定
		relationship.GroupID = char1.GroupID

		// 他の関係と重複しないかチェック（自分以外）
		exists, err := s.relationshipRepo.ExistsBetweenCharacters(relationship.Character1ID, relationship.Character2ID)
		if err != nil {
			return nil, fmt.Errorf("failed to check relationship existence: %w", err)
		}
		if exists {
			return nil, errors.New("relationship already exists between these characters")
		}
	} else {
		// 人物IDが変更されない場合は、既存のGroupIDを保持
		relationship.GroupID = existing.GroupID
		log.Printf("DEBUG: existing.GroupID = %s", existing.GroupID)
	}

	// IDと作成日時を保持
	relationship.ID = existing.ID
	relationship.CreatedAt = existing.CreatedAt

	// 関係を更新
	if err := s.relationshipRepo.Update(relationship); err != nil {
		return nil, fmt.Errorf("failed to update relationship: %w", err)
	}

	// 更新された関係を取得して返す
	return s.relationshipRepo.GetByID(id)
}

// DeleteRelationship 関係を削除
func (s *relationshipService) DeleteRelationship(id string) error {
	// 関係の存在確認
	exists, err := s.relationshipRepo.ExistsByID(id)
	if err != nil {
		return fmt.Errorf("failed to check relationship existence: %w", err)
	}
	if !exists {
		return errors.New("relationship not found")
	}

	// 関係を削除
	if err := s.relationshipRepo.Delete(id); err != nil {
		return fmt.Errorf("failed to delete relationship: %w", err)
	}

	return nil
}