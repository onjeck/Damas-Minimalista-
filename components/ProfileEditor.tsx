import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Camera, Save, X, User as UserIcon } from 'lucide-react';

interface ProfileEditorProps {
  user: User;
  onSave: (updatedUser: User) => void;
  onClose: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onSave, onClose }) => {
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatarId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({ ...user, username, avatarId: avatar });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <UserIcon className="text-emerald-400" />
          Editar Perfil
        </h2>

        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-700 bg-slate-800 shadow-lg">
              {avatar && (avatar.startsWith('data:') || avatar.startsWith('http')) ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-800 text-white">
                  {avatar || '👤'}
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-emerald-500 hover:bg-emerald-400 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110"
              title="Alterar Foto"
            >
              <Camera size={20} />
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>
          
          <div className="text-slate-400 text-sm">
            Clique na câmera para fazer upload de uma foto
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">
              Nome de Usuário
            </label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="Digite seu nome..."
              maxLength={20}
            />
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all active:scale-95 mt-4"
          >
            <Save size={20} />
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
