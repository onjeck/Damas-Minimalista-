import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music } from 'lucide-react';

interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
}

const PLAYLIST: Track[] = [
  {
    id: 1,
    title: "Lofi Study",
    artist: "FASSounds",
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3"
  },
  {
    id: 2,
    title: "Chill Abstract",
    artist: "Coma-Media",
    url: "https://cdn.pixabay.com/download/audio/2022/02/07/audio_1808fbf07a.mp3" // Placeholder, let's try to find a real one or use a reliable source
  },
  {
    id: 3,
    title: "Ambient Piano",
    artist: "Relaxing",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  }
];

// Let's use some reliable Pixabay music links if possible, or fallback to SoundHelix for demo.
// Actually, I'll use a few specific Pixabay tracks that are popular for background music.
// 1. "Lofi Study" - https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3 (Example ID)
// Since I can't verify the exact IDs, I will use SoundHelix for reliability in this demo context, 
// but I will comment that they should be replaced.

const DEMO_PLAYLIST: Track[] = [
    {
        id: 1,
        title: "Piano Suave",
        artist: "Demo Track 1",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
        id: 2,
        title: "Ambiente Relax",
        artist: "Demo Track 2",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
    },
    {
        id: 3,
        title: "Batida Leve",
        artist: "Demo Track 3",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    }
];

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(true);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play failed (user interaction needed first):", e));
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % DEMO_PLAYLIST.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + DEMO_PLAYLIST.length) % DEMO_PLAYLIST.length);
  };

  const handleEnded = () => {
    nextTrack();
  };

  return (
    <div className={`fixed bottom-4 left-4 z-50 transition-all duration-300 ${isMinimized ? 'w-12 h-12' : 'w-64 bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-4 border border-white/20'}`}>
      <audio
        ref={audioRef}
        src={DEMO_PLAYLIST[currentTrackIndex].url}
        onEnded={handleEnded}
      />

      {isMinimized ? (
        <button 
          onClick={() => setIsMinimized(false)}
          className="w-full h-full bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform border border-emerald-200"
        >
          <Music size={20} className={`text-emerald-600 ${isPlaying ? 'animate-spin-slow' : ''}`} />
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Header / Minimize */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
                <div className={`p-1.5 rounded-full bg-emerald-100 ${isPlaying ? 'animate-pulse' : ''}`}>
                    <Music size={14} className="text-emerald-600" />
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-bold text-slate-700 truncate">{DEMO_PLAYLIST[currentTrackIndex].title}</span>
                    <span className="text-[10px] text-slate-500 truncate">{DEMO_PLAYLIST[currentTrackIndex].artist}</span>
                </div>
            </div>
            <button onClick={() => setIsMinimized(true)} className="text-slate-400 hover:text-slate-600">
              <span className="sr-only">Minimize</span>
              <svg width="10" height="2" viewBox="0 0 10 2" fill="currentColor"><rect width="10" height="2" rx="1" /></svg>
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={prevTrack} className="text-slate-500 hover:text-emerald-600 transition-colors">
              <SkipBack size={18} fill="currentColor" />
            </button>
            
            <button 
                onClick={togglePlay} 
                className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md hover:bg-emerald-600 hover:scale-105 transition-all"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </button>
            
            <button onClick={nextTrack} className="text-slate-500 hover:text-emerald-600 transition-colors">
              <SkipForward size={18} fill="currentColor" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMuted(!isMuted)} className="text-slate-400 hover:text-slate-600">
              {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
