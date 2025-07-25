package models

import (
	"time"
)

// Label モデル
type Label struct {
	ID        string    `json:"id" gorm:"primaryKey;type:varchar(36)"`
	Name      string    `json:"name" gorm:"uniqueIndex;not null;size:100" validate:"required,max=100"`
	Color     string    `json:"color" gorm:"not null;size:7" validate:"required,hexcolor"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}