package repositories

import (
	"character-management-app/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// LabelRepository ラベルリポジトリのインターフェース
type LabelRepository interface {
	Create(label *models.Label) error
	GetByID(id string) (*models.Label, error)
	GetAll() ([]models.Label, error)
	Update(label *models.Label) error
	Delete(id string) error
	ExistsByID(id string) (bool, error)
	ExistsByName(name string) (bool, error)
}

// labelRepository ラベルリポジトリの実装
type labelRepository struct {
	db *gorm.DB
}

// NewLabelRepository ラベルリポジトリのコンストラクタ
func NewLabelRepository(db *gorm.DB) LabelRepository {
	return &labelRepository{db: db}
}

// Create ラベルを作成
func (r *labelRepository) Create(label *models.Label) error {
	// UUIDを生成
	label.ID = uuid.New().String()
	
	return r.db.Create(label).Error
}

// GetByID IDでラベルを取得
func (r *labelRepository) GetByID(id string) (*models.Label, error) {
	var label models.Label
	err := r.db.First(&label, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &label, nil
}

// GetAll 全てのラベルを取得
func (r *labelRepository) GetAll() ([]models.Label, error) {
	var labels []models.Label
	err := r.db.Find(&labels).Error
	return labels, err
}

// Update ラベルを更新
func (r *labelRepository) Update(label *models.Label) error {
	return r.db.Save(label).Error
}

// Delete ラベルを削除
func (r *labelRepository) Delete(id string) error {
	return r.db.Delete(&models.Label{}, "id = ?", id).Error
}

// ExistsByID ラベルが存在するかチェック
func (r *labelRepository) ExistsByID(id string) (bool, error) {
	var count int64
	err := r.db.Model(&models.Label{}).Where("id = ?", id).Count(&count).Error
	return count > 0, err
}

// ExistsByName 名前でラベルが存在するかチェック
func (r *labelRepository) ExistsByName(name string) (bool, error) {
	var count int64
	err := r.db.Model(&models.Label{}).Where("name = ?", name).Count(&count).Error
	return count > 0, err
}