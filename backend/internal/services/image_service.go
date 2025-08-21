package services

import (
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/nfnt/resize"
)

// ImageService 画像サービスのインターフェース
type ImageService interface {
	SaveImage(file io.Reader, filename string, maxWidth, maxHeight uint) (string, error)
	DeleteImage(filePath string) error
	ValidateImageFile(filename string) error
}

// imageService 画像サービスの実装
type imageService struct {
	uploadDir string
}

// NewImageService 画像サービスのコンストラクタ
func NewImageService(uploadDir string) ImageService {
	return &imageService{
		uploadDir: uploadDir,
	}
}

// SaveImage 画像を保存（リサイズ機能付き）
func (s *imageService) SaveImage(file io.Reader, filename string, maxWidth, maxHeight uint) (string, error) {
	// ファイル拡張子を検証
	if err := s.ValidateImageFile(filename); err != nil {
		return "", err
	}

	// アップロードディレクトリを作成
	if err := os.MkdirAll(s.uploadDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create upload directory: %w", err)
	}

	// 画像をデコード
	img, format, err := image.Decode(file)
	if err != nil {
		return "", fmt.Errorf("failed to decode image: %w", err)
	}

	// 画像をリサイズ（必要な場合）
	bounds := img.Bounds()
	width := uint(bounds.Dx())
	height := uint(bounds.Dy())

	if width > maxWidth || height > maxHeight {
		img = resize.Thumbnail(maxWidth, maxHeight, img, resize.Lanczos3)
	}

	// ユニークなファイル名を生成
	ext := s.getExtensionFromFormat(format)
	uniqueFilename := fmt.Sprintf("%d_%s%s", time.Now().Unix(), uuid.New().String()[:8], ext)
	filePath := filepath.Join(s.uploadDir, uniqueFilename)

	// ファイルを作成
	dst, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	// 画像を保存
	switch format {
	case "jpeg":
		err = jpeg.Encode(dst, img, &jpeg.Options{Quality: 85})
	case "png":
		err = png.Encode(dst, img)
	default:
		// デフォルトはJPEG
		err = jpeg.Encode(dst, img, &jpeg.Options{Quality: 85})
	}

	if err != nil {
		os.Remove(filePath) // エラー時はファイルを削除
		return "", fmt.Errorf("failed to encode image: %w", err)
	}

	// 静的ファイル配信用の相対パスを返す
	relativePath := "/uploads/" + uniqueFilename
	return relativePath, nil
}

// DeleteImage 画像ファイルを削除
func (s *imageService) DeleteImage(filePath string) error {
	if filePath == "" {
		return nil
	}

	// 相対パス（/uploads/filename）を絶対パスに変換
	var actualPath string
	if strings.HasPrefix(filePath, "/uploads/") {
		filename := strings.TrimPrefix(filePath, "/uploads/")
		actualPath = filepath.Join(s.uploadDir, filename)
	} else {
		actualPath = filePath
	}

	// ファイルが存在するかチェック
	if _, err := os.Stat(actualPath); os.IsNotExist(err) {
		return nil // ファイルが存在しない場合はエラーにしない
	}

	return os.Remove(actualPath)
}

// ValidateImageFile 画像ファイルの拡張子を検証
func (s *imageService) ValidateImageFile(filename string) error {
	if filename == "" {
		return fmt.Errorf("filename is required")
	}

	ext := strings.ToLower(filepath.Ext(filename))
	allowedExts := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}

	for _, allowedExt := range allowedExts {
		if ext == allowedExt {
			return nil
		}
	}

	return fmt.Errorf("unsupported file format: %s. Allowed formats: %v", ext, allowedExts)
}

// getExtensionFromFormat フォーマットから拡張子を取得
func (s *imageService) getExtensionFromFormat(format string) string {
	switch format {
	case "jpeg":
		return ".jpg"
	case "png":
		return ".png"
	case "gif":
		return ".gif"
	default:
		return ".jpg"
	}
}