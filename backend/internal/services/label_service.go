package services

import (
	"character-management-app/internal/models"
	"character-management-app/internal/repositories"
	"errors"
	"fmt"
)

// LabelService ラベルサービスのインターフェース
type LabelService interface {
	CreateLabel(label *models.Label) (*models.Label, error)
	GetLabelByID(id string) (*models.Label, error)
	GetAllLabels() ([]models.Label, error)
	UpdateLabel(id string, label *models.Label) (*models.Label, error)
	DeleteLabel(id string) error
}

// labelService ラベルサービスの実装
type labelService struct {
	labelRepo repositories.LabelRepository
}

// NewLabelService ラベルサービスのコンストラクタ
func NewLabelService(labelRepo repositories.LabelRepository) LabelService {
	return &labelService{
		labelRepo: labelRepo,
	}
}

// CreateLabel ラベルを作成
func (s *labelService) CreateLabel(label *models.Label) (*models.Label, error) {
	// 名前の重複チェック
	exists, err := s.labelRepo.ExistsByName(label.Name)
	if err != nil {
		return nil, fmt.Errorf("failed to check label name existence: %w", err)
	}
	if exists {
		return nil, errors.New("label with this name already exists")
	}

	// ラベルを作成
	if err := s.labelRepo.Create(label); err != nil {
		return nil, fmt.Errorf("failed to create label: %w", err)
	}

	return label, nil
}

// GetLabelByID IDでラベルを取得
func (s *labelService) GetLabelByID(id string) (*models.Label, error) {
	label, err := s.labelRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get label: %w", err)
	}
	return label, nil
}

// GetAllLabels 全てのラベルを取得
func (s *labelService) GetAllLabels() ([]models.Label, error) {
	labels, err := s.labelRepo.GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to get labels: %w", err)
	}
	return labels, nil
}

// UpdateLabel ラベルを更新
func (s *labelService) UpdateLabel(id string, label *models.Label) (*models.Label, error) {
	// 既存のラベルを取得
	existingLabel, err := s.labelRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("label not found: %w", err)
	}

	// 名前が変更されている場合、重複チェック
	if existingLabel.Name != label.Name {
		exists, err := s.labelRepo.ExistsByName(label.Name)
		if err != nil {
			return nil, fmt.Errorf("failed to check label name existence: %w", err)
		}
		if exists {
			return nil, errors.New("label with this name already exists")
		}
	}

	// IDと作成日時を保持
	label.ID = existingLabel.ID
	label.CreatedAt = existingLabel.CreatedAt

	// ラベルを更新
	if err := s.labelRepo.Update(label); err != nil {
		return nil, fmt.Errorf("failed to update label: %w", err)
	}

	return label, nil
}

// DeleteLabel ラベルを削除
func (s *labelService) DeleteLabel(id string) error {
	// ラベルの存在確認
	exists, err := s.labelRepo.ExistsByID(id)
	if err != nil {
		return fmt.Errorf("failed to check label existence: %w", err)
	}
	if !exists {
		return errors.New("label not found")
	}

	// ラベルを削除（GORM の many2many 関係により、character_labels テーブルからも自動削除される）
	if err := s.labelRepo.Delete(id); err != nil {
		return fmt.Errorf("failed to delete label: %w", err)
	}

	return nil
}