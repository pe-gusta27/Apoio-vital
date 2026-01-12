
import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Send, Loader2, Image as ImageIcon, Download, RotateCcw, Sparkles } from 'lucide-react';
import { editImageWithPrompt } from '../services/geminiService';

interface ImageEditorProps {
  onBack: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ onBack }) => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setSourceImage(base64);
        setMimeType(file.type);
        setEditedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceImage || !prompt.trim()) return;

    setIsLoading(true);
    try {
      const result = await editImageWithPrompt(sourceImage, mimeType, prompt);
      if (result) {
        setEditedImage(result);
        // If we want to continue editing from the new one, we could setSourceImage here
      }
    } catch (error) {
      alert("Falha ao processar a edição. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setSourceImage(null);
    setEditedImage(null);
    setPrompt('');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-t-3xl overflow-hidden animate-in slide-in-from-right-full duration-300">
      <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-black flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          Editor Mágico
        </h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {!sourceImage ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-4 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="bg-blue-100 p-6 rounded-full text-blue-600">
              <Upload className="w-12 h-12" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-800">Selecione uma Imagem</p>
              <p className="text-slate-500">Toque aqui para escolher uma foto</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-100 aspect-square flex items-center justify-center">
              <img 
                src={editedImage || `data:${mimeType};base64,${sourceImage}`} 
                alt="Visualização" 
                className="max-h-full w-auto object-contain"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                  <p className="font-bold text-blue-900">A IA está trabalhando na sua imagem...</p>
                </div>
              )}
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder='Ex: "Adicione um filtro retro" ou "Mude o fundo para uma praia"'
                  className="w-full bg-slate-100 p-5 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none text-lg font-medium transition-all resize-none min-h-[120px]"
                />
                <button 
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                </button>
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={reset}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-600 p-4 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  Nova Foto
                </button>
                {editedImage && (
                  <a 
                    href={editedImage} 
                    download="apoio_vital_editado.png"
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white p-4 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    Baixar
                  </a>
                )}
              </div>
            </form>
            
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex gap-3">
              <Sparkles className="w-6 h-6 text-orange-500 shrink-0" />
              <p className="text-sm text-orange-900 leading-tight">
                <strong>Dica:</strong> Seja específico! Tente descrever cores, objetos ou estilos que deseja mudar.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
