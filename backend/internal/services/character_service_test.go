package services

import (
	"character-management-app/internal/models"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

func TestCharacterService_CreateCharacter(t *testing.T) {
	t.Run("正常なキャラクター作成", func(t *testing.T) {
		// 新しいモックインスタンスを作成
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		// テストデータ
		relatedLinks := []string{"http://example.com"}
		relatedLinksJSON, _ := json.Marshal(relatedLinks)
		
		character := &models.Character{
			GroupID:      "group-1",
			Name:         "Test Character",
			Information:  "Test Info",
			RelatedLinks: datatypes.JSON(relatedLinksJSON),
		}
		
		createdCharacter := &models.Character{
			ID:           "char-1",
			GroupID:      "group-1",
			Name:         "Test Character",
			Information:  "Test Info",
			RelatedLinks: datatypes.JSON(relatedLinksJSON),
		}
		
		// モックの設定
		mockGroupRepo.On("ExistsByID", "group-1").Return(true, nil)
		mockCharacterRepo.On("Create", character).Return(nil)
		mockCharacterRepo.On("GetByID", character.ID).Return(createdCharacter, nil)
		
		// テスト実行
		result, err := service.CreateCharacter(character)
		
		// 検証
		assert.NoError(t, err)
		assert.Equal(t, createdCharacter, result)
		mockGroupRepo.AssertExpectations(t)
		mockCharacterRepo.AssertExpectations(t)
	})
	
	t.Run("画像付きキャラクター作成", func(t *testing.T) {
		// 新しいモックインスタンスを作成
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		
		// テストデータ
		photoPath := "uploads/characters/test.jpg"
		character := &models.Character{
			GroupID:     "group-1",
			Name:        "Test Character",
			Photo:       &photoPath,
			Information: "Test Info",
		}
		
		createdCharacter := &models.Character{
			ID:          "char-1",
			GroupID:     "group-1",
			Name:        "Test Character",
			Photo:       &photoPath,
			Information: "Test Info",
		}
		
		// モックの設定
		mockGroupRepo.On("ExistsByID", "group-1").Return(true, nil)
		mockCharacterRepo.On("Create", character).Return(nil)
		mockCharacterRepo.On("GetByID", character.ID).Return(createdCharacter, nil)
		
		// テスト実行
		result, err := service.CreateCharacter(character)
		
		// 検証
		assert.NoError(t, err)
		assert.Equal(t, createdCharacter, result)
		assert.NotNil(t, result.Photo)
		assert.Equal(t, photoPath, *result.Photo)
		mockGroupRepo.AssertExpectations(t)
		mockCharacterRepo.AssertExpectations(t)
	})
	
	t.Run("存在しないグループでキャラクター作成", func(t *testing.T) {
		// 新しいモックインスタンスを作成
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		
		character := &models.Character{
			GroupID: "nonexistent-group",
			Name:    "Test Character",
		}
		
		// モックの設定
		mockGroupRepo.On("ExistsByID", "nonexistent-group").Return(false, nil)
		
		// テスト実行
		result, err := service.CreateCharacter(character)
		
		// 検証
		assert.Error(t, err)
		assert.Nil(t, result)
		assert.Contains(t, err.Error(), "group not found")
		mockGroupRepo.AssertExpectations(t)
	})
	
	t.Run("グループ存在確認でエラー", func(t *testing.T) {
		// 新しいモックインスタンスを作成
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		
		character := &models.Character{
			GroupID: "group-1",
			Name:    "Test Character",
		}
		
		// モックの設定
		mockGroupRepo.On("ExistsByID", "group-1").Return(false, errors.New("database error"))
		
		// テスト実行
		result, err := service.CreateCharacter(character)
		
		// 検証
		assert.Error(t, err)
		assert.Nil(t, result)
		assert.Contains(t, err.Error(), "failed to check group existence")
		mockGroupRepo.AssertExpectations(t)
	})
	
	t.Run("キャラクター作成でエラー", func(t *testing.T) {
		// 新しいモックインスタンスを作成
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		
		character := &models.Character{
			GroupID: "group-1",
			Name:    "Test Character",
		}
		
		// モックの設定
		mockGroupRepo.On("ExistsByID", "group-1").Return(true, nil)
		mockCharacterRepo.On("Create", character).Return(errors.New("database error"))
		
		// テスト実行
		result, err := service.CreateCharacter(character)
		
		// 検証
		assert.Error(t, err)
		assert.Nil(t, result)
		assert.Contains(t, err.Error(), "failed to create character")
		mockGroupRepo.AssertExpectations(t)
		mockCharacterRepo.AssertExpectations(t)
	})
}

func TestCharacterService_GetCharacterByID(t *testing.T) {
	t.Run("正常なキャラクター取得", func(t *testing.T) {
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		character := &models.Character{
			ID:      "char-1",
			GroupID: "group-1",
			Name:    "Test Character",
		}
		
		// モックの設定
		mockCharacterRepo.On("GetByID", "char-1").Return(character, nil)
		
		// テスト実行
		result, err := service.GetCharacterByID("char-1")
		
		// 検証
		assert.NoError(t, err)
		assert.Equal(t, character, result)
		mockCharacterRepo.AssertExpectations(t)
	})
	
	t.Run("存在しないキャラクター取得", func(t *testing.T) {
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		
		// モックの設定
		mockCharacterRepo.On("GetByID", "nonexistent").Return((*models.Character)(nil), gorm.ErrRecordNotFound)
		
		// テスト実行
		result, err := service.GetCharacterByID("nonexistent")
		
		// 検証
		assert.Error(t, err)
		assert.Nil(t, result)
		mockCharacterRepo.AssertExpectations(t)
	})
}

func TestCharacterService_UpdateCharacter(t *testing.T) {
	t.Run("正常なキャラクター更新", func(t *testing.T) {
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		existingCharacter := &models.Character{
			ID:        "char-1",
			GroupID:   "group-1",
			Name:      "Old Name",
			CreatedAt: time.Now(),
		}
		
		updateCharacter := &models.Character{
			GroupID: "group-1",
			Name:    "New Name",
		}
		
		updatedCharacter := &models.Character{
			ID:        "char-1",
			GroupID:   "group-1",
			Name:      "New Name",
			CreatedAt: existingCharacter.CreatedAt,
		}
		
		// モックの設定
		mockCharacterRepo.On("GetByID", "char-1").Return(existingCharacter, nil).Once()
		mockCharacterRepo.On("Update", mock.MatchedBy(func(char *models.Character) bool {
			return char.ID == "char-1" && char.Name == "New Name" && char.CreatedAt.Equal(existingCharacter.CreatedAt)
		})).Return(nil)
		mockCharacterRepo.On("GetByID", "char-1").Return(updatedCharacter, nil).Once()
		
		// テスト実行
		result, err := service.UpdateCharacter("char-1", updateCharacter)
		
		// 検証
		assert.NoError(t, err)
		assert.Equal(t, updatedCharacter, result)
		mockCharacterRepo.AssertExpectations(t)
	})
	
	t.Run("グループ変更を伴うキャラクター更新", func(t *testing.T) {
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		
		existingCharacter := &models.Character{
			ID:      "char-1",
			GroupID: "group-1",
			Name:    "Test Character",
		}
		
		updateCharacter := &models.Character{
			GroupID: "group-2",
			Name:    "Test Character",
		}
		
		updatedCharacter := &models.Character{
			ID:      "char-1",
			GroupID: "group-2",
			Name:    "Test Character",
		}
		
		// モックの設定
		mockCharacterRepo.On("GetByID", "char-1").Return(existingCharacter, nil).Once()
		mockGroupRepo.On("ExistsByID", "group-2").Return(true, nil)
		mockCharacterRepo.On("Update", mock.AnythingOfType("*models.Character")).Return(nil)
		mockCharacterRepo.On("GetByID", "char-1").Return(updatedCharacter, nil).Once()
		
		// テスト実行
		result, err := service.UpdateCharacter("char-1", updateCharacter)
		
		// 検証
		assert.NoError(t, err)
		assert.Equal(t, updatedCharacter, result)
		mockCharacterRepo.AssertExpectations(t)
		mockGroupRepo.AssertExpectations(t)
	})
	
	t.Run("存在しないキャラクター更新", func(t *testing.T) {
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		
		updateCharacter := &models.Character{
			GroupID: "group-1",
			Name:    "New Name",
		}
		
		// モックの設定
		mockCharacterRepo.On("GetByID", "nonexistent").Return((*models.Character)(nil), gorm.ErrRecordNotFound)
		
		// テスト実行
		result, err := service.UpdateCharacter("nonexistent", updateCharacter)
		
		// 検証
		assert.Error(t, err)
		assert.Nil(t, result)
		assert.Contains(t, err.Error(), "failed to get existing character")
		mockCharacterRepo.AssertExpectations(t)
	})
	
	t.Run("存在しないグループへの更新", func(t *testing.T) {
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		
		existingCharacter := &models.Character{
			ID:      "char-1",
			GroupID: "group-1",
			Name:    "Test Character",
		}
		
		updateCharacter := &models.Character{
			GroupID: "nonexistent-group",
			Name:    "Test Character",
		}
		
		// モックの設定
		mockCharacterRepo.On("GetByID", "char-1").Return(existingCharacter, nil)
		mockGroupRepo.On("ExistsByID", "nonexistent-group").Return(false, nil)
		
		// テスト実行
		result, err := service.UpdateCharacter("char-1", updateCharacter)
		
		// 検証
		assert.Error(t, err)
		assert.Nil(t, result)
		assert.Contains(t, err.Error(), "group not found")
		mockCharacterRepo.AssertExpectations(t)
		mockGroupRepo.AssertExpectations(t)
	})
}

func TestCharacterService_DeleteCharacter(t *testing.T) {
	t.Run("正常なキャラクター削除", func(t *testing.T) {
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		
		// モックの設定
		mockCharacterRepo.On("ExistsByID", "char-1").Return(true, nil)
		mockCharacterRepo.On("Delete", "char-1").Return(nil)
		
		// テスト実行
		err := service.DeleteCharacter("char-1")
		
		// 検証
		assert.NoError(t, err)
		mockCharacterRepo.AssertExpectations(t)
	})
	
	t.Run("存在しないキャラクター削除", func(t *testing.T) {
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		
		// モックの設定
		mockCharacterRepo.On("ExistsByID", "nonexistent").Return(false, nil)
		
		// テスト実行
		err := service.DeleteCharacter("nonexistent")
		
		// 検証
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "character not found")
		mockCharacterRepo.AssertExpectations(t)
	})
}

func TestCharacterService_AddLabelToCharacter(t *testing.T) {
	t.Run("正常なラベル追加", func(t *testing.T) {
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		
		// モックの設定
		mockCharacterRepo.On("ExistsByID", "char-1").Return(true, nil)
		mockLabelRepo.On("ExistsByID", "label-1").Return(true, nil)
		mockCharacterRepo.On("HasLabel", "char-1", "label-1").Return(false, nil)
		mockCharacterRepo.On("GetLabelsCount", "char-1").Return(int64(3), nil)
		mockCharacterRepo.On("AddLabel", "char-1", "label-1").Return(nil)
		
		// テスト実行
		err := service.AddLabelToCharacter("char-1", "label-1")
		
		// 検証
		assert.NoError(t, err)
		mockCharacterRepo.AssertExpectations(t)
		mockLabelRepo.AssertExpectations(t)
	})
	
	t.Run("ラベル数制限エラー", func(t *testing.T) {
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		
		// モックの設定
		mockCharacterRepo.On("ExistsByID", "char-1").Return(true, nil)
		mockLabelRepo.On("ExistsByID", "label-1").Return(true, nil)
		mockCharacterRepo.On("HasLabel", "char-1", "label-1").Return(false, nil)
		mockCharacterRepo.On("GetLabelsCount", "char-1").Return(int64(5), nil)
		
		// テスト実行
		err := service.AddLabelToCharacter("char-1", "label-1")
		
		// 検証
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "cannot have more than 5 labels")
		mockCharacterRepo.AssertExpectations(t)
		mockLabelRepo.AssertExpectations(t)
	})
}

func TestCharacterService_GetCharactersByGroupID(t *testing.T) {
	t.Run("正常なグループ内キャラクター取得", func(t *testing.T) {
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		
		characters := []models.Character{
			{ID: "char-1", GroupID: "group-1", Name: "Character 1"},
			{ID: "char-2", GroupID: "group-1", Name: "Character 2"},
		}
		
		// モックの設定
		mockGroupRepo.On("ExistsByID", "group-1").Return(true, nil)
		mockCharacterRepo.On("GetByGroupID", "group-1").Return(characters, nil)
		
		// テスト実行
		result, err := service.GetCharactersByGroupID("group-1")
		
		// 検証
		assert.NoError(t, err)
		assert.Equal(t, characters, result)
		mockGroupRepo.AssertExpectations(t)
		mockCharacterRepo.AssertExpectations(t)
	})
	
	t.Run("存在しないグループでキャラクター取得", func(t *testing.T) {
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		
		// モックの設定
		mockGroupRepo.On("ExistsByID", "nonexistent").Return(false, nil)
		
		// テスト実行
		result, err := service.GetCharactersByGroupID("nonexistent")
		
		// 検証
		assert.Error(t, err)
		assert.Nil(t, result)
		assert.Contains(t, err.Error(), "group not found")
		mockGroupRepo.AssertExpectations(t)
	})
}

func TestCharacterService_GetAllCharacters(t *testing.T) {
	t.Run("正常な全キャラクター取得", func(t *testing.T) {
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		
		characters := []models.Character{
			{ID: "char-1", GroupID: "group-1", Name: "Character 1"},
			{ID: "char-2", GroupID: "group-2", Name: "Character 2"},
		}
		
		// モックの設定
		mockCharacterRepo.On("GetAll").Return(characters, nil)
		
		// テスト実行
		result, err := service.GetAllCharacters()
		
		// 検証
		assert.NoError(t, err)
		assert.Equal(t, characters, result)
		mockCharacterRepo.AssertExpectations(t)
	})
	
	t.Run("データベースエラー", func(t *testing.T) {
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		
		// モックの設定
		mockCharacterRepo.On("GetAll").Return([]models.Character{}, errors.New("database error"))
		
		// テスト実行
		result, err := service.GetAllCharacters()
		
		// 検証
		assert.Error(t, err)
		assert.Empty(t, result)
		assert.Contains(t, err.Error(), "failed to get all characters")
		mockCharacterRepo.AssertExpectations(t)
	})
}

func TestCharacterService_RemoveLabelFromCharacter(t *testing.T) {
	t.Run("正常なラベル削除", func(t *testing.T) {
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		
		// モックの設定
		mockCharacterRepo.On("ExistsByID", "char-1").Return(true, nil)
		mockLabelRepo.On("ExistsByID", "label-1").Return(true, nil)
		mockCharacterRepo.On("RemoveLabel", "char-1", "label-1").Return(nil)
		
		// テスト実行
		err := service.RemoveLabelFromCharacter("char-1", "label-1")
		
		// 検証
		assert.NoError(t, err)
		mockCharacterRepo.AssertExpectations(t)
		mockLabelRepo.AssertExpectations(t)
	})
	
	t.Run("存在しないキャラクターからラベル削除", func(t *testing.T) {
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		
		// モックの設定
		mockCharacterRepo.On("ExistsByID", "nonexistent").Return(false, nil)
		
		// テスト実行
		err := service.RemoveLabelFromCharacter("nonexistent", "label-1")
		
		// 検証
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "character not found")
		mockCharacterRepo.AssertExpectations(t)
	})
	
	t.Run("存在しないラベルを削除", func(t *testing.T) {
		mockCharacterRepo := new(MockCharacterRepository)
		mockGroupRepo := new(MockGroupRepository)
		mockLabelRepo := new(MockLabelRepository)
		service := NewCharacterService(mockCharacterRepo, mockGroupRepo, mockLabelRepo)
		
		// モックの設定
		mockCharacterRepo.On("ExistsByID", "char-1").Return(true, nil)
		mockLabelRepo.On("ExistsByID", "nonexistent").Return(false, nil)
		
		// テスト実行
		err := service.RemoveLabelFromCharacter("char-1", "nonexistent")
		
		// 検証
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "label not found")
		mockCharacterRepo.AssertExpectations(t)
		mockLabelRepo.AssertExpectations(t)
	})
}