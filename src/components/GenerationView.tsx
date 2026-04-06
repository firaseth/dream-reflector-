import React from 'react';
import { motion } from 'motion/react';
import { Download, Share2, Heart, RefreshCw, Sparkles, Instagram, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Language, TRANSLATIONS, STYLE_LABELS } from '../constants';
import type { Dream } from '../types';
import { cn } from '../lib/utils';

interface GenerationViewProps {
  dream: Partial<Dream>;
  lang: Language;
  onSave: () => void;
  onReset: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

export default function GenerationView({ dream, lang, onSave, onReset, onToggleFavorite, isFavorite }: GenerationViewProps) {
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [showShareMenu, setShowShareMenu] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleDownload = () => { if (!dream.mediaUrl) return; const link = document.createElement('a'); link.href = dream.mediaUrl; link.download = `dream-${Date.now()}`; link.click(); };
  const handleCopyLink = () => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleShareWhatsApp = () => { const text = encodeURIComponent(`🌙 ${t.appName}\n\n${dream.description}`); window.open(`https://wa.me/?text=${text}`, '_blank'); };
  const handleShareInstagram = () => { if (navigator.share) { navigator.share({ title: t.appName, text: dream.description }); } else { handleCopyLink(); } };

  return (
    <div className="relative min-h-screen pb-28">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="px-4 pt-4">
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(124,58,237,0.2)', boxShadow: '0 0 30px rgba(124,58,237,0.15), inset 0 0 20px rgba(124,58,237,0.03)' }}>
          {dream.mediaType === 'video' ? (
            <video src={dream.mediaUrl} controls autoPlay loop className="w-full aspect-square object-cover" />
          ) : dream.mediaUrl ? (
            <img src={dream.mediaUrl} alt={dream.title || dream.description || 'Dream'} className="w-full aspect-square object-cover" />
          ) : (
            <div className="w-full aspect-square flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.15))' }}>
              <p className="text-white/40">{t.noDreams}</p>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="px-5 mt-5 space-y-4">
        {dream.title && (<h1 className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{dream.title}</h1>)}
        {dream.description && (<p className="text-sm text-white/50 leading-relaxed" dir={isRTL ? 'rtl' : 'ltr'}>{dream.description}</p>)}
        {dream.style && (<span className="text-xs px-3 py-1 rounded-full text-white inline-block" style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1, #ec4899)' }}>{STYLE_LABELS[dream.style] || dream.style}</span>)}

        {dream.enhancedPrompt && (
          <div className="dream-gradient-card rounded-xl overflow-hidden">
            <button onClick={() => setShowPrompt(!showPrompt)} className={cn('flex items-center justify-between w-full p-3 text-sm text-white/40', isRTL && 'flex-row-reverse')}>
              <span>Prompt</span>
              {showPrompt ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showPrompt && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-3 pb-3">
              <p className="text-xs text-white/40 leading-relaxed bg-white/5 rounded-lg p-3">{dream.enhancedPrompt}</p>
            </motion.div>)}
          </div>
        )}

        {dream.interpretation && (
          <div className="dream-gradient-card rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-bold" style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🔮 {t.interpretDream}</h3>
            <div className="text-xs text-white/50 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">{dream.interpretation}</div>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="px-5 mt-5 space-y-3">
        <div className="flex gap-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl dream-gradient-card border border-white/10">
            <Share2 size={18} className="text-purple-400" /><span className="text-sm font-medium text-white/70">{t.share}</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl dream-gradient-card border border-white/10">
            <Download size={18} className="text-blue-400" /><span className="text-sm font-medium text-white/70">{isRTL ? 'تحميل' : 'Download'}</span>
          </motion.button>
          {onToggleFavorite && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={onToggleFavorite}
              className={cn('w-12 flex items-center justify-center rounded-xl border', isFavorite ? 'bg-pink-500/15 border-pink-500/30' : 'dream-gradient-card border-white/10')}>
              <Heart size={18} className={isFavorite ? 'text-pink-400 fill-pink-400' : 'text-pink-400'} />
            </motion.button>
          )}
        </div>

        {showShareMenu && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="dream-gradient-card rounded-xl p-3 space-y-2">
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleShareInstagram} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Instagram size={18} className="text-pink-400" /><span className="text-sm text-white/70">Instagram</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleShareWhatsApp} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
              <span className="text-green-400 text-lg">💬</span><span className="text-sm text-white/70">WhatsApp</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleCopyLink} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
              {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="text-purple-400" />}
              <span className="text-sm text-white/70">{copied ? (isRTL ? 'تم النسخ!' : 'Copied!') : (isRTL ? 'نسخ الرابط' : 'Copy Link')}</span>
            </motion.button>
          </motion.div>
        )}

        <motion.button whileTap={{ scale: 0.96 }} onClick={onSave} className="w-full py-3 rounded-xl text-white font-medium text-sm" style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1, #ec4899)' }}>
          {t.save} 💾
        </motion.button>
        <motion.button whileTap={{ scale: 0.96 }} onClick={onReset} className="w-full py-3 rounded-xl dream-gradient-card border border-white/10 flex items-center justify-center gap-2">
          <RefreshCw size={18} className="text-purple-400" /><span className="text-sm font-medium text-white/50">{isRTL ? 'ولّد مرة أخرى' : 'Generate Again'}</span>
        </motion.button>
        <div className="text-center pt-2"><p className="text-[10px] text-white/25">⚠️ {t.disclaimer}</p></div>
      </motion.div>
    </div>
  );
}
