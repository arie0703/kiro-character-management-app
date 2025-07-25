package handlers

import (
	"bytes"
	"character-management-app/internal/models"
	"encoding/json"
	"errors"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/datatypes"
)

// MockCharacterService キャラクターサービスのモック
type MockCharacterService struct {
	mock.Mock
}

func (m *MockCharacterService) CreateCharacter(character *models.Character) (*models.Character, error) {
	args := m.Called(character)
	return args.Get(0).(*models.Character), args.Error(1)
}

func (m *MockCharacterService) GetCharacterByID(id string) (*models.Character, error) {
	args := m.Called(id)
	return args.Get(0).(*models.Character), args.Error(1)
}

func (m *MockCharacterService) GetCharactersByGroupID(groupID string) ([]models.Character, error) {
	args := m.Called(groupID)
	return args.Get(0).([]models.Character), args.Error(1)
}

func (m *MockCharacterService) GetAllCharacters() ([]models.Character, error) {
	args := m.Called()
	return args.Get(0).([]models.Character), args.Error(1)
}

func (m *MockCharacterService) UpdateCharacter(id string, character *models.Character) (*models.Character, error) {
	args := m.Called(id, character)
	return args.Get(0).(*models.Character), args.Error(1)
}

func (m *MockCharacterService) DeleteCharacter(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockCharacterService) AddLabelToCharacter(characterID, labelID string) error {
	args := m.Called(characterID, labelID)
	return args.Error(0)
}

func (m *MockCharacterService) RemoveLabelFromCharacter(characterID, labelID string) error {
	args := m.Called(characterID, labelID)
	return args.Error(0)
}

// MockImageService 画像サービスのモック
type MockImageService struct {
	mock.Mock
}

func (m *MockImageService) SaveImage(file io.Reader, filename string, maxWidth, maxHeight uint) (string, error) {
	args := m.Called(file, filename, maxWidth, maxHeight)
	return args.String(0), args.Error(1)
}

func (m *MockImageService) DeleteImage(filePath string) error {
	args := m.Called(filePath)
	return args.Error(0)
}

func (m *MockImageService) ValidateImageFile(filename string) error {
	args := m.Called(filename)
	return args.Error(0)
}



func TestCharacterHandler_GetCharacters(t *testing.T) {
	mockService := new(MockCharacterService)
	mockImageService := new(MockImageService)
	handler := NewCharacterHandler(mockService, mockImageService)
	
	router := setupTestRouter()
	router.GET("/characters", handler.GetCharacters)
	
	t.Run("全キャラクター取得", func(t *testing.T) {
		characters := []models.Character{
			{ID: "char-1", Name: "Character 1"},
			{ID: "char-2", Name: "Character 2"},
		}
		
		mockService.On("GetAllCharacters").Return(characters, nil)
		
		req, _ := http.NewRequest("GET", "/characters", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusOK, w.Code)
		
		var response []models.Character
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, characters, response)
		
		mockService.AssertExpectations(t)
	})
	
	t.Run("グループ別キャラクター取得", func(t *testing.T) {
		characters := []models.Character{
			{ID: "char-1", GroupID: "group-1", Name: "Character 1"},
		}
		
		mockService.On("GetCharactersByGroupID", "group-1").Return(characters, nil)
		
		req, _ := http.NewRequest("GET", "/characters?groupId=group-1", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusOK, w.Code)
		
		var response []models.Character
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, characters, response)
		
		mockService.AssertExpectations(t)
	})
	
	t.Run("全キャラクター取得でエラー", func(t *testing.T) {
		mockService.On("GetAllCharacters").Return([]models.Character{}, errors.New("database error"))
		
		req, _ := http.NewRequest("GET", "/characters", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusInternalServerError, w.Code)
		
		mockService.AssertExpectations(t)
	})
	
	t.Run("グループ別キャラクター取得でエラー", func(t *testing.T) {
		mockService.On("GetCharactersByGroupID", "group-1").Return([]models.Character{}, errors.New("group not found"))
		
		req, _ := http.NewRequest("GET", "/characters?groupId=group-1", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusInternalServerError, w.Code)
		
		mockService.AssertExpectations(t)
	})
}

func TestCharacterHandler_CreateCharacter(t *testing.T) {
	mockService := new(MockCharacterService)
	mockImageService := new(MockImageService)
	handler := NewCharacterHandler(mockService, mockImageService)
	
	router := setupTestRouter()
	router.POST("/characters", handler.CreateCharacter)
	
	t.Run("JSON形式でキャラクター作成", func(t *testing.T) {
		reqData := CreateCharacterRequest{
			GroupID:      "group-1",
			Name:         "Test Character",
			Information:  "Test Info",
			RelatedLinks: []string{"http://example.com"},
		}
		
		relatedLinksJSON, _ := json.Marshal(reqData.RelatedLinks)
		expectedCharacter := &models.Character{
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
		
		mockService.On("CreateCharacter", mock.MatchedBy(func(char *models.Character) bool {
			return char.GroupID == expectedCharacter.GroupID &&
				char.Name == expectedCharacter.Name &&
				char.Information == expectedCharacter.Information
		})).Return(createdCharacter, nil)
		
		jsonData, _ := json.Marshal(reqData)
		req, _ := http.NewRequest("POST", "/characters", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusCreated, w.Code)
		
		var response models.Character
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, createdCharacter.ID, response.ID)
		
		mockService.AssertExpectations(t)
	})
	
	t.Run("マルチパート形式でキャラクター作成（画像付き）", func(t *testing.T) {
		// マルチパートフォームデータを作成
		var buf bytes.Buffer
		writer := multipart.NewWriter(&buf)
		
		writer.WriteField("groupId", "group-1")
		writer.WriteField("name", "Test Character")
		writer.WriteField("information", "Test Info")
		writer.WriteField("relatedLinks", `["http://example.com"]`)
		
		// 画像ファイルを追加
		part, _ := writer.CreateFormFile("photo", "test.jpg")
		part.Write([]byte("fake image data"))
		writer.Close()
		
		// モックの設定
		mockImageService.On("SaveImage", mock.Anything, "test.jpg", uint(800), uint(600)).Return("uploads/characters/test.jpg", nil)
		
		relatedLinksJSON, _ := json.Marshal([]string{"http://example.com"})
		photoPath := "uploads/characters/test.jpg"
		createdCharacter := &models.Character{
			ID:           "char-1",
			GroupID:      "group-1",
			Name:         "Test Character",
			Information:  "Test Info",
			Photo:        &photoPath,
			RelatedLinks: datatypes.JSON(relatedLinksJSON),
		}
		
		mockService.On("CreateCharacter", mock.MatchedBy(func(char *models.Character) bool {
			return char.GroupID == "group-1" &&
				char.Name == "Test Character" &&
				char.Photo != nil &&
				*char.Photo == "uploads/characters/test.jpg"
		})).Return(createdCharacter, nil)
		
		req, _ := http.NewRequest("POST", "/characters", &buf)
		req.Header.Set("Content-Type", writer.FormDataContentType())
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusCreated, w.Code)
		
		var response models.Character
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, createdCharacter.ID, response.ID)
		assert.NotNil(t, response.Photo)
		
		mockService.AssertExpectations(t)
		mockImageService.AssertExpectations(t)
	})
	
	t.Run("画像保存エラー時のキャラクター作成", func(t *testing.T) {
		// マルチパートフォームデータを作成
		var buf bytes.Buffer
		writer := multipart.NewWriter(&buf)
		
		writer.WriteField("groupId", "group-1")
		writer.WriteField("name", "Test Character")
		
		// 画像ファイルを追加
		part, _ := writer.CreateFormFile("photo", "test.jpg")
		part.Write([]byte("fake image data"))
		writer.Close()
		
		// モックの設定（画像保存でエラー）
		mockImageService.On("SaveImage", mock.Anything, "test.jpg", uint(800), uint(600)).Return("", errors.New("failed to save image"))
		
		req, _ := http.NewRequest("POST", "/characters", &buf)
		req.Header.Set("Content-Type", writer.FormDataContentType())
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		mockImageService.AssertExpectations(t)
	})
	
	t.Run("サービスエラー時の画像削除", func(t *testing.T) {
		// マルチパートフォームデータを作成
		var buf bytes.Buffer
		writer := multipart.NewWriter(&buf)
		
		writer.WriteField("groupId", "group-1")
		writer.WriteField("name", "Test Character")
		
		// 画像ファイルを追加
		part, _ := writer.CreateFormFile("photo", "test.jpg")
		part.Write([]byte("fake image data"))
		writer.Close()
		
		// モックの設定
		mockImageService.On("SaveImage", mock.Anything, "test.jpg", uint(800), uint(600)).Return("uploads/characters/test.jpg", nil)
		mockService.On("CreateCharacter", mock.Anything).Return((*models.Character)(nil), errors.New("service error"))
		mockImageService.On("DeleteImage", "uploads/characters/test.jpg").Return(nil)
		
		req, _ := http.NewRequest("POST", "/characters", &buf)
		req.Header.Set("Content-Type", writer.FormDataContentType())
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusInternalServerError, w.Code)
		
		mockService.AssertExpectations(t)
		mockImageService.AssertExpectations(t)
	})
	
	t.Run("不正なJSONでキャラクター作成", func(t *testing.T) {
		req, _ := http.NewRequest("POST", "/characters", bytes.NewBuffer([]byte("invalid json")))
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	
	t.Run("不正なRelatedLinksでキャラクター作成", func(t *testing.T) {
		// マルチパートフォームデータを作成
		var buf bytes.Buffer
		writer := multipart.NewWriter(&buf)
		
		writer.WriteField("groupId", "group-1")
		writer.WriteField("name", "Test Character")
		writer.WriteField("relatedLinks", "invalid json")
		writer.Close()
		
		req, _ := http.NewRequest("POST", "/characters", &buf)
		req.Header.Set("Content-Type", writer.FormDataContentType())
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestCharacterHandler_GetCharacter(t *testing.T) {
	mockService := new(MockCharacterService)
	mockImageService := new(MockImageService)
	handler := NewCharacterHandler(mockService, mockImageService)
	
	router := setupTestRouter()
	router.GET("/characters/:id", handler.GetCharacter)
	
	t.Run("正常なキャラクター取得", func(t *testing.T) {
		character := &models.Character{
			ID:      "char-1",
			GroupID: "group-1",
			Name:    "Test Character",
		}
		
		mockService.On("GetCharacterByID", "char-1").Return(character, nil)
		
		req, _ := http.NewRequest("GET", "/characters/char-1", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusOK, w.Code)
		
		var response models.Character
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, character.ID, response.ID)
		
		mockService.AssertExpectations(t)
	})
	
	t.Run("存在しないキャラクター取得", func(t *testing.T) {
		mockService.On("GetCharacterByID", "nonexistent").Return((*models.Character)(nil), errors.New("character not found"))
		
		req, _ := http.NewRequest("GET", "/characters/nonexistent", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusNotFound, w.Code)
		
		mockService.AssertExpectations(t)
	})
}

func TestCharacterHandler_UpdateCharacter(t *testing.T) {
	mockService := new(MockCharacterService)
	mockImageService := new(MockImageService)
	handler := NewCharacterHandler(mockService, mockImageService)
	
	router := setupTestRouter()
	router.PUT("/characters/:id", handler.UpdateCharacter)
	
	t.Run("JSON形式でキャラクター更新", func(t *testing.T) {
		existingCharacter := &models.Character{
			ID:      "char-1",
			GroupID: "group-1",
			Name:    "Old Name",
		}
		
		reqData := UpdateCharacterRequest{
			GroupID:     "group-1",
			Name:        "New Name",
			Information: "Updated Info",
		}
		
		updatedCharacter := &models.Character{
			ID:          "char-1",
			GroupID:     "group-1",
			Name:        "New Name",
			Information: "Updated Info",
		}
		
		mockService.On("GetCharacterByID", "char-1").Return(existingCharacter, nil)
		mockService.On("UpdateCharacter", "char-1", mock.MatchedBy(func(char *models.Character) bool {
			return char.Name == "New Name" && char.Information == "Updated Info"
		})).Return(updatedCharacter, nil)
		
		jsonData, _ := json.Marshal(reqData)
		req, _ := http.NewRequest("PUT", "/characters/char-1", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusOK, w.Code)
		
		var response models.Character
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "New Name", response.Name)
		
		mockService.AssertExpectations(t)
	})
	
	t.Run("マルチパート形式でキャラクター更新（画像付き）", func(t *testing.T) {
		oldPhotoPath := "uploads/characters/old.jpg"
		existingCharacter := &models.Character{
			ID:      "char-1",
			GroupID: "group-1",
			Name:    "Old Name",
			Photo:   &oldPhotoPath,
		}
		
		// マルチパートフォームデータを作成
		var buf bytes.Buffer
		writer := multipart.NewWriter(&buf)
		
		writer.WriteField("groupId", "group-1")
		writer.WriteField("name", "Updated Name")
		writer.WriteField("information", "Updated Info")
		
		// 新しい画像ファイルを追加
		part, _ := writer.CreateFormFile("photo", "new.jpg")
		part.Write([]byte("new fake image data"))
		writer.Close()
		
		newPhotoPath := "uploads/characters/new.jpg"
		updatedCharacter := &models.Character{
			ID:          "char-1",
			GroupID:     "group-1",
			Name:        "Updated Name",
			Information: "Updated Info",
			Photo:       &newPhotoPath,
		}
		
		// モックの設定
		mockService.On("GetCharacterByID", "char-1").Return(existingCharacter, nil)
		mockImageService.On("SaveImage", mock.Anything, "new.jpg", uint(800), uint(600)).Return(newPhotoPath, nil)
		mockService.On("UpdateCharacter", "char-1", mock.MatchedBy(func(char *models.Character) bool {
			return char.Name == "Updated Name" && char.Photo != nil && *char.Photo == newPhotoPath
		})).Return(updatedCharacter, nil)
		mockImageService.On("DeleteImage", oldPhotoPath).Return(nil)
		
		req, _ := http.NewRequest("PUT", "/characters/char-1", &buf)
		req.Header.Set("Content-Type", writer.FormDataContentType())
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusOK, w.Code)
		
		var response models.Character
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Updated Name", response.Name)
		assert.NotNil(t, response.Photo)
		
		mockService.AssertExpectations(t)
		mockImageService.AssertExpectations(t)
	})
	
	t.Run("存在しないキャラクター更新", func(t *testing.T) {
		reqData := UpdateCharacterRequest{
			GroupID: "group-1",
			Name:    "New Name",
		}
		
		mockService.On("GetCharacterByID", "nonexistent").Return((*models.Character)(nil), errors.New("character not found"))
		
		jsonData, _ := json.Marshal(reqData)
		req, _ := http.NewRequest("PUT", "/characters/nonexistent", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusNotFound, w.Code)
		
		mockService.AssertExpectations(t)
	})
	
	t.Run("画像保存エラー時のキャラクター更新", func(t *testing.T) {
		existingCharacter := &models.Character{
			ID:      "char-1",
			GroupID: "group-1",
			Name:    "Old Name",
		}
		
		// マルチパートフォームデータを作成
		var buf bytes.Buffer
		writer := multipart.NewWriter(&buf)
		
		writer.WriteField("groupId", "group-1")
		writer.WriteField("name", "Updated Name")
		
		// 画像ファイルを追加
		part, _ := writer.CreateFormFile("photo", "test.jpg")
		part.Write([]byte("fake image data"))
		writer.Close()
		
		// モックの設定（画像保存でエラー）
		mockService.On("GetCharacterByID", "char-1").Return(existingCharacter, nil)
		mockImageService.On("SaveImage", mock.Anything, "test.jpg", uint(800), uint(600)).Return("", errors.New("failed to save image"))
		
		req, _ := http.NewRequest("PUT", "/characters/char-1", &buf)
		req.Header.Set("Content-Type", writer.FormDataContentType())
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		mockService.AssertExpectations(t)
		mockImageService.AssertExpectations(t)
	})
	
	t.Run("サービスエラー時の新画像削除", func(t *testing.T) {
		existingCharacter := &models.Character{
			ID:      "char-1",
			GroupID: "group-1",
			Name:    "Old Name",
		}
		
		// マルチパートフォームデータを作成
		var buf bytes.Buffer
		writer := multipart.NewWriter(&buf)
		
		writer.WriteField("groupId", "group-1")
		writer.WriteField("name", "Updated Name")
		
		// 画像ファイルを追加
		part, _ := writer.CreateFormFile("photo", "test.jpg")
		part.Write([]byte("fake image data"))
		writer.Close()
		
		// モックの設定
		mockService.On("GetCharacterByID", "char-1").Return(existingCharacter, nil)
		mockImageService.On("SaveImage", mock.Anything, "test.jpg", uint(800), uint(600)).Return("uploads/characters/test.jpg", nil)
		mockService.On("UpdateCharacter", "char-1", mock.Anything).Return((*models.Character)(nil), errors.New("service error"))
		mockImageService.On("DeleteImage", "uploads/characters/test.jpg").Return(nil)
		
		req, _ := http.NewRequest("PUT", "/characters/char-1", &buf)
		req.Header.Set("Content-Type", writer.FormDataContentType())
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusInternalServerError, w.Code)
		
		mockService.AssertExpectations(t)
		mockImageService.AssertExpectations(t)
	})
}

func TestCharacterHandler_DeleteCharacter(t *testing.T) {
	mockService := new(MockCharacterService)
	mockImageService := new(MockImageService)
	handler := NewCharacterHandler(mockService, mockImageService)
	
	router := setupTestRouter()
	router.DELETE("/characters/:id", handler.DeleteCharacter)
	
	t.Run("正常なキャラクター削除", func(t *testing.T) {
		photoPath := "uploads/characters/test.jpg"
		character := &models.Character{
			ID:    "char-1",
			Name:  "Test Character",
			Photo: &photoPath,
		}
		
		mockService.On("GetCharacterByID", "char-1").Return(character, nil)
		mockService.On("DeleteCharacter", "char-1").Return(nil)
		mockImageService.On("DeleteImage", photoPath).Return(nil)
		
		req, _ := http.NewRequest("DELETE", "/characters/char-1", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusNoContent, w.Code)
		
		mockService.AssertExpectations(t)
		mockImageService.AssertExpectations(t)
	})
	
	t.Run("存在しないキャラクター削除", func(t *testing.T) {
		mockService.On("GetCharacterByID", "nonexistent").Return((*models.Character)(nil), errors.New("character not found"))
		
		req, _ := http.NewRequest("DELETE", "/characters/nonexistent", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusNotFound, w.Code)
		
		mockService.AssertExpectations(t)
	})
}

func TestCharacterHandler_AddLabelToCharacter(t *testing.T) {
	mockService := new(MockCharacterService)
	mockImageService := new(MockImageService)
	handler := NewCharacterHandler(mockService, mockImageService)
	
	router := setupTestRouter()
	router.POST("/characters/:id/labels/:labelId", handler.AddLabelToCharacter)
	
	t.Run("正常なラベル追加", func(t *testing.T) {
		mockService.On("AddLabelToCharacter", "char-1", "label-1").Return(nil)
		
		req, _ := http.NewRequest("POST", "/characters/char-1/labels/label-1", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusOK, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Label added successfully", response["message"])
		
		mockService.AssertExpectations(t)
	})
	
	t.Run("ラベル数制限エラー", func(t *testing.T) {
		mockService.On("AddLabelToCharacter", "char-1", "label-1").Return(errors.New("character cannot have more than 5 labels"))
		
		req, _ := http.NewRequest("POST", "/characters/char-1/labels/label-1", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		mockService.AssertExpectations(t)
	})
}

func TestCharacterHandler_RemoveLabelFromCharacter(t *testing.T) {
	mockService := new(MockCharacterService)
	mockImageService := new(MockImageService)
	handler := NewCharacterHandler(mockService, mockImageService)
	
	router := setupTestRouter()
	router.DELETE("/characters/:id/labels/:labelId", handler.RemoveLabelFromCharacter)
	
	t.Run("正常なラベル削除", func(t *testing.T) {
		mockService.On("RemoveLabelFromCharacter", "char-1", "label-1").Return(nil)
		
		req, _ := http.NewRequest("DELETE", "/characters/char-1/labels/label-1", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusOK, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Label removed successfully", response["message"])
		
		mockService.AssertExpectations(t)
	})
}