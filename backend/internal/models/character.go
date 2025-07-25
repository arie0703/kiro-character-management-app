package models

import (
	"time"

	"gorm.io/datatypes"
)

// Character モデル
type Character struct {
	ID           string         `json:"id" gorm:"primaryKey;type:varchar(36)"`
	GroupID      string         `json:"groupId" gorm:"not null;type:varchar(36)" validate:"required"`
	Name         string         `json:"name" gorm:"not null;size:255" validate:"required,max=255"`
	Photo        *string        `json:"photo" gorm:"size:500"`
	Information  string         `json:"information" gorm:"type:text"`
	RelatedLinks datatypes.JSON `json:"relatedLinks" gorm:"type:json"`
	CreatedAt    time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt    time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	Group        Group          `json:"group,omitempty" gorm:"foreignKey:GroupID"`
	Labels       []Label        `json:"labels,omitempty" gorm:"many2many:character_labels"`
}