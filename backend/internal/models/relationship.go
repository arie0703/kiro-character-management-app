package models

import (
	"time"
)

// Relationship モデル（双方向関係の統一管理）
type Relationship struct {
	ID               string    `json:"id" gorm:"primaryKey;type:varchar(36)"`
	GroupID          string    `json:"groupId" gorm:"not null;type:varchar(36)" validate:"required"`
	Character1ID     string    `json:"character1Id" gorm:"not null;type:varchar(36)" validate:"required"`
	Character2ID     string    `json:"character2Id" gorm:"not null;type:varchar(36)" validate:"required"`
	RelationshipType string    `json:"relationshipType" gorm:"not null;size:100" validate:"required,max=100"`
	Description      *string   `json:"description" gorm:"type:text"`
	CreatedAt        time.Time `json:"createdAt" gorm:"autoCreateTime"`
	Group            Group     `json:"group,omitempty" gorm:"foreignKey:GroupID"`
	Character1       Character `json:"character1,omitempty" gorm:"foreignKey:Character1ID"`
	Character2       Character `json:"character2,omitempty" gorm:"foreignKey:Character2ID"`
}