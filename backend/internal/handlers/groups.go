package handlers

import (
	"character-management-app/internal/middleware"
	"character-management-app/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GroupHandler グループハンドラー
type GroupHandler struct {
	groupService services.GroupService
}

// NewGroupHandler グループハンドラーのコンストラクタ
func NewGroupHandler(groupService services.GroupService) *GroupHandler {
	return &GroupHandler{
		groupService: groupService,
	}
}

// GetGroups グループ一覧を取得
// @Summary グループ一覧取得
// @Description 全てのグループを取得します
// @Tags groups
// @Accept json
// @Produce json
// @Success 200 {array} models.Group
// @Failure 500 {object} middleware.AppError
// @Router /api/v1/groups [get]
func (h *GroupHandler) GetGroups(c *gin.Context) {
	groups, err := h.groupService.GetAllGroups()
	if err != nil {
		c.Error(middleware.NewAppError("GET_GROUPS_FAILED", "Failed to get groups", err.Error()))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    groups,
		"message": "Groups retrieved successfully",
	})
}

// CreateGroup グループを作成
// @Summary グループ作成
// @Description 新しいグループを作成します
// @Tags groups
// @Accept json
// @Produce json
// @Param group body services.CreateGroupRequest true "グループ作成リクエスト"
// @Success 201 {object} models.Group
// @Failure 400 {object} middleware.AppError
// @Failure 500 {object} middleware.AppError
// @Router /api/v1/groups [post]
func (h *GroupHandler) CreateGroup(c *gin.Context) {
	var req services.CreateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(middleware.NewAppError("INVALID_REQUEST", "Invalid request body", err.Error()))
		return
	}

	group, err := h.groupService.CreateGroup(&req)
	if err != nil {
		c.Error(err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data":    group,
		"message": "Group created successfully",
	})
}

// GetGroup グループを取得
// @Summary グループ詳細取得
// @Description 指定されたIDのグループを取得します
// @Tags groups
// @Accept json
// @Produce json
// @Param id path string true "グループID"
// @Success 200 {object} models.Group
// @Failure 400 {object} middleware.AppError
// @Failure 404 {object} middleware.AppError
// @Failure 500 {object} middleware.AppError
// @Router /api/v1/groups/{id} [get]
func (h *GroupHandler) GetGroup(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.Error(middleware.NewAppError("INVALID_ID", "Group ID is required", nil))
		return
	}

	group, err := h.groupService.GetGroup(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.Error(middleware.NewAppError("GROUP_NOT_FOUND", "Group not found", nil))
			return
		}
		c.Error(middleware.NewAppError("GET_GROUP_FAILED", "Failed to get group", err.Error()))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    group,
		"message": "Group retrieved successfully",
	})
}

// UpdateGroup グループを更新
// @Summary グループ更新
// @Description 指定されたIDのグループを更新します
// @Tags groups
// @Accept json
// @Produce json
// @Param id path string true "グループID"
// @Param group body services.UpdateGroupRequest true "グループ更新リクエスト"
// @Success 200 {object} models.Group
// @Failure 400 {object} middleware.AppError
// @Failure 404 {object} middleware.AppError
// @Failure 500 {object} middleware.AppError
// @Router /api/v1/groups/{id} [put]
func (h *GroupHandler) UpdateGroup(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.Error(middleware.NewAppError("INVALID_ID", "Group ID is required", nil))
		return
	}

	var req services.UpdateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(middleware.NewAppError("INVALID_REQUEST", "Invalid request body", err.Error()))
		return
	}

	group, err := h.groupService.UpdateGroup(id, &req)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.Error(middleware.NewAppError("GROUP_NOT_FOUND", "Group not found", nil))
			return
		}
		c.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    group,
		"message": "Group updated successfully",
	})
}

// DeleteGroup グループを削除
// @Summary グループ削除
// @Description 指定されたIDのグループを削除します
// @Tags groups
// @Accept json
// @Produce json
// @Param id path string true "グループID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} middleware.AppError
// @Failure 404 {object} middleware.AppError
// @Failure 500 {object} middleware.AppError
// @Router /api/v1/groups/{id} [delete]
func (h *GroupHandler) DeleteGroup(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.Error(middleware.NewAppError("INVALID_ID", "Group ID is required", nil))
		return
	}

	err := h.groupService.DeleteGroup(id)
	if err != nil {
		if err.Error() == "group not found" {
			c.Error(middleware.NewAppError("GROUP_NOT_FOUND", "Group not found", nil))
			return
		}
		c.Error(middleware.NewAppError("DELETE_GROUP_FAILED", "Failed to delete group", err.Error()))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Group deleted successfully",
	})
}