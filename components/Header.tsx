
import React from 'react';
import { ShieldAlert, Menu, Home } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
  onHomeClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, onHomeClick }) => {
  return (
    <header className="sticky top-0 z-50 bg-blue-600 text-white p-4 shadow-lg flex justify-between items-center">
      <div className="flex items-center gap-1">
        <button 
          onClick={onHomeClick}
          className="p-2 hover:bg-blue-700 rounded-lg transition-colors mr-1"
          aria-label="Ir para o Início"
        >
          <Home className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="bg-white p-1.5 rounded-full hidden xs:block">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold tracking-tight select-none">ApoioVital</h1>
        </div>
      </div>
      <button 
        onClick={onMenuToggle}
        className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
        aria-label="Abrir Menu"
      >
        <Menu className="w-7 h-7" />
      </button>
    </header>
  );
};
