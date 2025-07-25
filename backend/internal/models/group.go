package models

import (
	"time"
)

// Group モデル
type Group struct {
	ID          string      `json:"id" gorm:"primaryKey;type:varchar(36)"`
	Name        string      `json:"name" gorm:"not null;size:255" validate:"required,max=255"`
	Description *string     `json:"description" gorm:"type:text"`
	CreatedAt   time.Time   `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt   time.Time   `json:"updatedAt" gorm:"autoUpdateTime"`
	Characters  []Character `json:"characters,omitempty" gorm:"foreignKey:GroupID;constraint:OnDelete:CASCADE"`
}