package repositories

import (
	"character-management-app/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// GroupRepository グループリポジトリのインターフェース
type GroupRepository interface {
	Create(group *models.Group) error
	GetByID(id string) (*models.Group, error)
	GetAll() ([]models.Group, error)
	Update(group *models.Group) error
	Delete(id string) error
	ExistsByID(id string) (bool, error)
}

// groupRepository グループリポジトリの実装
type groupRepository struct {
	db *gorm.DB
}

// NewGroupRepository グループリポジトリのコンストラクタ
func NewGroupRepository(db *gorm.DB) GroupRepository {
	return &groupRepository{db: db}
}

// Create グループを作成
func (r *groupRepository) Create(group *models.Group) error {
	// UUIDを生成
	group.ID = uuid.New().String()
	
	return r.db.Create(group).Error
}

// GetByID IDでグループを取得
func (r *groupRepository) GetByID(id string) (*models.Group, error) {
	var group models.Group
	err := r.db.Preload("Characters").First(&group, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &group, nil
}

// GetAll 全てのグループを取得
func (r *groupRepository) GetAll() ([]models.Group, error) {
	var groups []models.Group
	err := r.db.Preload("Characters").Find(&groups).Error
	return groups, err
}

// Update グループを更新
func (r *groupRepository) Update(group *models.Group) error {
	return r.db.Save(group).Error
}

// Delete グループを削除
func (r *groupRepository) Delete(id string) error {
	return r.db.Delete(&models.Group{}, "id = ?", id).Error
}

// ExistsByID グループが存在するかチェック
func (r *groupRepository) ExistsByID(id string) (bool, error) {
	var count int64
	err := r.db.Model(&models.Group{}).Where("id = ?", id).Count(&count).Error
	return count > 0, err
}