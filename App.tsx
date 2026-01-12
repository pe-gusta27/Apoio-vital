
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { QuickActions } from './components/QuickActions';
import { GuidancePanel } from './components/GuidancePanel';
import { ContactManager } from './components/ContactManager';
import { AppSection, EmergencyContact, EmergencyInstruction, AIQueryItem } from './types';
import { Info, X, BellRing } from 'lucide-react';

const DEFAULT_GUIDES: EmergencyInstruction[] = [
  { id: '1', title: 'Falta de Ar', icon: 'Wind', category: 'saude', content: '1. Sente-se e tente manter a calma.\n2. Incline o corpo levemente para frente.\n3. Respire devagar pelo nariz.\n4. Se não melhorar em 2 minutos, ligue 192.' },
  { id: '2', title: 'Convulsão', icon: 'Zap', category: 'saude', content: '1. Afaste objetos próximos para evitar ferimentos.\n2. Coloque algo macio sob a cabeça.\n3. NÃO coloque nada na boca.\n4. Deite a pessoa de lado após a crise.\n5. Chame 192.' },
  { id: '3', title: 'Engasgo (Choking)', icon: '🩹', category: 'saude', content: '1. Se a pessoa tosse, incentive-a a tossir com força.\n2. Se não consegue respirar ou falar, posicione-se atrás dela.\n3. Realize a Manobra de Heimlich: abrace a cintura e pressione o abdome para cima e para dentro com força.\n4. Se a pessoa desmaiar, ligue 192 imediatamente.' },
  { id: '4', title: 'Queimaduras', icon: '🔥', category: 'saude', content: '1. Resfrie a área com água corrente fria por 15 minutos.\n2. NÃO use gelo, pasta de dente ou pomadas.\n3. Cubra levemente com um pano limpo e úmido.\n4. Se houver bolhas ou a pele estiver solta, procure o hospital.' },
  { id: '5', title: 'Cortes e Sangramento', icon: '🩸', category: 'saude', content: '1. Lave a ferida com água corrente e sabão.\n2. Pressione o local com um pano limpo por 5-10 minutos sem parar.\n3. Se o sangue não parar, mantenha a pressão e eleve a região.\n4. Procure um posto de saúde para pontos se o corte for fundo.' },
  { id: '6', title: 'Hemorragia Grave', icon: '🆘', category: 'saude', content: '1. Ligue 192 imediatamente.\n2. Pressione a ferida com toda a força usando um pano limpo.\n3. Se o pano encharcar, coloque outro por cima sem remover o primeiro.\n4. Se possível, eleve o membro ferido acima do nível do coração.' },
  { id: '7', title: 'Desmaio (Fainting)', icon: '😵', category: 'saude', content: '1. Deite a pessoa de costas em local ventilado.\n2. Eleve as pernas dela (cerca de 30cm) acima do nível do coração.\n3. Afrouxe roupas apertadas.\n4. Se não acordar em 1 minuto ou se for idoso, ligue 192.' },
  { id: '8', title: 'AVC (Derrame)', icon: '🧠', category: 'saude', content: '1. SORRISO: Peça para sorrir. A boca entortou?\n2. ABRAÇO: Peça para levantar os braços. Um caiu?\n3. FALA: Peça para repetir uma frase. A fala está enrolada?\n4. Se notar qualquer sinal, ligue 192 IMEDIATAMENTE.' },
  { id: '9', title: 'Dor no Peito (Infarto)', icon: '💔', category: 'saude', content: '1. Ligue 192 imediatamente.\n2. Mantenha a pessoa sentada e em repouso absoluto.\n3. Afrouxe as roupas e tente acalmá-la.\n4. Não ofereça alimentos ou bebidas enquanto espera o SAMU.' },
  { id: '10', title: 'Crise de Ansiedade', icon: 'Brain', category: 'mental', content: '1. Encontre um lugar calmo e seguro.\n2. Inspire pelo nariz contando até 4.\n3. Segure o ar por 4 segundos.\n4. Solte lentamente pela boca contando até 4.\n5. Foque em 3 objetos que você consegue ver agora.' },
  { id: '11', title: 'Queda / Mobilidade', icon: 'Accessibility', category: 'mobilidade', content: '1. Não tente levantar a pessoa bruscamente.\n2. Pergunte onde dói e verifique se há deformidade em ossos.\n3. Se houver dor forte na coluna ou quadril, NÃO movimente.\n4. Agasalhe a pessoa e ligue para um familiar ou 192.' },
  { id: '12', title: 'Animais Peçonhentos', icon: '🦂', category: 'saude', content: '1. Lave o local da picada apenas com água e sabão.\n2. Mantenha a vítima em repouso e o membro afetado elevado.\n3. NÃO faça torniquete, cortes ou sucção no local.\n4. Se possível, tire uma foto do animal para identificação médica.\n5. Leve a vítima ao hospital mais próximo imediatamente ou ligue 192.' },
  { id: '13', title: 'Recém-nascido', icon: '👶', category: 'saude', content: '1. Engasgo: Coloque o bebê de bruços no seu arminclined for baixo. Dê 5 tapinhas firmes nas costas.\n2. Vire o bebê e faça 5 compressões no peito com dois dedos.\n3. Respiração: Se o bebê não chora ou está roxo, ligue 192 imediatamente.\n4. Febre: Mantenha o bebê hidratado e procure auxílio médico urgente.' },
  { id: '14', title: 'Parada Cardíaca', icon: '❤️', category: 'saude', content: '1. Ligue 192 (SAMU) ou 193 (Bombeiros) imediatamente.\n2. Verifique se a pessoa responde. Se não, deite-a de costas em superfície dura.\n3. Coloque as mãos no centro do peito da vítima.\n4. Com os braços esticados, empurre o peito com força e rapidez (100 a 120 vezes por minuto).\n5. Deixe o peito voltar à posição normal entre cada compressão.\n6. Continue até o socorro chegar ou a pessoa reagir.' },
];

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.HOME);
  const [toast, setToast] = useState<{message: string, type: 'alert' | 'info'} | null>(null);
  
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    const saved = localStorage.getItem('apoio_vital_contacts');
    return saved ? JSON.parse(saved) : [];
  });

  const [guides, setGuides] = useState<EmergencyInstruction[]>(() => {
    const saved = localStorage.getItem('apoio_vital_guides');
    const parsed = saved ? JSON.parse(saved) : DEFAULT_GUIDES;
    return parsed;
  });

  const [aiHistory, setAiHistory] = useState<AIQueryItem[]>(() => {
    const saved = localStorage.getItem('apoio_vital_ai_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [showWelcome, setShowWelcome] = useState(!localStorage.getItem('apoio_vital_onboarded'));

  useEffect(() => {
    localStorage.setItem('apoio_vital_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('apoio_vital_guides', JSON.stringify(guides));
  }, [guides]);

  useEffect(() => {
    localStorage.setItem('apoio_vital_ai_history', JSON.stringify(aiHistory));
  }, [aiHistory]);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleSilentAlert = (contact: EmergencyContact) => {
    const message = encodeURIComponent(`ALERTA DE EMERGÊNCIA ApoioVital: Preciso de ajuda urgente. Este é um alerta silencioso enviado por ${contact.name ? 'um de seus contatos' : 'mim'}.`);
    
    setToast({ 
      message: `Enviando alerta para ${contact.name}...`, 
      type: 'alert' 
    });

    setTimeout(() => setToast(null), 4000);
    window.open(`sms:${contact.phone}?body=${message}`, '_blank');
  };

  const addContact = (newContact: Omit<EmergencyContact, 'id'>) => {
    const contact: EmergencyContact = {
      ...newContact,
      id: Date.now().toString(),
    };
    setContacts(prev => [...prev, contact]);
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const setPrimaryContact = (id: string) => {
    setContacts(prev => prev.map(c => ({
      ...c,
      isPrimary: c.id === id
    })));
  };

  const updateGuideIcon = (id: string, newIcon: string) => {
    setGuides(prev => prev.map(g => g.id === id ? { ...g, icon: newIcon } : g));
  };

  const addAiHistoryItem = (item: AIQueryItem) => {
    setAiHistory(prev => [item, ...prev].slice(0, 20)); 
  };

  const clearAiHistory = () => {
    setAiHistory([]);
  };

  const closeWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('apoio_vital_onboarded', 'true');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-50 shadow-2xl relative overflow-hidden">
      <Header 
        onMenuToggle={() => setActiveSection(AppSection.CONTACTS)} 
        onHomeClick={() => setActiveSection(AppSection.HOME)}
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
              onNavigate={(section) => setActiveSection(section as AppSection)} 
            />

            <div className="mt-8 bg-blue-50 p-5 rounded-2xl border border-blue-100 flex gap-4">
              <div className="bg-blue-500 text-white p-2 rounded-lg h-fit">
                <div className="w-6 h-6 flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="font-bold text-blue-900 text-lg">Dica de Segurança</p>
                <p className="text-blue-800 mt-1">Mantenha seu telefone sempre carregado e perto de você.</p>
              </div>
            </div>
          </>
        )}

        {toast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] animate-in slide-in-from-top-10 duration-300">
            <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 border-2 ${toast.type === 'alert' ? 'bg-red-600 border-red-400 text-white' : 'bg-blue-600 border-blue-400 text-white'}`}>
              <BellRing className="w-6 h-6 animate-bounce" />
              <p className="font-bold">{toast.message}</p>
              <button onClick={() => setToast(null)} className="ml-auto">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {activeSection === AppSection.GUIDANCE && (
          <div className="fixed inset-0 z-50 pt-16 bg-slate-900/40 backdrop-blur-sm">
             <GuidancePanel 
              guides={guides}
              onUpdateIcon={updateGuideIcon}
              onBack={() => setActiveSection(AppSection.HOME)} 
              initialMode="manual"
              aiHistory={aiHistory}
              onAddAiHistory={addAiHistoryItem}
              onClearAiHistory={clearAiHistory}
             />
          </div>
        )}

        {activeSection === AppSection.AI_ASSISTANT && (
          <div className="fixed inset-0 z-50 pt-16 bg-slate-900/40 backdrop-blur-sm">
             <GuidancePanel 
              guides={guides}
              onUpdateIcon={updateGuideIcon}
              onBack={() => setActiveSection(AppSection.HOME)} 
              initialMode="ai"
              aiHistory={aiHistory}
              onAddAiHistory={addAiHistoryItem}
              onClearAiHistory={clearAiHistory}
             />
          </div>
        )}

        {activeSection === AppSection.CONTACTS && (
          <div className="fixed inset-0 z-50 pt-16 bg-slate-900/40 backdrop-blur-sm">
             <ContactManager 
                contacts={contacts}
                onAdd={addContact}
                onDelete={deleteContact}
                onSetPrimary={setPrimaryContact}
                onBack={() => setActiveSection(AppSection.HOME)} 
             />
          </div>
        )}
      </main>

      {showWelcome && (
        <div className="fixed inset-0 z-[100] bg-blue-600 text-white p-10 flex flex-col justify-center items-center text-center animate-in fade-in zoom-in duration-500">
          <button 
            onClick={closeWelcome}
            className="absolute top-8 right-8 p-2 bg-white/20 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="bg-white p-6 rounded-full mb-8">
            <Info className="w-20 h-20 text-blue-600" />
          </div>
          <h2 className="text-4xl font-black mb-4 leading-tight">Bem-vindo ao ApoioVital</h2>
          <p className="text-xl opacity-90 mb-12">Estamos aqui para garantir sua segurança com contatos rápidos e orientações inteligentes.</p>
          <button 
            onClick={closeWelcome}
            className="w-full max-w-xs bg-white text-blue-600 font-black py-5 rounded-2xl text-2xl shadow-2xl active:scale-95 transition-all"
          >
            Começar Agora
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

export default App;
