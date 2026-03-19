import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AppConfig {
  branding: {
    logoUrl: string;
    logoMaxHeight: number;
    title: string;
    subtitle: string;
    playButtonText: string;
    playButtonIconUrl: string;
    playButtonWidth: number;
    difficulties: {
      easy: { label: string; iconUrl: string };
      normal: { label: string; iconUrl: string };
      hard: { label: string; iconUrl: string };
      insane: { label: string; iconUrl: string };
    };
    difficultyIconHeight: number;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    loginButtonText: string;
    loginButtonColor: string;
    logoUrl: string;
    backgroundUrl: string;
    loadingIconUrl: string;
    loadingTips: string[];
  };
  pieces: {
    skins: {
      id: string;
      name: string;
      rarity: 'Grátis' | 'Clássico' | 'Raro' | 'Premium';
      price: number;
      images: {
        red: string;
        blue: string;
        redKing: string;
        blueKing: string;
      };
      globalScale: number;
    }[];
    activeSkinId: string;
  };
  boards: {
    skins: {
      id: string;
      name: string;
      boardImageUrl: string;
      backgroundUrl: string;
      grid: {
        x: number;
        y: number;
        scale: number;
      };
      playerOffsets: {
        red: { scale: number; x: number; y: number };
        blue: { scale: number; x: number; y: number };
      };
    }[];
    activeSkinId: string;
  };
  theme: {
    primaryColor: string;
    accentColor: string;
    generalBackgroundUrl: string;
    navBar: {
      items: {
        id: string;
        label: string;
        iconUrl: string;
      }[];
      globalIconSize: number;
    };
  };
  audio: {
    urls: {
      move: string;
      capture: string;
      uiClick: string;
      win: string;
      lose: string;
      king: string;
    };
    globalVolume: number;
    muted: boolean;
  };
  gamification: {
    win: {
      title: string;
      subtitle: string;
      imageUrl: string;
      backgroundUrl: string;
    };
    lose: {
      title: string;
      subtitle: string;
      imageUrl: string;
      backgroundUrl: string;
    };
  };
}

export const defaultConfig: AppConfig = {
  branding: {
    logoUrl: '',
    logoMaxHeight: 150,
    title: 'Damas Minimalista',
    subtitle: 'O clássico, reimaginado.',
    playButtonText: 'JOGAR AGORA',
    playButtonIconUrl: '',
    playButtonWidth: 300,
    difficulties: {
      easy: { label: 'Fácil', iconUrl: '' },
      normal: { label: 'Normal', iconUrl: '' },
      hard: { label: 'Difícil', iconUrl: '' },
      insane: { label: 'Insano', iconUrl: '' },
    },
    difficultyIconHeight: 24,
  },
  auth: {
    loginTitle: 'Bem-vindo',
    loginSubtitle: 'Faça login para continuar sua saga',
    loginButtonText: 'ENTRAR',
    loginButtonColor: '#10b981',
    logoUrl: '',
    backgroundUrl: '',
    loadingIconUrl: '',
    loadingTips: ['Dica: Controle o centro do tabuleiro.', 'Dica: Proteja suas peças da retaguarda.'],
  },
  pieces: {
    skins: [
      {
        id: 'default',
        name: 'Padrão',
        rarity: 'Grátis',
        price: 0,
        images: { red: '', blue: '', redKing: '', blueKing: '' },
        globalScale: 100,
      }
    ],
    activeSkinId: 'default',
  },
  boards: {
    skins: [
      {
        id: 'default',
        name: 'Padrão',
        boardImageUrl: '',
        backgroundUrl: '',
        grid: { x: 0, y: 0, scale: 100 },
        playerOffsets: {
          red: { scale: 100, x: 0, y: 0 },
          blue: { scale: 100, x: 0, y: 0 },
        }
      }
    ],
    activeSkinId: 'default',
  },
  theme: {
    primaryColor: '160, 100%, 36%',
    accentColor: '45, 100%, 51%',
    generalBackgroundUrl: '',
    navBar: {
      items: [
        { id: 'play', label: 'Jogar', iconUrl: '' },
        { id: 'pieces', label: 'Peças', iconUrl: '' },
        { id: 'themes', label: 'Temas', iconUrl: '' },
        { id: 'settings', label: 'Regras', iconUrl: '' },
      ],
      globalIconSize: 24,
    }
  },
  audio: {
    urls: {
      move: '',
      capture: '',
      uiClick: '',
      win: '',
      lose: '',
      king: '',
    },
    globalVolume: 100,
    muted: false,
  },
  gamification: {
    win: {
      title: 'VITÓRIA!',
      subtitle: 'Você dominou o tabuleiro.',
      imageUrl: '',
      backgroundUrl: '',
    },
    lose: {
      title: 'DERROTA',
      subtitle: 'Não foi dessa vez.',
      imageUrl: '',
      backgroundUrl: '',
    }
  }
};

interface AppConfigContextType {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  updateConfig: (section: keyof AppConfig, data: any) => void;
}

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

export const AppConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('appConfig');
    if (saved) {
      try {
        // Deep merge to ensure all nested properties exist
        const parsed = JSON.parse(saved);
        return {
          ...defaultConfig,
          ...parsed,
          branding: { ...defaultConfig.branding, ...parsed.branding },
          auth: { ...defaultConfig.auth, ...parsed.auth },
          pieces: { ...defaultConfig.pieces, ...parsed.pieces },
          boards: { ...defaultConfig.boards, ...parsed.boards },
          theme: { ...defaultConfig.theme, ...parsed.theme },
          audio: { ...defaultConfig.audio, ...parsed.audio },
          gamification: { ...defaultConfig.gamification, ...parsed.gamification },
        };
      } catch (e) {
        return defaultConfig;
      }
    }
    return defaultConfig;
  });

  useEffect(() => {
    localStorage.setItem('appConfig', JSON.stringify(config));
    (window as any).appConfig = config;
  }, [config]);

  const updateConfig = (section: keyof AppConfig, data: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        ...data
      }
    }));
  };

  return (
    <AppConfigContext.Provider value={{ config, setConfig, updateConfig }}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within an AppConfigProvider');
  }
  return context;
};
