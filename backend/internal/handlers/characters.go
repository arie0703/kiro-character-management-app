package handlers

import (
	"character-management-app/internal/models"
	"character-management-app/internal/services"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
)

// CharacterHandler 人物ハンドラー
type CharacterHandler struct {
	characterService services.CharacterService
	imageService     services.ImageService
}

// NewCharacterHandler 人物ハンドラーのコンストラクタ
func NewCharacterHandler(characterService services.CharacterService, imageService services.ImageService) *CharacterHandler {
	return &CharacterHandler{
		characterService: characterService,
		imageService:     imageService,
	}
}

// CreateCharacterRequest 人物作成リクエスト
type CreateCharacterRequest struct {
	GroupID      string   `json:"groupId" validate:"required"`
	Name         string   `json:"name" validate:"required,max=255"`
	Information  string   `json:"information"`
	RelatedLinks []string `json:"relatedLinks"`
}

// UpdateCharacterRequest 人物更新リクエスト
type UpdateCharacterRequest struct {
	GroupID      string   `json:"groupId" validate:"required"`
	Name         string   `json:"name" validate:"required,max=255"`
	Information  string   `json:"information"`
	RelatedLinks []string `json:"relatedLinks"`
}

// GetCharacters 人物一覧を取得
func (h *CharacterHandler) GetCharacters(c *gin.Context) {
	// クエリパラメータからgroupIdを取得
	groupID := c.Query("groupId")
	
	var characters []models.Character
	var err error
	
	if groupID != "" {
		// グループIDが指定されている場合、そのグループの人物を取得
		characters, err = h.characterService.GetCharactersByGroupID(groupID)
	} else {
		// グループIDが指定されていない場合、全ての人物を取得
		characters, err = h.characterService.GetAllCharacters()
	}
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, characters)
}

// CreateCharacter 人物を作成
func (h *CharacterHandler) CreateCharacter(c *gin.Context) {
	var req CreateCharacterRequest
	var photoPath *string
	
	// Content-Typeをチェック
	contentType := c.GetHeader("Content-Type")
	
	if strings.Contains(contentType, "multipart/form-data") {
		// マルチパートフォームデータの場合
		if err := h.handleMultipartCreate(c, &req, &photoPath); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	} else {
		// JSONの場合
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	}
	
	// RelatedLinksをJSONに変換
	relatedLinksJSON, err := json.Marshal(req.RelatedLinks)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal related links"})
		return
	}
	
	// 人物モデルを作成
	character := &models.Character{
		GroupID:      req.GroupID,
		Name:         req.Name,
		Photo:        photoPath,
		Information:  req.Information,
		RelatedLinks: datatypes.JSON(relatedLinksJSON),
	}
	
	// 人物を作成
	createdCharacter, err := h.characterService.CreateCharacter(character)
	if err != nil {
		// 画像ファイルが保存されている場合は削除
		if photoPath != nil {
			h.imageService.DeleteImage(*photoPath)
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusCreated, createdCharacter)
}

// GetCharacter 人物を取得
func (h *CharacterHandler) GetCharacter(c *gin.Context) {
	id := c.Param("id")
	
	character, err := h.characterService.GetCharacterByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Character not found"})
		return
	}
	
	c.JSON(http.StatusOK, character)
}

// UpdateCharacter 人物を更新
func (h *CharacterHandler) UpdateCharacter(c *gin.Context) {
	id := c.Param("id")
	var req UpdateCharacterRequest
	var photoPath *string
	
	// 既存の人物を取得
	existingCharacter, err := h.characterService.GetCharacterByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Character not found"})
		return
	}
	
	// Content-Typeをチェック
	contentType := c.GetHeader("Content-Type")
	
	if strings.Contains(contentType, "multipart/form-data") {
		// マルチパートフォームデータの場合
		if err := h.handleMultipartUpdate(c, &req, &photoPath); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	} else {
		// JSONの場合
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	}
	
	// RelatedLinksをJSONに変換
	relatedLinksJSON, err := json.Marshal(req.RelatedLinks)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal related links"})
		return
	}
	
	// 人物モデルを更新
	character := &models.Character{
		GroupID:      req.GroupID,
		Name:         req.Name,
		Information:  req.Information,
		RelatedLinks: datatypes.JSON(relatedLinksJSON),
	}
	
	// 画像が新しくアップロードされた場合
	if photoPath != nil {
		character.Photo = photoPath
	} else {
		// 画像が変更されない場合は既存の画像パスを保持
		character.Photo = existingCharacter.Photo
	}
	
	// 人物を更新
	updatedCharacter, err := h.characterService.UpdateCharacter(id, character)
	if err != nil {
		// 新しい画像ファイルが保存されている場合は削除
		if photoPath != nil {
			h.imageService.DeleteImage(*photoPath)
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	// 古い画像ファイルを削除（新しい画像がアップロードされた場合）
	if photoPath != nil && existingCharacter.Photo != nil {
		h.imageService.DeleteImage(*existingCharacter.Photo)
	}
	
	c.JSON(http.StatusOK, updatedCharacter)
}

// DeleteCharacter 人物を削除
func (h *CharacterHandler) DeleteCharacter(c *gin.Context) {
	id := c.Param("id")
	
	// 削除前に人物を取得（画像ファイル削除のため）
	character, err := h.characterService.GetCharacterByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Character not found"})
		return
	}
	
	// 人物を削除
	if err := h.characterService.DeleteCharacter(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	// 画像ファイルを削除
	if character.Photo != nil {
		h.imageService.DeleteImage(*character.Photo)
	}
	
	c.JSON(http.StatusNoContent, nil)
}

// AddLabelToCharacter 人物にラベルを追加
func (h *CharacterHandler) AddLabelToCharacter(c *gin.Context) {
	characterID := c.Param("id")
	labelID := c.Param("labelId")
	
	if err := h.characterService.AddLabelToCharacter(characterID, labelID); err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		if strings.Contains(err.Error(), "more than 5 labels") {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if strings.Contains(err.Error(), "already has this label") {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Label added successfully"})
}

// RemoveLabelFromCharacter 人物からラベルを削除
func (h *CharacterHandler) RemoveLabelFromCharacter(c *gin.Context) {
	characterID := c.Param("id")
	labelID := c.Param("labelId")
	
	if err := h.characterService.RemoveLabelFromCharacter(characterID, labelID); err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Label removed successfully"})
}

// handleMultipartCreate マルチパートフォームデータでの作成処理
func (h *CharacterHandler) handleMultipartCreate(c *gin.Context, req *CreateCharacterRequest, photoPath **string) error {
	// フォームデータを取得
	req.GroupID = c.PostForm("groupId")
	req.Name = c.PostForm("name")
	req.Information = c.PostForm("information")
	
	// RelatedLinksを解析
	relatedLinksStr := c.PostForm("relatedLinks")
	if relatedLinksStr != "" {
		if err := json.Unmarshal([]byte(relatedLinksStr), &req.RelatedLinks); err != nil {
			return fmt.Errorf("invalid relatedLinks format: %w", err)
		}
	}
	
	// 画像ファイルを処理
	file, header, err := c.Request.FormFile("photo")
	if err == nil {
		defer file.Close()
		
		// 画像サービスを使用してファイルを保存（800x600にリサイズ）
		path, err := h.imageService.SaveImage(file, header.Filename, 800, 600)
		if err != nil {
			fmt.Printf("ERROR: Failed to save image file %s: %v\n", header.Filename, err)
			return fmt.Errorf("failed to save uploaded file: %w", err)
		}
		*photoPath = &path
	}
	
	return nil
}

// handleMultipartUpdate マルチパートフォームデータでの更新処理
func (h *CharacterHandler) handleMultipartUpdate(c *gin.Context, req *UpdateCharacterRequest, photoPath **string) error {
	// フォームデータを取得
	req.GroupID = c.PostForm("groupId")
	req.Name = c.PostForm("name")
	req.Information = c.PostForm("information")
	
	// RelatedLinksを解析
	relatedLinksStr := c.PostForm("relatedLinks")
	if relatedLinksStr != "" {
		if err := json.Unmarshal([]byte(relatedLinksStr), &req.RelatedLinks); err != nil {
			return fmt.Errorf("invalid relatedLinks format: %w", err)
		}
	}
	
	// 画像ファイルを処理
	file, header, err := c.Request.FormFile("photo")
	if err == nil {
		defer file.Close()
		
		// 画像サービスを使用してファイルを保存（800x600にリサイズ）
		path, err := h.imageService.SaveImage(file, header.Filename, 800, 600)
		if err != nil {
			fmt.Printf("ERROR: Failed to save image file %s: %v\n", header.Filename, err)
			return fmt.Errorf("failed to save uploaded file: %w", err)
		}
		*photoPath = &path
	}
	
	return nil
}

