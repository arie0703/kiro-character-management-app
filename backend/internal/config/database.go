package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"character-management-app/internal/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// データベース接続の設定
func InitDatabase() (*gorm.DB, error) {
	// 環境変数からデータベース設定を取得
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "3306")
	dbUser := getEnv("DB_USER", "root")
	dbPassword := getEnv("DB_PASSWORD", "password")
	dbName := getEnv("DB_NAME", "character_management")

	// DSN (Data Source Name) を構築
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName)

	// GORM設定
	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	// データベース接続
	db, err := gorm.Open(mysql.Open(dsn), config)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// 接続プールの設定
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database instance: %w", err)
	}

	// 接続プールの設定
	sqlDB.SetMaxIdleConns(10)                  // アイドル接続の最大数
	sqlDB.SetMaxOpenConns(100)                 // 開いている接続の最大数
	sqlDB.SetConnMaxLifetime(time.Hour)        // 接続の最大生存時間

	// データベース接続テスト
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Successfully connected to MySQL database")

	// 自動マイグレーション
	if err := runMigrations(db); err != nil {
		return nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	return db, nil
}

// 自動マイグレーションの実行
func runMigrations(db *gorm.DB) error {
	log.Println("Running database migrations...")

	// モデルの自動マイグレーション
	err := db.AutoMigrate(
		&models.Group{},
		&models.Label{},
		&models.Character{},
		&models.Relationship{},
	)
	if err != nil {
		return fmt.Errorf("failed to auto migrate: %w", err)
	}

	log.Println("Database migrations completed successfully")
	return nil
}

// 環境変数を取得するヘルパー関数
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// データベース接続のヘルスチェック
func HealthCheck(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}

	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("database ping failed: %w", err)
	}

	return nil
}