package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// AppError カスタムエラー型
type AppError struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

func (e *AppError) Error() string {
	return e.Message
}

// NewAppError カスタムエラーを作成
func NewAppError(code, message string, details interface{}) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
		Details: details,
	}
}

// ErrorHandler エラーハンドリングミドルウェア
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// エラーが発生した場合の処理
		if len(c.Errors) > 0 {
			err := c.Errors.Last()
			
			switch e := err.Err.(type) {
			case *AppError:
				// カスタムエラーの場合
				c.JSON(http.StatusBadRequest, e)
			case validator.ValidationErrors:
				// バリデーションエラーの場合
				validationError := formatValidationError(e)
				c.JSON(http.StatusBadRequest, validationError)
			default:
				// その他のエラーの場合
				appError := &AppError{
					Code:    "INTERNAL_ERROR",
					Message: "Internal server error",
				}
				c.JSON(http.StatusInternalServerError, appError)
			}
		}
	}
}

// formatValidationError バリデーションエラーをフォーマット
func formatValidationError(errs validator.ValidationErrors) *AppError {
	details := make(map[string]string)
	
	for _, err := range errs {
		field := err.Field()
		switch err.Tag() {
		case "required":
			details[field] = field + " is required"
		case "max":
			details[field] = field + " must be at most " + err.Param() + " characters"
		case "min":
			details[field] = field + " must be at least " + err.Param() + " characters"
		case "email":
			details[field] = field + " must be a valid email address"
		case "hexcolor":
			details[field] = field + " must be a valid hex color code"
		default:
			details[field] = field + " is invalid"
		}
	}

	return &AppError{
		Code:    "VALIDATION_ERROR",
		Message: "Validation failed",
		Details: details,
	}
}

// NotFoundHandler 404エラーハンドラー
func NotFoundHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusNotFound, &AppError{
			Code:    "NOT_FOUND",
			Message: "Resource not found",
		})
	}
}

// MethodNotAllowedHandler 405エラーハンドラー
func MethodNotAllowedHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusMethodNotAllowed, &AppError{
			Code:    "METHOD_NOT_ALLOWED",
			Message: "Method not allowed",
		})
	}
}