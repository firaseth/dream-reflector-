import React from 'react';
import { motion } from 'motion/react';
import { Download, Share2, Trash2, Sparkles } from 'lucide-react';
import { Dream, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { cn } from '../lib/utils';

interface GenerationViewProps {
  dream: Partial<Dream>;
  lang: Language;
  onSave: () => void;
  onReset: () => void;
}

export default function GenerationView({ dream, lang, onSave, onReset }: GenerationViewProps) {
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8"
    >
      <div className="relative group rounded-3xl overflow-hidden dreamy-glass shadow-2xl">
        {dream.mediaType === 'video' ? (
          <video
            src={dream.mediaUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full aspect-[16/9] object-cover"
          />
        ) : (
          <img
            src={dream.mediaUrl}
            alt={dream.description}
            className="w-full aspect-[16/9] object-cover"
            referrerPolicy="no-referrer"
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <p className={cn(
            "text-white/90 text-lg font-medium line-clamp-2 italic",
            isRTL ? "text-right" : "text-left"
          )}>
            "{dream.description}"
          </p>
        </div>
      </div>

      <div className={cn(
        "flex items-center justify-center gap-4",
        isRTL ? "flex-row-reverse" : "flex-row"
      )}>
        <button
          onClick={onSave}
          className="flex-1 max-w-[200px] px-6 py-4 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-all active:scale-95"
        >
          <Sparkles className="w-5 h-5" />
          <span>{t.save}</span>
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = dream.mediaUrl!;
              link.download = `dream-${Date.now()}`;
              link.click();
            }}
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all"
          >
            <Download className="w-6 h-6" />
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: t.appName,
                  text: dream.description,
                  url: dream.mediaUrl
                });
              }
            }}
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all"
          >
            <Share2 className="w-6 h-6" />
          </button>
          <button
            onClick={onReset}
            className="p-4 rounded-2xl bg-white/5 hover:bg-red-500/20 text-red-400 transition-all"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
