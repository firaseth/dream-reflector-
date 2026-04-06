export type Language = 'en' | 'ar';

export type DreamStyle = 'realistic' | 'surreal' | 'cinematic' | 'ghibli' | 'dark_fantasy' | 'oilPainting' | 'cyberpunk' | 'watercolor' | 'anime';
export type GenerationType = 'image' | 'video';

export interface Dream {
  id: string;
  userId: string;
  description: string;
  enhancedPrompt: string;
  mediaUrl: string;
  mediaType: GenerationType;
  style?: DreamStyle;
  interpretation?: string;
  isFavorite?: boolean;
  title?: string;
  createdAt: number;
  language: Language;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  language: Language;
  credits: number;
  isPremium: boolean;
}
