
import React from 'react';
import { ArrowLeft, Type, Eye, ZapOff, Check, Moon, Sun, Monitor } from 'lucide-react';
import { AccessibilitySettings as SettingsType } from '../types';

interface AccessibilitySettingsProps {
  settings: SettingsType;
  onUpdate: (newSettings: SettingsType) => void;
  onBack: () => void;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ settings, onUpdate, onBack }) => {
  const updateSetting = (key: keyof SettingsType, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-t-3xl overflow-hidden animate-in slide-in-from-right-full duration-300">
      <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-black">Acessibilidade</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Font Size Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-500 font-black uppercase text-xs tracking-widest">
            <Type className="w-4 h-4" />
            <span>Tamanho do Texto</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'normal', label: 'Padrão', desc: 'Ideal para a maioria dos usuários' },
              { id: 'large', label: 'Grande', desc: 'Melhor leitura em telas médias' },
              { id: 'xl', label: 'Extra Grande', desc: 'Máxima visibilidade' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => updateSetting('fontSize', option.id)}
                className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${settings.fontSize === option.id ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-slate-100 bg-slate-50'}`}
              >
                <div className="text-left">
                  <p className="font-bold text-lg">{option.label}</p>
                  <p className="text-sm text-slate-500">{option.desc}</p>
                </div>
                {settings.fontSize === option.id && <Check className="w-6 h-6 text-blue-600" />}
              </button>
            ))}
          </div>
        </section>

        {/* Contrast Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-500 font-black uppercase text-xs tracking-widest">
            <Eye className="w-4 h-4" />
            <span>Contraste Visual</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'none', label: 'Padrão', icon: Monitor, desc: 'Cores normais do aplicativo' },
              { id: 'dark', label: 'Alto Contraste Escuro', icon: Moon, desc: 'Branco no fundo preto' },
              { id: 'light', label: 'Alto Contraste Claro', icon: Sun, desc: 'Preto no fundo branco' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => updateSetting('highContrast', option.id)}
                className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${settings.highContrast === option.id ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-slate-100 bg-slate-50'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${settings.highContrast === option.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}>
                    <option.icon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg">{option.label}</p>
                    <p className="text-sm text-slate-500">{option.desc}</p>
                  </div>
                </div>
                {settings.highContrast === option.id && <Check className="w-6 h-6 text-blue-600" />}
              </button>
            ))}
          </div>
        </section>

        {/* Animations Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-500 font-black uppercase text-xs tracking-widest">
            <ZapOff className="w-4 h-4" />
            <span>Movimento</span>
          </div>
          <button
            onClick={() => updateSetting('animations', !settings.animations)}
            className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${!settings.animations ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-slate-50'}`}
          >
            <div className="text-left">
              <p className="font-bold text-lg">Reduzir Animações</p>
              <p className="text-sm text-slate-500">Desativa transições e movimentos visuais</p>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${!settings.animations ? 'bg-blue-600' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${!settings.animations ? 'right-1' : 'left-1'}`} />
            </div>
          </button>
        </section>
      </div>

      <div className="p-6 bg-slate-50 border-t">
        <button 
          onClick={onBack}
          className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all"
        >
          Salvar Alterações
        </button>
      </div>
    </div>
  );
};
