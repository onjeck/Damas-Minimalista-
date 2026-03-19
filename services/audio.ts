export const initAudio = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  // Create a singleton context
  if (!(window as any).gameAudioContext) {
    (window as any).gameAudioContext = new AudioContext();
  }
  
  const ctx = (window as any).gameAudioContext;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
};

export const playSound = (type: 'move' | 'capture' | 'promote' | 'win' | 'pop') => {
  const ctx = (window as any).gameAudioContext as AudioContext;
  if (!ctx) return;

  const config = (window as any).appConfig?.audio;
  if (config?.muted) return;

  const globalVolume = config?.globalVolume !== undefined ? config.globalVolume / 100 : 1;

  // Check if there's a custom URL for this sound type
  let customUrl = '';
  if (config?.urls) {
    if (type === 'move') customUrl = config.urls.move;
    if (type === 'capture') customUrl = config.urls.capture;
    if (type === 'promote') customUrl = config.urls.king;
    if (type === 'win') customUrl = config.urls.win;
    if (type === 'pop') customUrl = config.urls.uiClick;
  }

  if (customUrl) {
    const audio = new Audio(customUrl);
    audio.volume = globalVolume;
    audio.play().catch(() => {});
    return;
  }

  const t = ctx.currentTime;
  
  const createOsc = (freq: number, type: OscillatorType, start: number, dur: number, vol: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(vol * globalVolume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur);
  };

  if (type === 'move') {
    // Wood-like thock
    createOsc(200, 'sine', t, 0.1, 0.2);
    createOsc(100, 'triangle', t, 0.1, 0.2);
  } else if (type === 'capture') {
    // High pop
    createOsc(400, 'sine', t, 0.15, 0.2);
    createOsc(600, 'sine', t + 0.05, 0.1, 0.1);
  } else if (type === 'promote') {
    // Magic chime
    createOsc(440, 'sine', t, 0.3, 0.1);
    createOsc(554, 'sine', t + 0.1, 0.3, 0.1);
    createOsc(659, 'sine', t + 0.2, 0.6, 0.1);
  } else if (type === 'win') {
    // Fanfare
    createOsc(523.25, 'triangle', t, 0.2, 0.2);
    createOsc(659.25, 'triangle', t + 0.15, 0.2, 0.2);
    createOsc(783.99, 'triangle', t + 0.3, 0.6, 0.2);
  } else if (type === 'pop') {
      // Bubble pop for emoji
      createOsc(800, 'sine', t, 0.05, 0.1);
      createOsc(1200, 'sine', t + 0.02, 0.05, 0.05);
  }
};