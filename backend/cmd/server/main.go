package main

import (
	"log"
	"os"

	"character-management-app/internal/config"
	"character-management-app/internal/handlers"
	"character-management-app/internal/middleware"
	"character-management-app/internal/repositories"
	"character-management-app/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// 環境変数の読み込み
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// データベース接続
	db, err := config.InitDatabase()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// リポジトリの初期化
	groupRepo := repositories.NewGroupRepository(db)
	characterRepo := repositories.NewCharacterRepository(db)
	labelRepo := repositories.NewLabelRepository(db)
	relationshipRepo := repositories.NewRelationshipRepository(db)

	// サービスの初期化
	groupService := services.NewGroupService(groupRepo)
	characterService := services.NewCharacterService(characterRepo, groupRepo, labelRepo)
	labelService := services.NewLabelService(labelRepo)
	relationshipService := services.NewRelationshipService(relationshipRepo, characterRepo)
	imageService := services.NewImageService("uploads/characters")

	// ハンドラーの初期化
	groupHandler := handlers.NewGroupHandler(groupService)
	characterHandler := handlers.NewCharacterHandler(characterService, imageService)
	labelHandler := handlers.NewLabelHandler(labelService)
	relationshipHandler := handlers.NewRelationshipHandler(relationshipService)

	// Ginルーターの設定
	r := gin.Default()

	// ミドルウェアの設定
	r.Use(middleware.CORS())
	r.Use(middleware.ErrorHandler())

	// 404と405のハンドラー設定
	r.NoRoute(middleware.NotFoundHandler())
	r.NoMethod(middleware.MethodNotAllowedHandler())

	// ヘルスチェックエンドポイント
	r.GET("/health", func(c *gin.Context) {
		if err := config.HealthCheck(db); err != nil {
			c.JSON(500, gin.H{"status": "error", "message": err.Error()})
			return
		}
		c.JSON(200, gin.H{"status": "ok", "message": "Database connection is healthy"})
	})

	// ルートの設定
	api := r.Group("/api/v1")
	{
		// グループ関連のルート
		groups := api.Group("/groups")
		{
			groups.GET("", groupHandler.GetGroups)
			groups.POST("", groupHandler.CreateGroup)
			groups.GET("/:id", groupHandler.GetGroup)
			groups.PUT("/:id", groupHandler.UpdateGroup)
			groups.DELETE("/:id", groupHandler.DeleteGroup)
		}

		// 人物関連のルート
		characters := api.Group("/characters")
		{
			characters.GET("", characterHandler.GetCharacters)
			characters.POST("", characterHandler.CreateCharacter)
			characters.GET("/:id", characterHandler.GetCharacter)
			characters.PUT("/:id", characterHandler.UpdateCharacter)
			characters.DELETE("/:id", characterHandler.DeleteCharacter)
			characters.POST("/:id/labels/:labelId", characterHandler.AddLabelToCharacter)
			characters.DELETE("/:id/labels/:labelId", characterHandler.RemoveLabelFromCharacter)
		}

		// ラベル関連のルート
		labels := api.Group("/labels")
		{
			labels.GET("", labelHandler.GetLabels)
			labels.POST("", labelHandler.CreateLabel)
			labels.GET("/:id", labelHandler.GetLabel)
			labels.PUT("/:id", labelHandler.UpdateLabel)
			labels.DELETE("/:id", labelHandler.DeleteLabel)
		}

		// 関係関連のルート
		relationships := api.Group("/relationships")
		{
			relationships.GET("", relationshipHandler.GetRelationships)
			relationships.POST("", relationshipHandler.CreateRelationship)
			relationships.GET("/:id", relationshipHandler.GetRelationship)
			relationships.PUT("/:id", relationshipHandler.UpdateRelationship)
			relationships.DELETE("/:id", relationshipHandler.DeleteRelationship)
		}
	}

	// 静的ファイルの配信（画像用）
	r.Static("/uploads", "./uploads")

	// サーバー起動
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}