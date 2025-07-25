package handlers

import (
	"character-management-app/internal/models"
	"character-management-app/internal/services"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// RelationshipHandler 関係ハンドラー
type RelationshipHandler struct {
	relationshipService services.RelationshipService
}

// NewRelationshipHandler 関係ハンドラーのコンストラクタ
func NewRelationshipHandler(relationshipService services.RelationshipService) *RelationshipHandler {
	return &RelationshipHandler{
		relationshipService: relationshipService,
	}
}

// CreateRelationshipRequest 関係作成リクエスト
type CreateRelationshipRequest struct {
	Character1ID     string  `json:"character1Id" validate:"required"`
	Character2ID     string  `json:"character2Id" validate:"required"`
	RelationshipType string  `json:"relationshipType" validate:"required,max=100"`
	Description      *string `json:"description"`
}

// UpdateRelationshipRequest 関係更新リクエスト
type UpdateRelationshipRequest struct {
	Character1ID     string  `json:"character1Id" validate:"required"`
	Character2ID     string  `json:"character2Id" validate:"required"`
	RelationshipType string  `json:"relationshipType" validate:"required,max=100"`
	Description      *string `json:"description"`
}

// GetRelationships 関係一覧を取得
func (h *RelationshipHandler) GetRelationships(c *gin.Context) {
	// クエリパラメータからgroupIdとcharacterIdを取得
	groupID := c.Query("groupId")
	characterID := c.Query("characterId")

	var relationships []models.Relationship
	var err error

	if characterID != "" {
		// 人物IDが指定されている場合、その人物の関係を取得
		relationships, err = h.relationshipService.GetRelationshipsByCharacterID(characterID)
	} else if groupID != "" {
		// グループIDが指定されている場合、そのグループの関係を取得
		relationships, err = h.relationshipService.GetRelationshipsByGroupID(groupID)
	} else {
		// 何も指定されていない場合、全ての関係を取得
		relationships, err = h.relationshipService.GetAllRelationships()
	}

	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, relationships)
}

// CreateRelationship 関係を作成
func (h *RelationshipHandler) CreateRelationship(c *gin.Context) {
	var req CreateRelationshipRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 関係モデルを作成
	relationship := &models.Relationship{
		Character1ID:     req.Character1ID,
		Character2ID:     req.Character2ID,
		RelationshipType: req.RelationshipType,
		Description:      req.Description,
	}

	// 関係を作成
	createdRelationship, err := h.relationshipService.CreateRelationship(relationship)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		if strings.Contains(err.Error(), "same character") ||
			strings.Contains(err.Error(), "same group") ||
			strings.Contains(err.Error(), "already exists") {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, createdRelationship)
}

// GetRelationship 関係を取得
func (h *RelationshipHandler) GetRelationship(c *gin.Context) {
	id := c.Param("id")

	relationship, err := h.relationshipService.GetRelationshipByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Relationship not found"})
		return
	}

	c.JSON(http.StatusOK, relationship)
}

// UpdateRelationship 関係を更新
func (h *RelationshipHandler) UpdateRelationship(c *gin.Context) {
	id := c.Param("id")
	var req UpdateRelationshipRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 関係モデルを作成
	relationship := &models.Relationship{
		Character1ID:     req.Character1ID,
		Character2ID:     req.Character2ID,
		RelationshipType: req.RelationshipType,
		Description:      req.Description,
	}

	// 関係を更新
	updatedRelationship, err := h.relationshipService.UpdateRelationship(id, relationship)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		if strings.Contains(err.Error(), "same character") ||
			strings.Contains(err.Error(), "same group") ||
			strings.Contains(err.Error(), "already exists") {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedRelationship)
}

// DeleteRelationship 関係を削除
func (h *RelationshipHandler) DeleteRelationship(c *gin.Context) {
	id := c.Param("id")

	if err := h.relationshipService.DeleteRelationship(id); err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}