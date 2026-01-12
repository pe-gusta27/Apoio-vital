
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Loader2, Info, Wind, Zap, Brain, Accessibility, Settings2, Check, X, History, Trash2, Smile, Mic, Square, Volume2, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getEmergencyGuidance, AudioData } from '../services/geminiService';
import { EmergencyInstruction, AIQueryItem } from '../types';

interface GuidancePanelProps {
  guides: EmergencyInstruction[];
  onUpdateIcon: (id: string, newIcon: string) => void;
  onBack: () => void;
  initialMode?: 'manual' | 'ai';
  aiHistory: AIQueryItem[];
  onAddAiHistory: (item: AIQueryItem) => void;
  onClearAiHistory: () => void;
}

const ICON_MAP: Record<string, any> = { Wind, Zap, Brain, Accessibility };
const PRESET_EMOJIS = [
  '🫁', '⚡', '🧠', '🦯', '🤕', '🚑', '🆘', '🧘', '🩹', '🌡️', '💧', '🦴', '🔥', '🩸', '👶',
  '🏠', '🏥', '👨‍👩', '🤝', '🏢', '🐕', '🚲', '👨‍⚕️', '💊', '👵', '👴', '🛡️', '❤️', '⚠️'
];

// Local fallback data for critical emergencies
const LOCAL_FALLBACK_DATA = [
  { 
    id: 'fb1', 
    title: 'Infarto / Dor no Peito', 
    content: '1. Ligue 192 (SAMU) imediatamente.\n2. Mantenha a pessoa sentada e em repouso.\n3. Afrouxe roupas apertadas.\n4. Não dê comida ou bebida.' 
  },
  { 
    id: 'fb2', 
    title: 'Engasgo Adulto', 
    content: '1. Se tossir, incentive.\n2. Se não respirar, use a Manobra de Heimlich.\n3. Abrace por trás e pressione o abdome para cima e para dentro.' 
  }
];

// Fix: Exporting the GuidancePanel component to resolve the import error in App.tsx
export const GuidancePanel: React.FC<GuidancePanelProps> = ({ 
  guides, 
  onUpdateIcon, 
  onBack, 
  initialMode = 'manual',
  aiHistory,
  onAddAiHistory,
  onClearAiHistory
}) => {
  const [mode, setMode] = useState<'manual' | 'ai'>(initialMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<EmergencyInstruction | null>(null);
  const [isEditingIcon, setIsEditingIcon] = useState<string | null>(null);
  
  // AI Assistant States
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<AudioData | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const filteredGuides = guides.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = (reader.result as string).split(',')[1];
          setRecordedAudio({ data: base64data, mimeType: 'audio/webm' });
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Não foi possível acessar o microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSendAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() && !recordedAudio) return;

    setIsLoading(true);
    const queryText = userInput || "Solicitação via áudio";
    
    try {
      const response = await getEmergencyGuidance(userInput, recordedAudio || undefined);
      
      const newHistoryItem: AIQueryItem = {
        id: Date.now().toString(),
        query: queryText,
        response: response,
        timestamp: Date.now()
      };
      
      onAddAiHistory(newHistoryItem);
      setUserInput('');
      setRecordedAudio(null);
    } catch (error) {
      alert("Desculpe, ocorreu um erro ao processar sua solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderIcon = (icon: string) => {
    const IconComponent = ICON_MAP[icon];
    if (IconComponent) return <IconComponent className="w-6 h-6" />;
    return <span className="text-xl">{icon}</span>;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-t-3xl overflow-hidden animate-in slide-in-from-right-full duration-300">
      <div className="p-4 bg-slate-50 border-b flex items-center justify-between shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex bg-slate-200 p-1 rounded-xl">
          <button 
            onClick={() => setMode('manual')}
            className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-all ${mode === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
          >
            Guia Manual
          </button>
          <button 
            onClick={() => setMode('ai')}
            className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-all ${mode === 'ai' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
          >
            Assistente IA
          </button>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {mode === 'manual' ? (
          <div className="p-6 space-y-6">
            {!selectedGuide ? (
              <>
                <div className="relative">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="O que está acontecendo?"
                    className="w-full bg-slate-100 p-4 pl-12 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-lg"
                  />
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {filteredGuides.map(guide => (
                    <button
                      key={guide.id}
                      onClick={() => setSelectedGuide(guide)}
                      className="flex items-center gap-4 p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/30 transition-all text-left group"
                    >
                      <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-white transition-colors">
                        {renderIcon(guide.icon)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800">{guide.title}</h3>
                        <p className="text-xs text-slate-500 uppercase font-black tracking-widest">{guide.category}</p>
                      </div>
                      <Settings2 
                        className="w-5 h-5 text-slate-300 hover:text-blue-500" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingIcon(guide.id);
                        }}
                      />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <button 
                  onClick={() => setSelectedGuide(null)}
                  className="mb-4 flex items-center gap-2 text-blue-600 font-bold"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar à lista
                </button>
                <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-xl shadow-blue-100 mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-white/20 p-3 rounded-2xl">
                      {renderIcon(selectedGuide.icon)}
                    </div>
                    <h2 className="text-2xl font-black">{selectedGuide.title}</h2>
                  </div>
                  <div className="bg-white/10 h-px w-full mb-4" />
                  <div className="space-y-4 text-lg font-medium leading-relaxed whitespace-pre-line">
                    {selectedGuide.content}
                  </div>
                </div>
                
                <div className="bg-red-50 p-5 rounded-2xl border-2 border-red-100 flex gap-4 items-start">
                  <AlertTriangle className="w-8 h-8 text-red-500 shrink-0" />
                  <div>
                    <p className="font-bold text-red-900">Não houve melhora?</p>
                    <p className="text-red-800 text-sm mt-1">Se a situação se agravar ou a pessoa não reagir, ligue imediatamente para o 192.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {aiHistory.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-10 h-10 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">Assistente de Emergência</h3>
                    <p className="text-slate-500 max-w-[240px] mx-auto mt-2">
                      Descreva o que está acontecendo por texto ou voz e receba orientações instantâneas.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-400 uppercase tracking-widest text-xs">Histórico Recente</h3>
                    <button onClick={onClearAiHistory} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {aiHistory.map(item => (
                    <div key={item.id} className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex justify-end">
                        <div className="bg-slate-100 p-4 rounded-2xl rounded-tr-none max-w-[85%]">
                          <p className="font-bold text-slate-800">{item.query}</p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-blue-50 border border-blue-100 p-5 rounded-3xl rounded-tl-none max-w-[90%] shadow-sm">
                          <div className="flex items-center gap-2 mb-2 text-blue-600">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">ApoioVital IA</span>
                          </div>
                          <div className="text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                            {item.response}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 bg-white border-t shrink-0">
              <form onSubmit={handleSendAI} className="space-y-4">
                {recordedAudio && (
                  <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl border border-blue-200 animate-in zoom-in">
                    <Volume2 className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-bold text-blue-900 flex-1">Áudio capturado</span>
                    <button type="button" onClick={() => setRecordedAudio(null)} className="text-blue-400 hover:text-blue-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    className={`p-4 rounded-2xl transition-all shadow-md active:scale-90 ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {isRecording ? <Square className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                  </button>
                  
                  <div className="relative flex-1">
                    <input 
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Descreva a emergência..."
                      className="w-full bg-slate-100 p-4 pr-12 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-medium"
                    />
                    <button 
                      type="submit"
                      disabled={isLoading || (!userInput.trim() && !recordedAudio)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg"
                    >
                      {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider">
                  {isRecording ? 'Solte para processar áudio' : 'Segure o microfone para falar'}
                </p>
              </form>
            </div>
          </div>
        )}
      </div>

      {isEditingIcon && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-8 animate-in slide-in-from-bottom-full duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black">Escolher Novo Ícone</h3>
              <button onClick={() => setIsEditingIcon(null)} className="p-2 bg-slate-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-6 gap-3 mb-8">
              {PRESET_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    onUpdateIcon(isEditingIcon, emoji);
                    setIsEditingIcon(null);
                  }}
                  className="text-3xl p-3 hover:bg-slate-50 rounded-2xl transition-all active:scale-90"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
