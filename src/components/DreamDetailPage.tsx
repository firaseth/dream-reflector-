import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Heart, Share2, Trash2, Download, Copy, Check, Brain, Loader2, Instagram } from 'lucide-react';
import { Language, TRANSLATIONS, STYLE_LABELS } from '../constants';
import type { Dream } from '../types';
import { cn } from '../lib/utils';
import { interpretDream } from '../services/interpretation';

interface DreamDetailPageProps {
  dream: Dream;
  lang: Language;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateDream: (dream: Dream) => void;
}

export default function DreamDetailPage({ dream, lang, onBack, onToggleFavorite, onDelete, onUpdateDream }: DreamDetailPageProps) {
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoadingInterp, setIsLoadingInterp] = useState(false);
  const [interpretation, setInterpretation] = useState<string | null>(dream.interpretation || null);
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const handleDownload = () => {
    if (!dream.mediaUrl) return;
    const link = document.createElement('a');
    link.href = dream.mediaUrl;
    link.download = `dream-${dream.id}`;
    link.click();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`🌙 ${t.appName}\n\n${dream.description}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareInstagram = () => {
    if (navigator.share) {
      navigator.share({ title: t.appName, text: dream.description });
    } else { handleCopyLink(); }
  };

  const handleInterpret = async () => {
    setIsLoadingInterp(true);
    try {
      const result = await interpretDream(dream.description, dream.language || lang);
      setInterpretation(result);
      onUpdateDream({ ...dream, interpretation: result });
    } catch (err) { console.error('Interpretation error:', err); }
    finally { setIsLoadingInterp(false); }
  };

  const dreamDate = new Date(dream.createdAt).toLocaleDateString(
    lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="relative min-h-screen pb-28">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 flex items-center justify-between p-4"
        style={{ background: 'rgba(15,10,26,0.8)', backdropFilter: 'blur(12px)' }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="w-9 h-9 rounded-xl dream-gradient-card flex items-center justify-center">
          <BackArrow size={18} className="text-purple-300" />
        </motion.button>
        <h2 className="text-base font-bold text-white truncate max-w-[60%]">{dream.description.slice(0, 30)}...</h2>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowShare(!showShare)}
          className="w-9 h-9 rounded-xl dream-gradient-card flex items-center justify-center">
          <Share2 size={16} className="text-purple-300" />
        </motion.button>
      </motion.div>

      {showShare && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="px-4 mt-1">
          <div className="dream-gradient-card rounded-xl p-3 flex gap-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleShareWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-green-400 text-sm"
              style={{ background: 'rgba(34,197,94,0.1)' }}>💬 WhatsApp</motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleShareInstagram}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-pink-400 text-sm"
              style={{ background: 'rgba(236,72,153,0.1)' }}><Instagram size={14} /> Instagram</motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-purple-400 text-sm"
              style={{ background: 'rgba(124,58,237,0.1)' }}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? (isRTL ? 'تم' : 'Done') : (isRTL ? 'نسخ' : 'Copy')}
            </motion.button>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="px-4 mt-3">
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(124,58,237,0.2)', boxShadow: '0 0 30px rgba(124,58,237,0.1), inset 0 0 20px rgba(124,58,237,0.03)' }}>
          {dream.mediaUrl ? (
            dream.mediaType === 'video' ? (
              <video src={dream.mediaUrl} controls className="w-full aspect-square object-cover" />
            ) : (
              <img src={dream.mediaUrl} alt={dream.description} className="w-full aspect-square object-cover" />
            )
          ) : (
            <div className="w-full aspect-square flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.15))' }}>
              <span className="text-4xl">🌙</span>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="px-5 mt-5 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          {dream.style && (
            <span className="text-xs px-3 py-1 rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1, #ec4899)' }}>
              {STYLE_LABELS[dream.style] || dream.style}
            </span>
          )}
          <span className="text-xs text-white/40">{dreamDate}</span>
        </div>

        <div className="dream-gradient-card rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-bold text-white">{isRTL ? 'وصف الحلم' : 'Dream Description'}</h3>
          <p className="text-sm text-white/50 leading-relaxed" dir={isRTL ? 'rtl' : 'ltr'}>{dream.description}</p>
        </div>

        {dream.enhancedPrompt && (
          <div className="dream-gradient-card rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-bold text-white">Prompt</h3>
            <p className="text-xs text-white/40 leading-relaxed">{dream.enhancedPrompt}</p>
          </div>
        )}

        {interpretation ? (
          <div className="dream-gradient-card rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-bold" style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🔮 {isRTL ? 'تفسير الحلم' : 'Dream Interpretation'}
            </h3>
            <div className="text-xs text-white/50 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">{interpretation}</div>
          </div>
        ) : (
          <motion.button whileTap={{ scale: 0.96 }} onClick={handleInterpret} disabled={isLoadingInterp}
            className="w-full py-3 rounded-xl dream-gradient-card flex items-center justify-center gap-2 text-purple-300 disabled:opacity-50"
            style={{ border: '1px solid rgba(124,58,237,0.2)' }}>
            {isLoadingInterp ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} />}
            <span className="text-sm font-medium">
              {isLoadingInterp ? (isRTL ? 'جارٍ التفسير...' : 'Interpreting...') : (isRTL ? 'تفسير الحلم' : 'Interpret Dream')}
            </span>
          </motion.button>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="px-5 mt-5 flex gap-2">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => onToggleFavorite(dream.id)}
          className={cn('flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all',
            dream.isFavorite ? 'bg-pink-500/15 border-pink-500/30 text-pink-400' : 'dream-gradient-card border-white/10 text-white/50')}>
          <Heart size={18} className={dream.isFavorite ? 'fill-pink-400' : ''} />
          <span className="text-sm">{dream.isFavorite ? (isRTL ? 'إزالة من المفضلة' : 'Unfavorite') : (isRTL ? 'إضافة للمفضلة' : 'Favorite')}</span>
        </motion.button>
        {dream.mediaUrl && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleDownload}
            className="w-12 flex items-center justify-center rounded-xl dream-gradient-card border border-white/10">
            <Download size={18} className="text-blue-400" />
          </motion.button>
        )}
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => onDelete(dream.id)}
          className="w-12 flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5">
          <Trash2 size={18} className="text-red-400" />
        </motion.button>
      </motion.div>
    </div>
  );
}
