
import React, { useState, useMemo } from 'react';
import { ArrowLeft, UserPlus, Phone, Trash2, CheckCircle2, Search, ArrowUpDown, X, Smile } from 'lucide-react';
import { EmergencyContact } from '../types';

interface ContactManagerProps {
  contacts: EmergencyContact[];
  onAdd: (contact: Omit<EmergencyContact, 'id'>) => void;
  onDelete: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onBack: () => void;
}

type SortOption = 'name' | 'primary';

const PRESET_ICONS = ['🏠', '🏥', '👨‍👩‍👧', '🤝', '🏢', '🐕', '🚲', '👨‍⚕️', '💊', '👵', '👴', '🛡️'];

export const ContactManager: React.FC<ContactManagerProps> = ({ contacts, onAdd, onDelete, onSetPrimary, onBack }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('primary');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    onAdd({ 
      name: newName, 
      phone: newPhone, 
      relation: newRelation, 
      isPrimary: contacts.length === 0,
      icon: selectedIcon
    });
    setNewName('');
    setNewPhone('');
    setNewRelation('');
    setSelectedIcon(PRESET_ICONS[0]);
    setIsAdding(false);
  };

  const filteredAndSortedContacts = useMemo(() => {
    let result = [...contacts];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.phone.includes(query) || 
        c.relation.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'primary') {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return a.name.localeCompare(b.name);
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [contacts, searchQuery, sortBy]);

  return (
    <div className="flex flex-col h-full bg-white rounded-t-3xl overflow-hidden animate-in slide-in-from-right-full duration-300">
      <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-black">Contatos de Emergência</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isAdding ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800">Novo Contato de Confiança</h3>
              
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Escolha um Ícone</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      className={`text-2xl p-3 rounded-xl border-2 transition-all ${selectedIcon === icon ? 'border-blue-600 bg-blue-50 scale-110' : 'border-slate-100 bg-slate-50 opacity-60'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-100 p-4 rounded-xl border-2 border-transparent focus:border-blue-500 outline-none text-lg font-medium"
                  placeholder="Nome do contato"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1">Telefone (com DDD)</label>
                <input 
                  type="tel" 
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-100 p-4 rounded-xl border-2 border-transparent focus:border-blue-500 outline-none text-lg font-medium"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1">Parentesco / Relação</label>
                <input 
                  type="text" 
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="w-full bg-slate-100 p-4 rounded-xl border-2 border-transparent focus:border-blue-500 outline-none text-lg font-medium"
                  placeholder="Ex: Mãe, Cuidador, Vizinho"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="flex-1 p-4 rounded-xl font-bold text-slate-600 bg-slate-100"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-1 p-4 rounded-xl font-bold text-white bg-blue-600 shadow-lg shadow-blue-200"
              >
                Salvar Contato
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {contacts.length > 0 && (
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-slate-400" />
                  </div>
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar contatos..."
                    className="w-full bg-slate-100 py-3 pl-12 pr-10 rounded-xl border-2 border-transparent focus:border-blue-500 outline-none font-medium transition-all"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-4 flex items-center"
                    >
                      <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                    </button>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                   <button 
                    onClick={() => setSortBy(sortBy === 'primary' ? 'name' : 'primary')}
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    {sortBy === 'primary' ? 'Ordenando: Principal' : 'Ordenando: A-Z'}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {contacts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">Nenhum contato cadastrado ainda.</p>
                </div>
              ) : filteredAndSortedContacts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 font-medium">Nenhum contato encontrado para sua busca.</p>
                </div>
              ) : (
                filteredAndSortedContacts.map(contact => (
                  <div key={contact.id} className="bg-white p-5 rounded-2xl border-2 border-slate-100 flex items-center justify-between group hover:border-blue-100 transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => onSetPrimary(contact.id)}
                        className={`p-2 rounded-full transition-all ${contact.isPrimary ? 'text-blue-600 bg-blue-50' : 'text-slate-300 hover:text-slate-400 bg-slate-50'}`}
                      >
                        <CheckCircle2 className="w-7 h-7" />
                      </button>
                      <div className="flex items-center gap-3">
                        <div className="text-3xl bg-slate-50 p-2 rounded-xl border border-slate-100">
                          {contact.icon || '👤'}
                        </div>
                        <div>
                          <p className="font-black text-lg text-slate-900 leading-tight">
                            {contact.name}
                            {contact.isPrimary && <span className="ml-2 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold align-middle">Principal</span>}
                          </p>
                          <p className="text-slate-500 text-sm">{contact.relation} • {contact.phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a 
                        href={`tel:${contact.phone}`}
                        className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm border border-green-100"
                      >
                        <Phone className="w-6 h-6" />
                      </a>
                      <button 
                        onClick={() => onDelete(contact.id)}
                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ))
              )}
              
              <button 
                onClick={() => setIsAdding(true)}
                className="w-full mt-4 p-5 rounded-2xl bg-blue-600 text-white font-black text-xl shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-blue-700"
              >
                <UserPlus className="w-7 h-7" />
                Novo Contato
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
