import { Piece, Cell, Move, GameRules, Player, GameState, Difficulty, HistoryEntry } from '../types';

// --- Helper Functions ---

export const initializeBoard = (size: number): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
  
  // Calculate rows filled by pieces based on board size
  // 8x8 -> 3 rows (12 pieces)
  // 10x10 -> 4 rows (20 pieces)
  // 12x12 -> 5 rows (30 pieces)
  const rowsFilled = (size - 2) / 2;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if ((row + col) % 2 === 1) {
        if (row < rowsFilled) {
            board[row][col] = { player: 'black', isKing: false };
        }
        if (row >= size - rowsFilled) {
            board[row][col] = { player: 'white', isKing: false };
        }
      }
    }
  }
  return board;
};

export const createCustomBoard = (size: number, setup: { row: number; col: number; piece: Piece }[]): (Piece | null)[][] => {
    const board: (Piece | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
    setup.forEach(item => {
        if (item.row >= 0 && item.row < size && item.col >= 0 && item.col < size) {
            board[item.row][item.col] = { ...item.piece };
        }
    });
    return board;
};

const isValidPos = (row: number, col: number, size: number) => row >= 0 && row < size && col >= 0 && col < size;

export const countPieces = (board: (Piece | null)[][]): { white: number, black: number } => {
    let white = 0;
    let black = 0;
    const size = board.length;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const p = board[r][c];
            if (p) {
                if (p.player === 'white') white++;
                else black++;
            }
        }
    }
    return { white, black };
};

// --- Notation Helper ---
const getPositionNotation = (cell: Cell, size: number): string => {
    const colChar = String.fromCharCode(65 + cell.col); // A, B, C...
    const rowNum = size - cell.row; // 8, 7, 6...
    return `${colChar}${rowNum}`;
};

// --- Move Generation ---

export const getValidMoves = (
  board: (Piece | null)[][],
  turn: Player,
  rules: GameRules,
  mustMovePiece: Cell | null = null
): Move[] => {
  let moves: Move[] = [];
  let maxCaptureCount = 0;
  const size = board.length;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const piece = board[row][col];
      // If specific piece is locked (due to multi-jump), skip others
      if (mustMovePiece && (mustMovePiece.row !== row || mustMovePiece.col !== col)) continue;
      
      if (piece && piece.player === turn) {
        const pieceMoves = getMovesForPiece(board, { row, col }, piece, rules);
        
        for (const move of pieceMoves) {
          if (move.captures.length > maxCaptureCount) {
            maxCaptureCount = move.captures.length;
            moves = [move]; // Reset if we found a better capture sequence
          } else if (move.captures.length === maxCaptureCount) {
            moves.push(move);
          }
        }
      }
    }
  }

  // If force capture is on, filter out non-capture moves if any capture moves exist
  if (rules.forceCapture && maxCaptureCount > 0) {
    moves = moves.filter(m => m.captures.length === maxCaptureCount);
  }

  return moves;
};

const getMovesForPiece = (
  board: (Piece | null)[][],
  pos: Cell,
  piece: Piece,
  rules: GameRules
): Move[] => {
  const moves: Move[] = [];
  const size = board.length;
  
  // Directions for basic movement
  let movementDirs: { r: number, c: number }[] = [];
  if (piece.isKing) {
    movementDirs = [
      { r: -1, c: -1 }, { r: -1, c: 1 },
      { r: 1, c: -1 }, { r: 1, c: 1 }
    ];
  } else {
    const forward = piece.player === 'white' ? -1 : 1;
    movementDirs = [{ r: forward, c: -1 }, { r: forward, c: 1 }];
  }

  // Check Simple Moves (non-captures)
  movementDirs.forEach(dir => {
    if (rules.flyingKings && piece.isKing) {
      // Flying King Logic: Slide until blocked
      let r = pos.row + dir.r;
      let c = pos.col + dir.c;
      while (isValidPos(r, c, size)) {
        if (board[r][c] === null) {
          moves.push({ from: pos, to: { row: r, col: c }, captures: [] });
        } else {
          break; // Blocked by piece
        }
        r += dir.r;
        c += dir.c;
      }
    } else {
      // Standard Logic
      const r = pos.row + dir.r;
      const c = pos.col + dir.c;
      if (isValidPos(r, c, size) && board[r][c] === null) {
        moves.push({ from: pos, to: { row: r, col: c }, captures: [] });
      }
    }
  });

  // Check Captures
  // Directions for capturing.
  // If backwardCaptureMen is true, Men can capture in all 4 diagonals
  let captureDirs = [...movementDirs];
  if (!piece.isKing && rules.backwardCaptureMen) {
    const forward = piece.player === 'white' ? -1 : 1;
    captureDirs.push({ r: -forward, c: -1 }, { r: -forward, c: 1 });
  } else if (piece.isKing) {
      captureDirs = [
          { r: -1, c: -1 }, { r: -1, c: 1 },
          { r: 1, c: -1 }, { r: 1, c: 1 }
        ];
  }

  captureDirs.forEach(dir => {
    if (rules.flyingKings && piece.isKing) {
        // Flying King Capture
        let r = pos.row + dir.r;
        let c = pos.col + dir.c;
        let foundEnemy = null;
        
        while (isValidPos(r, c, size)) {
            const currentCell = board[r][c];
            if (currentCell === null) {
                if (foundEnemy) {
                    // Valid landing spot after enemy
                     moves.push({
                        from: pos,
                        to: { row: r, col: c },
                        captures: [foundEnemy]
                    });
                }
            } else if (currentCell.player !== piece.player) {
                if (foundEnemy) break; // Cannot capture two in a row without landing
                foundEnemy = { row: r, col: c };
            } else {
                break; // Blocked by own piece
            }
            r += dir.r;
            c += dir.c;
        }

    } else {
        // Standard Capture
        const jumpR = pos.row + dir.r * 2;
        const jumpC = pos.col + dir.c * 2;
        const midR = pos.row + dir.r;
        const midC = pos.col + dir.c;

        if (isValidPos(jumpR, jumpC, size)) {
            const midPiece = board[midR][midC];
            const destPiece = board[jumpR][jumpC];

            if (midPiece && midPiece.player !== piece.player && destPiece === null) {
                 moves.push({
                    from: pos,
                    to: { row: jumpR, col: jumpC },
                    captures: [{ row: midR, col: midC }]
                });
            }
        }
    }
  });

  return moves;
};

// --- Execution ---

export const performMove = (
  currentState: GameState,
  move: Move,
  rules: GameRules
): GameState => {
  const newBoard = currentState.board.map(row => row.map(p => p ? { ...p } : null));
  const movingPiece = newBoard[move.from.row][move.from.col]!;
  const size = newBoard.length;

  // Record history
  const fromNot = getPositionNotation(move.from, size);
  const toNot = getPositionNotation(move.to, size);
  const isCapture = move.captures.length > 0;
  const historyEntry: HistoryEntry = {
      player: currentState.turn,
      notation: `${fromNot} ▶ ${toNot}`,
      isCapture
  };
  const newHistory = [...currentState.historyLog, historyEntry];

  // Move piece
  newBoard[move.to.row][move.to.col] = movingPiece;
  newBoard[move.from.row][move.from.col] = null;

  // Remove captures
  move.captures.forEach(cap => {
    newBoard[cap.row][cap.col] = null;
  });

  // King Promotion
  let promoted = false;
  if (!movingPiece.isKing) {
    if ((movingPiece.player === 'white' && move.to.row === 0) ||
        (movingPiece.player === 'black' && move.to.row === size - 1)) {
      movingPiece.isKing = true;
      promoted = true;
    }
  }

  // Multi-jump Logic
  
  let nextTurn = currentState.turn;
  let mustMoveSource: Cell | null = null;
  let status = currentState.status;

  if (move.captures.length > 0 && !promoted) {
      // Simulate if there are more captures available from new pos
      const subsequentMoves = getMovesForPiece(newBoard, move.to, movingPiece, rules);
      const captureMoves = subsequentMoves.filter(m => m.captures.length > 0);
      
      if (captureMoves.length > 0) {
          // Player must continue
          nextTurn = currentState.turn; // Turn doesn't change
          mustMoveSource = move.to;
      } else {
          nextTurn = currentState.turn === 'white' ? 'black' : 'white';
      }
  } else {
      nextTurn = currentState.turn === 'white' ? 'black' : 'white';
  }

  // Check Win Condition
  let whiteCount = 0;
  let blackCount = 0;
  let whiteHasMoves = false;
  let blackHasMoves = false;

  const allMovesNext = getValidMoves(newBoard, nextTurn, rules, mustMoveSource);

  for(let r=0; r<size; r++) {
      for(let c=0; c<size; c++) {
          const p = newBoard[r][c];
          if(p?.player === 'white') whiteCount++;
          if(p?.player === 'black') blackCount++;
      }
  }

  if (nextTurn === 'white' && allMovesNext.length > 0) whiteHasMoves = true;
  if (nextTurn === 'black' && allMovesNext.length > 0) blackHasMoves = true;

  if (whiteCount === 0 || (nextTurn === 'white' && !whiteHasMoves)) status = 'black_won';
  else if (blackCount === 0 || (nextTurn === 'black' && !blackHasMoves)) status = 'white_won';
  
  return {
    board: newBoard,
    turn: nextTurn,
    status,
    selectedCell: null,
    validMoves: allMovesNext,
    mandatoryMoveSource: mustMoveSource,
    lastMove: move,
    historyLog: newHistory
  };
};

// --- AI Bot Strategies ---

// Evaluation Function for Minimax
const evaluateState = (gameState: GameState): number => {
    let score = 0;
    const size = gameState.board.length;
    
    // Win condition check
    if (gameState.status === 'black_won') return 10000;
    if (gameState.status === 'white_won') return -10000;

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const p = gameState.board[r][c];
            if (!p) continue;

            let value = 10; // Base piece value
            if (p.isKing) value = 25; // King value

            // Positional factors (Black wants to go down (higher row index), White up (lower row index))
            // Central control bonus (generic for size)
            const centerStart = Math.floor(size / 4);
            const centerEnd = size - centerStart;
            
            if (c >= centerStart && c < centerEnd && r >= centerStart && r < centerEnd) value += 2;

            // Edge safety (sometimes safer on edges to avoid double jumps)
            if (c === 0 || c === size - 1) value += 1;

            if (p.player === 'black') {
                // Advancement bonus for men
                if (!p.isKing) value += r; 
                score += value;
            } else {
                if (!p.isKing) value += ((size - 1) - r);
                score -= value;
            }
        }
    }
    return score;
};

// Minimax with Alpha-Beta Pruning
const minimax = (
    state: GameState, 
    depth: number, 
    alpha: number, 
    beta: number, 
    maximizingPlayer: boolean,
    rules: GameRules
): number => {
    if (depth === 0 || state.status !== 'playing') {
        return evaluateState(state);
    }

    if (maximizingPlayer) {
        let maxEval = -Infinity;
        // Optimization: Sort moves by capture length to improve pruning
        const sortedMoves = state.validMoves.sort((a, b) => b.captures.length - a.captures.length);
        
        if (sortedMoves.length === 0) return -10000; // No moves = loss

        for (const move of sortedMoves) {
            const nextState = performMove(state, move, rules);
            const isSameTurn = nextState.turn === state.turn;
            
            const evalScore = minimax(nextState, isSameTurn ? depth : depth - 1, alpha, beta, isSameTurn ? true : false, rules);
            maxEval = Math.max(maxEval, evalScore);
            alpha = Math.max(alpha, evalScore);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        const sortedMoves = state.validMoves.sort((a, b) => b.captures.length - a.captures.length);

        if (sortedMoves.length === 0) return 10000; // No moves = loss for minimizer (White) -> Win for Black

        for (const move of sortedMoves) {
            const nextState = performMove(state, move, rules);
            const isSameTurn = nextState.turn === state.turn;

            const evalScore = minimax(nextState, isSameTurn ? depth : depth - 1, alpha, beta, isSameTurn ? false : true, rules);
            minEval = Math.min(minEval, evalScore);
            beta = Math.min(beta, evalScore);
            if (beta <= alpha) break;
        }
        return minEval;
    }
};

export const getAIMove = (gameState: GameState, rules: GameRules, difficulty: Difficulty): Move | null => {
  const { validMoves } = gameState;
  if (validMoves.length === 0) return null;
  const size = gameState.board.length;

  // --- EASY: Random Valid Move ---
  if (difficulty === 'easy') {
      // Still prefer captures if forced, but otherwise random
      const randomIdx = Math.floor(Math.random() * validMoves.length);
      return validMoves[randomIdx];
  }

  // --- MEDIUM: Greedy Heuristic (1-ply lookahead) ---
  if (difficulty === 'medium') {
      const scoredMoves = validMoves.map(move => {
        let score = 0;
        // Capture weight
        score += move.captures.length * 10;
        // Promotion weight
        const isPromotion = (gameState.turn === 'black' && move.to.row === size - 1);
        if (isPromotion) score += 5;
        
        // Safety check (simulate move and see if opponent can capture immediately)
        const simState = performMove(gameState, move, rules);
        if (simState.turn !== gameState.turn) {
             const opponentCanCapture = simState.validMoves.some(m => m.captures.length > 0);
             if (opponentCanCapture) score -= 8;
        }

        // Center control
        if (move.to.col > 1 && move.to.col < size - 2) score += 1;
        // Random noise to vary play
        score += Math.random() * 2;
        return { move, score };
      });

      scoredMoves.sort((a, b) => b.score - a.score);
      return scoredMoves[0].move;
  }

  // --- HARD: Minimax (Depth 3) ---
  if (difficulty === 'hard') {
      let bestMove = validMoves[0];
      let maxEval = -Infinity;

      // We run the first layer of minimax here to track the Move object
      for (const move of validMoves) {
          const nextState = performMove(gameState, move, rules);
          const isSameTurn = nextState.turn === gameState.turn;
          
          // If multi-jump, we are still maximizing.
          const evalScore = minimax(nextState, isSameTurn ? 3 : 2, -Infinity, Infinity, isSameTurn, rules);
          
          if (evalScore > maxEval) {
              maxEval = evalScore;
              bestMove = move;
          }
      }
      return bestMove;
  }

  return validMoves[0];
};