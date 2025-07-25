package services

import (
	"character-management-app/internal/models"
	"errors"
	"testing"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"
)



func TestGroupService_CreateGroup(t *testing.T) {
	t.Run("正常なグループ作成", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		// テストデータ
		description := "Test Description"
		req := &CreateGroupRequest{
			Name:        "Test Group",
			Description: &description,
		}

		// モックの設定
		mockRepo.On("Create", mock.AnythingOfType("*models.Group")).Return(nil).Run(func(args mock.Arguments) {
			group := args.Get(0).(*models.Group)
			group.ID = "test-id"
			group.CreatedAt = time.Now()
			group.UpdatedAt = time.Now()
		})

		// テスト実行
		result, err := service.CreateGroup(req)

		// 検証
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, "Test Group", result.Name)
		assert.Equal(t, &description, result.Description)
		assert.NotEmpty(t, result.ID)
		mockRepo.AssertExpectations(t)
	})

	t.Run("バリデーションエラー - 名前が空", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		
		req := &CreateGroupRequest{
			Name: "",
		}

		// テスト実行
		result, err := service.CreateGroup(req)

		// 検証
		assert.Error(t, err)
		assert.Nil(t, result)
		assert.IsType(t, validator.ValidationErrors{}, err)
	})

	t.Run("バリデーションエラー - 名前が長すぎる", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		
		longName := make([]byte, 256)
		for i := range longName {
			longName[i] = 'a'
		}
		req := &CreateGroupRequest{
			Name: string(longName),
		}

		// テスト実行
		result, err := service.CreateGroup(req)

		// 検証
		assert.Error(t, err)
		assert.Nil(t, result)
		assert.IsType(t, validator.ValidationErrors{}, err)
	})

	t.Run("リポジトリエラー", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		
		req := &CreateGroupRequest{
			Name: "Test Group",
		}

		// モックの設定
		mockRepo.On("Create", mock.AnythingOfType("*models.Group")).Return(errors.New("database error"))

		// テスト実行
		result, err := service.CreateGroup(req)

		// 検証
		assert.Error(t, err)
		assert.Nil(t, result)
		assert.Contains(t, err.Error(), "failed to create group")
		mockRepo.AssertExpectations(t)
	})
}

func TestGroupService_GetGroup(t *testing.T) {
	t.Run("正常なグループ取得", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		// テストデータ
		expectedGroup := &models.Group{
			ID:   "test-id",
			Name: "Test Group",
		}

		// モックの設定
		mockRepo.On("GetByID", "test-id").Return(expectedGroup, nil)

		// テスト実行
		result, err := service.GetGroup("test-id")

		// 検証
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, expectedGroup.ID, result.ID)
		assert.Equal(t, expectedGroup.Name, result.Name)
		mockRepo.AssertExpectations(t)
	})

	t.Run("IDが空の場合", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		
		// テスト実行
		result, err := service.GetGroup("")

		// 検証
		assert.Error(t, err)
		assert.Nil(t, result)
		assert.Contains(t, err.Error(), "group ID is required")
	})

	t.Run("グループが見つからない場合", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		
		// モックの設定
		mockRepo.On("GetByID", "nonexistent-id").Return(nil, gorm.ErrRecordNotFound)

		// テスト実行
		result, err := service.GetGroup("nonexistent-id")

		// 検証
		assert.Error(t, err)
		assert.Nil(t, result)
		assert.Contains(t, err.Error(), "failed to get group")
		mockRepo.AssertExpectations(t)
	})

	t.Run("リポジトリエラー", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		
		// モックの設定
		mockRepo.On("GetByID", "test-id").Return(nil, errors.New("database error"))

		// テスト実行
		result, err := service.GetGroup("test-id")

		// 検証
		assert.Error(t, err)
		assert.Nil(t, result)
		assert.Contains(t, err.Error(), "failed to get group")
		mockRepo.AssertExpectations(t)
	})
}

func TestGroupService_GetAllGroups(t *testing.T) {
	t.Run("正常な全グループ取得", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		// テストデータ
		expectedGroups := []models.Group{
			{ID: "1", Name: "Group 1"},
			{ID: "2", Name: "Group 2"},
		}

		// モックの設定
		mockRepo.On("GetAll").Return(expectedGroups, nil)

		// テスト実行
		result, err := service.GetAllGroups()

		// 検証
		assert.NoError(t, err)
		assert.Len(t, result, 2)
		assert.Equal(t, expectedGroups[0].ID, result[0].ID)
		assert.Equal(t, expectedGroups[1].ID, result[1].ID)
		mockRepo.AssertExpectations(t)
	})

	t.Run("空のグループリスト", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		
		// テストデータ
		expectedGroups := []models.Group{}

		// モックの設定
		mockRepo.On("GetAll").Return(expectedGroups, nil)

		// テスト実行
		result, err := service.GetAllGroups()

		// 検証
		assert.NoError(t, err)
		assert.Len(t, result, 0)
		mockRepo.AssertExpectations(t)
	})

	t.Run("リポジトリエラー", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		
		// モックの設定
		mockRepo.On("GetAll").Return([]models.Group{}, errors.New("database error"))

		// テスト実行
		result, err := service.GetAllGroups()

		// 検証
		assert.Error(t, err)
		assert.Nil(t, result)
		assert.Contains(t, err.Error(), "failed to get groups")
		mockRepo.AssertExpectations(t)
	})
}

func TestGroupService_UpdateGroup(t *testing.T) {
	t.Run("正常なグループ更新", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		// テストデータ
		existingGroup := &models.Group{
			ID:   "test-id",
			Name: "Old Name",
		}
		newName := "New Name"
		newDescription := "New Description"
		req := &UpdateGroupRequest{
			Name:        &newName,
			Description: &newDescription,
		}

		// モックの設定
		mockRepo.On("GetByID", "test-id").Return(existingGroup, nil)
		mockRepo.On("Update", mock.AnythingOfType("*models.Group")).Return(nil)

		// テスト実行
		result, err := service.UpdateGroup("test-id", req)

		// 検証
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, newName, result.Name)
		assert.Equal(t, &newDescription, result.Description)
		mockRepo.AssertExpectations(t)
	})

	t.Run("部分更新 - 名前のみ", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		
		// テストデータ
		existingGroup := &models.Group{
			ID:   "test-id",
			Name: "Old Name",
		}
		newName := "New Name"
		req := &UpdateGroupRequest{
			Name: &newName,
		}

		// モックの設定
		mockRepo.On("GetByID", "test-id").Return(existingGroup, nil)
		mockRepo.On("Update", mock.AnythingOfType("*models.Group")).Return(nil)

		// テスト実行
		result, err := service.UpdateGroup("test-id", req)

		// 検証
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, newName, result.Name)
		mockRepo.AssertExpectations(t)
	})

	t.Run("IDが空の場合", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		
		req := &UpdateGroupRequest{
			Name: stringPtr("New Name"),
		}

		// テスト実行
		result, err := service.UpdateGroup("", req)

		// 検証
		assert.Error(t, err)
		assert.Nil(t, result)
		assert.Contains(t, err.Error(), "group ID is required")
	})

	t.Run("バリデーションエラー", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		
		longName := make([]byte, 256)
		for i := range longName {
			longName[i] = 'a'
		}
		req := &UpdateGroupRequest{
			Name: stringPtr(string(longName)),
		}

		// テスト実行
		result, err := service.UpdateGroup("test-id", req)

		// 検証
		assert.Error(t, err)
		assert.Nil(t, result)
		assert.IsType(t, validator.ValidationErrors{}, err)
	})

	t.Run("グループが見つからない場合", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		
		req := &UpdateGroupRequest{
			Name: stringPtr("New Name"),
		}

		// モックの設定
		mockRepo.On("GetByID", "nonexistent-id").Return(nil, gorm.ErrRecordNotFound)

		// テスト実行
		result, err := service.UpdateGroup("nonexistent-id", req)

		// 検証
		assert.Error(t, err)
		assert.Nil(t, result)
		assert.Contains(t, err.Error(), "failed to get group")
		mockRepo.AssertExpectations(t)
	})

	t.Run("更新時のリポジトリエラー", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		
		existingGroup := &models.Group{
			ID:   "test-id",
			Name: "Old Name",
		}
		req := &UpdateGroupRequest{
			Name: stringPtr("New Name"),
		}

		// モックの設定
		mockRepo.On("GetByID", "test-id").Return(existingGroup, nil)
		mockRepo.On("Update", mock.AnythingOfType("*models.Group")).Return(errors.New("database error"))

		// テスト実行
		result, err := service.UpdateGroup("test-id", req)

		// 検証
		assert.Error(t, err)
		assert.Nil(t, result)
		assert.Contains(t, err.Error(), "failed to update group")
		mockRepo.AssertExpectations(t)
	})
}

func TestGroupService_DeleteGroup(t *testing.T) {
	t.Run("正常なグループ削除", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		
		// モックの設定
		mockRepo.On("ExistsByID", "test-id").Return(true, nil)
		mockRepo.On("Delete", "test-id").Return(nil)

		// テスト実行
		err := service.DeleteGroup("test-id")

		// 検証
		assert.NoError(t, err)
		mockRepo.AssertExpectations(t)
	})

	t.Run("IDが空の場合", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		
		// テスト実行
		err := service.DeleteGroup("")

		// 検証
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "group ID is required")
	})

	t.Run("グループが存在しない場合", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		
		// モックの設定
		mockRepo.On("ExistsByID", "nonexistent-id").Return(false, nil)

		// テスト実行
		err := service.DeleteGroup("nonexistent-id")

		// 検証
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "group not found")
		mockRepo.AssertExpectations(t)
	})

	t.Run("存在チェック時のリポジトリエラー", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		
		// モックの設定
		mockRepo.On("ExistsByID", "test-id").Return(false, errors.New("database error"))

		// テスト実行
		err := service.DeleteGroup("test-id")

		// 検証
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "failed to check group existence")
		mockRepo.AssertExpectations(t)
	})

	t.Run("削除時のリポジトリエラー", func(t *testing.T) {
		mockRepo := new(MockGroupRepository)
		service := NewGroupService(mockRepo)
		
		// モックの設定
		mockRepo.On("ExistsByID", "test-id").Return(true, nil)
		mockRepo.On("Delete", "test-id").Return(errors.New("database error"))

		// テスト実行
		err := service.DeleteGroup("test-id")

		// 検証
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "failed to delete group")
		mockRepo.AssertExpectations(t)
	})
}

// ヘルパー関数
func stringPtr(s string) *string {
	return &s
}