import React from 'react';
import { motion } from 'motion/react';
import { Dream, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { cn } from '../lib/utils';
import { Play, Image as ImageIcon, Calendar } from 'lucide-react';

interface LibraryProps {
  dreams: Dream[];
  lang: Language;
  onSelect: (dream: Dream) => void;
}

export default function Library({ dreams, lang, onSelect }: LibraryProps) {
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  if (dreams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
          <ImageIcon className="w-10 h-10 text-white/20" />
        </div>
        <p className="text-white/40 max-w-xs">{t.noDreams}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 pb-20">
      {dreams.map((dream, index) => (
        <motion.div
          key={dream.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onSelect(dream)}
          className="group relative rounded-3xl overflow-hidden dreamy-glass cursor-pointer hover:scale-[1.02] transition-all duration-500"
        >
          <div className="aspect-[16/9] relative">
            <img
              src={dream.mediaUrl}
              alt={dream.description}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {dream.mediaType === 'video' && (
              <div className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
            )}
          </div>
          
          <div className="p-5 space-y-3">
            <p className={cn(
              "text-white/80 line-clamp-2 font-medium italic",
              isRTL ? "text-right" : "text-left"
            )}>
              "{dream.description}"
            </p>
            
            <div className={cn(
              "flex items-center gap-2 text-white/30 text-sm",
              isRTL ? "flex-row-reverse" : "flex-row"
            )}>
              <Calendar className="w-4 h-4" />
              <span>{new Date(dream.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
