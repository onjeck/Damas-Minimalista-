export type Player = 'white' | 'black';

export interface User {
  username: string;
  avatarId: string; // emoji or id
  rank: number;
  isAdmin?: boolean;
}

export interface CustomImagesConfig {
  boardBackgroundUrl?: string;
  boardLightSquareUrl?: string;
  boardDarkSquareUrl?: string;
  pieceWhiteUrl?: string;
  pieceBlackUrl?: string;
}

export interface Piece {
  player: Player;
  isKing: boolean;
}

export interface Cell {
  row: number;
  col: number;
}

export interface Move {
  from: Cell;
  to: Cell;
  captures: Cell[]; // The cells of pieces being captured
}

export interface GameRules {
  id: string; // Identifier for the rule set
  name: string; // Display name
  boardSize: number; // 8, 10, or 12
  flyingKings: boolean; // Can kings move multiple squares? (Damas Voadoras)
  forceCapture: boolean; // Is capturing mandatory?
  backwardCaptureMen: boolean; // Can men capture backwards? (Common in Brazilian rules)
  moveTimeLimit: number; // Time in seconds per move (0 = infinite)
}

export interface Theme {
  id: string;
  name: string;
  boardDark: string;
  boardLight: string;
  pieceWhite: string;
  pieceBlack: string;
  background: string;
}

export type PieceStyle = 
  | 'classic' 
  | 'minimal' 
  | 'traditional' 
  | 'modern' 
  | 'illustrated' 
  | 'realistic' 
  | 'marble' 
  | 'metal' 
  | 'glass' 
  | 'dragon'
  | 'celestial'
  | 'egyptian'
  | 'medieval'
  | 'mythology'
  | 'mario'
  | 'sonic'
  | 'glossy'
  | 'neon'
  | 'mineral'
  | 'tech';

export interface PieceStyleDef {
    id: PieceStyle;
    name: string;
}

export type GameStatus = 'playing' | 'white_won' | 'black_won' | 'draw' | 'timeout';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type MatchType = 'single' | 'bo3'; // Partida Única ou Melhor de 3

export type CaptureEffect = 'none' | 'lightning' | 'abduction' | 'ghost' | 'explosion' | 'blackhole' | 'tornado' | 'random';

export interface CaptureEffectDef {
    id: CaptureEffect;
    name: string;
    icon: string;
    description: string;
}

export type GameMode = 'pvp' | 'ai' | 'online' | 'tutorial' | 'tournament';

export interface TournamentPlayer {
    id: string;
    name: string;
    avatar: string;
    isCpu: boolean;
    difficulty?: Difficulty;
}

export interface TournamentMatch {
    id: string;
    players: [TournamentPlayer | null, TournamentPlayer | null];
    winner: TournamentPlayer | null;
    round: number; // 0 = Quarter, 1 = Semi, 2 = Final (depends on size)
    nextMatchId: string | null;
    score: [number, number]; // Player 0 score, Player 1 score
    status: 'pending' | 'active' | 'finished';
}

export interface TournamentState {
    players: TournamentPlayer[];
    matches: TournamentMatch[];
    currentMatchId: string | null;
    champion: TournamentPlayer | null;
    size: 4 | 8;
}

export interface HistoryEntry {
    player: Player;
    notation: string;
    isCapture: boolean;
}

export interface GameState {
  board: (Piece | null)[][];
  turn: Player;
  status: GameStatus;
  selectedCell: Cell | null;
  validMoves: Move[];
  mandatoryMoveSource: Cell | null; // If a player just jumped and can jump again, they are locked to this piece
  lastMove: Move | null; // Track the last move for animations
  timeoutPlayer?: Player; // Who ran out of time
  historyLog: HistoryEntry[]; // Visual history
}

export interface TutorialStep {
    id: string;
    title: string;
    description: string;
    boardSetup: { row: number; col: number; piece: Piece }[]; // Custom pieces placement
    requiredMoves: { from: Cell; to: Cell }[]; // Sequence of moves user must make
}