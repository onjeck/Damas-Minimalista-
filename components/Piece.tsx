import React from 'react';
import { Piece as PieceType, Theme, PieceStyle } from '../types';
import { Shield, Skull, Hexagon, CircleDashed, Flame, Feather, Eye, Sword, Zap, Anchor, Cpu, Gem, Activity } from 'lucide-react';
import { useAppConfig } from '../configContext';

interface PieceProps {
  piece: PieceType;
  theme: Theme;
  isSelected: boolean;
  onClick?: () => void;
  viewMode: '2d' | '3d';
  style?: PieceStyle;
}

// Custom Crown Component with Light Trace Effect
const CrownIcon = ({ className, size = 24, strokeWidth = 2, isWhite }: { className?: string, size?: number, strokeWidth?: number, isWhite: boolean }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Base Shape */}
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      <path d="M5 20h14" />
      
      {/* Light Trace Effect */}
      <path 
        d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z" 
        className="animate-crown-trace opacity-100"
        stroke={isWhite ? "#fef08a" : "#fca5a5"} /* Yellow-200 for white king, Red-200 for black king */
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray="4 80" /* Short dash (point of light), long gap */
        strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 0 2px white)' }}
      />
    </svg>
  );
};

const Piece: React.FC<PieceProps> = ({ piece, theme, isSelected, onClick, viewMode, style = 'classic' }) => {
  const { config } = useAppConfig();
  const isWhite = piece.player === 'white';
  const kingColor = isWhite ? 'text-yellow-600' : 'text-yellow-400';
  
  // -- Material Definition (Colors & Gradients) --
  
  let topFaceClass = '';
  let sideGradient = ''; 
  let rimColor = ''; 
  let customStyle: React.CSSProperties = {};
  
  // 1. Determine Base Colors from Theme (Fallback)
  const themeBaseWhite = theme.id === 'wood' ? '#E3C8AA' : theme.id === 'ocean' ? '#e0f2fe' : '#f5f5f4';
  const themeBaseBlack = theme.id === 'wood' ? '#5e2222' : theme.id === 'ocean' ? '#0f172a' : '#1c1917';
  
  // 2. Specific Style Overrides
  const customSkin = config.pieces.skins.find(s => s.id === config.pieces.activeSkinId) || config.pieces.skins.find(s => s.id === style);
  
  if (customSkin && ((isWhite && customSkin.redUrl) || (!isWhite && customSkin.blueUrl))) {
      let url = isWhite ? customSkin.redUrl : customSkin.blueUrl;
      if (piece.isKing) {
          url = isWhite ? (customSkin.redKingUrl || customSkin.redUrl) : (customSkin.blueKingUrl || customSkin.blueUrl);
      }
      topFaceClass = 'border-2 border-gray-400';
      sideGradient = `linear-gradient(135deg, #ffffff 0%, ${isWhite ? themeBaseWhite : themeBaseBlack} 40%, #000000 100%)`;
      rimColor = isWhite ? '#ffffff' : '#78716c';
      customStyle = { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  } else {
      switch (style) {
    case 'mario':
        if (isWhite) {
            topFaceClass = 'bg-red-600 border-4 border-red-800';
            sideGradient = 'linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #7f1d1d 100%)';
            rimColor = '#fca5a5';
        } else {
            topFaceClass = 'bg-blue-600 border-4 border-blue-800';
            sideGradient = 'linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #1e3a8a 100%)';
            rimColor = '#93c5fd';
        }
        break;
    
    case 'sonic':
        if (isWhite) {
            // Sonic Blue
            topFaceClass = 'bg-blue-500 border-4 border-blue-700';
            sideGradient = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e3a8a 100%)';
            rimColor = '#60a5fa';
        } else {
            // Gold Ring
            topFaceClass = 'bg-yellow-400 border-4 border-yellow-600';
            sideGradient = 'linear-gradient(135deg, #facc15 0%, #ca8a04 50%, #854d0e 100%)';
            rimColor = '#fde047';
        }
        break;

    case 'glossy':
        if (isWhite) { // Red Glossy
            topFaceClass = 'bg-gradient-to-br from-red-400 to-red-600 border-red-500';
            sideGradient = 'linear-gradient(135deg, #f87171 0%, #dc2626 50%, #991b1b 100%)';
            rimColor = '#fca5a5';
        } else { // Blue Glossy (Like Image)
            topFaceClass = 'bg-gradient-to-br from-cyan-400 to-blue-600 border-cyan-500';
            sideGradient = 'linear-gradient(135deg, #22d3ee 0%, #0284c7 50%, #0c4a6e 100%)';
            rimColor = '#7dd3fc';
        }
        break;

    case 'neon':
        if (isWhite) { // Neon Pink
            topFaceClass = 'bg-fuchsia-500 border-fuchsia-400 shadow-[0_0_15px_#d946ef]';
            sideGradient = 'linear-gradient(135deg, #f0abfc 0%, #d946ef 50%, #a21caf 100%)';
            rimColor = '#f5d0fe';
        } else { // Neon Green
            topFaceClass = 'bg-lime-500 border-lime-400 shadow-[0_0_15px_#84cc16]';
            sideGradient = 'linear-gradient(135deg, #bef264 0%, #84cc16 50%, #3f6212 100%)';
            rimColor = '#d9f99d';
        }
        break;

    case 'mineral':
        if (isWhite) { // Ruby
            topFaceClass = 'bg-rose-600 border-rose-400';
            sideGradient = 'linear-gradient(135deg, #fb7185 0%, #e11d48 50%, #881337 100%)';
            rimColor = '#fda4af';
        } else { // Emerald
            topFaceClass = 'bg-emerald-600 border-emerald-400';
            sideGradient = 'linear-gradient(135deg, #34d399 0%, #059669 50%, #064e3b 100%)';
            rimColor = '#6ee7b7';
        }
        break;

    case 'tech':
        if (isWhite) { // Cyber White/Cyan
            topFaceClass = 'bg-slate-100 border-cyan-400';
            sideGradient = 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 50%, #64748b 100%)';
            rimColor = '#22d3ee';
        } else { // Cyber Black/Orange
            topFaceClass = 'bg-slate-900 border-orange-500';
            sideGradient = 'linear-gradient(135deg, #334155 0%, #0f172a 50%, #020617 100%)';
            rimColor = '#f97316';
        }
        break;

    case 'celestial': // Angels
        if (isWhite) { // Light / Divine
             topFaceClass = 'bg-gradient-to-br from-white via-sky-100 to-sky-200 border-sky-100';
             sideGradient = 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 50%, #bae6fd 100%)';
             rimColor = '#ffffff';
        } else { // Fallen / Dark Angel
             topFaceClass = 'bg-gradient-to-br from-slate-600 via-slate-800 to-slate-900 border-slate-500';
             sideGradient = 'linear-gradient(135deg, #64748b 0%, #334155 50%, #0f172a 100%)';
             rimColor = '#94a3b8';
        }
        break;

    case 'egyptian': // Pharaohs
        if (isWhite) { // Gold / Sand
             topFaceClass = 'bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 border-amber-300';
             sideGradient = 'linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #d97706 100%)';
             rimColor = '#fef3c7';
        } else { // Lapis Lazuli / Onyx
             topFaceClass = 'bg-gradient-to-br from-blue-700 via-blue-900 to-black border-blue-600';
             sideGradient = 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 50%, #000000 100%)';
             rimColor = '#3b82f6';
        }
        break;

    case 'medieval': // Knights
        if (isWhite) { // Polished Steel
             topFaceClass = 'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 border-gray-300';
             sideGradient = 'linear-gradient(135deg, #f3f4f6 0%, #9ca3af 50%, #4b5563 100%)';
             rimColor = '#e5e7eb';
        } else { // Black Iron
             topFaceClass = 'bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-950 border-zinc-600';
             sideGradient = 'linear-gradient(135deg, #52525b 0%, #27272a 50%, #09090b 100%)';
             rimColor = '#71717a';
        }
        break;

    case 'mythology': // Greek
        if (isWhite) { // Marble
             topFaceClass = 'bg-slate-100 border-slate-200 bg-[url("https://www.transparenttextures.com/patterns/white-diamond.png")]';
             sideGradient = 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 50%, #94a3b8 100%)';
             rimColor = '#ffffff';
        } else { // Bronze
             topFaceClass = 'bg-gradient-to-br from-orange-200 via-orange-800 to-orange-950 border-orange-800';
             sideGradient = 'linear-gradient(135deg, #fdba74 0%, #c2410c 50%, #431407 100%)';
             rimColor = '#ffedd5';
        }
        break;

    case 'dragon':
        if (isWhite) { // Gold / Light Dragon
            topFaceClass = 'bg-gradient-to-br from-yellow-300 via-amber-500 to-amber-700 border-amber-300';
            sideGradient = 'linear-gradient(135deg, #fcd34d 0%, #b45309 50%, #78350f 100%)';
            rimColor = '#fef08a';
        } else { // Red / Dark Dragon
            topFaceClass = 'bg-gradient-to-br from-red-600 via-red-900 to-black border-red-500';
            sideGradient = 'linear-gradient(135deg, #ef4444 0%, #7f1d1d 50%, #450a0a 100%)';
            rimColor = '#fca5a5';
        }
        break;

    case 'realistic': // Wood
        if (isWhite) {
            topFaceClass = 'bg-[url("https://www.transparenttextures.com/patterns/wood-pattern.png")] bg-[#E3C8AA] border-[#C2A88A]';
            sideGradient = 'linear-gradient(135deg, #EAD4BA 0%, #C2A88A 50%, #8C7558 100%)';
            rimColor = '#F5E6D3';
        } else {
            topFaceClass = 'bg-[url("https://www.transparenttextures.com/patterns/wood-pattern.png")] bg-[#7c2d2d] border-[#5a1e1e]';
            sideGradient = 'linear-gradient(135deg, #9C4545 0%, #5e2222 50%, #2b0f0f 100%)';
            rimColor = '#B85C5C';
        }
        break;

    case 'marble':
        if (isWhite) {
            topFaceClass = 'bg-gray-100 border-gray-300';
            sideGradient = 'linear-gradient(135deg, #ffffff 0%, #d1d5db 50%, #9ca3af 100%)';
            rimColor = '#ffffff';
        } else {
            topFaceClass = 'bg-gray-900 border-black';
            sideGradient = 'linear-gradient(135deg, #4b5563 0%, #1f2937 50%, #000000 100%)';
            rimColor = '#6b7280';
        }
        break;

    case 'metal':
        if (isWhite) { // Steel
            topFaceClass = 'bg-slate-200 border-slate-400';
            sideGradient = 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 40%, #475569 100%)';
            rimColor = '#e2e8f0';
        } else { // Bronze/Copper
            topFaceClass = 'bg-orange-950 border-orange-900';
            sideGradient = 'linear-gradient(135deg, #c2410c 0%, #7c2d12 40%, #431407 100%)';
            rimColor = '#ea580c';
        }
        break;

    case 'glass':
        if (isWhite) { // Cyan Glass
            topFaceClass = 'bg-cyan-100/40 border-cyan-200/40 backdrop-blur-sm';
            sideGradient = 'linear-gradient(135deg, rgba(165,243,252,0.6) 0%, rgba(34,211,238,0.3) 50%, rgba(8,145,178,0.6) 100%)';
            rimColor = 'rgba(255,255,255,0.8)';
        } else { // Violet Glass
            topFaceClass = 'bg-violet-900/60 border-violet-700/40 backdrop-blur-sm';
            sideGradient = 'linear-gradient(135deg, rgba(167,139,250,0.6) 0%, rgba(109,40,217,0.4) 50%, rgba(76,29,149,0.8) 100%)';
            rimColor = 'rgba(216,180,254,0.6)';
        }
        break;
        
    case 'minimal':
        if (isWhite) {
             topFaceClass = 'bg-stone-100 border-stone-300';
             sideGradient = 'linear-gradient(135deg, #f5f5f4 0%, #d6d3d1 100%)';
        } else {
             topFaceClass = 'bg-stone-800 border-stone-600';
             sideGradient = 'linear-gradient(135deg, #57534e 0%, #1c1917 100%)';
        }
        rimColor = 'transparent';
        break;

    default: // Classic & Others
        if (isWhite) {
            topFaceClass = `${theme.pieceWhite}`;
            sideGradient = `linear-gradient(135deg, #ffffff 0%, ${themeBaseWhite} 40%, #a8a29e 100%)`;
            rimColor = '#ffffff';
        } else {
            topFaceClass = `${theme.pieceBlack}`;
            sideGradient = `linear-gradient(135deg, #57534e 0%, ${themeBaseBlack} 40%, #000000 100%)`;
            rimColor = '#78716c';
        }
        break;
  }
  }

  // -- Content Renderer (Top Face Details) --
  const renderFaceContent = () => {
      switch (style) {
          case 'mario':
              // White = Mario (Red) | Black = Blue (Blue)
              const hatColor = isWhite ? '#ef4444' : '#3b82f6'; 
              const hatStroke = isWhite ? '#b91c1c' : '#1d4ed8';
              const badgeLetter = isWhite ? 'M' : 'L';
              
              return (
                <div className={`w-full h-full rounded-full flex items-center justify-center relative overflow-hidden ${isWhite ? 'bg-red-600' : 'bg-blue-600'}`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,white_2px,transparent_2px)] bg-[size:10px_10px]"></div>
                    
                    {/* Character Face SVG Construction */}
                    <div className="relative z-10 w-[80%] h-[80%] drop-shadow-lg">
                         <svg viewBox="0 0 100 100" className="w-full h-full">
                            {/* Skin / Ears */}
                            <circle cx="20" cy="55" r="10" fill="#fca5a5" /> {/* Left Ear */}
                            <circle cx="80" cy="55" r="10" fill="#fca5a5" /> {/* Right Ear */}
                            <circle cx="50" cy="50" r="30" fill="#fcd34d" /> {/* Face Base (Yellowish skin tone) */}
                            
                            {/* Hat Back */}
                            <path d="M 20 50 Q 50 10 80 50" fill={hatColor} stroke={hatStroke} strokeWidth="3" />
                            
                            {/* Hat Visor */}
                            <path d="M 15 50 Q 50 20 85 50 L 85 55 Q 50 35 15 55 Z" fill={hatColor} stroke={hatStroke} strokeWidth="1" />
                            
                            {/* Badge */}
                            <circle cx="50" cy="38" r="10" fill="white" />
                            <text x="50" y="42" textAnchor="middle" fontSize="14" fill={hatColor} fontWeight="bold" fontFamily="Arial">{badgeLetter}</text>
                            
                            {/* Eyes */}
                            <ellipse cx="40" cy="55" rx="3" ry="5" fill="black" />
                            <ellipse cx="60" cy="55" rx="3" ry="5" fill="black" />
                            
                            {/* Nose */}
                            <ellipse cx="50" cy="62" rx="7" ry="5" fill="#fca5a5" />
                            
                            {/* Moustache */}
                            <path d="M 35 68 Q 50 60 65 68 Q 75 72 65 75 Q 50 70 35 75 Q 25 72 35 68" fill="#1f2937" />
                            
                            {/* Sideburns */}
                             <path d="M 25 55 L 25 65 L 30 60 Z" fill="#4b5563" />
                             <path d="M 75 55 L 75 65 L 70 60 Z" fill="#4b5563" />
                         </svg>
                    </div>

                    {/* King Effect: Crown */}
                    {piece.isKing && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 animate-spin-slow">
                            <CrownIcon size={32} className="text-yellow-400 fill-yellow-200 drop-shadow-[0_0_5px_rgba(255,255,0,0.8)] animate-pulse" strokeWidth={2} isWhite={isWhite} />
                        </div>
                    )}
                </div>
              );

          case 'sonic':
              // White = Sonic (Blue) | Black = Shadow (Black/Red)
              const mainColor = isWhite ? '#3b82f6' : '#1f2937'; // Blue-500 vs Gray-800
              const skinColor = '#fde68a'; // Amber-200
              const eyeColor = isWhite ? '#22c55e' : '#ef4444'; // Green vs Red
              
              return (
                <div className={`w-full h-full rounded-full flex items-center justify-center relative overflow-hidden ${isWhite ? 'bg-blue-500' : 'bg-yellow-400'}`}>
                    {/* Ring Shine */}
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/60 to-transparent pointer-events-none" />
                    
                    {/* Character Face SVG Construction */}
                    <div className="relative z-10 w-[85%] h-[85%] drop-shadow-lg">
                         <svg viewBox="0 0 100 100" className="w-full h-full">
                            {/* Spikes / Head Base */}
                            <path d="M 20 60 Q 10 30 50 10 Q 90 30 80 60" fill={mainColor} />
                            <path d="M 20 60 L 10 70 L 25 65" fill={mainColor} /> {/* Left Spike */}
                            <path d="M 80 60 L 90 70 L 75 65" fill={mainColor} /> {/* Right Spike */}
                            <path d="M 50 10 L 50 5 L 55 10" fill={mainColor} /> {/* Top Spike */}
                            
                            {/* Muzzle */}
                            <path d="M 30 60 Q 50 50 70 60 Q 75 75 50 80 Q 25 75 30 60" fill={skinColor} />
                            
                            {/* Eyes Base (White) */}
                            <path d="M 35 55 Q 50 40 65 55 Q 60 65 50 60 Q 40 65 35 55" fill="white" />
                            
                            {/* Pupils (Green/Red) */}
                            <ellipse cx="45" cy="55" rx="3" ry="5" fill={eyeColor} />
                            <ellipse cx="55" cy="55" rx="3" ry="5" fill={eyeColor} />
                            <circle cx="46" cy="53" r="1" fill="white" />
                            <circle cx="56" cy="53" r="1" fill="white" />
                            
                            {/* Nose */}
                            <circle cx="50" cy="62" r="3" fill="black" />
                            
                            {/* Mouth */}
                            <path d="M 45 70 Q 50 73 55 70" fill="none" stroke="black" strokeWidth="1" />
                            
                            {/* Ears */}
                            <path d="M 25 35 L 35 25 L 40 40 Z" fill={mainColor} />
                            <path d="M 30 32 L 35 28 L 38 35 Z" fill={skinColor} />
                            
                            <path d="M 75 35 L 65 25 L 60 40 Z" fill={mainColor} />
                            <path d="M 70 32 L 65 28 L 62 35 Z" fill={skinColor} />
                         </svg>
                    </div>

                    {/* King Effect: Crown */}
                    {piece.isKing && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 animate-spin-slow">
                            <CrownIcon size={32} className="text-yellow-400 fill-yellow-200 drop-shadow-[0_0_5px_rgba(255,255,0,0.8)] animate-pulse" strokeWidth={2} isWhite={isWhite} />
                        </div>
                    )}
                </div>
              );

          case 'neon':
              return (
                  <div className={`w-full h-full rounded-full flex items-center justify-center relative overflow-hidden border-[3px] ${isWhite ? 'border-fuchsia-300 bg-fuchsia-900' : 'border-lime-300 bg-lime-900'} shadow-[inset_0_0_10px_currentColor]`}>
                      <div className={`absolute inset-0 opacity-30 ${isWhite ? 'bg-fuchsia-500' : 'bg-lime-500'} blur-md animate-pulse`} />
                      <div className="relative z-10 drop-shadow-[0_0_5px_currentColor]">
                          {piece.isKing ? (
                              <CrownIcon size={24} className={isWhite ? 'text-fuchsia-200' : 'text-lime-200'} strokeWidth={2.5} isWhite={isWhite} />
                          ) : (
                              isWhite ? <Zap size={24} className="text-fuchsia-400 fill-fuchsia-200" strokeWidth={2.5} /> : <Activity size={24} className="text-lime-400" strokeWidth={2.5} />
                          )}
                      </div>
                  </div>
              );

          case 'mineral':
              return (
                  <div className={`w-full h-full rounded-full flex items-center justify-center relative overflow-hidden 
                      ${isWhite ? 'bg-rose-500' : 'bg-emerald-500'}
                      shadow-[inset_0_-4px_6px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.6)]
                  `}>
                      {/* Facets */}
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_40%,rgba(255,255,255,0.4)_45%,transparent_50%)]" />
                      <div className="absolute inset-0 bg-[linear-gradient(-45deg,transparent_40%,rgba(255,255,255,0.2)_45%,transparent_50%)]" />
                      
                      <div className="relative z-10 drop-shadow-md">
                          {piece.isKing ? (
                              <CrownIcon size={24} className="text-white drop-shadow-sm" strokeWidth={2.5} isWhite={isWhite} />
                          ) : (
                              isWhite ? <Gem size={22} className="text-rose-100 fill-rose-200/50" strokeWidth={2} /> : <Hexagon size={22} className="text-emerald-100 fill-emerald-200/50" strokeWidth={2} />
                          )}
                      </div>
                  </div>
              );

          case 'tech':
              return (
                  <div className={`w-full h-full rounded-full flex items-center justify-center relative overflow-hidden 
                      ${isWhite ? 'bg-slate-100' : 'bg-slate-900'}
                      border-2 ${isWhite ? 'border-cyan-500' : 'border-orange-500'}
                  `}>
                      {/* Circuit Pattern */}
                      <div className={`absolute inset-0 opacity-20`} 
                           style={{backgroundImage: `radial-gradient(${isWhite ? '#06b6d4' : '#f97316'} 1px, transparent 1px)`, backgroundSize: '4px 4px'}} 
                      />
                      <div className={`absolute inset-0 border-4 border-double ${isWhite ? 'border-cyan-200' : 'border-orange-900'} rounded-full`} />
                      
                      <div className="relative z-10 drop-shadow-[0_0_5px_currentColor]">
                          {piece.isKing ? (
                              <CrownIcon size={24} className={isWhite ? 'text-cyan-600' : 'text-orange-500'} strokeWidth={2.5} isWhite={isWhite} />
                          ) : (
                              <Cpu size={24} className={isWhite ? 'text-cyan-500' : 'text-orange-500'} strokeWidth={2} />
                          )}
                      </div>
                  </div>
              );

          case 'celestial':
               return (
                  <div className={`w-full h-full rounded-full flex flex-col items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/20" style={{backgroundImage: 'radial-gradient(circle, white 2px, transparent 3px)', backgroundSize: '15px 15px'}}></div>
                      <div className="relative z-10 drop-shadow-md">
                        {piece.isKing ? (
                             <CrownIcon size={28} className={isWhite ? 'text-yellow-400 fill-yellow-200' : 'text-slate-200 fill-slate-400'} strokeWidth={2.5} isWhite={isWhite} />
                        ) : (
                             <Feather size={24} className={isWhite ? 'text-sky-400' : 'text-slate-400'} strokeWidth={2.5} />
                        )}
                      </div>
                      {isWhite && <div className="absolute inset-0 bg-gradient-to-t from-sky-300/20 to-transparent pointer-events-none" />}
                  </div>
               );
          
          case 'egyptian':
              return (
                  <div className={`w-full h-full rounded-full flex flex-col items-center justify-center relative overflow-hidden`}>
                      {/* Hieroglyph pattern hint */}
                      <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #000 5px, #000 6px)'}} />
                      <div className="absolute inset-1 border rounded-full border-black/10"></div>
                      <div className="relative z-10 drop-shadow-md">
                        {piece.isKing ? (
                             <CrownIcon size={26} className={isWhite ? 'text-amber-800 fill-amber-500' : 'text-blue-200 fill-blue-500'} strokeWidth={2} isWhite={isWhite} />
                        ) : (
                             isWhite ? <Eye size={24} className="text-amber-700" strokeWidth={2.5} /> : <Eye size={24} className="text-blue-300" strokeWidth={2.5} />
                        )}
                      </div>
                  </div>
              );

          case 'medieval':
              return (
                  <div className={`w-full h-full rounded-full flex flex-col items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]" />
                      <div className="absolute inset-1 border-2 border-dashed border-black/20 rounded-full"></div>
                      <div className="relative z-10 drop-shadow-sm">
                        {piece.isKing ? (
                            <CrownIcon size={26} className={isWhite ? 'text-yellow-600 fill-yellow-400/50' : 'text-red-700 fill-red-900/50'} strokeWidth={2.5} isWhite={isWhite} />
                        ) : (
                             isWhite ? <Shield size={22} className="text-gray-600 fill-gray-200" strokeWidth={2.5} /> : <Sword size={22} className="text-zinc-400 fill-zinc-900" strokeWidth={2.5} />
                        )}
                      </div>
                  </div>
              );

          case 'mythology':
              return (
                  <div className={`w-full h-full rounded-full flex flex-col items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cracked-concrete.png')]" />
                      <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.2)] rounded-full"></div>
                      <div className="relative z-10 drop-shadow-md">
                        {piece.isKing ? (
                             <CrownIcon size={28} className={isWhite ? 'text-slate-400 fill-slate-200' : 'text-orange-200 fill-orange-500'} strokeWidth={2} isWhite={isWhite} />
                        ) : (
                             isWhite ? <Zap size={24} className="text-yellow-500 fill-yellow-200" strokeWidth={2.5} /> : <Anchor size={24} className="text-orange-300 fill-orange-900" strokeWidth={2.5} />
                        )}
                      </div>
                  </div>
              );

          case 'dragon':
              return (
                  <div className={`w-full h-full rounded-full flex flex-col items-center justify-center relative overflow-hidden group`}>
                      {/* Scales Pattern */}
                      <div className="absolute inset-0 opacity-30 mix-blend-overlay" 
                           style={{ 
                               backgroundImage: `radial-gradient(circle at 50% 100%, #000 10%, transparent 11%), radial-gradient(circle at 50% 0%, #000 10%, transparent 11%)`,
                               backgroundSize: '8px 8px',
                               backgroundPosition: '0 0, 4px 4px'
                           }} 
                      />
                      
                      {/* Inner Rim / Glow */}
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-t ${isWhite ? 'from-amber-600/0 via-amber-400/20 to-yellow-200/40' : 'from-red-900/0 via-red-600/20 to-orange-500/30'}`} />

                      {/* Animated Flame Background (Subtle) */}
                      <div className={`absolute bottom-0 w-full h-1/2 blur-md opacity-40 animate-pulse ${isWhite ? 'bg-yellow-400' : 'bg-red-600'}`} />
                      
                      {/* Icon */}
                      <div className="relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                        {piece.isKing ? (
                            <div className="relative">
                                <CrownIcon size={28} className={`${isWhite ? 'text-yellow-50' : 'text-orange-100'} drop-shadow-md`} strokeWidth={2.5} isWhite={isWhite} />
                                {/* King's aura */}
                                <div className={`absolute inset-0 blur-sm ${isWhite ? 'bg-yellow-300' : 'bg-red-500'} opacity-60 -z-10 animate-pulse`} />
                            </div>
                        ) : (
                            <div className="relative">
                                <Flame size={24} className={`${isWhite ? 'text-yellow-100 fill-yellow-200' : 'text-orange-100 fill-orange-500'} drop-shadow-sm`} strokeWidth={2.5} />
                                {/* Flame core glow */}
                                <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 ${isWhite ? 'bg-yellow-400' : 'bg-orange-500'} blur-md opacity-60 -z-10 animate-pulse`} />
                            </div>
                        )}
                      </div>
                  </div>
              );

          case 'marble':
              return (
                  <div className={`w-full h-full rounded-full flex flex-col items-center justify-center 
                      shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.4)]
                      overflow-hidden relative
                  `}>
                      <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/white-diamond-dark.png')] mix-blend-overlay pointer-events-none scale-150" />
                      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/30 to-transparent pointer-events-none" />
                      <div className={`w-[75%] h-[75%] rounded-full border-4 flex items-center justify-center relative z-10
                          ${isWhite ? 'border-gray-300/50 bg-white/20' : 'border-gray-700/50 bg-black/20'}
                          shadow-inner
                      `}>
                          {piece.isKing ? (
                             <CrownIcon size={24} className={isWhite ? 'text-gray-400 drop-shadow-sm' : 'text-gray-500 drop-shadow-sm'} strokeWidth={2} isWhite={isWhite} />
                          ) : (
                             <div className={`w-3 h-3 rounded-full ${isWhite ? 'bg-gray-300' : 'bg-gray-700'} shadow-sm`} />
                          )}
                      </div>
                  </div>
              );

          case 'metal':
              return (
                  <div className={`w-full h-full rounded-full flex flex-col items-center justify-center 
                      shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_-2px_5px_rgba(0,0,0,0.7)]
                      relative overflow-hidden
                  `}>
                       <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(255,255,255,0.1)_90deg,transparent_180deg,rgba(0,0,0,0.1)_270deg)] opacity-50" />
                       <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" />
                       <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" />
                       <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-black/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" />
                       <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-black/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" />
                       <div className={`w-[60%] h-[60%] rounded-full flex items-center justify-center relative z-10
                          shadow-[0_1px_1px_rgba(255,255,255,0.2),inset_0_2px_4px_rgba(0,0,0,0.8)]
                          ${isWhite ? 'bg-slate-300' : 'bg-[#5c2815]'}
                          border ${isWhite ? 'border-slate-400' : 'border-[#7c3a1d]'}
                       `}>
                          {piece.isKing ? (
                              <CrownIcon size={24} className={`${isWhite ? 'text-blue-300' : 'text-amber-500'} drop-shadow-[0_0_5px_currentColor]`} strokeWidth={2.5} isWhite={isWhite} />
                          ) : (
                              <CircleDashed size={20} className="opacity-40 mix-blend-multiply" />
                          )}
                       </div>
                  </div>
              );

          case 'glass':
              return (
                  <div className="w-full h-full rounded-full flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-white/40 to-transparent skew-y-12 origin-top-left" />
                      <div className={`w-[55%] h-[55%] rounded-full flex items-center justify-center
                          shadow-[0_0_20px_rgba(var(--color),0.6),inset_0_0_10px_rgba(255,255,255,0.2)]
                          ${isWhite ? 'bg-cyan-400/10 shadow-cyan-400/60' : 'bg-violet-500/20 shadow-violet-500/60'}
                          border ${isWhite ? 'border-cyan-200/60' : 'border-violet-300/40'}
                          backdrop-filter backdrop-blur-md
                      `}>
                          {piece.isKing && (
                              <CrownIcon size={20} className={`${isWhite ? 'text-cyan-100' : 'text-fuchsia-200'} drop-shadow-[0_0_4px_white] animate-pulse`} strokeWidth={2} isWhite={isWhite} />
                          )}
                      </div>
                  </div>
              );

          case 'realistic':
               return (
                  <div className={`w-full h-full rounded-full flex flex-col items-center justify-center 
                      shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-2px_6px_rgba(0,0,0,0.6)]
                      ${isWhite ? 'bg-[#E3C8AA]' : 'bg-[#6F2828]'}
                  `}>
                      <div className="absolute inset-0 rounded-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-multiply pointer-events-none" />
                      <div className={`w-[90%] h-[90%] rounded-full flex items-center justify-center relative
                          shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_1px_rgba(255,255,255,0.3)]
                          ${isWhite ? 'bg-[#D4B99B]' : 'bg-[#5e2222]'}
                      `}>
                          <div className={`w-[80%] h-[80%] rounded-full flex items-center justify-center
                              shadow-[inset_0_4px_8px_rgba(0,0,0,0.6),inset_0_-1px_1px_rgba(255,255,255,0.15)]
                              border border-black/10
                              ${isWhite ? 'bg-[#C2A88A]' : 'bg-[#4a1a1a]'}
                          `}>
                              {piece.isKing && (
                                  <div className="relative drop-shadow-lg">
                                      <CrownIcon 
                                        size={28} 
                                        className="text-yellow-400 fill-yellow-500/80 drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]" 
                                        strokeWidth={2}
                                        isWhite={isWhite}
                                      />
                                      <div className="absolute top-1 left-1 w-2 h-2 bg-white/60 blur-[1px] rounded-full pointer-events-none" />
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              );

          case 'illustrated':
              return (
                  <div className={`w-full h-full rounded-full flex flex-col items-center justify-center 
                      ${isWhite 
                          ? 'bg-gradient-to-b from-amber-50 to-amber-100' 
                          : 'bg-gradient-to-b from-slate-700 to-slate-800'}
                      shadow-inner border border-white/10
                  `}>
                      <div className={`rounded-full p-1.5 border-2 ${isWhite ? 'border-amber-200/50 bg-amber-500/10' : 'border-slate-600/50 bg-black/20'}`}>
                          {piece.isKing ? (
                              <CrownIcon size={26} className="text-yellow-500 fill-yellow-500 drop-shadow-sm" strokeWidth={2.5} isWhite={isWhite} />
                          ) : (
                              isWhite ? (
                                  <Shield size={22} className="text-amber-600/70" strokeWidth={2.5} />
                              ) : (
                                  <Skull size={22} className="text-slate-400/70" strokeWidth={2.5} />
                              )
                          )}
                      </div>
                  </div>
              );
          case 'minimal':
              return (
                <div className={`w-full h-full rounded-full border-[6px] ${isWhite ? 'border-stone-400' : 'border-stone-700'} flex items-center justify-center shadow-md bg-white/5`}>
                    {piece.isKing && <CrownIcon size={20} className={kingColor} strokeWidth={3} isWhite={isWhite} />}
                </div>
              );
          case 'modern':
              return (
                  <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-white/40 to-black/10 shadow-inner">
                      {piece.isKing && <CrownIcon size={24} className={`${kingColor} drop-shadow-md`} strokeWidth={3} isWhite={isWhite} />}
                  </div>
              );
          case 'traditional':
              return (
                  <div className={`w-full h-full rounded-full flex items-center justify-center
                    shadow-[inset_0_0_0_2px_rgba(0,0,0,0.2),inset_0_0_0_5px_rgba(255,255,255,0.1)]
                  `}>
                      <div className="w-1/2 h-1/2 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-black/10 flex items-center justify-center bg-black/10">
                         {piece.isKing && <CrownIcon size={18} className={kingColor} strokeWidth={3} isWhite={isWhite} />}
                      </div>
                  </div>
              );
          case 'classic':
          default:
              return (
                <div className="w-2/3 h-2/3 rounded-full border-2 border-black/10 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                    {piece.isKing && (
                    <CrownIcon size={24} className={`${kingColor} drop-shadow-md`} strokeWidth={3} isWhite={isWhite} />
                    )}
                </div>
              );
      }
  };

  // --- 2D RENDER ---
  if (viewMode === '2d') {
      let extraClasses = 'shadow-piece';
      if (style === 'mario') {
          extraClasses = `shadow-[0_4px_0_#1e3a8a,0_8px_10px_rgba(0,0,0,0.3)] hover:translate-y-[-2px] hover:shadow-[0_6px_0_#1e3a8a,0_10px_10px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_2px_0_#1e3a8a] transition-all`;
      } else if (style === 'sonic') {
          extraClasses = `shadow-[0_4px_0_#b45309,0_8px_10px_rgba(0,0,0,0.3)] hover:translate-y-[-2px] hover:shadow-[0_6px_0_#b45309,0_10px_10px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_2px_0_#b45309] transition-all`;
      } else if (style === 'glossy') {
          extraClasses = `shadow-[0_4px_8px_rgba(0,0,0,0.3),0_2px_0_rgba(255,255,255,0.2)_inset] hover:scale-105 transition-transform duration-200`;
      } else if (style === 'neon') {
          extraClasses = `shadow-[0_0_10px_currentColor] border-2 hover:scale-105 transition-transform duration-200`;
      } else if (style === 'mineral') {
          extraClasses = `shadow-[0_0_10px_currentColor] border-2 hover:scale-105 transition-transform duration-200`;
      } else if (style === 'tech') {
          extraClasses = `shadow-[0_0_5px_rgba(0,0,0,0.5)] border-2 hover:scale-105 transition-transform duration-200`;
      } else if (style === 'illustrated') {
          extraClasses = `border-b-[6px] active:translate-y-1 active:border-b-2 active:mt-1 ${isWhite ? 'border-amber-300/80 shadow-lg' : 'border-slate-900/80 shadow-lg'}`;
      } else if (style === 'dragon' || style === 'medieval' || style === 'egyptian') {
          extraClasses = `shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_-2px_6px_rgba(0,0,0,0.4)] border-4`;
      } else if (style === 'celestial') {
          extraClasses = `shadow-[0_0_15px_rgba(255,255,255,0.6)] border-4`;
      } else if (style === 'realistic') {
           extraClasses = `shadow-[0_4px_6px_rgba(0,0,0,0.4),inset_0_-4px_4px_rgba(0,0,0,0.2)] border-0`;
      } else if (style === 'marble') {
           extraClasses = `shadow-[0_4px_6px_rgba(0,0,0,0.3)] border-2 ${isWhite ? 'border-gray-200' : 'border-gray-700'}`;
      } else if (style === 'metal') {
           extraClasses = `shadow-[0_3px_5px_rgba(0,0,0,0.5),inset_0_1px_4px_rgba(255,255,255,0.3)] border-0`;
      } else if (style === 'glass') {
           extraClasses = `shadow-[0_4px_10px_rgba(var(--shadow-color),0.4)] border-0 backdrop-blur-md`;
      }

      return (
        <>
            {/* King Aura Effect (2D) */}
            {piece.isKing && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 rounded-full border-2 border-yellow-400/40 animate-spin-slow" style={{animationDuration: '8s', borderStyle: 'dashed'}} />
                    <div className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.4)] animate-pulse" />
                </div>
            )}
            
            <div 
              className={`absolute inset-1 rounded-full cursor-pointer transform transition-all duration-300 border-4 
                ${topFaceClass} ${extraClasses}
                ${isSelected ? 'scale-110 ring-4 ring-yellow-400 z-20 animate-bounce' : 'z-10'}
                flex items-center justify-center overflow-hidden
              `}
              style={customStyle}
              onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick();
              }}
            >
              {(!customImages || (!customImages.pieceWhiteUrl && !customImages.pieceBlackUrl)) && renderFaceContent()}
              {(customImages && ((isWhite && customImages.pieceWhiteUrl) || (!isWhite && customImages.pieceBlackUrl))) && piece.isKing && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                      <CrownIcon size={32} className="text-yellow-400 fill-yellow-200 drop-shadow-[0_0_5px_rgba(255,255,0,0.8)] animate-pulse" strokeWidth={2} isWhite={isWhite} />
                  </div>
              )}
            </div>
        </>
      );
  }

  // --- 3D VOLUMETRIC RENDER ---
  const liftZ = isSelected ? 30 : 0; 
  const isGlass = style === 'glass';
  const isFloating = piece.isKing && !isSelected; // Check if it should float
  
  // Calculate Shadow Logic
  const shadowOffset = isSelected ? 'translate(4px, 4px)' : 'translate(0px, 0px)';
  const shadowBlur = isSelected ? 'blur-md opacity-20' : 'blur-[2px] opacity-50';

  // Base Box Shadow for 3D Top Face
  let topFaceShadow = style === 'minimal' ? 'none' : style === 'dragon' ? 'inset 0 0 8px rgba(0,0,0,0.6)' : style === 'mario' ? 'inset 0 2px 5px rgba(255,255,255,0.4), inset 0 -2px 5px rgba(0,0,0,0.2)' : style === 'sonic' ? 'inset 0 2px 5px rgba(255,255,255,0.6), inset 0 -2px 5px rgba(0,0,0,0.3)' : style === 'glossy' ? 'inset 0 2px 4px rgba(255,255,255,0.5)' : style === 'neon' ? 'inset 0 0 10px rgba(255,255,255,0.5)' : style === 'mineral' ? 'inset 0 0 10px rgba(255,255,255,0.5)' : style === 'tech' ? 'inset 0 0 5px rgba(0,255,255,0.2)' : 'inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.3)';
  
  // Add King Glow to Shadow
  if (piece.isKing) {
      topFaceShadow = `0 0 15px 2px rgba(250, 204, 21, 0.5), ${topFaceShadow}`;
  }

  return (
    <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ transformStyle: 'preserve-3d' }}
    >
        {/* Click Target (Hitbox) */}
        <div 
            className="absolute inset-0 cursor-pointer pointer-events-auto z-50"
            style={{ transform: `translateZ(${liftZ + 14}px)` }}
            onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick();
            }}
        />

        {/* Dynamic Realistic Shadow */}
        <div 
            className={`absolute inset-1 rounded-full bg-black transition-all duration-300 ease-out pointer-events-none
                ${shadowBlur}
                ${isGlass ? 'bg-cyan-900 mix-blend-multiply' : ''}
                ${isFloating ? 'animate-shadowPulse' : ''}
            `}
            style={{ 
                transform: `translateZ(0px) ${shadowOffset} scale(${isSelected ? 0.9 : 1})`,
            }}
        />

        {/* The Volumetric Stack Container */}
        <div 
            className={`absolute inset-0 transition-transform duration-300 ease-out ${isSelected ? 'animate-bounce' : ''}`}
            style={{ 
                transformStyle: 'preserve-3d', 
                transform: `translateZ(${liftZ}px) scale(${config.pieces.globalScale || 1})` 
            }}
        >
            {/* 
                FLOAT WRAPPER 
                We wrap the inner structure in a div that handles the floating animation
                so it doesn't conflict with the 'liftZ' transform above.
            */}
            <div 
                className={`w-full h-full relative ${isFloating ? 'animate-float' : ''}`}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* 
                STACK LAYERS (The sides)
                */}
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div 
                        key={i}
                        className={`absolute inset-1 rounded-full border border-black/5 ${isGlass ? 'opacity-40' : ''}`}
                        style={{ 
                            transform: `translateZ(${i * 2}px)`,
                            background: sideGradient, 
                            boxShadow: i === 6 ? `inset 0 0 2px ${rimColor}` : 'none' 
                        }} 
                    />
                ))}

                {/* The Top Face */}
                <div 
                    className={`absolute inset-1 rounded-full flex items-center justify-center overflow-hidden
                        ${topFaceClass} 
                        ${['minimal', 'dragon', 'celestial', 'medieval', 'egyptian', 'mythology', 'mario', 'sonic', 'glossy', 'neon', 'mineral', 'tech'].includes(style) ? '' : ''}
                    `}
                    style={{ 
                        transform: 'translateZ(13px)', 
                        boxShadow: topFaceShadow,
                        ...customStyle
                    }} 
                >
                    {(!customSkin || (!customSkin.redUrl && !customSkin.blueUrl)) && renderFaceContent()}
                    {(customSkin && ((isWhite && customSkin.redUrl) || (!isWhite && customSkin.blueUrl))) && piece.isKing && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <CrownIcon size={32} className="text-yellow-400 fill-yellow-200 drop-shadow-[0_0_5px_rgba(255,255,0,0.8)] animate-pulse" strokeWidth={2} isWhite={isWhite} />
                        </div>
                    )}
                    
                    {!['minimal', 'dragon', 'celestial', 'medieval', 'egyptian', 'mythology', 'mario', 'sonic', 'glossy', 'neon', 'mineral', 'tech'].includes(style) && (
                        <div className="absolute top-0 left-0 w-full h-full rounded-full pointer-events-none opacity-40 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.9)_0%,transparent_20%)]" />
                    )}
                    
                    <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />
                </div>
            </div>
        </div>
    </div>
  );
};

export default Piece;