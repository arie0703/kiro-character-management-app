package handlers

import (
	"character-management-app/internal/models"
	"character-management-app/internal/services"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// LabelHandler ラベルハンドラー
type LabelHandler struct {
	labelService services.LabelService
}

// NewLabelHandler ラベルハンドラーのコンストラクタ
func NewLabelHandler(labelService services.LabelService) *LabelHandler {
	return &LabelHandler{
		labelService: labelService,
	}
}

// CreateLabelRequest ラベル作成リクエスト
type CreateLabelRequest struct {
	Name  string `json:"name" validate:"required,max=100"`
	Color string `json:"color" validate:"required,hexcolor"`
}

// UpdateLabelRequest ラベル更新リクエスト
type UpdateLabelRequest struct {
	Name  string `json:"name" validate:"required,max=100"`
	Color string `json:"color" validate:"required,hexcolor"`
}

// GetLabels ラベル一覧を取得
func (h *LabelHandler) GetLabels(c *gin.Context) {
	labels, err := h.labelService.GetAllLabels()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, labels)
}

// CreateLabel ラベルを作成
func (h *LabelHandler) CreateLabel(c *gin.Context) {
	var req CreateLabelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ラベルモデルを作成
	label := &models.Label{
		Name:  req.Name,
		Color: req.Color,
	}

	// ラベルを作成
	createdLabel, err := h.labelService.CreateLabel(label)
	if err != nil {
		if strings.Contains(err.Error(), "already exists") {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, createdLabel)
}

// GetLabel ラベルを取得
func (h *LabelHandler) GetLabel(c *gin.Context) {
	id := c.Param("id")

	label, err := h.labelService.GetLabelByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Label not found"})
		return
	}

	c.JSON(http.StatusOK, label)
}

// UpdateLabel ラベルを更新
func (h *LabelHandler) UpdateLabel(c *gin.Context) {
	id := c.Param("id")
	var req UpdateLabelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ラベルモデルを作成
	label := &models.Label{
		Name:  req.Name,
		Color: req.Color,
	}

	// ラベルを更新
	updatedLabel, err := h.labelService.UpdateLabel(id, label)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		if strings.Contains(err.Error(), "already exists") {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedLabel)
}

// DeleteLabel ラベルを削除
func (h *LabelHandler) DeleteLabel(c *gin.Context) {
	id := c.Param("id")

	if err := h.labelService.DeleteLabel(id); err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}