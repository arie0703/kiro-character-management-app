import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Character, Relationship } from '../../types';
import { CharacterDetailModal } from './CharacterDetailModal';
import { RelationshipTooltip } from './RelationshipTooltip';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  photo?: string;
  labels: Array<{ name: string; color: string }>;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  id: string;
  relationshipType: string;
  description?: string;
}

interface RelationshipGraphProps {
  characters: Character[];
  relationships: Relationship[];
  onNodeClick?: (character: Character) => void;
  onLinkClick?: (relationship: Relationship) => void;
}

export const RelationshipGraph: React.FC<RelationshipGraphProps> = ({
  characters,
  relationships,
  onNodeClick,
  onLinkClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tooltipData, setTooltipData] = useState<{
    relationship: Relationship | null;
    position: { x: number; y: number } | null;
    isVisible: boolean;
  }>({
    relationship: null,
    position: null,
    isVisible: false
  });

  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current?.parentElement) {
        const rect = svgRef.current.parentElement.getBoundingClientRect();
        setDimensions({
          width: rect.width || 800,
          height: rect.height || 600
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!svgRef.current || characters.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Prepare data
    const nodes: Node[] = characters.map(char => ({
      id: char.id,
      name: char.name,
      photo: char.photo,
      labels: char.labels || []
    }));

    const links: Link[] = relationships.map(rel => ({
      id: rel.id,
      source: rel.character1Id,
      target: rel.character2Id,
      relationshipType: rel.relationshipType,
      description: rel.description
    }));

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    // Add background pattern
    const defs = svg.append('defs');
    const pattern = defs.append('pattern')
      .attr('id', 'grid')
      .attr('width', 20)
      .attr('height', 20)
      .attr('patternUnits', 'userSpaceOnUse');

    pattern.append('path')
      .attr('d', 'M 20 0 L 0 0 0 20')
      .attr('fill', 'none')
      .attr('stroke', '#f3f4f6')
      .attr('stroke-width', 1);

    // Add background
    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#grid)');

    // Create container group for zoom/pan
    const container = svg.append('g')
      .attr('class', 'graph-container');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create simulation
    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Create links
    const linkGroup = container.append('g')
      .attr('class', 'links');

    const linkElements = linkGroup.selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'relationship-link')
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 3)
      .attr('stroke-opacity', 0.7)
      .attr('stroke-dasharray', d => {
        // 関係タイプに応じて線のスタイルを変更
        const type = d.relationshipType.toLowerCase();
        if (type.includes('友人') || type.includes('friend')) return '5,5';
        if (type.includes('家族') || type.includes('family')) return 'none';
        if (type.includes('恋人') || type.includes('lover')) return '10,2,2,2';
        return 'none';
      })
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke', '#3b82f6')
          .attr('stroke-width', 4)
          .attr('stroke-opacity', 0.9);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .attr('stroke', '#6b7280')
          .attr('stroke-width', 3)
          .attr('stroke-opacity', 0.7);
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        const relationship = relationships.find(r => r.id === d.id);
        if (relationship && onLinkClick) {
          onLinkClick(relationship);
        }
      })
      .on('mouseover', (event, d) => {
        const relationship = relationships.find(r => r.id === d.id);
        if (relationship) {
          setTooltipData({
            relationship,
            position: { x: event.pageX, y: event.pageY },
            isVisible: true
          });
        }
      })
      .on('mousemove', (event, d) => {
        setTooltipData(prev => ({
          ...prev,
          position: { x: event.pageX, y: event.pageY }
        }));
      })
      .on('mouseout', () => {
        setTooltipData({
          relationship: null,
          position: null,
          isVisible: false
        });
      });

    // Create link labels
    const linkLabelGroup = container.append('g')
      .attr('class', 'link-labels');

    const linkLabels = linkLabelGroup.selectAll('g')
      .data(links)
      .enter()
      .append('g')
      .attr('class', 'link-label-group');

    // Add background rectangles for labels
    linkLabels.append('rect')
      .attr('class', 'link-label-bg')
      .attr('fill', 'rgba(255, 255, 255, 0.9)')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('pointer-events', 'none');

    // Add text labels
    const linkLabelTexts = linkLabels.append('text')
      .attr('class', 'link-label-text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#374151')
      .attr('font-weight', '500')
      .attr('pointer-events', 'none')
      .text(d => d.relationshipType);

    // Adjust background rectangle size based on text
    linkLabels.selectAll('.link-label-bg')
      .each(function(d, i) {
        const textElement = linkLabelTexts.nodes()[i];
        if (textElement) {
          const bbox = textElement.getBBox();
          d3.select(this)
            .attr('x', bbox.x - 4)
            .attr('y', bbox.y - 2)
            .attr('width', bbox.width + 8)
            .attr('height', bbox.height + 4);
        }
      });

    // Create nodes
    const nodeGroup = container.append('g')
      .attr('class', 'nodes');

    const nodeElements = nodeGroup.selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        const character = characters.find(c => c.id === d.id);
        if (character) {
          setSelectedCharacter(character);
          setIsModalOpen(true);
          if (onNodeClick) {
            onNodeClick(character);
          }
        }
      })
      .on('mouseover', function(event, d) {
        // ノードのホバー効果
        d3.select(this).select('circle')
          .attr('stroke', '#3b82f6')
          .attr('stroke-width', 3);
      })
      .on('mouseout', function(event, d) {
        // ホバー効果を元に戻す
        d3.select(this).select('circle')
          .attr('stroke', '#e5e7eb')
          .attr('stroke-width', 2);
      });

    // Add node backgrounds (for images or default circles)
    const nodeBackgrounds = nodeElements.append('circle')
      .attr('r', 32)
      .attr('fill', '#f3f4f6')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 2);

    // Add images for nodes (if available)
    const nodeImages = nodeElements.append('foreignObject')
      .attr('x', -30)
      .attr('y', -30)
      .attr('width', 60)
      .attr('height', 60)
      .append('xhtml:div')
      .style('width', '60px')
      .style('height', '60px')
      .style('border-radius', '50%')
      .style('overflow', 'hidden')
      .style('display', 'flex')
      .style('align-items', 'center')
      .style('justify-content', 'center')
      .style('background-color', '#f3f4f6');

    nodeImages.each(function(d) {
      const element = d3.select(this);
      if (d.photo) {
        element.append('xhtml:img')
          .attr('src', d.photo)
          .style('width', '100%')
          .style('height', '100%')
          .style('object-fit', 'cover')
          .style('pointer-events', 'none');
      } else {
        element.append('xhtml:div')
          .style('width', '100%')
          .style('height', '100%')
          .style('display', 'flex')
          .style('align-items', 'center')
          .style('justify-content', 'center')
          .style('color', '#9ca3af')
          .html(`
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          `);
      }
    });

    // Add name labels below nodes
    nodeElements.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '45px')
      .attr('font-size', '12px')
      .attr('fill', '#374151')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text(d => d.name.length > 12 ? d.name.substring(0, 12) + '...' : d.name);

    // Add label indicators (colored dots) around nodes
    nodeElements.each(function(d) {
      const nodeGroup = d3.select(this);
      if (d.labels && d.labels.length > 0) {
        const labelCount = Math.min(d.labels.length, 5); // 最大5つまで表示
        const angleStep = (2 * Math.PI) / labelCount;
        
        d.labels.slice(0, 5).forEach((label, index) => {
          const angle = index * angleStep - Math.PI / 2; // 上から開始
          const x = Math.cos(angle) * 40;
          const y = Math.sin(angle) * 40;
          
          nodeGroup.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 4)
            .attr('fill', label.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .attr('pointer-events', 'none');
        });
      }
    });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      linkElements
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      linkLabels
        .attr('transform', d => {
          const x = ((d.source as Node).x! + (d.target as Node).x!) / 2;
          const y = ((d.source as Node).y! + (d.target as Node).y!) / 2;
          return `translate(${x}, ${y})`;
        });

      nodeElements
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Cleanup function
    return () => {
      simulation.stop();
    };
  }, [characters, relationships, dimensions, onNodeClick, onLinkClick]);

  return (
    <>
      <div className="w-full h-full min-h-[600px] border border-gray-300 rounded-lg bg-white relative">
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ minHeight: '600px' }}
        />
        
        {/* 操作説明 */}
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 p-2 rounded text-xs text-gray-600">
          <div>• ノードをクリック: 人物詳細表示</div>
          <div>• 線にマウスオーバー: 関係詳細表示</div>
          <div>• ドラッグ: ノード移動</div>
          <div>• マウスホイール: ズーム</div>
        </div>
      </div>

      {/* 人物詳細モーダル */}
      <CharacterDetailModal
        character={selectedCharacter}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCharacter(null);
        }}
      />

      {/* 関係ツールチップ */}
      <RelationshipTooltip
        relationship={tooltipData.relationship}
        characters={characters}
        position={tooltipData.position}
        isVisible={tooltipData.isVisible}
      />
    </>
  );
};