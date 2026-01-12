import React, { useState, useEffect, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { Header } from './components/Header';
import { QuickActions } from './components/QuickActions';
import { GuidancePanel } from './components/GuidancePanel';
import { ContactManager } from './components/ContactManager';
import { AccessibilitySettings } from './components/AccessibilitySettings';
import { AppSection, EmergencyContact, EmergencyInstruction, AIQueryItem, AccessibilitySettings as SettingsType } from './types';
import { Info, X, BellRing, AlertTriangle } from 'lucide-react';

// Error Boundary para evitar tela branca total
// Fix: Use React.Component explicitly and make children optional to resolve property access and JSX validation errors
class ErrorBoundary extends React.Component<{ children?: React.ReactNode }, { hasError: boolean }> {
  // Fix: Property initializer for state instead of constructor for cleaner TS compatibility
  state = { hasError: false };

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Erro capturado:", error, errorInfo);
  }

  render() {
    // Fix: 'this.state' is now correctly inherited from React.Component
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
          <div className="bg-red-100 p-6 rounded-full mb-6">
            <AlertTriangle className="w-16 h-16 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Ops! Algo deu errado.</h2>
          <p className="text-slate-500 mb-8">Ocorreu um erro inesperado na inicialização do aplicativo.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl"
          >
            Tentar Novamente
          </button>
        </div>
      );
    }
    // Fix: 'this.props' is now correctly inherited from React.Component
    return this.props.children;
  }
}

const DEFAULT_GUIDES: EmergencyInstruction[] = [
  { id: '1', title: 'Falta de Ar', icon: 'Wind', category: 'saude', content: '1. Sente-se e tente manter a calma.\n2. Incline o corpo levemente para frente.\n3. Respire devagar pelo nariz.\n4. Se não melhorar em 2 minutos, ligue 192.' },
  { id: '2', title: 'Convulsão', icon: 'Zap', category: 'saude', content: '1. Afaste objetos próximos para evitar ferimentos.\n2. Coloque algo macio sob a cabeça.\n3. NÃO coloque nada na boca.\n4. Deite a pessoa de lado após a crise.\n5. Chame 192.' },
  { id: '3', title: 'Engasgo (Choking)', icon: '🩹', category: 'saude', content: '1. Se a pessoa tosse, incentive-a a tossir com força.\n2. Se não consegue respirar ou falar, posicione-se atrás dela.\n3. Realize a Manobra de Heimlich: abrace a cintura e pressione o abdome para cima e para dentro com força.\n4. Se a pessoa desmaiar, ligue 192 imediatamente.' },
  { id: '8', title: 'AVC (Derrame)', icon: '🧠', category: 'saude', content: '1. SORRISO: Peça para sorrir. A boca entortou?\n2. ABRAÇO: Peça para levantar os braços. Um caiu?\n3. FALA: Peça para repetir uma frase. A fala está enrolada?\n4. Se notar qualquer sinal, ligue 192 IMEDIATAMENTE.' },
  { id: '10', title: 'Crise de Ansiedade', icon: 'Brain', category: 'mental', content: '1. Encontre um lugar calmo e seguro.\n2. Inspire pelo nariz contando até 4.\n3. Segure o ar por 4 segundos.\n4. Solte lentamente pela boca contando até 4.\n5. Foque em 3 objetos que você consegue ver agora.' },
];

const DEFAULT_SETTINGS: SettingsType = {
  fontSize: 'normal',
  highContrast: 'none',
  animations: true,
  hapticFeedback: true,
  hapticIntensity: 'medium',
};

const AppContent: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.HOME);
  const [toast, setToast] = useState<{message: string, type: 'alert' | 'info'} | null>(null);
  
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    try {
      const saved = localStorage.getItem('apoio_vital_contacts');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [guides, setGuides] = useState<EmergencyInstruction[]>(() => {
    try {
      const saved = localStorage.getItem('apoio_vital_guides');
      return saved ? JSON.parse(saved) : DEFAULT_GUIDES;
    } catch { return DEFAULT_GUIDES; }
  });

  const [aiHistory, setAiHistory] = useState<AIQueryItem[]>(() => {
    try {
      const saved = localStorage.getItem('apoio_vital_ai_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [accSettings, setAccSettings] = useState<SettingsType>(() => {
    try {
      const saved = localStorage.getItem('apoio_vital_acc_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  });

  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('apoio_vital_onboarded'));

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'alert') => {
    if (!accSettings.hapticFeedback || !navigator.vibrate) return;
    let baseMs = 50;
    if (accSettings.hapticIntensity === 'low') baseMs = 20;
    if (accSettings.hapticIntensity === 'high') baseMs = 100;
    switch (type) {
      case 'light': navigator.vibrate(baseMs * 0.5); break;
      case 'medium': navigator.vibrate(baseMs); break;
      case 'heavy': navigator.vibrate(baseMs * 1.5); break;
      case 'alert': navigator.vibrate([baseMs, 50, baseMs, 50, baseMs * 2]); break;
    }
  }, [accSettings.hapticFeedback, accSettings.hapticIntensity]);

  useEffect(() => {
    localStorage.setItem('apoio_vital_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('apoio_vital_acc_settings', JSON.stringify(accSettings));
    const body = document.body;
    body.classList.remove('font-size-large', 'font-size-xl', 'contrast-dark', 'contrast-light', 'no-animations');
    if (accSettings.fontSize === 'large') body.classList.add('font-size-large');
    if (accSettings.fontSize === 'xl') body.classList.add('font-size-xl');
    if (accSettings.highContrast === 'dark') body.classList.add('contrast-dark');
    if (accSettings.highContrast === 'light') body.classList.add('contrast-light');
    if (!accSettings.animations) body.classList.add('no-animations');
  }, [accSettings]);

  useEffect(() => {
    if (toast) triggerHaptic(toast.type === 'alert' ? 'alert' : 'heavy');
  }, [toast, triggerHaptic]);

  const handleCall = (phone: string) => { 
    triggerHaptic('heavy');
    window.location.href = `tel:${phone}`; 
  };

  const handleSilentAlert = (contact: EmergencyContact) => {
    const message = encodeURIComponent(`ALERTA DE EMERGÊNCIA ApoioVital: Preciso de ajuda urgente.`);
    setToast({ message: `Alerta enviado para ${contact.name}...`, type: 'alert' });
    setTimeout(() => setToast(null), 4000);
    window.open(`sms:${contact.phone}?body=${message}`, '_blank');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-50 shadow-2xl relative overflow-hidden transition-colors duration-300">
      <Header 
        onMenuToggle={() => { triggerHaptic('light'); setActiveSection(AppSection.CONTACTS); }} 
        onHomeClick={() => { triggerHaptic('light'); setActiveSection(AppSection.HOME); }}
        onAccessibilityClick={() => { triggerHaptic('light'); setActiveSection(AppSection.ACCESSIBILITY); }}
      />

      <main className="flex-1 p-6 pb-24 overflow-y-auto custom-scrollbar">
        {activeSection === AppSection.HOME && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Olá! 👋</h2>
              <p className="text-slate-500 text-lg font-medium">Como podemos ajudar você hoje?</p>
            </div>
            
            <QuickActions 
              contacts={contacts} 
              onCall={handleCall} 
              onSilentAlert={handleSilentAlert}
              onNavigate={(section) => { triggerHaptic('light'); setActiveSection(section as AppSection); }} 
            />

            <div className="mt-8 bg-blue-50 p-5 rounded-2xl border border-blue-100 flex gap-4">
              <div className="bg-blue-500 text-white p-2 rounded-lg h-fit">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-blue-900 text-lg">Dica de Segurança</p>
                <p className="text-blue-800 mt-1">Mantenha seu telefone sempre carregado.</p>
              </div>
            </div>
          </>
        )}

        {toast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] animate-in slide-in-from-top-10 duration-300">
            <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 border-2 ${toast.type === 'alert' ? 'bg-red-600 border-red-400 text-white' : 'bg-blue-600 border-blue-400 text-white'}`}>
              <BellRing className="w-6 h-6 animate-bounce" />
              <p className="font-bold">{toast.message}</p>
              <button onClick={() => setToast(null)} className="ml-auto p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {activeSection === AppSection.GUIDANCE && (
          <div className="fixed inset-0 z-50 pt-16 bg-slate-900/40 backdrop-blur-sm">
             <GuidancePanel 
              guides={guides}
              onUpdateIcon={(id, icon) => setGuides(prev => prev.map(g => g.id === id ? { ...g, icon } : g))}
              onBack={() => { triggerHaptic('light'); setActiveSection(AppSection.HOME); }} 
              initialMode="manual"
              aiHistory={aiHistory}
              onAddAiHistory={(item) => { triggerHaptic('medium'); setAiHistory(prev => [item, ...prev].slice(0, 20)); }}
              onClearAiHistory={() => { triggerHaptic('heavy'); setAiHistory([]); }}
             />
          </div>
        )}

        {activeSection === AppSection.AI_ASSISTANT && (
          <div className="fixed inset-0 z-50 pt-16 bg-slate-900/40 backdrop-blur-sm">
             <GuidancePanel 
              guides={guides}
              onUpdateIcon={(id, icon) => setGuides(prev => prev.map(g => g.id === id ? { ...g, icon } : g))}
              onBack={() => { triggerHaptic('light'); setActiveSection(AppSection.HOME); }} 
              initialMode="ai"
              aiHistory={aiHistory}
              onAddAiHistory={(item) => { triggerHaptic('medium'); setAiHistory(prev => [item, ...prev].slice(0, 20)); }}
              onClearAiHistory={() => { triggerHaptic('heavy'); setAiHistory([]); }}
             />
          </div>
        )}

        {activeSection === AppSection.CONTACTS && (
          <div className="fixed inset-0 z-50 pt-16 bg-slate-900/40 backdrop-blur-sm">
             <ContactManager 
                contacts={contacts}
                onAdd={(c) => { triggerHaptic('medium'); setContacts(prev => [...prev, { ...c, id: Date.now().toString() }]); }}
                onDelete={(id) => { triggerHaptic('heavy'); setContacts(prev => prev.filter(c => c.id !== id)); }}
                onSetPrimary={(id) => { triggerHaptic('light'); setContacts(prev => prev.map(c => ({ ...c, isPrimary: c.id === id }))); }}
                onBack={() => { triggerHaptic('light'); setActiveSection(AppSection.HOME); }} 
             />
          </div>
        )}

        {activeSection === AppSection.ACCESSIBILITY && (
          <div className="fixed inset-0 z-50 pt-16 bg-slate-900/40 backdrop-blur-sm">
            <AccessibilitySettings 
              settings={accSettings}
              onUpdate={setAccSettings}
              onBack={() => { triggerHaptic('light'); setActiveSection(AppSection.HOME); }}
            />
          </div>
        )}
      </main>

      {showWelcome && (
        <div className="fixed inset-0 z-[100] bg-blue-600 text-white p-10 flex flex-col justify-center items-center text-center">
          <div className="bg-white p-6 rounded-full mb-8">
            <Info className="w-20 h-20 text-blue-600" />
          </div>
          <h2 className="text-4xl font-black mb-4 leading-tight">Bem-vindo ao ApoioVital</h2>
          <button 
            onClick={() => {
              triggerHaptic('light');
              setShowWelcome(false);
              localStorage.setItem('apoio_vital_onboarded', 'true');
            }}
            className="w-full max-w-xs bg-white text-blue-600 font-black py-5 rounded-2xl text-2xl shadow-2xl active:scale-95 transition-all"
          >
            Começar
          </button>
        </div>
      )}

      {activeSection !== AppSection.HOME && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full px-6 z-[60]">
           <button 
            onClick={() => handleCall('192')}
            className="w-full bg-red-600 text-white p-4 rounded-2xl shadow-xl font-black text-xl flex items-center justify-center gap-3 animate-bounce"
           >
             LIGAR 192 AGORA
           </button>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
);

export default App;