package handlers

import (
	"bytes"
	"character-management-app/internal/middleware"
	"character-management-app/internal/models"
	"character-management-app/internal/services"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"
)

// MockGroupService モックサービス
type MockGroupService struct {
	mock.Mock
}

func (m *MockGroupService) CreateGroup(req *services.CreateGroupRequest) (*models.Group, error) {
	args := m.Called(req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Group), args.Error(1)
}

func (m *MockGroupService) GetGroup(id string) (*models.Group, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Group), args.Error(1)
}

func (m *MockGroupService) GetAllGroups() ([]models.Group, error) {
	args := m.Called()
	return args.Get(0).([]models.Group), args.Error(1)
}

func (m *MockGroupService) UpdateGroup(id string, req *services.UpdateGroupRequest) (*models.Group, error) {
	args := m.Called(id, req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Group), args.Error(1)
}

func (m *MockGroupService) DeleteGroup(id string) error {
	args := m.Called(id)
	return args.Error(0)
}



func TestGroupHandler_GetGroups(t *testing.T) {
	mockService := new(MockGroupService)
	handler := NewGroupHandler(mockService)
	router := setupTestRouter()
	router.GET("/groups", handler.GetGroups)

	t.Run("正常なグループ一覧取得", func(t *testing.T) {
		// テストデータ
		expectedGroups := []models.Group{
			{ID: "1", Name: "Group 1", CreatedAt: time.Now(), UpdatedAt: time.Now()},
			{ID: "2", Name: "Group 2", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		}

		// モックの設定
		mockService.On("GetAllGroups").Return(expectedGroups, nil)

		// リクエスト作成
		req, _ := http.NewRequest("GET", "/groups", nil)
		w := httptest.NewRecorder()

		// テスト実行
		router.ServeHTTP(w, req)

		// 検証
		assert.Equal(t, http.StatusOK, w.Code)
		
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		
		assert.Equal(t, "Groups retrieved successfully", response["message"])
		assert.NotNil(t, response["data"])
		
		data := response["data"].([]interface{})
		assert.Len(t, data, 2)
		
		mockService.AssertExpectations(t)
	})

	t.Run("サービスエラー", func(t *testing.T) {
		// モックの設定
		mockService.On("GetAllGroups").Return([]models.Group{}, errors.New("service error"))

		// リクエスト作成
		req, _ := http.NewRequest("GET", "/groups", nil)
		w := httptest.NewRecorder()

		// テスト実行
		router.ServeHTTP(w, req)

		// 検証
		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		var response middleware.AppError
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		
		assert.Equal(t, "GET_GROUPS_FAILED", response.Code)
		assert.Equal(t, "Failed to get groups", response.Message)
		
		mockService.AssertExpectations(t)
	})
}

func TestGroupHandler_CreateGroup(t *testing.T) {
	mockService := new(MockGroupService)
	handler := NewGroupHandler(mockService)
	router := setupTestRouter()
	router.POST("/groups", handler.CreateGroup)

	t.Run("正常なグループ作成", func(t *testing.T) {
		// テストデータ
		description := "Test Description"
		requestBody := services.CreateGroupRequest{
			Name:        "Test Group",
			Description: &description,
		}
		expectedGroup := &models.Group{
			ID:          "test-id",
			Name:        "Test Group",
			Description: &description,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		// モックの設定
		mockService.On("CreateGroup", &requestBody).Return(expectedGroup, nil)

		// リクエスト作成
		jsonBody, _ := json.Marshal(requestBody)
		req, _ := http.NewRequest("POST", "/groups", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		// テスト実行
		router.ServeHTTP(w, req)

		// 検証
		assert.Equal(t, http.StatusCreated, w.Code)
		
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		
		assert.Equal(t, "Group created successfully", response["message"])
		assert.NotNil(t, response["data"])
		
		data := response["data"].(map[string]interface{})
		assert.Equal(t, "test-id", data["id"])
		assert.Equal(t, "Test Group", data["name"])
		
		mockService.AssertExpectations(t)
	})

	t.Run("不正なJSONリクエスト", func(t *testing.T) {
		// リクエスト作成
		req, _ := http.NewRequest("POST", "/groups", bytes.NewBuffer([]byte("invalid json")))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		// テスト実行
		router.ServeHTTP(w, req)

		// 検証
		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		var response middleware.AppError
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		
		assert.Equal(t, "INVALID_REQUEST", response.Code)
		assert.Equal(t, "Invalid request body", response.Message)
	})

	t.Run("バリデーションエラー", func(t *testing.T) {
		// テストデータ
		requestBody := services.CreateGroupRequest{
			Name: "", // 空の名前
		}

		// モックの設定
		validationErr := validator.ValidationErrors{}
		mockService.On("CreateGroup", &requestBody).Return(nil, validationErr)

		// リクエスト作成
		jsonBody, _ := json.Marshal(requestBody)
		req, _ := http.NewRequest("POST", "/groups", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		// テスト実行
		router.ServeHTTP(w, req)

		// 検証
		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		mockService.AssertExpectations(t)
	})

	t.Run("サービスエラー", func(t *testing.T) {
		// テストデータ
		requestBody := services.CreateGroupRequest{
			Name: "Test Group",
		}

		// モックの設定
		mockService.On("CreateGroup", &requestBody).Return(nil, errors.New("service error"))

		// リクエスト作成
		jsonBody, _ := json.Marshal(requestBody)
		req, _ := http.NewRequest("POST", "/groups", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		// テスト実行
		router.ServeHTTP(w, req)

		// 検証
		assert.Equal(t, http.StatusInternalServerError, w.Code)
		
		mockService.AssertExpectations(t)
	})
}

func TestGroupHandler_GetGroup(t *testing.T) {
	mockService := new(MockGroupService)
	handler := NewGroupHandler(mockService)
	router := setupTestRouter()
	router.GET("/groups/:id", handler.GetGroup)

	t.Run("正常なグループ取得", func(t *testing.T) {
		// テストデータ
		expectedGroup := &models.Group{
			ID:        "test-id",
			Name:      "Test Group",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		// モックの設定
		mockService.On("GetGroup", "test-id").Return(expectedGroup, nil)

		// リクエスト作成
		req, _ := http.NewRequest("GET", "/groups/test-id", nil)
		w := httptest.NewRecorder()

		// テスト実行
		router.ServeHTTP(w, req)

		// 検証
		assert.Equal(t, http.StatusOK, w.Code)
		
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		
		assert.Equal(t, "Group retrieved successfully", response["message"])
		assert.NotNil(t, response["data"])
		
		data := response["data"].(map[string]interface{})
		assert.Equal(t, "test-id", data["id"])
		assert.Equal(t, "Test Group", data["name"])
		
		mockService.AssertExpectations(t)
	})

	t.Run("グループが見つからない場合", func(t *testing.T) {
		// モックの設定
		mockService.On("GetGroup", "nonexistent-id").Return(nil, gorm.ErrRecordNotFound)

		// リクエスト作成
		req, _ := http.NewRequest("GET", "/groups/nonexistent-id", nil)
		w := httptest.NewRecorder()

		// テスト実行
		router.ServeHTTP(w, req)

		// 検証
		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		var response middleware.AppError
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		
		assert.Equal(t, "GROUP_NOT_FOUND", response.Code)
		assert.Equal(t, "Group not found", response.Message)
		
		mockService.AssertExpectations(t)
	})

	t.Run("サービスエラー", func(t *testing.T) {
		// モックの設定
		mockService.On("GetGroup", "test-id").Return(nil, errors.New("service error"))

		// リクエスト作成
		req, _ := http.NewRequest("GET", "/groups/test-id", nil)
		w := httptest.NewRecorder()

		// テスト実行
		router.ServeHTTP(w, req)

		// 検証
		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		var response middleware.AppError
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		
		assert.Equal(t, "GET_GROUP_FAILED", response.Code)
		assert.Equal(t, "Failed to get group", response.Message)
		
		mockService.AssertExpectations(t)
	})
}

func TestGroupHandler_UpdateGroup(t *testing.T) {
	mockService := new(MockGroupService)
	handler := NewGroupHandler(mockService)
	router := setupTestRouter()
	router.PUT("/groups/:id", handler.UpdateGroup)

	t.Run("正常なグループ更新", func(t *testing.T) {
		// テストデータ
		newName := "Updated Group"
		requestBody := services.UpdateGroupRequest{
			Name: &newName,
		}
		expectedGroup := &models.Group{
			ID:        "test-id",
			Name:      "Updated Group",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		// モックの設定
		mockService.On("UpdateGroup", "test-id", &requestBody).Return(expectedGroup, nil)

		// リクエスト作成
		jsonBody, _ := json.Marshal(requestBody)
		req, _ := http.NewRequest("PUT", "/groups/test-id", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		// テスト実行
		router.ServeHTTP(w, req)

		// 検証
		assert.Equal(t, http.StatusOK, w.Code)
		
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		
		assert.Equal(t, "Group updated successfully", response["message"])
		assert.NotNil(t, response["data"])
		
		data := response["data"].(map[string]interface{})
		assert.Equal(t, "test-id", data["id"])
		assert.Equal(t, "Updated Group", data["name"])
		
		mockService.AssertExpectations(t)
	})

	t.Run("不正なJSONリクエスト", func(t *testing.T) {
		// リクエスト作成
		req, _ := http.NewRequest("PUT", "/groups/test-id", bytes.NewBuffer([]byte("invalid json")))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		// テスト実行
		router.ServeHTTP(w, req)

		// 検証
		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		var response middleware.AppError
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		
		assert.Equal(t, "INVALID_REQUEST", response.Code)
		assert.Equal(t, "Invalid request body", response.Message)
	})

	t.Run("グループが見つからない場合", func(t *testing.T) {
		// テストデータ
		newName := "Updated Group"
		requestBody := services.UpdateGroupRequest{
			Name: &newName,
		}

		// モックの設定
		mockService.On("UpdateGroup", "nonexistent-id", &requestBody).Return(nil, gorm.ErrRecordNotFound)

		// リクエスト作成
		jsonBody, _ := json.Marshal(requestBody)
		req, _ := http.NewRequest("PUT", "/groups/nonexistent-id", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		// テスト実行
		router.ServeHTTP(w, req)

		// 検証
		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		var response middleware.AppError
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		
		assert.Equal(t, "GROUP_NOT_FOUND", response.Code)
		assert.Equal(t, "Group not found", response.Message)
		
		mockService.AssertExpectations(t)
	})

	t.Run("サービスエラー", func(t *testing.T) {
		// テストデータ
		newName := "Updated Group"
		requestBody := services.UpdateGroupRequest{
			Name: &newName,
		}

		// モックの設定
		mockService.On("UpdateGroup", "test-id", &requestBody).Return(nil, errors.New("service error"))

		// リクエスト作成
		jsonBody, _ := json.Marshal(requestBody)
		req, _ := http.NewRequest("PUT", "/groups/test-id", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		// テスト実行
		router.ServeHTTP(w, req)

		// 検証
		assert.Equal(t, http.StatusInternalServerError, w.Code)
		
		mockService.AssertExpectations(t)
	})
}

func TestGroupHandler_DeleteGroup(t *testing.T) {
	mockService := new(MockGroupService)
	handler := NewGroupHandler(mockService)
	router := setupTestRouter()
	router.DELETE("/groups/:id", handler.DeleteGroup)

	t.Run("正常なグループ削除", func(t *testing.T) {
		// モックの設定
		mockService.On("DeleteGroup", "test-id").Return(nil)

		// リクエスト作成
		req, _ := http.NewRequest("DELETE", "/groups/test-id", nil)
		w := httptest.NewRecorder()

		// テスト実行
		router.ServeHTTP(w, req)

		// 検証
		assert.Equal(t, http.StatusOK, w.Code)
		
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		
		assert.Equal(t, "Group deleted successfully", response["message"])
		
		mockService.AssertExpectations(t)
	})

	t.Run("グループが見つからない場合", func(t *testing.T) {
		// モックの設定
		mockService.On("DeleteGroup", "nonexistent-id").Return(errors.New("group not found"))

		// リクエスト作成
		req, _ := http.NewRequest("DELETE", "/groups/nonexistent-id", nil)
		w := httptest.NewRecorder()

		// テスト実行
		router.ServeHTTP(w, req)

		// 検証
		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		var response middleware.AppError
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		
		assert.Equal(t, "GROUP_NOT_FOUND", response.Code)
		assert.Equal(t, "Group not found", response.Message)
		
		mockService.AssertExpectations(t)
	})

	t.Run("サービスエラー", func(t *testing.T) {
		// モックの設定
		mockService.On("DeleteGroup", "test-id").Return(errors.New("service error"))

		// リクエスト作成
		req, _ := http.NewRequest("DELETE", "/groups/test-id", nil)
		w := httptest.NewRecorder()

		// テスト実行
		router.ServeHTTP(w, req)

		// 検証
		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		var response middleware.AppError
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		
		assert.Equal(t, "DELETE_GROUP_FAILED", response.Code)
		assert.Equal(t, "Failed to delete group", response.Message)
		
		mockService.AssertExpectations(t)
	})
}