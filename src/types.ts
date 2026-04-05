export type Language = 'en' | 'ar';

export interface Dream {
  id: string;
  userId: string;
  description: string;
  enhancedPrompt: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
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
