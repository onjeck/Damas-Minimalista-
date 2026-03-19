import React, { useMemo } from 'react';
import { Theme } from '../types';
import { Cloud, Mountain, Castle, Zap, Star, Droplets, Flame, Leaf } from 'lucide-react';
import { FANTASY_SKY_BG } from '../src/assets/images';
import { useAppConfig } from '../configContext';

interface BackgroundProps {
  theme: Theme;
}

// Configuration for random floating pieces
const FLOATING_PIECES = [
    { id: 1, left: '10%', top: '15%', size: '60px', delay: '0s', duration: '18s', type: 'white', blur: 'blur-sm' },
    { id: 2, left: '85%', top: '10%', size: '80px', delay: '2s', duration: '22s', type: 'black', blur: 'blur-md' },
    { id: 3, left: '20%', top: '75%', size: '100px', delay: '5s', duration: '25s', type: 'white', blur: 'blur-lg' },
    { id: 4, left: '70%', top: '60%', size: '50px', delay: '1s', duration: '15s', type: 'black', blur: 'blur-[2px]' },
    { id: 5, left: '50%', top: '40%', size: '40px', delay: '8s', duration: '30s', type: 'white', blur: 'blur-xl' },
    { id: 6, left: '90%', top: '85%', size: '70px', delay: '3s', duration: '20s', type: 'black', blur: 'blur-sm' },
    { id: 7, left: '5%', top: '50%', size: '90px', delay: '6s', duration: '28s', type: 'white', blur: 'blur-md' },
];

const Background: React.FC<BackgroundProps> = ({ theme }) => {
  const { config } = useAppConfig();
  
  // Generate random particles for effects
  const particles = useMemo(() => {
      return Array.from({ length: 20 }).map((_, i) => ({
          id: i,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          size: Math.random() * 4 + 2,
          delay: `${Math.random() * 5}s`,
          duration: `${Math.random() * 10 + 10}s`,
      }));
  }, []);

  const renderFloatingPieces = () => {
    // Only render simple pieces for cleaner themes, skip for very complex ones if needed, 
    // or adapt colors. For now, we use a generic overlay style.
    
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
            {FLOATING_PIECES.map((p) => {
                const isWhite = p.type === 'white';
                // Dynamic styling based on theme could go here, but generic semi-transparent looks best
                const borderColor = isWhite ? 'border-white/20' : 'border-black/10';
                const bgColor = isWhite ? 'bg-white/5' : 'bg-black/5';
                const innerShadow = isWhite ? 'shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]' : 'shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]';
                
                return (
                    <div
                        key={p.id}
                        className={`absolute rounded-full border-4 ${borderColor} ${bgColor} ${innerShadow} ${p.blur} animate-tumble flex items-center justify-center`}
                        style={{
                            left: p.left,
                            top: p.top,
                            width: p.size,
                            height: p.size,
                            animationDelay: p.delay,
                            animationDuration: p.duration,
                        }}
                    >
                         {/* Inner circle detail to make it look like a checker piece */}
                         <div className={`w-[70%] h-[70%] rounded-full border-2 ${borderColor} opacity-50`}></div>
                    </div>
                );
            })}
        </div>
    );
  };

  // Determine content based on theme ID
  const renderEffects = () => {
    switch (theme.id) {
      case 'heaven': // Celestial
        return (
           <>
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8)_0%,transparent_70%)] opacity-50"></div>
             {/* Twinkling Stars */}
             {particles.map((p) => (
                 <div 
                    key={p.id} 
                    className="absolute bg-white rounded-full animate-twinkle"
                    style={{
                        left: p.left,
                        top: p.top,
                        width: p.size,
                        height: p.size,
                        animationDelay: p.delay
                    }}
                 />
             ))}
             {/* Moving Clouds */}
             <div className="absolute top-10 left-10 text-white/40 animate-drift" style={{animationDuration: '30s'}}>
                 <Cloud size={100} fill="white" />
             </div>
             <div className="absolute bottom-20 right-20 text-white/30 animate-drift" style={{animationDuration: '45s', animationDirection: 'reverse'}}>
                 <Cloud size={150} fill="white" />
             </div>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
           </>
        );

      case 'inferno': // Dragon
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-red-950 via-slate-900 to-slate-950"></div>
            {/* Rising Embers */}
            {particles.map((p) => (
                <div 
                   key={p.id} 
                   className="absolute bg-orange-500 rounded-full animate-rise blur-[1px]"
                   style={{
                       left: p.left,
                       bottom: '-10px', // Start from bottom
                       top: 'auto',
                       width: Math.random() * 3 + 2,
                       height: Math.random() * 3 + 2,
                       animationDelay: p.delay,
                       animationDuration: `${Math.random() * 5 + 3}s`
                   }}
                />
            ))}
            {/* Lava glow */}
            <div className="absolute bottom-[-100px] left-0 right-0 h-[200px] bg-red-600/30 blur-[100px] animate-pulse"></div>
          </>
        );

      case 'egypt': // Egyptian
         return (
             <>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,215,0,0.05)_25%,transparent_25%,transparent_75%,rgba(255,215,0,0.05)_75%,rgba(255,215,0,0.05)),linear-gradient(45deg,rgba(255,215,0,0.05)_25%,transparent_25%,transparent_75%,rgba(255,215,0,0.05)_75%,rgba(255,215,0,0.05))] bg-[size:40px_40px] opacity-20"></div>
                <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-amber-200/20 to-transparent"></div>
                {/* Heat Haze (Simulated with rising transparent waves) */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10 animate-drift"></div>
                <div className="absolute -right-20 bottom-10 opacity-10">
                    <Mountain size={400} className="text-amber-900" />
                </div>
             </>
         );

      case 'castle': // Medieval
         return (
             <>
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-brick-wall.png')] opacity-30"></div>
                 <div className="absolute top-0 w-full h-full bg-gradient-to-b from-black/50 to-transparent"></div>
                 {/* Torches (Simulated) */}
                 <div className="absolute top-1/3 left-10 w-20 h-20 bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
                 <div className="absolute top-1/3 right-10 w-20 h-20 bg-orange-500/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
                 <div className="absolute bottom-0 left-10 opacity-10">
                    <Castle size={300} className="text-slate-900" />
                 </div>
             </>
         );

      case 'olympus': // Mythology
         return (
             <>
                 <div className="absolute inset-0 bg-gradient-to-b from-teal-50 to-white"></div>
                 <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-200/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s'}}></div>
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')]"></div>
                 <div className="absolute top-20 right-20 text-yellow-400/20 animate-pulse">
                     <Zap size={100} fill="currentColor" />
                 </div>
             </>
         );

      case 'purple': // Neon Cyber
        return (
          <>
            {/* Retro Grid Floor */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(88,28,135,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(88,28,135,0.2)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,transparent,black)] opacity-40 animate-gridMove" style={{ transformOrigin: 'top', transform: 'perspective(500px) rotateX(60deg)' }}></div>
            {/* Digital Rain / Data Particles */}
            {particles.map((p) => (
                <div 
                   key={p.id} 
                   className="absolute w-[2px] bg-fuchsia-500/50 animate-rise"
                   style={{
                       left: p.left,
                       top: '100%',
                       height: `${Math.random() * 20 + 10}px`,
                       animationDelay: p.delay,
                       animationDuration: '3s'
                   }}
                />
            ))}
            {/* Glowing Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-drift"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-fuchsia-600/20 rounded-full blur-[80px] animate-drift" style={{ animationDelay: '-5s' }}></div>
          </>
        );

      case 'ocean': // Ocean
        return (
          <>
            {/* Fluid Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-cyan-100 to-blue-50 bg-[length:400%_400%] animate-gradientFlow opacity-60"></div>
            {/* Rising Bubbles */}
            {particles.map((p) => (
                <div 
                   key={p.id} 
                   className="absolute border border-white/40 rounded-full animate-rise"
                   style={{
                       left: p.left,
                       bottom: '-20px',
                       top: 'auto',
                       width: p.size * 2,
                       height: p.size * 2,
                       animationDelay: p.delay,
                       animationDuration: `${Math.random() * 10 + 5}s`
                   }}
                />
            ))}
            {/* Waves pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
            {/* Light shaft */}
            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-white/20 rounded-full blur-3xl mix-blend-overlay animate-pulse" style={{animationDuration: '10s'}}></div>
          </>
        );

      case 'wood': // Wood / Cozy
        return (
          <>
            {/* Warm Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(60,40,30,0.1)_100%)]"></div>
            {/* Floating Dust / Leaves */}
            {particles.slice(0, 10).map((p) => (
                <div 
                   key={p.id} 
                   className="absolute bg-amber-900/20 rounded-full animate-float"
                   style={{
                       left: p.left,
                       top: p.top,
                       width: Math.random() > 0.5 ? 4 : 8,
                       height: Math.random() > 0.5 ? 4 : 8,
                       animationDelay: p.delay,
                       animationDuration: `${Math.random() * 15 + 10}s`
                   }}
                />
            ))}
          </>
        );

      case 'fantasy-sky':
        return (
          <>
            <div 
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
                style={{ backgroundImage: `url(${FANTASY_SKY_BG})` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>
            {/* Soft volumetric lighting effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-100/20 via-transparent to-transparent mix-blend-overlay pointer-events-none"></div>
          </>
        );

      case 'classic': 
      default:
        return (
          <>
            {/* Subtle Geometric Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.07]"></div>
            {/* Slow moving soft blobs */}
            <div className="absolute top-0 right-0 w-[50vh] h-[50vh] bg-emerald-300/10 rounded-full blur-3xl animate-drift"></div>
            <div className="absolute bottom-0 left-0 w-[60vh] h-[60vh] bg-emerald-400/10 rounded-full blur-3xl animate-drift" style={{ animationDelay: '-10s', animationDirection: 'reverse' }}></div>
            {/* Floating Squares */}
            {particles.slice(0, 5).map((p) => (
                <div 
                   key={p.id} 
                   className="absolute border border-emerald-500/10 animate-tumble"
                   style={{
                       left: p.left,
                       top: p.top,
                       width: p.size * 10,
                       height: p.size * 10,
                       animationDelay: p.delay,
                       animationDuration: '30s'
                   }}
                />
            ))}
          </>
        );
    }
  };

  return (
    <div 
        className={`fixed inset-0 w-full h-full -z-50 overflow-hidden transition-colors duration-1000 ${theme.background}`}
        style={config.theme.generalBackgroundUrl ? {
            backgroundImage: `url(${config.theme.generalBackgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        } : {}}
    >
      {!config.theme.generalBackgroundUrl && renderEffects()}
      {renderFloatingPieces()}
    </div>
  );
};

export default Background;