import React, { useState, useRef } from 'react';
import { Mic, Send, Loader2, Sparkles, Image as ImageIcon, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface DreamInputProps {
  lang: Language;
  onGenerate: (text: string, type: 'image' | 'video', style: string) => void;
  isGenerating: boolean;
}

export default function DreamInput({ lang, onGenerate, isGenerating }: DreamInputProps) {
  const [text, setText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [isListening, setIsListening] = useState(false);
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  const styles = [
    { id: 'cinematic', label: t.cinematic },
    { id: 'surreal', label: t.surreal },
    { id: 'oilPainting', label: t.oilPainting },
    { id: 'cyberpunk', label: t.cyberpunk },
  ];

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText(prev => prev + ' ' + transcript);
    };

    recognition.start();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 px-4">
      <div className={cn(
        "relative dreamy-glass rounded-3xl p-4 transition-all duration-500",
        isGenerating ? "opacity-50 pointer-events-none scale-95" : "opacity-100 scale-100"
      )}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.inputPlaceholder}
          dir={isRTL ? 'rtl' : 'ltr'}
          className={cn(
            "w-full bg-transparent border-none focus:ring-0 text-lg min-h-[120px] resize-none placeholder:text-white/30",
            isRTL ? "text-right" : "text-left"
          )}
        />
        
        <div className={cn(
          "flex items-center justify-between mt-4",
          isRTL ? "flex-row-reverse" : "flex-row"
        )}>
          <button
            onClick={handleVoiceInput}
            className={cn(
              "p-3 rounded-full transition-all duration-300",
              isListening ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-white/5 text-white/60 hover:bg-white/10"
            )}
          >
            <Mic className="w-6 h-6" />
          </button>

          <div className={cn("flex gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
            <button
              onClick={() => onGenerate(text, 'image', selectedStyle)}
              disabled={!text.trim() || isGenerating}
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-medium flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <ImageIcon className="w-5 h-5" />
              <span>{t.generateImage}</span>
            </button>
            <button
              onClick={() => onGenerate(text, 'video', selectedStyle)}
              disabled={!text.trim() || isGenerating}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Video className="w-5 h-5" />
              <span>{t.generateVideo}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Style Selection */}
      <div className="space-y-3">
        <p className={cn("text-white/40 text-sm font-medium", isRTL ? "text-right" : "text-left")}>
          {t.style}
        </p>
        <div className={cn(
          "flex flex-wrap gap-2",
          isRTL ? "flex-row-reverse" : "flex-row"
        )}>
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border",
                selectedStyle === style.id
                  ? "bg-white/10 border-white/20 text-white shadow-lg shadow-white/5"
                  : "bg-transparent border-white/5 text-white/40 hover:border-white/10"
              )}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center space-y-4"
          >
            <div className="relative">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
              <Sparkles className="w-6 h-6 text-blue-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <p className="text-white/60 font-medium animate-pulse">{t.generating}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
