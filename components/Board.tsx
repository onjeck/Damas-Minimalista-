import React, { useState, useEffect } from 'react';
import { GameState, Cell, Theme, Move, Piece, PieceStyle, CaptureEffect, CustomImagesConfig } from '../types';
import PieceComponent from './Piece';
import { Sparkles } from 'lucide-react';
import { useAppConfig } from '../configContext';

interface BoardProps {
  gameState: GameState;
  theme: Theme;
  onCellClick: (cell: Cell) => void;
  isAiThinking: boolean;
  viewMode: '2d' | '3d';
  pieceStyle: PieceStyle;
  enableShake: boolean;
  activeCaptureEffect: CaptureEffect;
  activePromotion?: { row: number, col: number } | null;
  tutorialHints?: Cell[];
  tutorialArrow?: { from: Cell, to: Cell } | null;
  customImages?: CustomImagesConfig;
}

// Particle Interface
interface Particle {
  id: number;
  x: number;
  y: number; // Percentages relative to the cell
  color: string;
  tx: string; // Translation X CSS var
  ty: string; // Translation Y CSS var
}

// Active Effect Interface
interface ActiveEffect {
    id: number;
    row: number;
    col: number;
    type: CaptureEffect;
}

const Board: React.FC<BoardProps> = ({ gameState, theme, onCellClick, isAiThinking, viewMode, pieceStyle, enableShake, activeCaptureEffect, activePromotion, tutorialHints, tutorialArrow, customImages }) => {
  const { config } = useAppConfig();
  const { board, selectedCell, validMoves, lastMove } = gameState;
  const boardSize = board.length;
  const customSkin = config.boards.skins.find(s => s.id === config.boards.activeSkinId) || config.boards.skins.find(s => s.id === theme.id) || config.boards.skins[0];

  // --- Visual Effects State ---
  const [shake, setShake] = useState(false);
  const [activeParticles, setActiveParticles] = useState<{ row: number, col: number, particles: Particle[] }[]>([]);
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);

  // Trigger effects on capture
  useEffect(() => {
    if (lastMove && lastMove.captures.length > 0) {
        // 1. Trigger Selected Capture Effect
        if (activeCaptureEffect !== 'none') {
            const newEffects = lastMove.captures.map(cap => {
                let effectType = activeCaptureEffect;
                if (effectType === 'random') {
                    const effects: CaptureEffect[] = ['lightning', 'abduction', 'ghost', 'explosion', 'blackhole', 'tornado'];
                    effectType = effects[Math.floor(Math.random() * effects.length)];
                }
                return {
                    id: Math.random(),
                    row: cap.row,
                    col: cap.col,
                    type: effectType
                };
            });
            setActiveEffects(prev => [...prev, ...newEffects]);
            
            // Cleanup effects after animation
            // Use max duration for safety if random
            const duration = (activeCaptureEffect === 'lightning' || (activeCaptureEffect === 'random' && newEffects.some(e => e.type === 'lightning'))) ? 600 : 1500;
            setTimeout(() => {
                setActiveEffects(prev => prev.filter(e => !newEffects.find(ne => ne.id === e.id)));
            }, duration);
        }

        // 2. Generate Particles (Only if Explosion or Default fallback if no effect?)
        // Let's keep particles as a subtle default OR specific to 'explosion'
        if (activeCaptureEffect === 'explosion' || activeCaptureEffect === 'none' || activeCaptureEffect === 'random') {
            const newParticleGroups = lastMove.captures.map(cap => {
                 // Generate 8-12 random particles
                 const count = 12;
                 const particles: Particle[] = [];
                 for(let i=0; i<count; i++) {
                     const angle = Math.random() * Math.PI * 2;
                     const dist = 50 + Math.random() * 100; // distance in %
                     const tx = Math.cos(angle) * dist + '%';
                     const ty = Math.sin(angle) * dist + '%';
                     
                     const capturedColor = gameState.turn === 'white' ? '#f43f5e' : '#fbbf24'; 
                     
                     particles.push({
                         id: Math.random(),
                         x: 50,
                         y: 50,
                         color: capturedColor,
                         tx,
                         ty
                     });
                 }
                 return { row: cap.row, col: cap.col, particles };
            });
    
            setActiveParticles(newParticleGroups);
            const particleTimer = setTimeout(() => setActiveParticles([]), 700);
        }
    }
  }, [lastMove, gameState.turn, enableShake, activeCaptureEffect]);


  // --- Camera Controls State ---
  // Fixed rotation for 3D mode
  const [rotation, setRotation] = useState({ x: 40, z: 0 });
  const [zoom, setZoom] = useState(1);
  
  // Reset rotation when switching modes
  useEffect(() => {
    if (viewMode === '2d') {
        setRotation({ x: 0, z: 0 });
        setZoom(1);
    } else {
        setRotation({ x: 40, z: 0 });
        setZoom(1);
    }
  }, [viewMode]);

  // Camera controls disabled as per request
  
  // Helper to check if a cell is a valid destination for the selected piece
  const getMoveForCell = (r: number, c: number): Move | undefined => {
    if (!selectedCell) return undefined;
    return validMoves.find(
      m => m.from.row === selectedCell.row && m.from.col === selectedCell.col && m.to.row === r && m.to.col === c
    );
  };

  // Check if a cell was part of the last move (from or to)
  const isLastMoveHighlight = (r: number, c: number) => {
    if (!lastMove) return false;
    return (lastMove.from.row === r && lastMove.from.col === c) || 
           (lastMove.to.row === r && lastMove.to.col === c);
  };

  // Check if a piece was JUST captured at this cell (for animation)
  const getCapturedGhost = (r: number, c: number): Piece | null => {
      if (!lastMove || lastMove.captures.length === 0) return null;
      // If this cell is in the captured list of the LAST move
      const wasCaptured = lastMove.captures.some(cap => cap.row === r && cap.col === c);
      if (wasCaptured) {
          // Return the opposite color of the current turn (since turn changed, or same turn if multi-jump)
          const moverIsWhite = board[lastMove.to.row][lastMove.to.col]?.player === 'white';
          return { player: moverIsWhite ? 'black' : 'white', isKing: false }; 
      }
      return null;
  };

  const renderCell = (row: number, col: number) => {
    const isDark = (row + col) % 2 === 1;
    let bgClass = isDark ? theme.boardDark : theme.boardLight;
    let customStyle: React.CSSProperties = {};

    if (customSkin && customSkin.boardImageUrl) {
        bgClass = 'bg-transparent';
    }

    const piece = board[row][col];
    
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const possibleMove = getMoveForCell(row, col);
    const isHighlighted = isLastMoveHighlight(row, col);
    const capturedGhost = getCapturedGhost(row, col);
    
    // Check for particles in this cell
    const cellParticles = activeParticles.find(p => p.row === row && p.col === col);
    const cellEffects = activeEffects.filter(e => e.row === row && e.col === col);

    const isHint = !!possibleMove;
    const isCapture = possibleMove && possibleMove.captures.length > 0;
    
    // Tutorial Highlight Logic
    const isTutorialSource = tutorialHints?.some(h => h.row === row && h.col === col && piece);
    const isTutorialDest = tutorialHints?.some(h => h.row === row && h.col === col && !piece);

    return (
      <div
        key={`${row}-${col}`}
        className={`relative w-full h-full flex items-center justify-center ${bgClass} 
            ${isHighlighted ? 'after:absolute after:inset-0 after:bg-yellow-400/20 after:pointer-events-none' : ''}
            ${isTutorialSource ? 'ring-4 ring-yellow-400 ring-inset z-20 animate-pulse' : ''}
            ${isTutorialDest ? 'ring-4 ring-green-400 ring-inset bg-green-400/20 z-10 animate-pulse' : ''}
        `}
        // Only click cell if empty (for move). If piece exists, Piece component handles click (or we bubble up)
        onClick={() => !isAiThinking && onCellClick({ row, col })}
        style={{ transformStyle: 'preserve-3d', ...customStyle }}
      >
        
        {/* Particles Effect */}
        {cellParticles && (
            <div className="absolute inset-0 pointer-events-none z-30 overflow-visible" style={{transformStyle: 'preserve-3d'}}>
                {cellParticles.particles.map(p => (
                    <div 
                        key={p.id}
                        className="absolute w-2 h-2 rounded-full animate-particle shadow-[0_0_4px_white]"
                        style={{
                            left: p.x + '%',
                            top: p.y + '%',
                            backgroundColor: p.color,
                            // Pass custom properties for the CSS animation
                            ['--tx' as any]: p.tx,
                            ['--ty' as any]: p.ty,
                            transform: `translateZ(10px)`
                        }}
                    />
                ))}
            </div>
        )}

        {/* Active Capture Effects */}
        {cellEffects.map(effect => (
            <div key={effect.id} className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center" style={{transformStyle: 'preserve-3d'}}>
                {effect.type === 'lightning' && (
                    <div className="absolute inset-0 flex items-center justify-center animate-lightning origin-bottom">
                         <svg viewBox="0 0 100 100" className="w-full h-[200%] -mt-[100%] drop-shadow-[0_0_10px_yellow]">
                             <path d="M50,0 L30,40 L60,40 L40,100" fill="white" stroke="yellow" strokeWidth="2" />
                         </svg>
                    </div>
                )}
                {effect.type === 'abduction' && (
                    <>
                        <div className="absolute bottom-0 w-full bg-green-400/30 animate-abduction-beam origin-bottom blur-sm" style={{ transform: 'translateZ(20px)' }} />
                        <div className="absolute w-full h-full bg-green-500/20 animate-pulse rounded-full blur-md" />
                    </>
                )}
                {effect.type === 'explosion' && (
                    <div className="absolute w-full h-full bg-orange-500/50 rounded-full animate-explosion blur-md" />
                )}
                {effect.type === 'blackhole' && (
                    <div className="absolute w-full h-full bg-black rounded-full animate-[ping_0.5s_reverse_forwards] opacity-80" />
                )}
                {effect.type === 'tornado' && (
                    <div className="absolute w-full h-full border-4 border-gray-400 border-t-transparent rounded-full animate-spin" />
                )}
            </div>
        ))}

        {/* Promotion Effect */}
        {activePromotion?.row === row && activePromotion?.col === col && (
            <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(20px)' }}>
                {/* Energy Ring */}
                <div className="absolute w-[140%] h-[140%] rounded-full border-4 border-yellow-400 animate-ping opacity-75" />
                <div className="absolute w-[120%] h-[120%] rounded-full bg-yellow-400/20 animate-pulse blur-md" />
                
                {/* Spinning Aura */}
                <div className="absolute w-[160%] h-[160%] rounded-full border-t-4 border-yellow-300 animate-spin-slow opacity-80" />
                <div className="absolute w-[140%] h-[140%] rounded-full border-b-4 border-orange-400 animate-spin-reverse opacity-80" />

                {/* Rising Particles */}
                <div className="absolute inset-0 flex items-center justify-center animate-float-up">
                    <Sparkles className="text-yellow-300 w-full h-full animate-spin" />
                </div>
            </div>
        )}

        {/* Move Hint Indicator */}
        {(isHint || isTutorialDest) && (
            <div 
                className={`absolute w-4 h-4 rounded-full z-0 animate-pulse
                    ${isCapture ? 'bg-red-500 ring-4 ring-red-200' : 'bg-green-500/50 ring-4 ring-green-200/50'}
                `} 
                style={{ transform: 'translateZ(2px)' }} 
            />
        )}

        {/* Captured Piece Animation (Ghost) */}
        {capturedGhost && (
            <div 
                className={`absolute inset-0 z-20 pointer-events-none 
                    ${(activeCaptureEffect === 'abduction' || (activeCaptureEffect === 'random' && cellEffects.some(e => e.type === 'abduction'))) ? 'animate-abduction-float' : 
                      (activeCaptureEffect === 'ghost' || (activeCaptureEffect === 'random' && cellEffects.some(e => e.type === 'ghost'))) ? 'animate-ghost-rise' :
                      (activeCaptureEffect === 'blackhole' || (activeCaptureEffect === 'random' && cellEffects.some(e => e.type === 'blackhole'))) ? 'animate-blackhole' :
                      (activeCaptureEffect === 'tornado' || (activeCaptureEffect === 'random' && cellEffects.some(e => e.type === 'tornado'))) ? 'animate-tornado' :
                      viewMode === '3d' ? 'animate-[capture3d_0.8s_ease-out_forwards]' : 'animate-[capture_0.6s_ease-out_forwards]'}
                `}
                style={{ 
                    transformStyle: 'preserve-3d',
                    transform: `translate(${customSkin?.playerOffsets?.[capturedGhost.player === 'white' ? 'red' : 'blue']?.x || 0}px, ${customSkin?.playerOffsets?.[capturedGhost.player === 'white' ? 'red' : 'blue']?.y || 0}px) scale(${customSkin?.playerOffsets?.[capturedGhost.player === 'white' ? 'red' : 'blue']?.scale ? customSkin.playerOffsets[capturedGhost.player === 'white' ? 'red' : 'blue'].scale / 100 : 1})`
                }}
            >
                 <PieceComponent 
                    piece={capturedGhost} 
                    theme={theme} 
                    isSelected={false} 
                    viewMode={viewMode}
                    style={pieceStyle}
                    customImages={customImages}
                 />
            </div>
        )}

        {/* Piece */}
        {piece && (
          <div className="z-10 w-full h-full relative" style={{ 
              transformStyle: 'preserve-3d',
              transform: `translate(${customSkin?.playerOffsets?.[piece.player === 'white' ? 'red' : 'blue']?.x || 0}px, ${customSkin?.playerOffsets?.[piece.player === 'white' ? 'red' : 'blue']?.y || 0}px) scale(${customSkin?.playerOffsets?.[piece.player === 'white' ? 'red' : 'blue']?.scale ? customSkin.playerOffsets[piece.player === 'white' ? 'red' : 'blue'].scale / 100 : 1})`
          }}>
            <PieceComponent 
                piece={piece} 
                theme={theme} 
                isSelected={isSelected}
                viewMode={viewMode}
                style={pieceStyle}
                // Pass click handler to piece to ensure 3D hitbox works
                onClick={() => !isAiThinking && onCellClick({ row, col })}
                customImages={customImages}
            />
          </div>
        )}
      </div>
    );
  };

  // Simple Arrow Renderer (2D overlay for tutorial)
  const renderArrow = () => {
      if(!tutorialArrow || viewMode === '3d') return null;
      // Calculate percentage positions
      const startX = (tutorialArrow.from.col * 100 / boardSize) + (50 / boardSize);
      const startY = (tutorialArrow.from.row * 100 / boardSize) + (50 / boardSize);
      const endX = (tutorialArrow.to.col * 100 / boardSize) + (50 / boardSize);
      const endY = (tutorialArrow.to.row * 100 / boardSize) + (50 / boardSize);
      
      const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
      const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

      return (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-lg">
             <div 
                className="absolute h-2 bg-yellow-400 shadow-lg origin-left animate-pulse"
                style={{
                    top: `${startY}%`,
                    left: `${startX}%`,
                    width: `${length}%`,
                    transform: `rotate(${angle}deg)`
                }}
             >
                <div className="absolute -right-2 -top-2 w-6 h-6 bg-yellow-400 rotate-45 transform origin-center shadow-sm" />
             </div>
          </div>
      )
  };

  return (
    <div className="relative flex flex-col items-center w-full">
        <div 
            className="w-full max-w-[500px] aspect-square transition-transform duration-100 ease-out relative"
            style={{ perspective: '1200px' }}
        >
        <div 
            className={`relative w-full h-full shadow-board border-8 border-[#2e2e2e] bg-[#2e2e2e] rounded-lg
                will-change-transform
                ${shake ? 'animate-shake' : ''}
                ${viewMode === '3d' ? 'shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]' : 'shadow-xl'}
            `}
            style={{ 
                // Dynamic Rotation
                transform: viewMode === '3d' 
                    ? `scale(${zoom}) rotateX(${rotation.x}deg) rotateZ(${rotation.z}deg)` 
                    : 'scale(1) rotateX(0deg)',
                transformStyle: 'preserve-3d',
                transition: shake ? 'none' : 'transform 0.3s ease-out',
                backgroundImage: customSkin?.boardImageUrl ? `url(${customSkin.boardImageUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            {renderArrow()}

            {/* 3D Thickness Slab (Visible only when rotated) */}
            <div 
                className="absolute -inset-2 bg-[#1a1a1a] rounded-lg -z-10"
                style={{ 
                    transform: 'translateZ(-15px)',
                    opacity: viewMode === '3d' ? 1 : 0,
                    transition: 'opacity 0.5s'
                }}
            />
            
            <div 
                className="w-full h-full grid rounded-sm"
                style={{ 
                    transformStyle: 'preserve-3d',
                    gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${boardSize}, minmax(0, 1fr))`,
                    transform: `translate(${customSkin?.grid?.x || 0}px, ${customSkin?.grid?.y || 0}px) scale(${customSkin?.grid?.scale ? customSkin.grid.scale / 100 : 1})`
                }}
            >
                {Array.from({ length: boardSize }).map((_, r) =>
                Array.from({ length: boardSize }).map((_, c) => renderCell(r, c))
                )}
            </div>
        </div>
        </div>
    </div>
  );
};

export default Board;