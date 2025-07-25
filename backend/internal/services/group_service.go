package services

import (
	"character-management-app/internal/models"
	"character-management-app/internal/repositories"
	"fmt"

	"github.com/go-playground/validator/v10"
)

// GroupService グループサービスのインターフェース
type GroupService interface {
	CreateGroup(req *CreateGroupRequest) (*models.Group, error)
	GetGroup(id string) (*models.Group, error)
	GetAllGroups() ([]models.Group, error)
	UpdateGroup(id string, req *UpdateGroupRequest) (*models.Group, error)
	DeleteGroup(id string) error
}

// CreateGroupRequest グループ作成リクエスト
type CreateGroupRequest struct {
	Name        string  `json:"name" validate:"required,max=255"`
	Description *string `json:"description"`
}

// UpdateGroupRequest グループ更新リクエスト
type UpdateGroupRequest struct {
	Name        *string `json:"name" validate:"omitempty,max=255"`
	Description *string `json:"description"`
}

// groupService グループサービスの実装
type groupService struct {
	groupRepo repositories.GroupRepository
	validator *validator.Validate
}

// NewGroupService グループサービスのコンストラクタ
func NewGroupService(groupRepo repositories.GroupRepository) GroupService {
	return &groupService{
		groupRepo: groupRepo,
		validator: validator.New(),
	}
}

// CreateGroup グループを作成
func (s *groupService) CreateGroup(req *CreateGroupRequest) (*models.Group, error) {
	// バリデーション
	if err := s.validator.Struct(req); err != nil {
		return nil, err
	}

	// グループモデルを作成
	group := &models.Group{
		Name:        req.Name,
		Description: req.Description,
	}

	// データベースに保存
	if err := s.groupRepo.Create(group); err != nil {
		return nil, fmt.Errorf("failed to create group: %w", err)
	}

	return group, nil
}

// GetGroup グループを取得
func (s *groupService) GetGroup(id string) (*models.Group, error) {
	if id == "" {
		return nil, fmt.Errorf("group ID is required")
	}

	group, err := s.groupRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get group: %w", err)
	}

	return group, nil
}

// GetAllGroups 全てのグループを取得
func (s *groupService) GetAllGroups() ([]models.Group, error) {
	groups, err := s.groupRepo.GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to get groups: %w", err)
	}

	return groups, nil
}

// UpdateGroup グループを更新
func (s *groupService) UpdateGroup(id string, req *UpdateGroupRequest) (*models.Group, error) {
	if id == "" {
		return nil, fmt.Errorf("group ID is required")
	}

	// バリデーション
	if err := s.validator.Struct(req); err != nil {
		return nil, err
	}

	// 既存のグループを取得
	group, err := s.groupRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get group: %w", err)
	}

	// フィールドを更新
	if req.Name != nil {
		group.Name = *req.Name
	}
	if req.Description != nil {
		group.Description = req.Description
	}

	// データベースを更新
	if err := s.groupRepo.Update(group); err != nil {
		return nil, fmt.Errorf("failed to update group: %w", err)
	}

	return group, nil
}

// DeleteGroup グループを削除
func (s *groupService) DeleteGroup(id string) error {
	if id == "" {
		return fmt.Errorf("group ID is required")
	}

	// グループが存在するかチェック
	exists, err := s.groupRepo.ExistsByID(id)
	if err != nil {
		return fmt.Errorf("failed to check group existence: %w", err)
	}
	if !exists {
		return fmt.Errorf("group not found")
	}

	// グループを削除
	if err := s.groupRepo.Delete(id); err != nil {
		return fmt.Errorf("failed to delete group: %w", err)
	}

	return nil
}