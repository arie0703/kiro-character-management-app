package repositories

import (
	"character-management-app/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// RelationshipRepository 関係リポジトリのインターフェース
type RelationshipRepository interface {
	Create(relationship *models.Relationship) error
	GetByID(id string) (*models.Relationship, error)
	GetAll() ([]models.Relationship, error)
	GetByGroupID(groupID string) ([]models.Relationship, error)
	GetByCharacterID(characterID string) ([]models.Relationship, error)
	Update(relationship *models.Relationship) error
	Delete(id string) error
	ExistsByID(id string) (bool, error)
	ExistsBetweenCharacters(character1ID, character2ID string) (bool, error)
}

// relationshipRepository 関係リポジトリの実装
type relationshipRepository struct {
	db *gorm.DB
}

// NewRelationshipRepository 関係リポジトリのコンストラクタ
func NewRelationshipRepository(db *gorm.DB) RelationshipRepository {
	return &relationshipRepository{db: db}
}

// Create 関係を作成
func (r *relationshipRepository) Create(relationship *models.Relationship) error {
	// UUIDを生成
	relationship.ID = uuid.New().String()
	
	// IDの順序を保証（小さいIDをCharacter1IDに）
	if relationship.Character1ID > relationship.Character2ID {
		relationship.Character1ID, relationship.Character2ID = relationship.Character2ID, relationship.Character1ID
	}
	
	return r.db.Create(relationship).Error
}

// GetByID IDで関係を取得
func (r *relationshipRepository) GetByID(id string) (*models.Relationship, error) {
	var relationship models.Relationship
	err := r.db.Preload("Group").Preload("Character1").Preload("Character2").First(&relationship, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &relationship, nil
}

// GetAll 全ての関係を取得
func (r *relationshipRepository) GetAll() ([]models.Relationship, error) {
	var relationships []models.Relationship
	err := r.db.Preload("Group").Preload("Character1").Preload("Character2").Find(&relationships).Error
	return relationships, err
}

// GetByGroupID グループIDで関係を取得
func (r *relationshipRepository) GetByGroupID(groupID string) ([]models.Relationship, error) {
	var relationships []models.Relationship
	err := r.db.Preload("Group").Preload("Character1").Preload("Character2").Where("group_id = ?", groupID).Find(&relationships).Error
	return relationships, err
}

// GetByCharacterID 人物IDで関係を取得（その人物が関わる全ての関係）
func (r *relationshipRepository) GetByCharacterID(characterID string) ([]models.Relationship, error) {
	var relationships []models.Relationship
	err := r.db.Preload("Group").Preload("Character1").Preload("Character2").
		Where("character1_id = ? OR character2_id = ?", characterID, characterID).
		Find(&relationships).Error
	return relationships, err
}

// Update 関係を更新
func (r *relationshipRepository) Update(relationship *models.Relationship) error {
	// IDの順序を保証（小さいIDをCharacter1IDに）
	if relationship.Character1ID > relationship.Character2ID {
		relationship.Character1ID, relationship.Character2ID = relationship.Character2ID, relationship.Character1ID
	}
	
	return r.db.Save(relationship).Error
}

// Delete 関係を削除
func (r *relationshipRepository) Delete(id string) error {
	return r.db.Delete(&models.Relationship{}, "id = ?", id).Error
}

// ExistsByID 関係が存在するかチェック
func (r *relationshipRepository) ExistsByID(id string) (bool, error) {
	var count int64
	err := r.db.Model(&models.Relationship{}).Where("id = ?", id).Count(&count).Error
	return count > 0, err
}

// ExistsBetweenCharacters 2人の人物間に関係が存在するかチェック
func (r *relationshipRepository) ExistsBetweenCharacters(character1ID, character2ID string) (bool, error) {
	// IDの順序を正規化
	if character1ID > character2ID {
		character1ID, character2ID = character2ID, character1ID
	}
	
	var count int64
	err := r.db.Model(&models.Relationship{}).
		Where("character1_id = ? AND character2_id = ?", character1ID, character2ID).
		Count(&count).Error
	return count > 0, err
}