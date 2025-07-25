package services

import (
	"character-management-app/internal/models"
	"character-management-app/internal/repositories"
	"errors"
	"fmt"
)

// CharacterService 人物サービスのインターフェース
type CharacterService interface {
	CreateCharacter(character *models.Character) (*models.Character, error)
	GetCharacterByID(id string) (*models.Character, error)
	GetCharactersByGroupID(groupID string) ([]models.Character, error)
	GetAllCharacters() ([]models.Character, error)
	UpdateCharacter(id string, character *models.Character) (*models.Character, error)
	DeleteCharacter(id string) error
	AddLabelToCharacter(characterID, labelID string) error
	RemoveLabelFromCharacter(characterID, labelID string) error
}

// characterService 人物サービスの実装
type characterService struct {
	characterRepo repositories.CharacterRepository
	groupRepo     repositories.GroupRepository
	labelRepo     repositories.LabelRepository
}

// NewCharacterService 人物サービスのコンストラクタ
func NewCharacterService(characterRepo repositories.CharacterRepository, groupRepo repositories.GroupRepository, labelRepo repositories.LabelRepository) CharacterService {
	return &characterService{
		characterRepo: characterRepo,
		groupRepo:     groupRepo,
		labelRepo:     labelRepo,
	}
}

// CreateCharacter 人物を作成
func (s *characterService) CreateCharacter(character *models.Character) (*models.Character, error) {
	// グループの存在確認
	exists, err := s.groupRepo.ExistsByID(character.GroupID)
	if err != nil {
		return nil, fmt.Errorf("failed to check group existence: %w", err)
	}
	if !exists {
		return nil, errors.New("group not found")
	}

	// 人物を作成
	if err := s.characterRepo.Create(character); err != nil {
		return nil, fmt.Errorf("failed to create character: %w", err)
	}

	// 作成された人物を取得して返す
	return s.characterRepo.GetByID(character.ID)
}

// GetCharacterByID IDで人物を取得
func (s *characterService) GetCharacterByID(id string) (*models.Character, error) {
	character, err := s.characterRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get character: %w", err)
	}
	return character, nil
}

// GetCharactersByGroupID グループIDで人物を取得
func (s *characterService) GetCharactersByGroupID(groupID string) ([]models.Character, error) {
	// グループの存在確認
	exists, err := s.groupRepo.ExistsByID(groupID)
	if err != nil {
		return nil, fmt.Errorf("failed to check group existence: %w", err)
	}
	if !exists {
		return nil, errors.New("group not found")
	}

	characters, err := s.characterRepo.GetByGroupID(groupID)
	if err != nil {
		return nil, fmt.Errorf("failed to get characters by group: %w", err)
	}
	return characters, nil
}

// GetAllCharacters 全ての人物を取得
func (s *characterService) GetAllCharacters() ([]models.Character, error) {
	characters, err := s.characterRepo.GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to get all characters: %w", err)
	}
	return characters, nil
}

// UpdateCharacter 人物を更新
func (s *characterService) UpdateCharacter(id string, character *models.Character) (*models.Character, error) {
	// 既存の人物を取得
	existing, err := s.characterRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get existing character: %w", err)
	}

	// グループIDが変更される場合は、新しいグループの存在確認
	if character.GroupID != existing.GroupID {
		exists, err := s.groupRepo.ExistsByID(character.GroupID)
		if err != nil {
			return nil, fmt.Errorf("failed to check group existence: %w", err)
		}
		if !exists {
			return nil, errors.New("group not found")
		}
	}

	// IDと作成日時は変更しない
	character.ID = existing.ID
	character.CreatedAt = existing.CreatedAt

	// 人物を更新
	if err := s.characterRepo.Update(character); err != nil {
		return nil, fmt.Errorf("failed to update character: %w", err)
	}

	// 更新された人物を取得して返す
	return s.characterRepo.GetByID(id)
}

// DeleteCharacter 人物を削除
func (s *characterService) DeleteCharacter(id string) error {
	// 人物の存在確認
	exists, err := s.characterRepo.ExistsByID(id)
	if err != nil {
		return fmt.Errorf("failed to check character existence: %w", err)
	}
	if !exists {
		return errors.New("character not found")
	}

	// 人物を削除
	if err := s.characterRepo.Delete(id); err != nil {
		return fmt.Errorf("failed to delete character: %w", err)
	}

	return nil
}

// AddLabelToCharacter 人物にラベルを追加
func (s *characterService) AddLabelToCharacter(characterID, labelID string) error {
	// 人物の存在確認
	exists, err := s.characterRepo.ExistsByID(characterID)
	if err != nil {
		return fmt.Errorf("failed to check character existence: %w", err)
	}
	if !exists {
		return errors.New("character not found")
	}

	// ラベルの存在確認
	exists, err = s.labelRepo.ExistsByID(labelID)
	if err != nil {
		return fmt.Errorf("failed to check label existence: %w", err)
	}
	if !exists {
		return errors.New("label not found")
	}

	// 既に同じラベルが付いているかチェック
	hasLabel, err := s.characterRepo.HasLabel(characterID, labelID)
	if err != nil {
		return fmt.Errorf("failed to check if character has label: %w", err)
	}
	if hasLabel {
		return errors.New("character already has this label")
	}

	// ラベル数の制限チェック（最大5つ）
	count, err := s.characterRepo.GetLabelsCount(characterID)
	if err != nil {
		return fmt.Errorf("failed to get labels count: %w", err)
	}
	if count >= 5 {
		return errors.New("character cannot have more than 5 labels")
	}

	// ラベルを追加
	if err := s.characterRepo.AddLabel(characterID, labelID); err != nil {
		return fmt.Errorf("failed to add label to character: %w", err)
	}

	return nil
}

// RemoveLabelFromCharacter 人物からラベルを削除
func (s *characterService) RemoveLabelFromCharacter(characterID, labelID string) error {
	// 人物の存在確認
	exists, err := s.characterRepo.ExistsByID(characterID)
	if err != nil {
		return fmt.Errorf("failed to check character existence: %w", err)
	}
	if !exists {
		return errors.New("character not found")
	}

	// ラベルの存在確認
	exists, err = s.labelRepo.ExistsByID(labelID)
	if err != nil {
		return fmt.Errorf("failed to check label existence: %w", err)
	}
	if !exists {
		return errors.New("label not found")
	}

	// ラベルを削除
	if err := s.characterRepo.RemoveLabel(characterID, labelID); err != nil {
		return fmt.Errorf("failed to remove label from character: %w", err)
	}

	return nil
}