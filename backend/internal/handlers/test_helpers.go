package handlers

import (
	"character-management-app/internal/middleware"

	"github.com/gin-gonic/gin"
)

// setupTestRouter テスト用のルーターを設定
func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(middleware.ErrorHandler())
	return router
}