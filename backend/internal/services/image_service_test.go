package services

import (
	"bytes"
	"image"
	"image/jpeg"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestImageService_ValidateImageFile(t *testing.T) {
	service := NewImageService("test_uploads")
	
	tests := []struct {
		name     string
		filename string
		wantErr  bool
	}{
		{"正常なJPEGファイル", "test.jpg", false},
		{"正常なJPEGファイル（大文字）", "test.JPEG", false},
		{"正常なPNGファイル", "test.png", false},
		{"正常なGIFファイル", "test.gif", false},
		{"正常なWebPファイル", "test.webp", false},
		{"サポートされていない拡張子", "test.bmp", true},
		{"拡張子なし", "test", true},
		{"空のファイル名", "", true},
	}
	
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := service.ValidateImageFile(tt.filename)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestImageService_SaveImage(t *testing.T) {
	// テスト用のディレクトリを作成
	testDir := "test_uploads"
	defer os.RemoveAll(testDir) // テスト後にクリーンアップ
	
	service := NewImageService(testDir)
	
	t.Run("正常な画像保存", func(t *testing.T) {
		// テスト用の画像を作成
		img := image.NewRGBA(image.Rect(0, 0, 100, 100))
		var buf bytes.Buffer
		jpeg.Encode(&buf, img, nil)
		
		// 画像を保存
		filePath, err := service.SaveImage(&buf, "test.jpg", 800, 600)
		
		// 検証
		assert.NoError(t, err)
		assert.NotEmpty(t, filePath)
		assert.True(t, strings.HasPrefix(filePath, testDir))
		assert.True(t, strings.HasSuffix(filePath, ".jpg"))
		
		// ファイルが実際に作成されているかチェック
		_, err = os.Stat(filePath)
		assert.NoError(t, err)
		
		// クリーンアップ
		os.Remove(filePath)
	})
	
	t.Run("画像リサイズ機能", func(t *testing.T) {
		// 大きな画像を作成（1000x1000）
		img := image.NewRGBA(image.Rect(0, 0, 1000, 1000))
		var buf bytes.Buffer
		jpeg.Encode(&buf, img, nil)
		
		// 画像を保存（最大サイズ500x500に制限）
		filePath, err := service.SaveImage(&buf, "large.jpg", 500, 500)
		
		// 検証
		assert.NoError(t, err)
		assert.NotEmpty(t, filePath)
		
		// 保存された画像のサイズをチェック
		file, err := os.Open(filePath)
		assert.NoError(t, err)
		defer file.Close()
		
		savedImg, _, err := image.Decode(file)
		assert.NoError(t, err)
		
		bounds := savedImg.Bounds()
		assert.True(t, bounds.Dx() <= 500)
		assert.True(t, bounds.Dy() <= 500)
		
		// クリーンアップ
		os.Remove(filePath)
	})
	
	t.Run("無効な画像データ", func(t *testing.T) {
		// 無効なデータ
		invalidData := bytes.NewReader([]byte("invalid image data"))
		
		// 画像保存を試行
		filePath, err := service.SaveImage(invalidData, "invalid.jpg", 800, 600)
		
		// 検証
		assert.Error(t, err)
		assert.Empty(t, filePath)
		assert.Contains(t, err.Error(), "failed to decode image")
	})
}

func TestImageService_DeleteImage(t *testing.T) {
	testDir := "test_uploads"
	defer os.RemoveAll(testDir)
	
	service := NewImageService(testDir)
	
	t.Run("正常なファイル削除", func(t *testing.T) {
		// テストファイルを作成
		os.MkdirAll(testDir, 0755)
		testFile := filepath.Join(testDir, "test.jpg")
		file, err := os.Create(testFile)
		assert.NoError(t, err)
		file.Close()
		
		// ファイルが存在することを確認
		_, err = os.Stat(testFile)
		assert.NoError(t, err)
		
		// ファイルを削除
		err = service.DeleteImage(testFile)
		assert.NoError(t, err)
		
		// ファイルが削除されていることを確認
		_, err = os.Stat(testFile)
		assert.True(t, os.IsNotExist(err))
	})
	
	t.Run("存在しないファイル削除", func(t *testing.T) {
		// 存在しないファイルを削除
		err := service.DeleteImage("nonexistent.jpg")
		
		// エラーにならないことを確認
		assert.NoError(t, err)
	})
	
	t.Run("空のパス", func(t *testing.T) {
		// 空のパスで削除
		err := service.DeleteImage("")
		
		// エラーにならないことを確認
		assert.NoError(t, err)
	})
}

func TestImageService_getExtensionFromFormat(t *testing.T) {
	service := &imageService{}
	
	tests := []struct {
		format   string
		expected string
	}{
		{"jpeg", ".jpg"},
		{"png", ".png"},
		{"gif", ".gif"},
		{"unknown", ".jpg"}, // デフォルト
	}
	
	for _, tt := range tests {
		t.Run(tt.format, func(t *testing.T) {
			result := service.getExtensionFromFormat(tt.format)
			assert.Equal(t, tt.expected, result)
		})
	}
}