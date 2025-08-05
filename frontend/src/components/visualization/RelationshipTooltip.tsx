import React from 'react';
import { Relationship, Character } from '../../types';

interface RelationshipTooltipProps {
  relationship: Relationship | null;
  characters: Character[];
  position: { x: number; y: number } | null;
  isVisible: boolean;
}

export const RelationshipTooltip: React.FC<RelationshipTooltipProps> = ({
  relationship,
  characters,
  position,
  isVisible
}) => {
  if (!relationship || !position || !isVisible) return null;

  const character1 = characters.find(c => c.id === relationship.character1Id);
  const character2 = characters.find(c => c.id === relationship.character2Id);

  if (!character1 || !character2) return null;

  return (
    <div
      className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 max-w-xs pointer-events-none"
      style={{
        left: position.x + 10,
        top: position.y - 10,
        transform: 'translateY(-100%)'
      }}
    >
      <div className="text-sm">
        <div className="font-medium text-gray-900 mb-1">
          {character1.name} ↔ {character2.name}
        </div>
        <div className="text-blue-600 font-medium mb-1">
          {relationship.relationshipType}
        </div>
        {relationship.description && (
          <div className="text-gray-600 text-xs">
            {relationship.description}
          </div>
        )}
      </div>
      {/* 矢印 */}
      <div
        className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"
        style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }}
      />
    </div>
  );
};