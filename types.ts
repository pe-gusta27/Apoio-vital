export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isPrimary: boolean;
  icon?: string; // Emoji or icon name
}

export interface EmergencyInstruction {
  id: string;
  title: string;
  content: string;
  icon: string;
  category: 'saude' | 'mobilidade' | 'mental' | 'geral';
}

export interface AIQueryItem {
  id: string;
  query: string;
  response: string;
  timestamp: number;
}

export interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'xl';
  highContrast: 'none' | 'dark' | 'light';
  animations: boolean;
  hapticFeedback: boolean;
  hapticIntensity: 'low' | 'medium' | 'high';
}

export enum AppSection {
  HOME = 'home',
  GUIDANCE = 'guidance',
  CONTACTS = 'contacts',
  AI_ASSISTANT = 'ai_assistant',
  ACCESSIBILITY = 'accessibility'
}
