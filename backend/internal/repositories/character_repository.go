package repositories

import (
	"character-management-app/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CharacterRepository 人物リポジトリのインターフェース
type CharacterRepository interface {
	Create(character *models.Character) error
	GetByID(id string) (*models.Character, error)
	GetAll() ([]models.Character, error)
	GetByGroupID(groupID string) ([]models.Character, error)
	Update(character *models.Character) error
	Delete(id string) error
	ExistsByID(id string) (bool, error)
	AddLabel(characterID, labelID string) error
	RemoveLabel(characterID, labelID string) error
	GetLabelsCount(characterID string) (int64, error)
	HasLabel(characterID, labelID string) (bool, error)
}

// characterRepository 人物リポジトリの実装
type characterRepository struct {
	db *gorm.DB
}

// NewCharacterRepository 人物リポジトリのコンストラクタ
func NewCharacterRepository(db *gorm.DB) CharacterRepository {
	return &characterRepository{db: db}
}

// Create 人物を作成
func (r *characterRepository) Create(character *models.Character) error {
	// UUIDを生成
	character.ID = uuid.New().String()
	
	return r.db.Create(character).Error
}

// GetByID IDで人物を取得
func (r *characterRepository) GetByID(id string) (*models.Character, error) {
	var character models.Character
	err := r.db.Preload("Group").Preload("Labels").First(&character, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &character, nil
}

// GetAll 全ての人物を取得
func (r *characterRepository) GetAll() ([]models.Character, error) {
	var characters []models.Character
	err := r.db.Preload("Group").Preload("Labels").Find(&characters).Error
	return characters, err
}

// GetByGroupID グループIDで人物を取得
func (r *characterRepository) GetByGroupID(groupID string) ([]models.Character, error) {
	var characters []models.Character
	err := r.db.Preload("Group").Preload("Labels").Where("group_id = ?", groupID).Find(&characters).Error
	return characters, err
}

// Update 人物を更新
func (r *characterRepository) Update(character *models.Character) error {
	return r.db.Save(character).Error
}

// Delete 人物を削除
func (r *characterRepository) Delete(id string) error {
	return r.db.Delete(&models.Character{}, "id = ?", id).Error
}

// ExistsByID 人物が存在するかチェック
func (r *characterRepository) ExistsByID(id string) (bool, error) {
	var count int64
	err := r.db.Model(&models.Character{}).Where("id = ?", id).Count(&count).Error
	return count > 0, err
}

// AddLabel 人物にラベルを追加
func (r *characterRepository) AddLabel(characterID, labelID string) error {
	var character models.Character
	if err := r.db.First(&character, "id = ?", characterID).Error; err != nil {
		return err
	}
	
	var label models.Label
	if err := r.db.First(&label, "id = ?", labelID).Error; err != nil {
		return err
	}
	
	return r.db.Model(&character).Association("Labels").Append(&label)
}

// RemoveLabel 人物からラベルを削除
func (r *characterRepository) RemoveLabel(characterID, labelID string) error {
	var character models.Character
	if err := r.db.First(&character, "id = ?", characterID).Error; err != nil {
		return err
	}
	
	var label models.Label
	if err := r.db.First(&label, "id = ?", labelID).Error; err != nil {
		return err
	}
	
	return r.db.Model(&character).Association("Labels").Delete(&label)
}

// GetLabelsCount 人物のラベル数を取得
func (r *characterRepository) GetLabelsCount(characterID string) (int64, error) {
	var character models.Character
	if err := r.db.First(&character, "id = ?", characterID).Error; err != nil {
		return 0, err
	}
	
	return r.db.Model(&character).Association("Labels").Count(), nil
}

// HasLabel 人物が指定されたラベルを持っているかチェック
func (r *characterRepository) HasLabel(characterID, labelID string) (bool, error) {
	var count int64
	err := r.db.Table("character_labels").
		Where("character_id = ? AND label_id = ?", characterID, labelID).
		Count(&count).Error
	
	return count > 0, err
}