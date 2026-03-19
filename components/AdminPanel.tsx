import React, { useState } from 'react';
import { useAppConfig } from '../configContext';
import { Save, ChevronLeft, Image as ImageIcon, Type, Layout, Palette, Music, Trophy, ShieldCheck } from 'lucide-react';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const { config, setConfig } = useAppConfig();
  const [activeTab, setActiveTab] = useState('branding');
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = () => {
    setConfig(localConfig);
    alert('Configurações salvas com sucesso!');
  };

  const updateSection = (section: keyof typeof config, field: string, value: any) => {
    setLocalConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const updateNested = (section: keyof typeof config, path: string[], value: any) => {
    setLocalConfig(prev => {
      const newConfig = { ...prev };
      let current: any = newConfig[section];
      for (let i = 0; i < path.length - 1; i++) {
        current[path[i]] = { ...current[path[i]] };
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newConfig;
    });
  };

  const tabs = [
    { id: 'branding', label: 'Branding & Home', icon: <Layout size={18} /> },
    { id: 'auth', label: 'Acesso & Loading', icon: <ShieldCheck size={18} /> },
    { id: 'pieces', label: 'Peças (Skins)', icon: <ImageIcon size={18} /> },
    { id: 'boards', label: 'Tabuleiros', icon: <Layout size={18} /> },
    { id: 'theme', label: 'Identidade Visual', icon: <Palette size={18} /> },
    { id: 'audio', label: 'Áudio', icon: <Music size={18} /> },
    { id: 'gamification', label: 'Gamificação', icon: <Trophy size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col z-50 relative animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors">
            <ChevronLeft />
          </button>
          <h2 className="text-3xl font-black text-gray-800">Painel de Administração</h2>
        </div>
        <button 
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all"
        >
          <Save size={20} />
          SALVAR ALTERAÇÕES
        </button>
      </div>

      <div className="flex gap-6 max-w-6xl mx-auto w-full flex-1 overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-64 flex flex-col gap-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left ${
                activeTab === tab.id 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 overflow-y-auto">
          
          {activeTab === 'branding' && (
            <div className="space-y-8 animate-in fade-in">
              <h3 className="text-2xl font-bold text-gray-800 border-b pb-4">Branding e Tela Inicial</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-700">Logo</h4>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">URL do Logo</label>
                    <input 
                      type="text" 
                      value={localConfig.branding.logoUrl} 
                      onChange={e => updateSection('branding', 'logoUrl', e.target.value)}
                      className="w-full p-3 border rounded-xl bg-gray-50"
                      placeholder="https://exemplo.com/logo.png"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Altura Máxima (px)</label>
                    <input 
                      type="number" 
                      value={localConfig.branding.logoMaxHeight} 
                      onChange={e => updateSection('branding', 'logoMaxHeight', Number(e.target.value))}
                      className="w-full p-3 border rounded-xl bg-gray-50"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-700">Textos Principais</h4>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Título (Fallback)</label>
                    <input 
                      type="text" 
                      value={localConfig.branding.title} 
                      onChange={e => updateSection('branding', 'title', e.target.value)}
                      className="w-full p-3 border rounded-xl bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Subtítulo</label>
                    <input 
                      type="text" 
                      value={localConfig.branding.subtitle} 
                      onChange={e => updateSection('branding', 'subtitle', e.target.value)}
                      className="w-full p-3 border rounded-xl bg-gray-50"
                    />
                  </div>
                </div>

                <div className="space-y-4 col-span-2">
                  <h4 className="font-bold text-gray-700 border-t pt-6">Botão Jogar</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Texto</label>
                      <input 
                        type="text" 
                        value={localConfig.branding.playButtonText} 
                        onChange={e => updateSection('branding', 'playButtonText', e.target.value)}
                        className="w-full p-3 border rounded-xl bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">URL do Ícone</label>
                      <input 
                        type="text" 
                        value={localConfig.branding.playButtonIconUrl} 
                        onChange={e => updateSection('branding', 'playButtonIconUrl', e.target.value)}
                        className="w-full p-3 border rounded-xl bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Largura (px)</label>
                      <input 
                        type="number" 
                        value={localConfig.branding.playButtonWidth} 
                        onChange={e => updateSection('branding', 'playButtonWidth', Number(e.target.value))}
                        className="w-full p-3 border rounded-xl bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 col-span-2">
                  <h4 className="font-bold text-gray-700 border-t pt-6">Dificuldades (IA)</h4>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Altura Global dos Ícones (px)</label>
                    <input 
                      type="number" 
                      value={localConfig.branding.difficultyIconHeight} 
                      onChange={e => updateSection('branding', 'difficultyIconHeight', Number(e.target.value))}
                      className="w-full p-3 border rounded-xl bg-gray-50 max-w-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {['easy', 'normal', 'hard', 'insane'].map(diff => (
                      <div key={diff} className="p-4 border rounded-xl bg-gray-50 space-y-3">
                        <h5 className="font-bold capitalize text-emerald-800">{diff}</h5>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Rótulo</label>
                          <input 
                            type="text" 
                            value={(localConfig.branding.difficulties as any)[diff].label} 
                            onChange={e => updateNested('branding', ['difficulties', diff, 'label'], e.target.value)}
                            className="w-full p-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">URL do Ícone</label>
                          <input 
                            type="text" 
                            value={(localConfig.branding.difficulties as any)[diff].iconUrl} 
                            onChange={e => updateNested('branding', ['difficulties', diff, 'iconUrl'], e.target.value)}
                            className="w-full p-2 border rounded-lg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'auth' && (
            <div className="space-y-8 animate-in fade-in">
              <h3 className="text-2xl font-bold text-gray-800 border-b pb-4">Telas de Acesso (Login & Loading)</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-700">Login</h4>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Título</label>
                    <input type="text" value={localConfig.auth.loginTitle} onChange={e => updateSection('auth', 'loginTitle', e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Subtítulo</label>
                    <input type="text" value={localConfig.auth.loginSubtitle} onChange={e => updateSection('auth', 'loginSubtitle', e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Texto do Botão</label>
                    <input type="text" value={localConfig.auth.loginButtonText} onChange={e => updateSection('auth', 'loginButtonText', e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Cor do Botão (Hex ou Tailwind)</label>
                    <input type="text" value={localConfig.auth.loginButtonColor} onChange={e => updateSection('auth', 'loginButtonColor', e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">URL do Logo Específico</label>
                    <input type="text" value={localConfig.auth.logoUrl} onChange={e => updateSection('auth', 'logoUrl', e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">URL do Background Específico</label>
                    <input type="text" value={localConfig.auth.backgroundUrl} onChange={e => updateSection('auth', 'backgroundUrl', e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-700">Loading</h4>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">URL do Ícone Animado</label>
                    <input type="text" value={localConfig.auth.loadingIconUrl} onChange={e => updateSection('auth', 'loadingIconUrl', e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Dicas Dinâmicas (Uma por linha)</label>
                    <textarea 
                      value={localConfig.auth.loadingTips.join('\n')} 
                      onChange={e => updateSection('auth', 'loadingTips', e.target.value.split('\n'))}
                      className="w-full p-3 border rounded-xl bg-gray-50 h-48"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pieces' && (
            <div className="space-y-8 animate-in fade-in">
              <h3 className="text-2xl font-bold text-gray-800 border-b pb-4">Sistema de Peças (Skins)</h3>
              
              {localConfig.pieces.skins.map((skin, index) => (
                <div key={skin.id} className="p-6 border-2 border-gray-100 rounded-2xl bg-gray-50 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-lg text-emerald-800">Skin: {skin.name}</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Nome</label>
                      <input type="text" value={skin.name} onChange={e => {
                        const newSkins = [...localConfig.pieces.skins];
                        newSkins[index].name = e.target.value;
                        updateSection('pieces', 'skins', newSkins);
                      }} className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Raridade</label>
                      <select value={skin.rarity} onChange={e => {
                        const newSkins = [...localConfig.pieces.skins];
                        newSkins[index].rarity = e.target.value as any;
                        updateSection('pieces', 'skins', newSkins);
                      }} className="w-full p-2 border rounded-lg">
                        <option value="Grátis">Grátis</option>
                        <option value="Clássico">Clássico</option>
                        <option value="Raro">Raro</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Preço (Moedas)</label>
                      <input type="number" value={skin.price} onChange={e => {
                        const newSkins = [...localConfig.pieces.skins];
                        newSkins[index].price = Number(e.target.value);
                        updateSection('pieces', 'skins', newSkins);
                      }} className="w-full p-2 border rounded-lg" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Imagem Vermelha</label>
                      <input type="text" value={skin.images.red} onChange={e => {
                        const newSkins = [...localConfig.pieces.skins];
                        newSkins[index].images.red = e.target.value;
                        updateSection('pieces', 'skins', newSkins);
                      }} className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Imagem Azul</label>
                      <input type="text" value={skin.images.blue} onChange={e => {
                        const newSkins = [...localConfig.pieces.skins];
                        newSkins[index].images.blue = e.target.value;
                        updateSection('pieces', 'skins', newSkins);
                      }} className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Imagem Vermelha (Rei)</label>
                      <input type="text" value={skin.images.redKing} onChange={e => {
                        const newSkins = [...localConfig.pieces.skins];
                        newSkins[index].images.redKing = e.target.value;
                        updateSection('pieces', 'skins', newSkins);
                      }} className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Imagem Azul (Rei)</label>
                      <input type="text" value={skin.images.blueKing} onChange={e => {
                        const newSkins = [...localConfig.pieces.skins];
                        newSkins[index].images.blueKing = e.target.value;
                        updateSection('pieces', 'skins', newSkins);
                      }} className="w-full p-2 border rounded-lg" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Escala Global (%)</label>
                    <input type="number" value={skin.globalScale} onChange={e => {
                      const newSkins = [...localConfig.pieces.skins];
                      newSkins[index].globalScale = Number(e.target.value);
                      updateSection('pieces', 'skins', newSkins);
                    }} className="w-full p-2 border rounded-lg max-w-xs" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'boards' && (
            <div className="space-y-8 animate-in fade-in">
              <h3 className="text-2xl font-bold text-gray-800 border-b pb-4">Sistema de Tabuleiros (Calibração)</h3>
              
              {localConfig.boards.skins.map((skin, index) => (
                <div key={skin.id} className="p-6 border-2 border-gray-100 rounded-2xl bg-gray-50 space-y-6">
                  <h4 className="font-bold text-lg text-emerald-800">Tabuleiro: {skin.name}</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Imagem do Tabuleiro</label>
                      <input type="text" value={skin.boardImageUrl} onChange={e => {
                        const newSkins = [...localConfig.boards.skins];
                        newSkins[index].boardImageUrl = e.target.value;
                        updateSection('boards', 'skins', newSkins);
                      }} className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Imagem de Fundo (Background)</label>
                      <input type="text" value={skin.backgroundUrl} onChange={e => {
                        const newSkins = [...localConfig.boards.skins];
                        newSkins[index].backgroundUrl = e.target.value;
                        updateSection('boards', 'skins', newSkins);
                      }} className="w-full p-2 border rounded-lg" />
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <h5 className="font-bold text-gray-700 mb-3">Calibração de Grid</h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Posição X</label>
                        <input type="number" value={skin.grid.x} onChange={e => {
                          const newSkins = [...localConfig.boards.skins];
                          newSkins[index].grid.x = Number(e.target.value);
                          updateSection('boards', 'skins', newSkins);
                        }} className="w-full p-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Posição Y</label>
                        <input type="number" value={skin.grid.y} onChange={e => {
                          const newSkins = [...localConfig.boards.skins];
                          newSkins[index].grid.y = Number(e.target.value);
                          updateSection('boards', 'skins', newSkins);
                        }} className="w-full p-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Escala (%)</label>
                        <input type="number" value={skin.grid.scale} onChange={e => {
                          const newSkins = [...localConfig.boards.skins];
                          newSkins[index].grid.scale = Number(e.target.value);
                          updateSection('boards', 'skins', newSkins);
                        }} className="w-full p-2 border rounded-lg" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                      <h5 className="font-bold text-red-800 mb-3">Offset Jogador Vermelho</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-red-700 mb-1">Escala (%)</label>
                          <input type="number" value={skin.playerOffsets.red.scale} onChange={e => {
                            const newSkins = [...localConfig.boards.skins];
                            newSkins[index].playerOffsets.red.scale = Number(e.target.value);
                            updateSection('boards', 'skins', newSkins);
                          }} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-semibold text-red-700 mb-1">Offset X</label>
                            <input type="number" value={skin.playerOffsets.red.x} onChange={e => {
                              const newSkins = [...localConfig.boards.skins];
                              newSkins[index].playerOffsets.red.x = Number(e.target.value);
                              updateSection('boards', 'skins', newSkins);
                            }} className="w-full p-2 border rounded-lg" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-red-700 mb-1">Offset Y</label>
                            <input type="number" value={skin.playerOffsets.red.y} onChange={e => {
                              const newSkins = [...localConfig.boards.skins];
                              newSkins[index].playerOffsets.red.y = Number(e.target.value);
                              updateSection('boards', 'skins', newSkins);
                            }} className="w-full p-2 border rounded-lg" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <h5 className="font-bold text-blue-800 mb-3">Offset Jogador Azul</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-blue-700 mb-1">Escala (%)</label>
                          <input type="number" value={skin.playerOffsets.blue.scale} onChange={e => {
                            const newSkins = [...localConfig.boards.skins];
                            newSkins[index].playerOffsets.blue.scale = Number(e.target.value);
                            updateSection('boards', 'skins', newSkins);
                          }} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-semibold text-blue-700 mb-1">Offset X</label>
                            <input type="number" value={skin.playerOffsets.blue.x} onChange={e => {
                              const newSkins = [...localConfig.boards.skins];
                              newSkins[index].playerOffsets.blue.x = Number(e.target.value);
                              updateSection('boards', 'skins', newSkins);
                            }} className="w-full p-2 border rounded-lg" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-blue-700 mb-1">Offset Y</label>
                            <input type="number" value={skin.playerOffsets.blue.y} onChange={e => {
                              const newSkins = [...localConfig.boards.skins];
                              newSkins[index].playerOffsets.blue.y = Number(e.target.value);
                              updateSection('boards', 'skins', newSkins);
                            }} className="w-full p-2 border rounded-lg" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-8 animate-in fade-in">
              <h3 className="text-2xl font-bold text-gray-800 border-b pb-4">Identidade Visual e Temas</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-700">Cores Globais (HSL)</h4>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Cor Primária</label>
                    <input type="text" value={localConfig.theme.primaryColor} onChange={e => updateSection('theme', 'primaryColor', e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50" placeholder="160, 100%, 36%" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Cor de Destaque (Accent)</label>
                    <input type="text" value={localConfig.theme.accentColor} onChange={e => updateSection('theme', 'accentColor', e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50" placeholder="45, 100%, 51%" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Background Geral (URL)</label>
                    <input type="text" value={localConfig.theme.generalBackgroundUrl} onChange={e => updateSection('theme', 'generalBackgroundUrl', e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-700">Barra de Navegação</h4>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Tamanho Global dos Ícones (px)</label>
                    <input type="number" value={localConfig.theme.navBar.globalIconSize} onChange={e => updateNested('theme', ['navBar', 'globalIconSize'], Number(e.target.value))} className="w-full p-3 border rounded-xl bg-gray-50" />
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    {localConfig.theme.navBar.items.map((item, index) => (
                      <div key={item.id} className="p-3 border rounded-xl bg-gray-50 flex gap-3">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Rótulo ({item.id})</label>
                          <input type="text" value={item.label} onChange={e => {
                            const newItems = [...localConfig.theme.navBar.items];
                            newItems[index].label = e.target.value;
                            updateNested('theme', ['navBar', 'items'], newItems);
                          }} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">URL do Ícone</label>
                          <input type="text" value={item.iconUrl} onChange={e => {
                            const newItems = [...localConfig.theme.navBar.items];
                            newItems[index].iconUrl = e.target.value;
                            updateNested('theme', ['navBar', 'items'], newItems);
                          }} className="w-full p-2 border rounded-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-8 animate-in fade-in">
              <h3 className="text-2xl font-bold text-gray-800 border-b pb-4">Áudio e Feedback</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-700">Mixagem</h4>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Volume Global (%)</label>
                    <input type="range" min="0" max="100" value={localConfig.audio.globalVolume} onChange={e => updateSection('audio', 'globalVolume', Number(e.target.value))} className="w-full" />
                    <div className="text-right text-sm text-gray-500">{localConfig.audio.globalVolume}%</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="muted" checked={localConfig.audio.muted} onChange={e => updateSection('audio', 'muted', e.target.checked)} className="w-5 h-5 rounded text-emerald-600" />
                    <label htmlFor="muted" className="font-semibold text-gray-700">Mutar todos os sons</label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-700">Sons Individuais (URLs)</h4>
                  {Object.entries(localConfig.audio.urls).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-gray-600 mb-1 capitalize">{key}</label>
                      <input type="text" value={value} onChange={e => updateNested('audio', ['urls', key], e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gamification' && (
            <div className="space-y-8 animate-in fade-in">
              <h3 className="text-2xl font-bold text-gray-800 border-b pb-4">Gamificação e Textos</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-emerald-700">Tela de Vitória</h4>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Título</label>
                    <input type="text" value={localConfig.gamification.win.title} onChange={e => updateNested('gamification', ['win', 'title'], e.target.value)} className="w-full p-3 border rounded-xl bg-emerald-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Subtítulo</label>
                    <input type="text" value={localConfig.gamification.win.subtitle} onChange={e => updateNested('gamification', ['win', 'subtitle'], e.target.value)} className="w-full p-3 border rounded-xl bg-emerald-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Imagem de Destaque (URL)</label>
                    <input type="text" value={localConfig.gamification.win.imageUrl} onChange={e => updateNested('gamification', ['win', 'imageUrl'], e.target.value)} className="w-full p-3 border rounded-xl bg-emerald-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Background Específico (URL)</label>
                    <input type="text" value={localConfig.gamification.win.backgroundUrl} onChange={e => updateNested('gamification', ['win', 'backgroundUrl'], e.target.value)} className="w-full p-3 border rounded-xl bg-emerald-50" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-red-700">Tela de Derrota</h4>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Título</label>
                    <input type="text" value={localConfig.gamification.lose.title} onChange={e => updateNested('gamification', ['lose', 'title'], e.target.value)} className="w-full p-3 border rounded-xl bg-red-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Subtítulo</label>
                    <input type="text" value={localConfig.gamification.lose.subtitle} onChange={e => updateNested('gamification', ['lose', 'subtitle'], e.target.value)} className="w-full p-3 border rounded-xl bg-red-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Imagem de Destaque (URL)</label>
                    <input type="text" value={localConfig.gamification.lose.imageUrl} onChange={e => updateNested('gamification', ['lose', 'imageUrl'], e.target.value)} className="w-full p-3 border rounded-xl bg-red-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Background Específico (URL)</label>
                    <input type="text" value={localConfig.gamification.lose.backgroundUrl} onChange={e => updateNested('gamification', ['lose', 'backgroundUrl'], e.target.value)} className="w-full p-3 border rounded-xl bg-red-50" />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
