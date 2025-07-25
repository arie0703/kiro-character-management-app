package services

import (
	"character-management-app/internal/models"
	"io"

	"github.com/stretchr/testify/mock"
)

// MockCharacterRepository キャラクターリポジトリのモック
type MockCharacterRepository struct {
	mock.Mock
}

func (m *MockCharacterRepository) Create(character *models.Character) error {
	args := m.Called(character)
	return args.Error(0)
}

func (m *MockCharacterRepository) GetByID(id string) (*models.Character, error) {
	args := m.Called(id)
	return args.Get(0).(*models.Character), args.Error(1)
}

func (m *MockCharacterRepository) GetAll() ([]models.Character, error) {
	args := m.Called()
	return args.Get(0).([]models.Character), args.Error(1)
}

func (m *MockCharacterRepository) GetByGroupID(groupID string) ([]models.Character, error) {
	args := m.Called(groupID)
	return args.Get(0).([]models.Character), args.Error(1)
}

func (m *MockCharacterRepository) Update(character *models.Character) error {
	args := m.Called(character)
	return args.Error(0)
}

func (m *MockCharacterRepository) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockCharacterRepository) ExistsByID(id string) (bool, error) {
	args := m.Called(id)
	return args.Bool(0), args.Error(1)
}

func (m *MockCharacterRepository) AddLabel(characterID, labelID string) error {
	args := m.Called(characterID, labelID)
	return args.Error(0)
}

func (m *MockCharacterRepository) RemoveLabel(characterID, labelID string) error {
	args := m.Called(characterID, labelID)
	return args.Error(0)
}

func (m *MockCharacterRepository) GetLabelsCount(characterID string) (int64, error) {
	args := m.Called(characterID)
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockCharacterRepository) HasLabel(characterID, labelID string) (bool, error) {
	args := m.Called(characterID, labelID)
	return args.Bool(0), args.Error(1)
}

// MockGroupRepository グループリポジトリのモック
type MockGroupRepository struct {
	mock.Mock
}

func (m *MockGroupRepository) Create(group *models.Group) error {
	args := m.Called(group)
	return args.Error(0)
}

func (m *MockGroupRepository) GetByID(id string) (*models.Group, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Group), args.Error(1)
}

func (m *MockGroupRepository) GetAll() ([]models.Group, error) {
	args := m.Called()
	return args.Get(0).([]models.Group), args.Error(1)
}

func (m *MockGroupRepository) Update(group *models.Group) error {
	args := m.Called(group)
	return args.Error(0)
}

func (m *MockGroupRepository) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockGroupRepository) ExistsByID(id string) (bool, error) {
	args := m.Called(id)
	return args.Bool(0), args.Error(1)
}

// MockLabelRepository ラベルリポジトリのモック
type MockLabelRepository struct {
	mock.Mock
}

func (m *MockLabelRepository) Create(label *models.Label) error {
	args := m.Called(label)
	return args.Error(0)
}

func (m *MockLabelRepository) GetByID(id string) (*models.Label, error) {
	args := m.Called(id)
	return args.Get(0).(*models.Label), args.Error(1)
}

func (m *MockLabelRepository) GetAll() ([]models.Label, error) {
	args := m.Called()
	return args.Get(0).([]models.Label), args.Error(1)
}

func (m *MockLabelRepository) Update(label *models.Label) error {
	args := m.Called(label)
	return args.Error(0)
}

func (m *MockLabelRepository) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockLabelRepository) ExistsByID(id string) (bool, error) {
	args := m.Called(id)
	return args.Bool(0), args.Error(1)
}

func (m *MockLabelRepository) ExistsByName(name string) (bool, error) {
	args := m.Called(name)
	return args.Bool(0), args.Error(1)
}

// MockRelationshipRepository 関係リポジトリのモック
type MockRelationshipRepository struct {
	mock.Mock
}

func (m *MockRelationshipRepository) Create(relationship *models.Relationship) error {
	args := m.Called(relationship)
	return args.Error(0)
}

func (m *MockRelationshipRepository) GetByID(id string) (*models.Relationship, error) {
	args := m.Called(id)
	return args.Get(0).(*models.Relationship), args.Error(1)
}

func (m *MockRelationshipRepository) GetAll() ([]models.Relationship, error) {
	args := m.Called()
	return args.Get(0).([]models.Relationship), args.Error(1)
}

func (m *MockRelationshipRepository) GetByGroupID(groupID string) ([]models.Relationship, error) {
	args := m.Called(groupID)
	return args.Get(0).([]models.Relationship), args.Error(1)
}

func (m *MockRelationshipRepository) Update(relationship *models.Relationship) error {
	args := m.Called(relationship)
	return args.Error(0)
}

func (m *MockRelationshipRepository) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockRelationshipRepository) ExistsByID(id string) (bool, error) {
	args := m.Called(id)
	return args.Bool(0), args.Error(1)
}

func (m *MockRelationshipRepository) GetByCharacterID(characterID string) ([]models.Relationship, error) {
	args := m.Called(characterID)
	return args.Get(0).([]models.Relationship), args.Error(1)
}

func (m *MockRelationshipRepository) ExistsByCharacters(char1ID, char2ID string) (bool, error) {
	args := m.Called(char1ID, char2ID)
	return args.Bool(0), args.Error(1)
}

func (m *MockRelationshipRepository) ExistsBetweenCharacters(character1ID, character2ID string) (bool, error) {
	args := m.Called(character1ID, character2ID)
	return args.Bool(0), args.Error(1)
}

// MockImageService 画像サービスのモック
type MockImageService struct {
	mock.Mock
}

func (m *MockImageService) SaveImage(file io.Reader, filename string, maxWidth, maxHeight uint) (string, error) {
	args := m.Called(file, filename, maxWidth, maxHeight)
	return args.String(0), args.Error(1)
}

func (m *MockImageService) DeleteImage(filePath string) error {
	args := m.Called(filePath)
	return args.Error(0)
}

func (m *MockImageService) ValidateImageFile(filename string) error {
	args := m.Called(filename)
	return args.Error(0)
}