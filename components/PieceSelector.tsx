import React from 'react';
import { PIECE_STYLES } from '../constants';
import { PieceStyle, Theme } from '../types';
import Piece from './Piece';
import { Check, ChevronLeft, Info } from 'lucide-react';

interface PieceSelectorProps {
  activeStyle: PieceStyle;
  onSelect: (style: PieceStyle) => void;
  onBack: () => void;
  theme: Theme;
}

const PieceSelector: React.FC<PieceSelectorProps> = ({ activeStyle, onSelect, onBack, theme }) => {
  return (
    <div className="min-h-screen p-6 max-w-md mx-auto flex flex-col z-10 relative animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-4 mb-8">
            <button onClick={onBack} className="p-2 bg-white rounded-full shadow hover:bg-gray-50 text-emerald-800 transition-colors">
                <ChevronLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Estilo das Peças</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
            {PIECE_STYLES.map(style => (
                <button 
                    key={style.id} 
                    onClick={() => onSelect(style.id)} 
                    className={`relative p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group ${activeStyle === style.id ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-100' : 'bg-white/60 border-transparent hover:bg-white hover:shadow-sm'}`}
                >
                    <div className={`w-20 h-20 flex items-center justify-center rounded-xl transition-colors ${activeStyle === style.id ? 'bg-emerald-50' : 'bg-gray-100/50 group-hover:bg-white'}`}>
                        <div className="relative w-12 h-12 transform group-hover:scale-110 transition-transform duration-300">
                            <Piece piece={{player: 'white', isKing: false}} theme={theme} isSelected={false} viewMode="2d" style={style.id}/>
                        </div>
                    </div>
                    
                    <div className="flex-1 text-left">
                        <h3 className={`font-bold text-lg transition-colors ${activeStyle === style.id ? 'text-emerald-900' : 'text-gray-700'}`}>{style.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">Toque para selecionar este estilo.</p>
                    </div>

                    {activeStyle === style.id && (
                        <div className="bg-emerald-500 text-white p-1.5 rounded-full shadow-sm animate-in zoom-in">
                            <Check size={18} strokeWidth={3} />
                        </div>
                    )}
                </button>
            ))}
        </div>

        <div className="mt-auto bg-emerald-50/80 backdrop-blur p-4 rounded-xl border border-emerald-100 flex gap-3 items-start">
            <Info className="text-emerald-600 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-emerald-800 leading-relaxed">
                Sua escolha será salva automaticamente para as próximas partidas.
            </p>
        </div>
    </div>
  );
};

export default PieceSelector;
