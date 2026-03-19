import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameRules, GameState, Theme, Player, Cell, Move, PieceStyle, Difficulty, MatchType, User, GameMode, TournamentState, TournamentPlayer, TournamentMatch, CaptureEffect, CustomImagesConfig } from './types';
import { DEFAULT_RULES, THEMES, PIECE_STYLES, RULE_VARIANTS, TUTORIAL_STEPS, EMOJI_LIST, CAPTURE_EFFECTS } from './constants';
import * as GameLogic from './services/logic';
import { initAudio, playSound } from './services/audio';
import Board from './components/Board';
import Piece from './components/Piece'; 
import PieceSelector from './components/PieceSelector';
import Background from './components/Background';
import MusicPlayer from './components/MusicPlayer';
import Auth from './components/Auth';
import ProfileEditor from './components/ProfileEditor';
import AdminPanel from './components/AdminPanel';
import { useAppConfig } from './configContext';
import { Settings, Play, User as UserIcon, Monitor, ChevronLeft, RefreshCw, Trophy, Box, Layers, Clock, Timer, Loader2, Skull, Zap, Baby, Swords, Home, RotateCcw, BookOpen, Globe, Search, Wifi, GraduationCap, CheckCircle, MousePointer2, Sparkles, Undo2, ScrollText, Activity, Users, Edit, Palette, Image as ImageIcon, ShieldCheck } from 'lucide-react';

type Screen = 'auth' | 'loading' | 'menu' | 'game' | 'settings' | 'customization' | 'difficulty_select' | 'matchmaking' | 'tutorial' | 'tournament_setup' | 'tournament_bracket' | 'piece_selection' | 'admin_settings';
export type ViewMode = '2d' | '3d';

// Ensure tutorial always runs on a specific ruleset to match the steps
const TUTORIAL_RULES: GameRules = {
    ...DEFAULT_RULES,
    boardSize: 8,
    flyingKings: true,
    forceCapture: true,
    backwardCaptureMen: true,
    moveTimeLimit: 0
};

const App: React.FC = () => {
  const { config } = useAppConfig();
  // User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  // Screen State
  const [screen, setScreen] = useState<Screen>('auth');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Game Settings
  const [rules, setRules] = useState<GameRules>(DEFAULT_RULES);
  const [activeThemeId, setActiveThemeId] = useState<string>('classic');
  const [activePieceStyle, setActivePieceStyle] = useState<PieceStyle>(() => {
    const saved = localStorage.getItem('checkers_piece_style');
    return (saved && PIECE_STYLES.some(s => s.id === saved)) ? (saved as PieceStyle) : 'classic';
  });
  const [activeCaptureEffect, setActiveCaptureEffect] = useState<CaptureEffect>('none');
  const [activePromotion, setActivePromotion] = useState<Cell | null>(null);

  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const [enableShake, setEnableShake] = useState(true);
  const [customImages, setCustomImages] = useState<CustomImagesConfig>(() => {
    const saved = localStorage.getItem('checkers_custom_images');
    return saved ? JSON.parse(saved) : {};
  });
  
  // Game Play State
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [historyStack, setHistoryStack] = useState<GameState[]>([]); // For Undo
  const [aiThinking, setAiThinking] = useState(false);
  const [matchType, setMatchType] = useState<MatchType>('single');
  const [roundScores, setRoundScores] = useState<{white: number, black: number}>({ white: 0, black: 0 });
  const [currentRound, setCurrentRound] = useState(1);
  const [overlayMessage, setOverlayMessage] = useState<string | null>(null);
  const [subMessage, setSubMessage] = useState<string | null>(null);
  const [showMatchEndMenu, setShowMatchEndMenu] = useState(false);
  const [matchResult, setMatchResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [onlineOpponent, setOnlineOpponent] = useState<User | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Tournament State
  const [tournamentState, setTournamentState] = useState<TournamentState | null>(null);
  const [tournamentInputPlayers, setTournamentInputPlayers] = useState<string[]>(Array(4).fill(''));
  const [tournamentSize, setTournamentSize] = useState<4 | 8>(4);

  // Tutorial State
  const [currentTutorialStepIndex, setCurrentTutorialStepIndex] = useState(0);
  const [tutorialMoveIndex, setTutorialMoveIndex] = useState(0); // Tracks progress within a step (e.g., combo jumps)
  const [showTutorialSuccess, setShowTutorialSuccess] = useState(false);
  const [tutorialComplete, setTutorialComplete] = useState(false);

  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  const activeTheme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];

  // --- Auth Handler ---
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setScreen('loading');
    setLoadingProgress(0); // Reset loading
  };

  // --- Loading Effect (Triggered after Login) ---
  useEffect(() => {
    if (screen === 'loading') {
        const interval = setInterval(() => {
            setLoadingProgress((prev) => {
                const increment = Math.random() * 15;
                const next = prev + increment;
                if (next >= 100) {
                clearInterval(interval);
                setTimeout(() => setScreen('menu'), 500);
                return 100;
                }
                return next;
            });
        }, 150);
        return () => clearInterval(interval);
    }
  }, [screen]);

  useEffect(() => {
    localStorage.setItem('checkers_piece_style', activePieceStyle);
  }, [activePieceStyle]);

  // --- Round & Match Logic ---

  const announceRound = (round: number, callback?: () => void) => {
    setOverlayMessage(round === 3 ? "FINAL ROUND" : `ROUND ${round}`);
    setSubMessage(null);
    setShowMatchEndMenu(false);
    playSound('move'); 

    setTimeout(() => {
        setOverlayMessage("FIGHT!");
        setSubMessage(null);
        playSound('capture'); 

        setTimeout(() => {
            setOverlayMessage(null);
            if (callback) callback();
        }, 800);
    }, 1500);
  };

  const startMatchmaking = () => {
      setScreen('matchmaking');
      // Simulate matchmaking delay
      setTimeout(() => {
          const fakeOpponents = [
              { username: 'DragonSlayer99', avatarId: '🐲', rank: 1200 },
              { username: 'QueenGambit', avatarId: '👸', rank: 1050 },
              { username: 'ShadowNinja', avatarId: '🥷', rank: 980 },
              { username: 'CheckMateMaster', avatarId: '🧠', rank: 1350 },
          ];
          const randomOpponent = fakeOpponents[Math.floor(Math.random() * fakeOpponents.length)];
          setOnlineOpponent(randomOpponent);
          
          setTimeout(() => {
              startGame('online', 'medium'); // Use medium difficulty for online simulation
          }, 2000);
      }, 3000);
  };

  const startTutorial = () => {
      setGameMode('tutorial');
      setAiThinking(false); // Ensure AI is off
      
      // Temporarily enforce tutorial rules for the session
      // We don't overwrite 'rules' state permanently to preserve user settings,
      // but we pass TUTORIAL_RULES to the loader.
      // However, to ensure Board renders 8x8, we MUST set 'rules' state.
      setRules(TUTORIAL_RULES);
      
      setCurrentTutorialStepIndex(0);
      setTutorialMoveIndex(0);
      setShowTutorialSuccess(false);
      setTutorialComplete(false);
      loadTutorialStep(0, TUTORIAL_RULES);
      setScreen('tutorial');
  };

  const loadTutorialStep = (index: number, activeRules: GameRules) => {
      if (index >= TUTORIAL_STEPS.length) {
          // Tutorial Finished
          setTutorialComplete(true);
          playSound('win');
          return;
      }

      const step = TUTORIAL_STEPS[index];
      // Create board based on step setup
      const initialBoard = GameLogic.createCustomBoard(activeRules.boardSize, step.boardSetup);
      
      const initialState: GameState = {
        board: initialBoard,
        turn: 'white',
        status: 'playing',
        selectedCell: null,
        validMoves: GameLogic.getValidMoves(initialBoard, 'white', activeRules),
        mandatoryMoveSource: null,
        lastMove: null,
        historyLog: []
      };
      setGameState(initialState);
      setTutorialMoveIndex(0);
      setShowTutorialSuccess(false);
  };

  const nextTutorialStep = () => {
      const nextIndex = currentTutorialStepIndex + 1;
      setCurrentTutorialStepIndex(nextIndex);
      loadTutorialStep(nextIndex, TUTORIAL_RULES);
  };

  const startTournamentSetup = () => {
      setScreen('tournament_setup');
      setTournamentInputPlayers(Array(4).fill(''));
      setTournamentSize(4);
  };

  const generateTournament = () => {
      const players: TournamentPlayer[] = tournamentInputPlayers.map((name, i) => ({
          id: `p${i}`,
          name: name || `Player ${i+1}`,
          avatar: EMOJI_LIST[i % EMOJI_LIST.length].icons[0],
          isCpu: false
      }));

      const matches: TournamentMatch[] = [];

      if (tournamentSize === 4) {
          // Semi-Finals
          matches.push({
              id: 'm1',
              players: [players[0], players[1]],
              winner: null,
              round: 0,
              nextMatchId: 'm3',
              score: [0, 0],
              status: 'pending'
          });
          matches.push({
              id: 'm2',
              players: [players[2], players[3]],
              winner: null,
              round: 0,
              nextMatchId: 'm3',
              score: [0, 0],
              status: 'pending'
          });
          // Final
          matches.push({
              id: 'm3',
              players: [null, null],
              winner: null,
              round: 1,
              nextMatchId: null,
              score: [0, 0],
              status: 'pending'
          });
      }

      setTournamentState({
          players,
          matches,
          currentMatchId: null,
          champion: null,
          size: tournamentSize
      });
      setScreen('tournament_bracket');
  };

  const startTournamentMatch = (matchId: string) => {
      if (!tournamentState) return;
      const match = tournamentState.matches.find(m => m.id === matchId);
      if (!match || !match.players[0] || !match.players[1]) return;

      setTournamentState(prev => ({ ...prev!, currentMatchId: matchId }));
      
      // Setup game for tournament match
      setGameMode('tournament');
      setMatchType('bo3');
      setRoundScores({ white: match.score[0], black: match.score[1] });
      setCurrentRound(match.score[0] + match.score[1] + 1);
      
      // Reset game state
      setDifficulty('medium'); // Default for now
      setShowMatchEndMenu(false);
      setOverlayMessage(null);
      setHistoryStack([]);
      
      startNewRound(match.score[0] + match.score[1] + 1);
      setScreen('game');
  };

  const startGame = (mode: GameMode, selectedDifficulty: Difficulty = 'medium') => {
    initAudio(); 
    setGameMode(mode);
    setDifficulty(selectedDifficulty);
    setRoundScores({ white: 0, black: 0 });
    setCurrentRound(1);
    setShowMatchEndMenu(false);
    
    // Reset flags that might prevent interaction
    setShowTutorialSuccess(false);
    setTutorialComplete(false);
    setTutorialMoveIndex(0);
    setOverlayMessage(null);
    setHistoryStack([]);
    setShowHistory(false);

    startNewRound(1);
    setScreen('game');
  };

  const startNewRound = (roundNum: number) => {
    const initialBoard = GameLogic.initializeBoard(rules.boardSize);
    const initialState: GameState = {
      board: initialBoard,
      turn: 'white',
      status: 'playing',
      selectedCell: null,
      validMoves: [],
      mandatoryMoveSource: null,
      lastMove: null,
      historyLog: []
    };
    initialState.validMoves = GameLogic.getValidMoves(initialBoard, 'white', rules);
    setGameState(initialState);
    setHistoryStack([]);
    
    if (rules.moveTimeLimit > 0) {
        setTimeLeft(rules.moveTimeLimit);
    }
    setAiThinking(false);

    announceRound(roundNum);
  };

  // --- Game End Logic ---
  const handleGameEnd = useCallback((winner: Player | 'draw') => {
      if (gameMode === 'tutorial') return; // Handled separately

      let bigText = "DRAW";
      let res: 'win' | 'lose' | 'draw' = 'draw';
      if (winner === 'white') {
          bigText = config.gamification.win.title || "VICTORY";
          res = 'win';
      }
      if (winner === 'black') {
          bigText = config.gamification.lose.title || "DEFEAT";
          res = 'lose';
      }
      
      if (gameMode === 'pvp' || gameMode === 'tournament') {
           if (winner === 'white') bigText = "WHITE WINS";
           if (winner === 'black') bigText = "BLACK WINS";
      }

      setMatchResult(res);
      setOverlayMessage(gameMode === 'online' && winner === 'white' ? (config.gamification.win.title || "YOU WIN") : bigText);
      playSound(res === 'win' ? 'win' : 'lose');

      setTimeout(() => {
          setOverlayMessage(bigText);
          if (res === 'win' && config.gamification.win.subtitle) {
              setSubMessage(config.gamification.win.subtitle);
          } else if (res === 'lose' && config.gamification.lose.subtitle) {
              setSubMessage(config.gamification.lose.subtitle);
          } else {
              setSubMessage(null);
          }
          
          setTimeout(() => {
              if (matchType === 'bo3') {
                   const nextScores = { ...roundScores };
                   if (winner !== 'draw') {
                       nextScores[winner] = (roundScores[winner] || 0) + 1;
                       setRoundScores(nextScores);
                   }

                   // Tournament Logic
                   if (gameMode === 'tournament' && tournamentState && tournamentState.currentMatchId) {
                       const matchIndex = tournamentState.matches.findIndex(m => m.id === tournamentState.currentMatchId);
                       if (matchIndex !== -1) {
                           const match = tournamentState.matches[matchIndex];
                           const newScore: [number, number] = [nextScores.white, nextScores.black];
                           
                           let matchWinner: TournamentPlayer | null = null;
                           if (newScore[0] >= 2) matchWinner = match.players[0];
                           else if (newScore[1] >= 2) matchWinner = match.players[1];

                           const updatedMatches = [...tournamentState.matches];
                           updatedMatches[matchIndex] = { 
                               ...match, 
                               score: newScore, 
                               winner: matchWinner, 
                               status: matchWinner ? 'finished' : 'active' 
                           };

                           let champion = tournamentState.champion;

                           if (matchWinner) {
                               // Advance winner to next match
                               if (match.nextMatchId) {
                                   const nextMatchIndex = updatedMatches.findIndex(m => m.id === match.nextMatchId);
                                   if (nextMatchIndex !== -1) {
                                       const nextMatch = updatedMatches[nextMatchIndex];
                                       const nextPlayers = [...nextMatch.players] as [TournamentPlayer | null, TournamentPlayer | null];
                                       
                                       // Determine slot (0 or 1) based on current match ID
                                       // For 4 players: m1 -> m3 (slot 0), m2 -> m3 (slot 1)
                                       const slot = match.id === 'm1' ? 0 : 1;
                                       nextPlayers[slot] = matchWinner;
                                       
                                       updatedMatches[nextMatchIndex] = { ...nextMatch, players: nextPlayers };
                                   }
                               } else {
                                   // No next match -> Champion!
                                   champion = matchWinner;
                               }
                           }

                           setTournamentState({
                               ...tournamentState,
                               matches: updatedMatches,
                               champion
                           });

                           if (matchWinner) {
                               setSubMessage(champion ? "TOURNAMENT CHAMPION!" : "MATCH WINNER!");
                               setOverlayMessage(champion ? champion.name.toUpperCase() : matchWinner.name.toUpperCase());
                               setTimeout(() => {
                                   setScreen('tournament_bracket');
                               }, 3000);
                               return;
                           }
                       }
                   }

                   if (nextScores.white >= 2) {
                        setSubMessage("PERFECT VICTORY");
                        setOverlayMessage(gameMode === 'ai' ? "YOU ARE CHAMPION" : "WHITE CHAMPION");
                        setShowMatchEndMenu(true);
                   } else if (nextScores.black >= 2) {
                        setSubMessage("TOTAL DOMINATION");
                        setOverlayMessage(gameMode === 'ai' ? "GAME OVER" : "BLACK CHAMPION");
                        setShowMatchEndMenu(true);
                   } else {
                       const nextRound = currentRound + 1;
                       setCurrentRound(nextRound);
                       startNewRound(nextRound);
                   }
              } else {
                  setShowMatchEndMenu(true);
              }
          }, 2000);

      }, 1500);
  }, [matchType, roundScores, currentRound, gameState, rules, gameMode, tournamentState]);

  // Timer Logic
  useEffect(() => {
      if (!gameState || gameState.status !== 'playing' || rules.moveTimeLimit <= 0 || overlayMessage || gameMode === 'tutorial') {
          if (timerRef.current) clearInterval(timerRef.current);
          return;
      }

      timerRef.current = window.setInterval(() => {
          setTimeLeft(prev => {
              if (prev <= 1) {
                  if (timerRef.current) clearInterval(timerRef.current);
                  const winner = gameState.turn === 'white' ? 'black' : 'white';
                  setGameState(g => g ? ({ ...g, status: 'timeout' }) : null);
                  handleGameEnd(winner);
                  return 0;
              }
              return prev - 1;
          });
      }, 1000);

      return () => {
          if (timerRef.current) clearInterval(timerRef.current);
      };
  }, [gameState?.status, gameState?.turn, rules.moveTimeLimit, overlayMessage, handleGameEnd, gameMode]); 

  // --- Undo Logic ---
  const handleUndo = useCallback(() => {
      if (historyStack.length === 0 || aiThinking || overlayMessage || gameMode === 'tutorial' || gameMode === 'online') return;

      let newState: GameState | undefined;
      let newStack = [...historyStack];

      if (gameMode === 'ai') {
          // In AI mode, we need to undo 2 moves (AI + Player) to get back to player turn
          // UNLESS the AI hasn't moved yet (rare race condition) or it's a multi-jump scenario
          // But simplified: Pop until we find a state where it's white's turn (player)
          
          // Pop AI move
          newStack.pop(); 
          // Pop Player move
          newState = newStack.pop();
          
          // Safety: if stack empty, reset
          if (!newState) return;

      } else {
          // PvP: Just pop one
          newState = newStack.pop();
      }

      if (newState) {
          setGameState(newState);
          setHistoryStack(newStack);
          playSound('move'); // Feedback
      }
  }, [historyStack, aiThinking, overlayMessage, gameMode]);


  const executeMove = useCallback((move: Move, currentGameState: GameState) => {
    const piece = currentGameState.board[move.from.row][move.from.col];
    const isCapture = move.captures.length > 0;
    
    const size = currentGameState.board.length;
    const isPromotion = piece && !piece.isKing && (
        (piece.player === 'white' && move.to.row === 0) || 
        (piece.player === 'black' && move.to.row === size - 1)
    );

    // Save current state to history before moving
    if (gameMode !== 'tutorial') {
        setHistoryStack(prev => [...prev, currentGameState]);
    }

    const newState = GameLogic.performMove(currentGameState, move, rules);
    setGameState(newState);

    if (rules.moveTimeLimit > 0 && gameMode !== 'tutorial') {
        setTimeLeft(rules.moveTimeLimit);
    }

    if (isPromotion) {
        playSound('promote');
        setActivePromotion(move.to);
        setTimeout(() => setActivePromotion(null), 3000);
    }
    else if (isCapture) playSound('capture');
    else playSound('move');
    
    // Tutorial Validation
    if (gameMode === 'tutorial') {
        const step = TUTORIAL_STEPS[currentTutorialStepIndex];
        const requiredMove = step.requiredMoves[tutorialMoveIndex];
        
        // Double check against current required move
        if (move.from.row === requiredMove.from.row && 
            move.from.col === requiredMove.from.col &&
            move.to.row === requiredMove.to.row && 
            move.to.col === requiredMove.to.col) {
            
            // Advance to next required move in sequence (if any)
            const nextMoveIdx = tutorialMoveIndex + 1;
            if (nextMoveIdx < step.requiredMoves.length) {
                setTutorialMoveIndex(nextMoveIdx);
                // Don't show success yet, user has to jump again
            } else {
                playSound('win');
                setShowTutorialSuccess(true);
            }

        }
        return;
    }

    if (newState.status !== 'playing') {
        let winner: Player | 'draw' = 'draw';
        if (newState.status === 'white_won') winner = 'white';
        else if (newState.status === 'black_won') winner = 'black';
        handleGameEnd(winner);
    }
  }, [rules, handleGameEnd, gameMode, currentTutorialStepIndex, tutorialMoveIndex]); 

  const handleCellClick = (cell: Cell) => {
    if (!gameState || gameState.status !== 'playing' || aiThinking || overlayMessage || showTutorialSuccess || tutorialComplete) return;
    // In Online or AI mode, lock black pieces
    if ((gameMode === 'ai' || gameMode === 'online') && gameState.turn === 'black') return;

    const { board, turn, selectedCell, validMoves, mandatoryMoveSource } = gameState;
    const clickedPiece = board[cell.row][cell.col];

    if (clickedPiece && clickedPiece.player === turn) {
        if (mandatoryMoveSource && (mandatoryMoveSource.row !== cell.row || mandatoryMoveSource.col !== cell.col)) {
            return; 
        }
        setGameState(prev => ({ ...prev!, selectedCell: cell }));
        return;
    }

    if (!clickedPiece && selectedCell) {
        const move = validMoves.find(m => 
            m.from.row === selectedCell.row && 
            m.from.col === selectedCell.col && 
            m.to.row === cell.row && 
            m.to.col === cell.col
        );

        if (move) {
            if (gameMode === 'tutorial') {
                const step = TUTORIAL_STEPS[currentTutorialStepIndex];
                const requiredMove = step.requiredMoves[tutorialMoveIndex];
                
                // Restrict moves to strictly the required move in tutorial
                if (move.from.row === requiredMove.from.row &&
                    move.from.col === requiredMove.from.col &&
                    move.to.row === requiredMove.to.row &&
                    move.to.col === requiredMove.to.col) {
                         executeMove(move, gameState);
                } else {
                    // Wrong move in tutorial
                    setGameState(prev => ({ ...prev!, selectedCell: null }));
                    playSound('pop'); // Error sound
                }
            } else {
                executeMove(move, gameState);
            }
        } else {
            setGameState(prev => ({ ...prev!, selectedCell: null }));
        }
    }
  };

  // AI & Online Bot Effect
  useEffect(() => {
    if ((gameMode === 'ai' || gameMode === 'online') && gameState?.status === 'playing' && gameState.turn === 'black' && !overlayMessage) {
      setAiThinking(true);
      
      // Simulate network delay for online mode (random between 1s and 3s)
      const delay = gameMode === 'online' ? 1000 + Math.random() * 2000 : 1000;

      const timer = setTimeout(() => {
        const bestMove = GameLogic.getAIMove(gameState, rules, difficulty);
        if (bestMove) {
          executeMove(bestMove, gameState);
        } else {
             setGameState(prev => ({...prev!, status: 'white_won'}));
             handleGameEnd('white');
        }
        setAiThinking(false);
      }, delay); 
      return () => clearTimeout(timer);
    }
  }, [gameState?.turn, gameState?.status, overlayMessage, executeMove, handleGameEnd, gameMode, rules, difficulty]);


  // --- Render Functions ---

  const renderLoading = () => {
      const tips = config.auth.loadingTips || ['Prepare sua estratégia...', 'Analisando o tabuleiro...', 'Calculando movimentos...'];
      const randomTip = tips[Math.floor(Math.random() * tips.length)];

      return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-emerald-50 text-emerald-900 transition-opacity duration-500">
          <div className="mb-8 relative">
              <div className="w-20 h-20 rounded-2xl bg-emerald-100 rotate-12 absolute -top-4 -left-4 animate-pulse"></div>
              <div className="w-20 h-20 rounded-2xl bg-emerald-600 rotate-45 relative z-10 flex items-center justify-center shadow-2xl overflow-hidden">
                   {config.auth.loadingIconUrl ? (
                       <img src={config.auth.loadingIconUrl} alt="Loading" className="w-12 h-12 animate-spin object-contain -rotate-45" />
                   ) : (
                       <Loader2 size={40} className="text-white animate-spin -rotate-45" />
                   )}
              </div>
          </div>
          <h1 className="text-3xl font-black mb-2 tracking-tight">{config.branding.title || 'Damas Minimalista'}</h1>
          <p className="text-emerald-600 mb-8 text-sm uppercase tracking-widest font-semibold">{randomTip}</p>
          <div className="w-64 h-2 bg-emerald-200 rounded-full overflow-hidden shadow-inner">
              <div 
                  className="h-full bg-emerald-500 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${loadingProgress}%` }}
              />
          </div>
          <div className="mt-2 font-mono text-emerald-600 text-xs font-bold">
              {Math.min(100, Math.floor(loadingProgress))}%
          </div>
      </div>
      );
  };

  const renderMatchmaking = () => (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-emerald-900/90 backdrop-blur-xl text-white">
          {!onlineOpponent ? (
              <>
                 <div className="relative mb-12">
                     <div className="w-32 h-32 rounded-full border-4 border-emerald-500/30 animate-ping absolute inset-0"></div>
                     <div className="w-32 h-32 rounded-full border-4 border-emerald-400/50 animate-[ping_2s_infinite] absolute inset-0"></div>
                     <div className="w-32 h-32 rounded-full bg-emerald-800 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                         <Globe size={64} className="text-emerald-300 animate-pulse" />
                     </div>
                 </div>
                 <h2 className="text-3xl font-arcade text-emerald-300 mb-2">BUSCANDO OPONENTE</h2>
                 <p className="text-emerald-400/70 font-mono text-sm">Tempo estimado: 5s</p>
              </>
          ) : (
              <div className="flex items-center gap-12 animate-in zoom-in duration-500">
                  <div className="text-center">
                      <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-4xl border-4 border-emerald-500 shadow-lg mb-4">
                          {currentUser?.avatarId}
                      </div>
                      <h3 className="font-bold text-xl">{currentUser?.username}</h3>
                      <p className="text-emerald-400 text-sm">{currentUser?.rank} pts</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                      <Swords size={48} className="text-yellow-400 animate-pulse" />
                      <span className="font-arcade text-yellow-400 text-xl">VS</span>
                  </div>
                  <div className="text-center">
                      <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center text-4xl border-4 border-red-500 shadow-lg mb-4">
                          {onlineOpponent.avatarId}
                      </div>
                      <h3 className="font-bold text-xl">{onlineOpponent.username}</h3>
                      <p className="text-red-400 text-sm">{onlineOpponent.rank} pts</p>
                  </div>
              </div>
          )}
          <button onClick={() => setScreen('menu')} className="absolute bottom-10 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-bold border border-white/20">
              Cancelar
          </button>
      </div>
  );

  const renderDifficultySelect = () => {
    const iconHeight = config.branding.difficultyIconHeight || 24;
    return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-8 animate-fade-in max-w-sm mx-auto z-10 relative">
        <div className="w-full flex items-center justify-start">
            <button onClick={() => setScreen('menu')} className="p-2 bg-white/80 backdrop-blur rounded-full shadow hover:bg-gray-50 text-gray-600">
                <ChevronLeft size={24} />
            </button>
        </div>
        <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-emerald-800">Dificuldade</h2>
            <p className="text-emerald-600">Escolha o nível da IA</p>
        </div>
        <div className="w-full space-y-4">
            <button onClick={() => startGame('ai', 'easy')} className="w-full bg-white/80 backdrop-blur hover:bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-500 rounded-2xl p-5 shadow-sm transition-all flex items-center gap-4">
                <div className="bg-emerald-100 p-3 rounded-xl">
                    {config.branding.difficulties?.easy?.iconUrl ? (
                        <img src={config.branding.difficulties.easy.iconUrl} alt="Easy" style={{ height: `${iconHeight}px` }} className="object-contain" />
                    ) : (
                        <Baby className="text-emerald-600" size={iconHeight} />
                    )}
                </div>
                <div className="text-left"><h3 className="text-lg font-bold text-gray-800">{config.branding.difficulties?.easy?.label || 'Fácil'}</h3><p className="text-gray-500 text-xs">Joga aleatoriamente</p></div>
            </button>
            <button onClick={() => startGame('ai', 'medium')} className="w-full bg-white/80 backdrop-blur hover:bg-amber-50 border-2 border-emerald-100 hover:border-amber-500 rounded-2xl p-5 shadow-sm transition-all flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-xl">
                    {config.branding.difficulties?.normal?.iconUrl ? (
                        <img src={config.branding.difficulties.normal.iconUrl} alt="Normal" style={{ height: `${iconHeight}px` }} className="object-contain" />
                    ) : (
                        <Zap className="text-amber-600" size={iconHeight} />
                    )}
                </div>
                <div className="text-left"><h3 className="text-lg font-bold text-gray-800">{config.branding.difficulties?.normal?.label || 'Médio'}</h3><p className="text-gray-500 text-xs">Equilibrado e focado</p></div>
            </button>
            <button onClick={() => startGame('ai', 'hard')} className="w-full bg-white/80 backdrop-blur hover:bg-red-50 border-2 border-emerald-100 hover:border-red-500 rounded-2xl p-5 shadow-sm transition-all flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-xl">
                    {config.branding.difficulties?.hard?.iconUrl ? (
                        <img src={config.branding.difficulties.hard.iconUrl} alt="Hard" style={{ height: `${iconHeight}px` }} className="object-contain" />
                    ) : (
                        <Skull className="text-red-600" size={iconHeight} />
                    )}
                </div>
                <div className="text-left"><h3 className="text-lg font-bold text-gray-800">{config.branding.difficulties?.hard?.label || 'Difícil'}</h3><p className="text-gray-500 text-xs">Pensa várias jogadas à frente</p></div>
            </button>
        </div>
    </div>
    );
  };

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-8 animate-fade-in z-10 relative">
      <div className="text-center space-y-2 flex flex-col items-center">
        {config.branding.logoUrl ? (
            <img 
                src={config.branding.logoUrl} 
                alt="Logo" 
                style={{ maxHeight: `${config.branding.logoMaxHeight || 150}px` }} 
                className="mb-4 object-contain drop-shadow-md" 
            />
        ) : (
            <h1 className="text-5xl font-black text-emerald-800 tracking-tight drop-shadow-sm">
                {config.branding.title || 'Damas'}
            </h1>
        )}
        <p className="text-emerald-600 text-lg font-medium">
            {config.branding.subtitle || 'Minimalista & Estratégico'}
        </p>
      </div>

      {/* User Mini Profile */}
      {currentUser && (
          <div className="bg-white/40 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 border border-white/50 shadow-sm animate-in fade-in slide-in-from-top-4 relative group">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/50 flex items-center justify-center text-2xl border border-white/50">
                {currentUser.avatarId && (currentUser.avatarId.startsWith('data:') || currentUser.avatarId.startsWith('http')) ? (
                    <img src={currentUser.avatarId} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <span>{currentUser.avatarId}</span>
                )}
              </div>
              <div className="flex flex-col text-left">
                  <span className="text-emerald-900 font-bold text-sm leading-tight">{currentUser.username}</span>
                  <span className="text-emerald-700 text-[10px] font-mono leading-tight">Rank: {currentUser.rank}</span>
              </div>
              <button 
                onClick={() => setShowProfileEditor(true)}
                className="absolute -right-2 -top-2 bg-white text-emerald-600 p-1.5 rounded-full shadow-md hover:scale-110 transition-transform border border-emerald-100"
                title="Editar Perfil"
              >
                  <Edit size={14} />
              </button>
          </div>
      )}

      <div className="bg-white/50 backdrop-blur p-1 rounded-full flex border border-emerald-100/50 mb-2">
          <button onClick={() => setMatchType('single')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${matchType === 'single' ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-700 hover:bg-white/50'}`}>Partida Única</button>
          <button onClick={() => setMatchType('bo3')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${matchType === 'bo3' ? 'bg-amber-500 text-white shadow-md' : 'text-emerald-700 hover:bg-white/50'}`}><Swords size={16} />Melhor de 3</button>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {/* ONLINE BUTTON */}
        <button onClick={startMatchmaking} className="w-full group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-2xl p-6 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all flex items-center gap-4 border-2 border-emerald-400/30">
          <div className="bg-white/20 p-3 rounded-xl text-white"><Globe size={28} /></div>
          <div className="text-left text-white">
              <h3 className="text-xl font-bold font-arcade tracking-wide">ONLINE</h3>
              <p className="text-emerald-100 text-sm flex items-center gap-1"><Wifi size={12}/> Jogadores Mundiais</p>
          </div>
        </button>

        <button onClick={startTournamentSetup} className="w-full group bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 rounded-2xl p-6 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-1 transition-all flex items-center gap-4 border-2 border-orange-400/30">
          <div className="bg-white/20 p-3 rounded-xl text-white"><Trophy size={28} /></div>
          <div className="text-left text-white">
              <h3 className="text-xl font-bold font-arcade tracking-wide">TORNEIO</h3>
              <p className="text-orange-100 text-sm flex items-center gap-1"><Users size={12}/> Copa dos Campeões</p>
          </div>
        </button>

        <button 
            onClick={() => setScreen('difficulty_select')} 
            className="w-full group bg-white/90 backdrop-blur hover:bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-500 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-4 mx-auto"
            style={{ maxWidth: config.branding.playButtonWidth ? `${config.branding.playButtonWidth}px` : '100%' }}
        >
          <div className="bg-emerald-100 p-3 rounded-xl group-hover:bg-emerald-500 transition-colors">
              {config.branding.playButtonIconUrl ? (
                  <img src={config.branding.playButtonIconUrl} alt="Play" className="w-7 h-7 object-contain" />
              ) : (
                  <Monitor className="text-emerald-600 group-hover:text-white" size={28} />
              )}
          </div>
          <div className="text-left">
              <h3 className="text-xl font-bold text-gray-800">{config.branding.playButtonText || 'Vs Inteligência Artificial'}</h3>
              <p className="text-gray-500 text-sm">Desafie o computador</p>
          </div>
        </button>
        <button onClick={() => startGame('pvp')} className="w-full group bg-white/90 backdrop-blur hover:bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-500 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-xl group-hover:bg-emerald-500 transition-colors"><UserIcon className="text-emerald-600 group-hover:text-white" size={28} /></div>
          <div className="text-left"><h3 className="text-xl font-bold text-gray-800">Multijogador Local</h3><p className="text-gray-500 text-sm">Jogue com um amigo</p></div>
        </button>
        
        {/* TUTORIAL BUTTON */}
        <button onClick={startTutorial} className="w-full group bg-white/80 backdrop-blur hover:bg-indigo-50 border-2 border-indigo-100 hover:border-indigo-500 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4 mt-2">
           <div className="bg-indigo-100 p-3 rounded-xl group-hover:bg-indigo-500 transition-colors"><GraduationCap className="text-indigo-600 group-hover:text-white" size={24} /></div>
           <div className="text-left"><h3 className="text-lg font-bold text-gray-800">Tutorial Interativo</h3><p className="text-gray-500 text-xs">Aprenda a jogar passo a passo</p></div>
        </button>

      </div>
      <div className="flex gap-4">
        <button onClick={() => setScreen('piece_selection')} className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white/40 transition-colors text-emerald-800 font-bold">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-emerald-100"><Palette className="text-emerald-600" size={24} /></div>
            <span className="text-xs">Peças</span>
        </button>
        <button onClick={() => setScreen('customization')} className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white/40 transition-colors text-emerald-800 font-bold">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-emerald-100"><Play className="text-emerald-600 rotate-90" size={24} fill="currentColor" /></div>
            <span className="text-xs">Temas</span>
        </button>
        <button onClick={() => setScreen('settings')} className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white/40 transition-colors text-emerald-800 font-bold">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-emerald-100"><Settings className="text-emerald-600" size={24} /></div>
            <span className="text-xs">Regras</span>
        </button>
        {currentUser?.isAdmin && (
            <button onClick={() => setScreen('admin_settings')} className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white/40 transition-colors text-emerald-800 font-bold">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-emerald-100"><ShieldCheck className="text-emerald-600" size={24} /></div>
                <span className="text-xs">Admin</span>
            </button>
        )}
      </div>
    </div>
  );

  const renderGame = () => {
    if (!gameState) return null;
    const isTutorial = gameMode === 'tutorial';
    
    // Tutorial Overlay Logic
    let tutorialStep = null;
    if (isTutorial) {
        tutorialStep = TUTORIAL_STEPS[currentTutorialStepIndex];
    }

    const counts = GameLogic.countPieces(gameState.board);
    const piecesPerSide = ((rules.boardSize - 2) / 2) * (rules.boardSize / 2);
    
    const whiteHealth = (counts.white / piecesPerSide) * 100;
    const blackHealth = (counts.black / piecesPerSide) * 100;

    // Names
    let p1Name = isTutorial ? 'Aluno' : (gameMode === 'online' ? currentUser?.username : (gameMode === 'ai' ? 'Você' : 'Player 1'));
    let p2Name = isTutorial ? 'Treinador' : (gameMode === 'online' ? onlineOpponent?.username : (gameMode === 'ai' ? (difficulty === 'hard' ? 'CPU (Hard)' : difficulty === 'medium' ? 'CPU' : 'CPU (Easy)') : 'Player 2'));
    
    if (gameMode === 'tournament' && tournamentState && tournamentState.currentMatchId) {
        const match = tournamentState.matches.find(m => m.id === tournamentState.currentMatchId);
        if (match && match.players[0] && match.players[1]) {
            p1Name = match.players[0].name;
            p2Name = match.players[1].name;
        }
    }
    
    // Tutorial hints calculation (only show hint for current required move)
    let activeTutorialHints: Cell[] | undefined = undefined;
    let activeTutorialArrow: { from: Cell, to: Cell } | null = null;
    
    if (isTutorial && tutorialStep && !showTutorialSuccess) {
        const requiredMove = tutorialStep.requiredMoves[tutorialMoveIndex];
        if (requiredMove) {
             activeTutorialHints = [requiredMove.from, requiredMove.to];
             activeTutorialArrow = requiredMove;
        }
    }

    return (
      <div className="flex flex-col items-center min-h-screen p-4 pb-12 overflow-hidden relative z-10">
        
        {/* TOP BAR / CONTROLS */}
        <div className="w-full max-w-[600px] flex justify-between items-center mb-4 mt-2 px-2 z-30">
             <button 
                onClick={() => {
                  setScreen('menu');
                  setShowTutorialSuccess(false);
                  setTutorialComplete(false);
                  setOverlayMessage(null);
                }} 
                className="p-3 bg-white/80 backdrop-blur-md rounded-xl shadow-md border border-white hover:bg-white transition-all text-emerald-700 flex items-center gap-2 font-bold text-sm"
             >
                <Home size={18} />
                <span className="hidden sm:inline">Menu</span>
             </button>
             
             {!isTutorial && (
                 <div className="flex gap-2">
                    {/* UNDO BUTTON */}
                    {gameMode !== 'online' && historyStack.length > 0 && !overlayMessage && (
                        <button 
                            onClick={handleUndo} 
                            disabled={aiThinking}
                            className={`p-3 bg-white/80 backdrop-blur-md rounded-xl shadow-md border border-white transition-all text-emerald-700 flex items-center gap-2 font-bold text-sm ${aiThinking ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'}`}
                        >
                            <Undo2 size={18} />
                        </button>
                    )}
                    
                    {/* HISTORY BUTTON */}
                    <button 
                        onClick={() => setShowHistory(!showHistory)} 
                        className={`p-3 backdrop-blur-md rounded-xl shadow-md border border-white transition-all flex items-center gap-2 font-bold text-sm ${showHistory ? 'bg-emerald-600 text-white' : 'bg-white/80 hover:bg-white text-emerald-700'}`}
                    >
                        <ScrollText size={18} />
                    </button>

                    <button 
                        onClick={() => setViewMode(v => v === '2d' ? '3d' : '2d')} 
                        className="p-3 bg-white/80 backdrop-blur-md rounded-xl shadow-md border border-white hover:bg-white transition-all text-emerald-700 flex items-center gap-2 font-bold text-sm"
                    >
                        {viewMode === '3d' ? <Layers size={18} /> : <Box size={18} />}
                        <span>{viewMode === '3d' ? '3D' : '2D'}</span>
                    </button>
                    
                    <button 
                        onClick={() => startGame(gameMode, difficulty)} 
                        className="p-3 bg-white/80 backdrop-blur-md rounded-xl shadow-md border border-white hover:bg-white transition-all text-emerald-700"
                        title="Reiniciar Partida"
                    >
                        <RotateCcw size={18} />
                    </button>
                 </div>
             )}
        </div>

        {/* --- ARCADE HUD (Hidden in Tutorial to reduce noise) --- */}
        {!isTutorial && (
            <div className="w-full max-w-[600px] mb-6 relative z-20">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 flex flex-col items-end relative">
                        <div className="flex justify-between w-full text-xs font-black uppercase tracking-wider mb-1 text-emerald-900">
                            <span className="flex items-center gap-2">
                                {gameMode === 'online' && currentUser?.avatarId} {p1Name}
                            </span>
                            {matchType === 'bo3' && (
                                <div className="flex gap-1">
                                    <div className={`w-3 h-3 rounded-full border border-black/20 ${roundScores.white > 0 ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'bg-gray-300'}`} />
                                    <div className={`w-3 h-3 rounded-full border border-black/20 ${roundScores.white > 1 ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'bg-gray-300'}`} />
                                </div>
                            )}
                        </div>
                        <div className="w-full h-6 bg-gray-800 rounded-sm skew-x-[-15deg] border-2 border-white shadow-md relative overflow-hidden">
                            <div className="absolute inset-0 bg-red-600 transition-all duration-1000 ease-out" style={{ width: `${whiteHealth}%` }} />
                            <div className="absolute inset-0 bg-gradient-to-b from-yellow-300 to-yellow-500 transition-all duration-300 ease-out" style={{ width: `${whiteHealth}%` }} />
                            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                        </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-center justify-center -mt-2">
                        <div className="w-14 h-14 bg-gray-800 rounded-lg border-2 border-white flex items-center justify-center shadow-lg relative z-10">
                            <span className={`font-arcade text-3xl ${timeLeft < 10 && rules.moveTimeLimit > 0 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                                {rules.moveTimeLimit > 0 ? timeLeft : '∞'}
                            </span>
                        </div>
                        {matchType === 'bo3' && (
                            <div className="bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 backdrop-blur-sm">
                                ROUND {currentRound}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 flex flex-col items-start relative">
                        <div className="flex justify-between w-full text-xs font-black uppercase tracking-wider mb-1 text-emerald-900">
                            {matchType === 'bo3' && (
                                <div className="flex gap-1">
                                    <div className={`w-3 h-3 rounded-full border border-black/20 ${roundScores.black > 0 ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'bg-gray-300'}`} />
                                    <div className={`w-3 h-3 rounded-full border border-black/20 ${roundScores.black > 1 ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'bg-gray-300'}`} />
                                </div>
                            )}
                            <span className="flex items-center gap-2">
                            {p2Name} {gameMode === 'online' && onlineOpponent?.avatarId}
                            </span>
                        </div>
                        <div className="w-full h-6 bg-gray-800 rounded-sm skew-x-[15deg] border-2 border-white shadow-md relative overflow-hidden">
                            <div className="absolute right-0 top-0 bottom-0 bg-red-600 transition-all duration-1000 ease-out" style={{ width: `${blackHealth}%` }} />
                            <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-b from-orange-400 to-red-500 transition-all duration-300 ease-out" style={{ width: `${blackHealth}%` }} />
                            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- TUTORIAL OVERLAY --- */}
        {isTutorial && tutorialStep && !tutorialComplete && (
             <div className="w-full max-w-[600px] mb-4 z-40 animate-in slide-in-from-top-4 fade-in">
                 <div className="bg-white/95 backdrop-blur-xl border-l-4 border-indigo-500 shadow-xl rounded-r-xl p-6 relative overflow-hidden">
                     {/* Tutorial Step Indicator */}
                     <div className="absolute top-2 right-4 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                         {currentTutorialStepIndex + 1} / {TUTORIAL_STEPS.length}
                     </div>

                     <h2 className="text-xl font-black text-gray-800 mb-2 flex items-center gap-2">
                         <GraduationCap className="text-indigo-600" />
                         {tutorialStep.title}
                     </h2>
                     <p className="text-gray-600 text-sm leading-relaxed font-medium">
                         {tutorialStep.description}
                     </p>

                     {showTutorialSuccess && (
                         <div className="absolute inset-0 bg-emerald-500/95 flex flex-col items-center justify-center animate-in zoom-in">
                             <CheckCircle size={48} className="text-white mb-2 animate-bounce" />
                             <span className="text-white font-black text-xl mb-4">EXCELENTE!</span>
                             <button 
                                onClick={nextTutorialStep}
                                className="bg-white text-emerald-600 px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
                             >
                                 Próxima Lição
                             </button>
                         </div>
                     )}
                 </div>
             </div>
        )}

        {/* --- TUTORIAL COMPLETE SCREEN --- */}
        {isTutorial && tutorialComplete && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-emerald-900/95 backdrop-blur-xl text-white animate-in zoom-in duration-500 p-6 text-center">
                 <div className="relative mb-8">
                     <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 animate-pulse"></div>
                     <Trophy size={100} className="text-yellow-400 relative z-10 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-bounce" />
                     <Sparkles size={40} className="text-yellow-200 absolute -top-4 -right-4 animate-ping" />
                     <Sparkles size={30} className="text-yellow-200 absolute bottom-0 -left-6 animate-pulse" />
                 </div>
                 
                 <h1 className="font-arcade text-4xl md:text-5xl mb-4 text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-600 drop-shadow-sm">
                     PARABÉNS!
                 </h1>
                 
                 <p className="text-emerald-100 text-lg md:text-xl font-medium max-w-md mb-10 leading-relaxed">
                     Você completou o treinamento básico.<br/>
                     Agora você está pronto para os <span className="text-yellow-300 font-bold">desafios</span>!
                 </p>

                 <button 
                    onClick={() => {
                        setScreen('menu');
                        setRules(DEFAULT_RULES);
                        setTutorialComplete(false);
                    }}
                    className="group relative bg-white text-emerald-900 font-black text-xl px-10 py-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:scale-105 transition-all flex items-center gap-3 overflow-hidden"
                 >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Home size={28} className="relative z-10" />
                    <span className="relative z-10">VOLTAR AO MENU</span>
                 </button>
            </div>
        )}

        {/* --- OVERLAY ANIMATIONS (ROUND / KO) --- */}
        {overlayMessage && !isTutorial && (
            <div 
                className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none bg-black/40 backdrop-blur-[2px] transition-all duration-500"
                style={{
                    backgroundImage: showMatchEndMenu && matchResult === 'win' && config.gamification.win.backgroundUrl ? `url(${config.gamification.win.backgroundUrl})` : 
                                     showMatchEndMenu && matchResult === 'lose' && config.gamification.lose.backgroundUrl ? `url(${config.gamification.lose.backgroundUrl})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {showMatchEndMenu && matchResult === 'win' && config.gamification.win.imageUrl && (
                    <img src={config.gamification.win.imageUrl} alt="Win" className="w-48 h-48 object-contain mb-8 animate-bounce drop-shadow-2xl" referrerPolicy="no-referrer" />
                )}
                {showMatchEndMenu && matchResult === 'lose' && config.gamification.lose.imageUrl && (
                    <img src={config.gamification.lose.imageUrl} alt="Lose" className="w-48 h-48 object-contain mb-8 animate-pulse drop-shadow-2xl" referrerPolicy="no-referrer" />
                )}
                
                <h1 className="font-arcade text-7xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-500 to-red-600 drop-shadow-[0_4px_0_rgba(0,0,0,1)] text-stroke animate-arcade-in text-center leading-tight">
                    {overlayMessage}
                </h1>
                {subMessage && (
                    <div className="mt-4 font-arcade text-3xl text-white text-stroke-sm animate-bounce text-center">
                        {subMessage}
                    </div>
                )}
                
                {/* MATCH END MENU */}
                {showMatchEndMenu && (
                    <div 
                      className="mt-12 flex flex-col gap-4 pointer-events-auto animate-arcade-in" 
                      style={{ animationDelay: '1s', animationFillMode: 'both' }}
                    >
                         <button 
                            onClick={() => startGame(gameMode, difficulty)}
                            className="bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-arcade text-2xl px-12 py-4 rounded-2xl shadow-[0_6px_0_#064e3b] hover:shadow-[0_3px_0_#064e3b] hover:translate-y-1 transition-all flex items-center justify-center gap-3 border-2 border-emerald-400/50"
                         >
                            <RotateCcw size={28} strokeWidth={2.5} />
                            REVANCHE
                         </button>
                         <button 
                            onClick={() => setScreen('menu')}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-arcade text-xl px-12 py-4 rounded-2xl border-2 border-white/40 shadow-[0_6px_0_rgba(0,0,0,0.2)] hover:shadow-[0_3px_0_rgba(0,0,0,0.2)] hover:translate-y-1 transition-all flex items-center justify-center gap-3"
                         >
                            <Home size={24} strokeWidth={2.5} />
                            MENU PRINCIPAL
                         </button>
                    </div>
                )}
            </div>
        )}
        
        {/* --- HISTORY DRAWER --- */}
        {showHistory && (
            <div className="absolute left-4 top-24 bottom-24 w-48 bg-white/90 backdrop-blur-lg rounded-2xl border border-white/50 shadow-xl z-40 flex flex-col overflow-hidden animate-in slide-in-from-left-10">
                <div className="p-3 bg-emerald-100 border-b border-emerald-200 font-bold text-emerald-900 text-sm flex items-center justify-between">
                    <span>Histórico</span>
                    <span className="text-xs bg-emerald-200 px-2 py-0.5 rounded-full">{gameState.historyLog.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {gameState.historyLog.length === 0 ? (
                        <p className="text-gray-400 text-xs text-center mt-4">Nenhuma jogada ainda.</p>
                    ) : (
                        gameState.historyLog.map((log, i) => (
                            <div key={i} className={`text-xs p-2 rounded-lg flex items-center justify-between ${log.player === 'white' ? 'bg-white border border-gray-100' : 'bg-gray-800 text-white border border-gray-700'}`}>
                                <span className="font-mono font-bold">{i + 1}.</span>
                                <span className="font-bold">{log.notation}</span>
                                {log.isCapture && <span className="text-red-500 font-black">x</span>}
                            </div>
                        ))
                    )}
                    {/* Dummy div to scroll to bottom */}
                    <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
                </div>
            </div>
        )}

        {/* --- GAME BOARD --- */}
        <div className="flex-1 flex items-center justify-center w-full max-w-[600px]">
            <Board 
                gameState={gameState} 
                theme={activeTheme} 
                onCellClick={handleCellClick}
                isAiThinking={aiThinking || !!overlayMessage}
                viewMode={viewMode}
                pieceStyle={activePieceStyle}
                enableShake={enableShake}
                activeCaptureEffect={activeCaptureEffect}
                activePromotion={activePromotion}
                tutorialHints={activeTutorialHints}
                tutorialArrow={activeTutorialArrow}
                customImages={customImages}
            />
        </div>
        
        {/* Helper Footer */}
        {!isTutorial && (
            <div className="mt-6 flex flex-col items-center gap-4 z-10">
                <p className={`text-white font-arcade text-lg px-6 py-2 rounded-full backdrop-blur-md shadow-lg border-2 transition-all duration-300 ${gameState.turn === 'white' ? 'bg-emerald-600/80 border-emerald-400' : 'bg-gray-800/80 border-gray-600 opacity-60'}`}>
                    {gameState.turn === 'white' ? "SUA VEZ" : "AGUARDE..."}
                </p>
            </div>
        )}
      </div>
    );
  };

  const renderTournamentSetup = () => (
      <div className="min-h-screen p-6 max-w-md mx-auto flex flex-col z-10 relative animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setScreen('menu')} className="p-2 bg-white rounded-full shadow hover:bg-gray-50"><ChevronLeft /></button>
              <h2 className="text-2xl font-bold text-gray-800">Configurar Torneio</h2>
          </div>
          
          <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/50 space-y-6">
              <div className="text-center mb-4">
                  <Trophy size={48} className="text-yellow-500 mx-auto mb-2" />
                  <h3 className="font-black text-xl text-emerald-900">Copa dos Campeões</h3>
                  <p className="text-emerald-600 text-sm">Insira os nomes dos participantes</p>
              </div>

              <div className="space-y-3">
                  {tournamentInputPlayers.map((name, i) => (
                      <div key={i} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl shadow-inner">
                              {EMOJI_LIST[i % EMOJI_LIST.length].icons[0]}
                          </div>
                          <input 
                              type="text" 
                              placeholder={`Jogador ${i+1}`}
                              value={name}
                              onChange={(e) => {
                                  const newPlayers = [...tournamentInputPlayers];
                                  newPlayers[i] = e.target.value;
                                  setTournamentInputPlayers(newPlayers);
                              }}
                              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-gray-700"
                          />
                      </div>
                  ))}
              </div>

              <button 
                  onClick={generateTournament}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white font-black text-lg py-4 rounded-xl shadow-lg shadow-orange-500/20 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                  <Swords size={24} />
                  INICIAR TORNEIO
              </button>
          </div>
      </div>
  );

  const renderTournamentBracket = () => {
      if (!tournamentState) return null;

      return (
          <div className="min-h-screen p-4 flex flex-col z-10 relative overflow-y-auto">
              <div className="flex items-center justify-between mb-6 max-w-4xl mx-auto w-full">
                  <button onClick={() => setScreen('menu')} className="p-2 bg-white/80 backdrop-blur rounded-full shadow hover:bg-white text-emerald-800 font-bold flex items-center gap-2 px-4">
                      <ChevronLeft size={20} /> Sair
                  </button>
                  <h2 className="text-2xl font-black text-white drop-shadow-md font-arcade tracking-wider">CHAVEAMENTO</h2>
                  <div className="w-20"></div> 
              </div>

              <div className="flex-1 flex items-center justify-center overflow-x-auto pb-10">
                  <div className="flex gap-8 md:gap-16 items-center min-w-max px-8">
                      {/* Round 1: Semi-Finals */}
                      <div className="flex flex-col gap-12 md:gap-24">
                          {tournamentState.matches.filter(m => m.round === 0).map(match => (
                              <div key={match.id} className="relative group">
                                  <div className={`w-64 bg-white/90 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl border-2 ${match.status === 'active' ? 'border-yellow-400 ring-4 ring-yellow-400/30' : 'border-white/50'}`}>
                                      <div className="bg-gray-100 px-4 py-2 text-xs font-bold text-gray-500 uppercase flex justify-between items-center">
                                          <span>Semifinal {match.id === 'm1' ? 'A' : 'B'}</span>
                                          {match.status === 'finished' && <span className="text-emerald-600 flex items-center gap-1"><CheckCircle size={12}/> Finalizado</span>}
                                      </div>
                                      <div className="p-2 space-y-1">
                                          {match.players.map((p, idx) => (
                                              <div key={idx} className={`flex items-center justify-between p-2 rounded-lg ${match.winner?.id === p?.id ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-white text-gray-700'}`}>
                                                  <div className="flex items-center gap-2">
                                                      <span className="text-lg">{p?.avatar || '👤'}</span>
                                                      <span>{p?.name || 'TBD'}</span>
                                                  </div>
                                                  {match.status !== 'pending' && (
                                                      <span className={`font-mono font-bold ${match.winner?.id === p?.id ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                          {match.score[idx]}
                                                      </span>
                                                  )}
                                              </div>
                                          ))}
                                      </div>
                                      {match.status !== 'finished' && match.players[0] && match.players[1] && (
                                          <button 
                                              onClick={() => startTournamentMatch(match.id)}
                                              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 text-sm uppercase tracking-wider transition-colors"
                                          >
                                              {match.status === 'active' ? 'Continuar' : 'Jogar'}
                                          </button>
                                      )}
                                  </div>
                                  {/* Connector Line */}
                                  <div className="absolute top-1/2 -right-8 md:-right-16 w-8 md:w-16 h-1 bg-white/50"></div>
                                  <div className={`absolute top-1/2 -right-8 md:-right-16 w-1 h-[calc(50%+3rem)] md:h-[calc(50%+6rem)] bg-white/50 ${match.id === 'm1' ? 'border-b-0' : 'top-auto bottom-1/2'}`}></div>
                              </div>
                          ))}
                      </div>

                      {/* Round 2: Final */}
                      <div className="flex flex-col justify-center relative">
                          {/* Vertical Connector Join */}
                          <div className="absolute top-0 bottom-0 -left-8 md:-left-16 w-1 bg-white/50 my-auto h-[calc(100%-12rem)] border-r border-white/50"></div>
                          
                          {tournamentState.matches.filter(m => m.round === 1).map(match => (
                              <div key={match.id} className="relative z-10">
                                  {tournamentState.champion && (
                                      <div className="absolute -top-24 left-0 right-0 flex flex-col items-center animate-bounce">
                                          <Trophy size={48} className="text-yellow-400 drop-shadow-lg" />
                                          <span className="font-black text-yellow-300 text-shadow uppercase tracking-widest text-sm mt-1">Campeão</span>
                                      </div>
                                  )}
                                  <div className={`w-72 bg-gradient-to-b from-white to-emerald-50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border-4 ${match.status === 'active' ? 'border-yellow-400 ring-4 ring-yellow-400/30' : 'border-emerald-500/50'}`}>
                                      <div className="bg-emerald-600 px-4 py-3 text-sm font-black text-white uppercase flex justify-between items-center tracking-widest">
                                          <span className="flex items-center gap-2"><Trophy size={14}/> Grande Final</span>
                                      </div>
                                      <div className="p-4 space-y-2">
                                          {match.players.map((p, idx) => (
                                              <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border-2 ${match.winner?.id === p?.id ? 'bg-yellow-100 border-yellow-400 text-yellow-900 font-bold shadow-sm' : 'bg-white border-transparent text-gray-700'}`}>
                                                  <div className="flex items-center gap-3">
                                                      <span className="text-2xl">{p?.avatar || '👤'}</span>
                                                      <span className="text-lg">{p?.name || '???'}</span>
                                                  </div>
                                                  {match.status !== 'pending' && (
                                                      <span className="font-mono font-black text-xl">
                                                          {match.score[idx]}
                                                      </span>
                                                  )}
                                              </div>
                                          ))}
                                      </div>
                                      {match.status !== 'finished' && match.players[0] && match.players[1] && (
                                          <button 
                                              onClick={() => startTournamentMatch(match.id)}
                                              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white font-black py-3 text-lg uppercase tracking-wider transition-all shadow-md"
                                          >
                                              {match.status === 'active' ? 'Continuar Final' : 'Iniciar Final'}
                                          </button>
                                      )}
                                      {tournamentState.champion && (
                                          <div className="bg-yellow-400 text-yellow-900 font-black text-center py-2 uppercase tracking-widest animate-pulse">
                                              {tournamentState.champion.name} Venceu!
                                          </div>
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const renderSettings = () => (
    <div className="min-h-screen p-6 max-w-md mx-auto flex flex-col z-10 relative">
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setScreen('menu')} className="p-2 bg-white rounded-full shadow hover:bg-gray-50"><ChevronLeft /></button>
            <h2 className="text-2xl font-bold text-gray-800">Regras do Jogo</h2>
        </div>
        <div className="space-y-4 flex-1">
             {/* Rules Preset Selector */}
             <div className="bg-white/90 backdrop-blur p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
                <div className="flex items-center gap-3 mb-1">
                    <BookOpen className="text-emerald-600" size={20} />
                    <div>
                        <h4 className="font-bold text-gray-800">Variação de Regra</h4>
                        <p className="text-xs text-gray-500">Escolha o estilo de jogo.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {RULE_VARIANTS.map(variant => (
                        <button 
                            key={variant.id}
                            onClick={() => setRules({ ...variant, moveTimeLimit: rules.moveTimeLimit })}
                            className={`p-3 rounded-lg text-left transition-all border flex justify-between items-center ${rules.id === variant.id ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm' : 'bg-gray-50 border-transparent hover:bg-gray-100 text-gray-600'}`}
                        >
                            <span className="font-bold text-sm">{variant.name}</span>
                            {rules.id === variant.id && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                        </button>
                    ))}
                </div>
            </div>

             <div className="bg-white/90 backdrop-blur p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
                <div className="flex items-center gap-3 mb-1">
                    <Timer className="text-emerald-600" size={20} />
                    <div>
                        <h4 className="font-bold text-gray-800">Tempo por Jogada</h4>
                        <p className="text-xs text-gray-500">Limite de tempo para cada turno.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <input type="range" min="0" max="120" step="10" value={rules.moveTimeLimit} onChange={(e) => setRules(r => ({...r, moveTimeLimit: Number(e.target.value)}))} className="w-full accent-emerald-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    <div className="min-w-[60px] text-right font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 text-sm">
                        {rules.moveTimeLimit === 0 ? '∞' : `${rules.moveTimeLimit}s`}
                    </div>
                </div>
            </div>
            
            <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Detalhes da Regra Atual</h4>
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Tamanho</span>
                        <span className="font-bold text-gray-800">{rules.boardSize}x{rules.boardSize}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Damas Voadoras</span>
                        <span className={`font-bold ${rules.flyingKings ? 'text-emerald-600' : 'text-gray-400'}`}>{rules.flyingKings ? 'Sim' : 'Não'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Captura Obrigatória</span>
                        <span className={`font-bold ${rules.forceCapture ? 'text-emerald-600' : 'text-gray-400'}`}>{rules.forceCapture ? 'Sim' : 'Não'}</span>
                    </div>
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Captura p/ Trás (Peça)</span>
                        <span className={`font-bold ${rules.backwardCaptureMen ? 'text-emerald-600' : 'text-gray-400'}`}>{rules.backwardCaptureMen ? 'Sim' : 'Não'}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderAdminSettings = () => (
      <AdminPanel onBack={() => setScreen('menu')} />
  );

  const renderCustomization = () => (
      <div className="min-h-screen p-6 max-w-md mx-auto flex flex-col z-10 relative">
        <div className="flex items-center gap-4 mb-4">
            <button onClick={() => setScreen('menu')} className="p-2 bg-white rounded-full shadow hover:bg-gray-50"><ChevronLeft /></button>
            <h2 className="text-2xl font-bold text-gray-800">Customização</h2>
        </div>
        <div className="flex-1 overflow-y-auto space-y-8 pb-8">
            <section>
                <div className="flex items-center gap-2 mb-4 px-2">
                    <Activity className="text-emerald-600" size={20} />
                    <h3 className="text-lg font-bold text-emerald-800">Efeitos Visuais</h3>
                </div>
                <div className="px-2">
                    <button 
                        onClick={() => setEnableShake(!enableShake)}
                        className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${enableShake ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                    >
                        <div className="flex flex-col items-start">
                            <span className="font-bold text-gray-800 text-sm">Tremor da Tela</span>
                            <span className="text-xs text-gray-500">Agitar o tabuleiro ao capturar peças.</span>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${enableShake ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${enableShake ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </button>

                    <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-bold text-gray-700 px-1">Efeito de Captura</h4>
                        <div className="grid grid-cols-1 gap-2">
                            {CAPTURE_EFFECTS.map(effect => (
                                <button 
                                    key={effect.id} 
                                    onClick={() => setActiveCaptureEffect(effect.id)}
                                    className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${activeCaptureEffect === effect.id ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                                >
                                    <span className="text-2xl">{effect.icon}</span>
                                    <div className="flex flex-col items-start">
                                        <span className="font-bold text-gray-800 text-sm">{effect.name}</span>
                                        <span className="text-xs text-gray-500 text-left">{effect.description}</span>
                                    </div>
                                    {activeCaptureEffect === effect.id && <div className="ml-auto w-3 h-3 bg-emerald-500 rounded-full" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-bold text-emerald-800 mb-4 px-2">Temas do Tabuleiro</h3>
                <div className="grid grid-cols-2 gap-4">
                    {THEMES.map(theme => (
                        <button key={theme.id} onClick={() => setActiveThemeId(theme.id)} className={`relative p-4 rounded-2xl border-4 transition-all overflow-hidden h-32 ${activeThemeId === theme.id ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-transparent hover:shadow-lg'} ${theme.background}`}>
                            <div className="absolute top-2 left-2 font-bold text-gray-700 text-sm z-10">{theme.name}</div>
                            <div className="absolute -bottom-6 -right-6 w-24 h-24 transform rotate-12 shadow-xl rounded-lg overflow-hidden border-2 border-gray-800">
                                <div className="grid grid-cols-2 grid-rows-2 w-full h-full"><div className={theme.boardLight}></div><div className={`${theme.boardDark}`}></div><div className={`${theme.boardDark}`}></div><div className={theme.boardLight}></div></div>
                            </div>
                        </button>
                    ))}
                </div>
            </section>
        </div>
      </div>
  );

  const renderPieceSelection = () => (
      <PieceSelector 
          activeStyle={activePieceStyle} 
          onSelect={setActivePieceStyle} 
          onBack={() => setScreen('menu')} 
          theme={activeTheme} 
      />
  );
  
  if (screen === 'auth') return <Auth onLogin={handleLogin} />;
  if (screen === 'loading') return renderLoading();

  return (
    <div className={`min-h-screen transition-colors duration-1000 relative overflow-x-hidden`}>
      <Background theme={activeTheme} />
      <MusicPlayer />
      {screen === 'menu' && renderMenu()}
      {screen === 'difficulty_select' && renderDifficultySelect()}
      {screen === 'matchmaking' && renderMatchmaking()}
      {screen === 'game' && renderGame()}
      {screen === 'tutorial' && renderGame()}
      {screen === 'settings' && renderSettings()}
      {screen === 'customization' && renderCustomization()}
      {screen === 'piece_selection' && renderPieceSelection()}
      {screen === 'tournament_setup' && renderTournamentSetup()}
      {screen === 'tournament_bracket' && renderTournamentBracket()}
      {screen === 'admin_settings' && renderAdminSettings()}
      
      {showProfileEditor && currentUser && (
        <ProfileEditor 
          user={currentUser} 
          onSave={(updatedUser) => setCurrentUser(updatedUser)} 
          onClose={() => setShowProfileEditor(false)} 
        />
      )}
    </div>
  );
};

export default App;