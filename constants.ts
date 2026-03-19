import { Theme, GameRules, PieceStyleDef, TutorialStep } from './types';

// NOTE: BOARD_SIZE is now dynamic based on GameRules.
// Default to 8 for initial state if needed.

export const DEFAULT_RULES: GameRules = {
  id: 'brazilian',
  name: 'Damas Brasileiras',
  boardSize: 8,
  flyingKings: true,
  forceCapture: true,
  backwardCaptureMen: true,
  moveTimeLimit: 0,
};

export const RULE_VARIANTS: GameRules[] = [
    {
        id: 'brazilian',
        name: 'Damas Brasileiras (8x8)',
        boardSize: 8,
        flyingKings: true,
        forceCapture: true,
        backwardCaptureMen: true,
        moveTimeLimit: 0
    },
    {
        id: 'american',
        name: 'Damas Americanas (8x8)',
        boardSize: 8,
        flyingKings: false,
        forceCapture: true,
        backwardCaptureMen: false,
        moveTimeLimit: 0
    },
    {
        id: 'international',
        name: 'Internacional (10x10)',
        boardSize: 10,
        flyingKings: true,
        forceCapture: true,
        backwardCaptureMen: true,
        moveTimeLimit: 0
    },
    {
        id: 'canadian',
        name: 'Canadense (12x12)',
        boardSize: 12,
        flyingKings: true,
        forceCapture: true,
        backwardCaptureMen: true,
        moveTimeLimit: 0
    }
];

export const PIECE_STYLES: PieceStyleDef[] = [
    { id: 'mario', name: 'Super Bros' },
    { id: 'sonic', name: 'Velocidade Sônica' },
    { id: 'glossy', name: 'Botão Glossy' },
    { id: 'neon', name: 'Neon Cyber' },
    { id: 'mineral', name: 'Pedras Preciosas' },
    { id: 'tech', name: 'Alta Tecnologia' },
    { id: 'dragon', name: 'Lendário Dracônico' },
    { id: 'celestial', name: 'Anjos Celestiais' },
    { id: 'egyptian', name: 'Deuses do Egito' },
    { id: 'medieval', name: 'Cavaleiros de Aço' },
    { id: 'mythology', name: 'Mitologia Grega' },
    { id: 'classic', name: 'Clássico' },
    { id: 'traditional', name: 'Tradicional' },
    { id: 'minimal', name: 'Anel Minimalista' },
    { id: 'modern', name: 'Moderno' },
    { id: 'illustrated', name: 'Rúnico 2.5D' },
    { id: 'realistic', name: 'Realista (Madeira)' },
    { id: 'marble', name: 'Mármore Imperial' },
    { id: 'metal', name: 'Metal Industrial' },
    { id: 'glass', name: 'Cristal Arcano' },
];

export const THEMES: Theme[] = [
  {
    id: 'classic',
    name: 'Clássico Verde',
    boardDark: 'bg-emerald-700',
    boardLight: 'bg-emerald-200',
    pieceWhite: 'bg-stone-100 border-stone-300',
    pieceBlack: 'bg-stone-800 border-stone-600',
    background: 'bg-emerald-50'
  },
  {
    id: 'inferno',
    name: 'Covil do Dragão',
    boardDark: 'bg-red-950',
    boardLight: 'bg-orange-900',
    pieceWhite: 'bg-yellow-500 border-yellow-700',
    pieceBlack: 'bg-red-900 border-red-950',
    background: 'bg-slate-950'
  },
  {
    id: 'heaven',
    name: 'Reino Celestial',
    boardDark: 'bg-sky-600',
    boardLight: 'bg-sky-100',
    pieceWhite: 'bg-white border-yellow-200',
    pieceBlack: 'bg-slate-500 border-slate-700',
    background: 'bg-sky-50'
  },
  {
    id: 'egypt',
    name: 'Dunas do Faraó',
    boardDark: 'bg-blue-900', // Lapis Lazuli
    boardLight: 'bg-amber-200', // Sand
    pieceWhite: 'bg-amber-100 border-amber-300',
    pieceBlack: 'bg-slate-900 border-slate-950',
    background: 'bg-orange-50'
  },
  {
    id: 'castle',
    name: 'Fortaleza Medieval',
    boardDark: 'bg-slate-700',
    boardLight: 'bg-stone-300',
    pieceWhite: 'bg-stone-200 border-stone-400',
    pieceBlack: 'bg-slate-800 border-slate-900',
    background: 'bg-stone-200'
  },
  {
    id: 'olympus',
    name: 'Monte Olimpo',
    boardDark: 'bg-teal-800',
    boardLight: 'bg-slate-100', // Marble
    pieceWhite: 'bg-white border-slate-200',
    pieceBlack: 'bg-yellow-700 border-yellow-900', // Bronze
    background: 'bg-teal-50'
  },
  {
    id: 'wood',
    name: 'Madeira Nobre',
    boardDark: 'bg-[#5c4033]', // Dark Wood
    boardLight: 'bg-[#d2b48c]', // Tan
    pieceWhite: 'bg-[#f3e5ab] border-[#d2b48c]',
    pieceBlack: 'bg-[#3b2f2f] border-[#000]',
    background: 'bg-[#f5f5dc]'
  },
  {
    id: 'ocean',
    name: 'Oceano Profundo',
    boardDark: 'bg-blue-800',
    boardLight: 'bg-blue-200',
    pieceWhite: 'bg-white border-blue-200',
    pieceBlack: 'bg-slate-900 border-slate-700',
    background: 'bg-blue-50'
  },
  {
    id: 'purple',
    name: 'Neon Cyber',
    boardDark: 'bg-purple-900',
    boardLight: 'bg-fuchsia-200',
    pieceWhite: 'bg-fuchsia-50 border-fuchsia-300',
    pieceBlack: 'bg-purple-950 border-purple-700',
    background: 'bg-purple-50'
  },
  {
    id: 'fantasy-sky',
    name: 'Céu Fantástico',
    boardDark: 'bg-sky-950',
    boardLight: 'bg-amber-100',
    pieceWhite: 'bg-white border-yellow-200',
    pieceBlack: 'bg-slate-900 border-slate-700',
    background: 'bg-sky-900'
  }
];

export const EMOJI_LIST = [
    { category: 'Happy', icons: ['😄', '😂', '😎', '🤩'] },
    { category: 'Taunt', icons: ['😜', '🤡', '🥱', '👻'] },
    { category: 'Angry', icons: ['😤', '😠', '🤬', '🙄'] },
    { category: 'Sad', icons: ['😢', '😭', '🥺', '🏳️'] },
    { category: 'Game', icons: ['🤔', '🧠', '🔥', '👏'] },
];

export const CAPTURE_EFFECTS: CaptureEffectDef[] = [
    { id: 'none', name: 'Nenhum', icon: '🚫', description: 'Sem efeitos especiais.' },
    { id: 'lightning', name: 'Raio', icon: '⚡', description: 'Um raio atinge a peça capturada.' },
    { id: 'abduction', name: 'Abdução', icon: '🛸', description: 'Um feixe de luz abduz a peça.' },
    { id: 'ghost', name: 'Fantasma', icon: '👻', description: 'A peça vira um espírito e sobe.' },
    { id: 'explosion', name: 'Explosão', icon: '💥', description: 'A peça explode em partículas.' },
    { id: 'blackhole', name: 'Buraco Negro', icon: '⚫', description: 'A peça é sugada para o vazio.' },
    { id: 'tornado', name: 'Tornado', icon: '🌪️', description: 'A peça gira e voa para longe.' },
    { id: 'random', name: 'Aleatório', icon: '🎲', description: 'Um efeito surpresa a cada captura!' },
];

export const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 'basics',
        title: 'Movimento Básico',
        description: 'Bem-vindo! O objetivo é capturar todas as peças inimigas. Comece movendo sua peça branca uma casa na diagonal para a frente.',
        boardSetup: [
            { row: 5, col: 2, piece: { player: 'white', isKing: false } },
            { row: 2, col: 5, piece: { player: 'black', isKing: false } } // Distant enemy
        ],
        requiredMoves: [
            { from: { row: 5, col: 2 }, to: { row: 4, col: 3 } }
        ]
    },
    {
        id: 'capture',
        title: 'Captura',
        description: 'Você pode capturar peças inimigas "pulando" sobre elas. A captura é OBRIGATÓRIA! Capture a peça preta.',
        boardSetup: [
            { row: 4, col: 3, piece: { player: 'white', isKing: false } },
            { row: 3, col: 4, piece: { player: 'black', isKing: false } }
        ],
        requiredMoves: [
            { from: { row: 4, col: 3 }, to: { row: 2, col: 5 } }
        ]
    },
    {
        id: 'combo',
        title: 'Captura em Cadeia',
        description: 'Se após capturar você cair em posição de nova captura, deve continuar! Execute uma captura dupla.',
        boardSetup: [
            { row: 6, col: 1, piece: { player: 'white', isKing: false } },
            { row: 5, col: 2, piece: { player: 'black', isKing: false } },
            { row: 3, col: 4, piece: { player: 'black', isKing: false } }
        ],
        requiredMoves: [
            { from: { row: 6, col: 1 }, to: { row: 4, col: 3 } }, // First jump
            { from: { row: 4, col: 3 }, to: { row: 2, col: 5 } }  // Second jump
        ]
    },
    {
        id: 'promotion',
        title: 'Coroação',
        description: 'Ao chegar na última linha do tabuleiro, sua peça vira uma DAMA (Rei). Damas podem mover-se para trás.',
        boardSetup: [
            { row: 1, col: 6, piece: { player: 'white', isKing: false } }
        ],
        requiredMoves: [
            { from: { row: 1, col: 6 }, to: { row: 0, col: 7 } }
        ]
    },
    {
        id: 'flying_king',
        title: 'Dama Voadora',
        description: 'Nas regras brasileiras, a Dama "voa"! Ela pode mover-se várias casas e capturar à distância. Capture a peça distante.',
        boardSetup: [
            { row: 7, col: 0, piece: { player: 'white', isKing: true } },
            { row: 4, col: 3, piece: { player: 'black', isKing: false } }
        ],
        requiredMoves: [
            { from: { row: 7, col: 0 }, to: { row: 2, col: 5 } }
        ]
    }
];