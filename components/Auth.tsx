import React, { useState } from 'react';
import { User } from '../types';
import { User as UserIcon, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useAppConfig } from '../configContext';

interface AuthProps {
  onLogin: (user: User) => void;
}

const AVATARS = ['🧙‍♂️', '🥷', '🤴', '👸', '🧛', '🧜', '🧚', '🧞', '🤖', '👽'];

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const { config } = useAppConfig();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
        setError('Por favor, digite um nome de usuário.');
        return;
    }
    if (username.length < 3) {
        setError('O nome deve ter pelo menos 3 caracteres.');
        return;
    }

    // Simulate API delay
    setTimeout(() => {
        onLogin({
            username: username.trim(),
            avatarId: selectedAvatar,
            rank: 1000, // Starting ELO
            isAdmin: ['admin', 'alison'].includes(username.trim().toLowerCase())
        });
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={config.auth.backgroundUrl ? { backgroundImage: `url(${config.auth.backgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        {/* Background Elements */}
        {!config.auth.backgroundUrl && (
            <>
                <div className="absolute inset-0 bg-emerald-50 -z-20"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#d1fae5_0%,transparent_50%)] -z-10"></div>
            </>
        )}
        
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 animate-fade-in relative z-10">
            <div className="flex flex-col items-center mb-8">
                {config.auth.logoUrl ? (
                    <img src={config.auth.logoUrl} alt="Logo" className="max-h-24 mb-4 object-contain" />
                ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 rotate-3">
                        <Sparkles className="text-white" size={32} />
                    </div>
                )}
                <h1 className="text-3xl font-black text-gray-800 tracking-tight text-center">
                    {isRegister ? 'Criar Conta' : (config.auth.loginTitle || 'Bem-vindo')}
                </h1>
                <p className="text-gray-500 text-sm mt-1 text-center">
                    {isRegister ? 'Inicie sua jornada no Damas Minimalista' : (config.auth.loginSubtitle || 'Faça login para continuar sua saga')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">Avatar</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {AVATARS.map(avatar => (
                            <button
                                key={avatar}
                                type="button"
                                onClick={() => setSelectedAvatar(avatar)}
                                className={`w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full flex items-center justify-center text-xl md:text-2xl transition-all border-2 ${selectedAvatar === avatar ? 'bg-emerald-100 border-emerald-500 scale-110 shadow-md' : 'bg-gray-50 border-transparent hover:bg-gray-100 grayscale hover:grayscale-0'}`}
                            >
                                {avatar}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">Nome de Usuário</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <UserIcon size={20} />
                        </div>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError('');
                            }}
                            placeholder="Seu nome épico"
                            className="w-full bg-gray-50 border-2 border-gray-100 focus:border-emerald-400 focus:bg-white text-gray-800 rounded-xl py-3 pl-12 pr-4 outline-none transition-all font-bold placeholder:font-normal placeholder:text-gray-400"
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs font-bold ml-1 animate-pulse">{error}</p>}
                </div>

                {!isRegister && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">Senha</label>
                         <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <ShieldCheck size={20} />
                            </div>
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border-2 border-gray-100 focus:border-emerald-400 focus:bg-white text-gray-800 rounded-xl py-3 pl-12 pr-4 outline-none transition-all font-bold"
                            />
                        </div>
                    </div>
                )}

                <button 
                    type="submit"
                    className="w-full text-white font-bold py-4 rounded-xl shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
                    style={{ 
                        backgroundColor: config.auth.buttonColor || '#059669',
                        boxShadow: `0 10px 15px -3px ${config.auth.buttonColor ? config.auth.buttonColor + '4d' : 'rgba(5, 150, 105, 0.3)'}`
                    }}
                >
                    <span>{isRegister ? 'Cadastrar e Jogar' : (config.auth.buttonText || 'Entrar')}</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
            </form>

            <div className="mt-6 text-center">
                <button 
                    onClick={() => {
                        setIsRegister(!isRegister);
                        setError('');
                    }}
                    className="text-sm font-semibold text-gray-400 hover:text-emerald-600 transition-colors"
                >
                    {isRegister ? 'Já tem uma conta? ' : 'Não tem conta? '}
                    <span className="text-emerald-600 underline decoration-2 underline-offset-2">{isRegister ? 'Entrar' : 'Cadastre-se'}</span>
                </button>
            </div>
        </div>
    </div>
  );
};

export default Auth;