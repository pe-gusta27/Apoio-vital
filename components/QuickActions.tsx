
import React, { useState, useRef } from 'react';
import { Phone, AlertCircle, Heart, UserPlus, MessageSquareText } from 'lucide-react';
import { EmergencyContact } from '../types';

interface QuickActionsProps {
  contacts: EmergencyContact[];
  onCall: (phone: string) => void;
  onNavigate: (section: string) => void;
  onSilentAlert: (contact: EmergencyContact) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ contacts, onCall, onNavigate, onSilentAlert }) => {
  const primaryContact = contacts.find(c => c.isPrimary);
  const [clickCount, setClickCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEmergencyClick = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      setClickCount(0);
      
      if (primaryContact) {
        onSilentAlert(primaryContact);
      } else {
        onCall('192');
      }
    } else {
      setClickCount(1);
      timerRef.current = setTimeout(() => {
        onCall('192');
        timerRef.current = null;
        setClickCount(0);
      }, 500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative group">
        <button 
          onClick={handleEmergencyClick}
          className={`w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 transition-all relative overflow-hidden ${clickCount === 1 ? 'ring-4 ring-red-400 ring-offset-2' : ''}`}
        >
          <div className="bg-white/20 p-4 rounded-full">
            <AlertCircle className="w-16 h-16" />
          </div>
          <div className="text-center">
            <span className="text-3xl font-black block">EMERGÊNCIA</span>
            <span className="text-lg font-medium opacity-90">1 toque: Ligar 192</span>
            {primaryContact && (
              <span className="text-xs block mt-1 opacity-70 italic">2 toques: Alerta para {primaryContact.name}</span>
            )}
          </div>
          
          {clickCount === 1 && (
            <div className="absolute inset-0 bg-white/10 flex items-center justify-center backdrop-blur-[2px]">
              <span className="font-black text-white text-xl animate-pulse">TOQUE NOVAMENTE PARA ALERTA</span>
            </div>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onNavigate('guidance')}
          className="bg-orange-100 p-6 rounded-2xl flex flex-col items-center gap-3 border-2 border-orange-200 hover:bg-orange-200 transition-colors"
        >
          <div className="bg-orange-500 p-3 rounded-xl text-white">
            <Heart className="w-8 h-8" />
          </div>
          <span className="font-bold text-orange-900 text-lg">Guia SOS</span>
        </button>

        <button 
          onClick={() => onNavigate('ai_assistant')}
          className="bg-blue-100 p-6 rounded-2xl flex flex-col items-center gap-3 border-2 border-blue-200 hover:bg-blue-200 transition-colors"
        >
          <div className="bg-blue-500 p-3 rounded-xl text-white">
            <AlertCircle className="w-8 h-8" />
          </div>
          <span className="font-bold text-blue-900 text-lg">Ajuda IA</span>
        </button>
      </div>

      {primaryContact ? (
        <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 p-2 rounded-xl text-2xl flex items-center justify-center w-12 h-12">
              {primaryContact.icon || '👤'}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Contato de Confiança</p>
              <p className="text-xl font-bold leading-tight">{primaryContact.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onSilentAlert(primaryContact)}
              className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-xl transition-all shadow-md active:scale-90"
              title="Enviar Alerta SMS"
            >
              <MessageSquareText className="w-7 h-7" />
            </button>
            <button 
              onClick={() => onCall(primaryContact.phone)}
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl transition-all shadow-md active:scale-90"
              title="Ligar"
            >
              <Phone className="w-7 h-7" />
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => onNavigate('contacts')}
          className="w-full border-2 border-dashed border-slate-300 p-6 rounded-2xl text-slate-500 flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors"
        >
          <UserPlus className="w-6 h-6" />
          <span className="font-bold">Adicionar Contato de Confiança</span>
        </button>
      )}
    </div>
  );
};
