import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, ImageIcon, Crown } from 'lucide-react';
import { Language, TRANSLATIONS } from '../constants';
import type { Dream, UserProfile } from '../types';

interface HomePageProps {
  lang: Language;
  dreams: Dream[];
  userProfile: UserProfile | null;
  onViewChange: (view: string) => void;
  onSelectDream: (dream: Dream) => void;
}

export default function HomePage({ lang, dreams, userProfile, onViewChange, onSelectDream }: HomePageProps) {
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';
  const recentDreams = dreams.slice(0, 5);
  const credits = userProfile?.credits ?? 5;

  return (
    <div className="relative min-h-screen px-5 pt-12 pb-28">
      <div className="floating-orb floating-orb-1" />
      <div className="floating-orb floating-orb-2" />
      <div className="floating-orb floating-orb-3" />

      <div className="relative z-10 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="text-center space-y-4 pt-4">
          <motion.div
            className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #ec4899 100%)', boxShadow: '0 0 30px rgba(124, 58, 237, 0.2), 0 0 60px rgba(99, 102, 241, 0.1)' }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Sparkles size={36} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold" style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t.appName}
          </h1>
          <p className="text-white/50 text-base">{t.tagline}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-3 gap-3">
          <div className="dream-gradient-card rounded-2xl p-4 text-center">
            <Zap size={20} className="mx-auto text-yellow-400 mb-1" />
            <p className="text-xl font-bold text-white">{credits}</p>
            <p className="text-[11px] text-white/40">{t.credits}</p>
          </div>
          <div className="dream-gradient-card rounded-2xl p-4 text-center">
            <ImageIcon size={20} className="mx-auto text-purple-400 mb-1" />
            <p className="text-xl font-bold text-white">{dreams.length}</p>
            <p className="text-[11px] text-white/40">{t.myLibrary}</p>
          </div>
          <div className="dream-gradient-card rounded-2xl p-4 text-center">
            <Crown size={20} className="mx-auto text-pink-400 mb-1" />
            <p className="text-xl font-bold text-white">{userProfile?.isPremium ? '✨' : 'مجاني'}</p>
            <p className="text-[11px] text-white/40">{t.premium}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => onViewChange('create')}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #ec4899 100%)', boxShadow: '0 0 30px rgba(124, 58, 237, 0.2), 0 0 60px rgba(99, 102, 241, 0.1)' }}>
            <Sparkles size={22} /> {t.createDream}
          </motion.button>
        </motion.div>

        {recentDreams.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              🌙 {lang === 'ar' ? 'أحلامك الأخيرة' : 'Recent Dreams'}
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2"
# 3. Create HomePage.tsx
@'
import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, ImageIcon, Crown } from 'lucide-react';
import { Language, TRANSLATIONS } from '../constants';
import type { Dream, UserProfile } from '../types';

interface HomePageProps {
  lang: Language;
  dreams: Dream[];
  userProfile: UserProfile | null;
  onViewChange: (view: string) => void;
  onSelectDream: (dream: Dream) => void;
}

export default function HomePage({ lang, dreams, userProfile, onViewChange, onSelectDream }: HomePageProps) {
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';
  const recentDreams = dreams.slice(0, 5);
  const credits = userProfile?.credits ?? 5;

  return (
    <div className="relative min-h-screen px-5 pt-12 pb-28">
      <div className="floating-orb floating-orb-1" />
      <div className="floating-orb floating-orb-2" />
      <div className="floating-orb floating-orb-3" />

      <div className="relative z-10 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="text-center space-y-4 pt-4">
          <motion.div
            className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #ec4899 100%)', boxShadow: '0 0 30px rgba(124, 58, 237, 0.2), 0 0 60px rgba(99, 102, 241, 0.1)' }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Sparkles size={36} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold" style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t.appName}
          </h1>
          <p className="text-white/50 text-base">{t.tagline}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-3 gap-3">
          <div className="dream-gradient-card rounded-2xl p-4 text-center">
            <Zap size={20} className="mx-auto text-yellow-400 mb-1" />
            <p className="text-xl font-bold text-white">{credits}</p>
            <p className="text-[11px] text-white/40">{t.credits}</p>
          </div>
          <div className="dream-gradient-card rounded-2xl p-4 text-center">
            <ImageIcon size={20} className="mx-auto text-purple-400 mb-1" />
            <p className="text-xl font-bold text-white">{dreams.length}</p>
            <p className="text-[11px] text-white/40">{t.myLibrary}</p>
          </div>
          <div className="dream-gradient-card rounded-2xl p-4 text-center">
            <Crown size={20} className="mx-auto text-pink-400 mb-1" />
            <p className="text-xl font-bold text-white">{userProfile?.isPremium ? '✨' : 'مجاني'}</p>
            <p className="text-[11px] text-white/40">{t.premium}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => onViewChange('create')}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #ec4899 100%)', boxShadow: '0 0 30px rgba(124, 58, 237, 0.2), 0 0 60px rgba(99, 102, 241, 0.1)' }}>
            <Sparkles size={22} /> {t.createDream}
          </motion.button>
        </motion.div>

        {recentDreams.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              🌙 {lang === 'ar' ? 'أحلامك الأخيرة' : 'Recent Dreams'}
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {recentDreams.map((dream) => (
                <motion.button key={dream.id} whileTap={{ scale: 0.96 }}
                  onClick={() => { onSelectDream(dream); onViewChange('dream-detail'); }}
                  className="shrink-0 w-40 rounded-2xl overflow-hidden dream-gradient-card"
                  style={{ border: '1px solid rgba(124, 58, 237, 0.15)' }}>
                  {dream.mediaUrl ? (
                    <div className="w-full h-32 bg-white/5 relative">
                      {dream.mediaType === 'video' ? (
                        <video src={dream.mediaUrl} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={dream.mediaUrl} alt={dream.description} className="w-full h-full object-cover" />
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.15))' }}>
                      <Sparkles size={24} className="text-purple-400/50" />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-white truncate">{dream.description.slice(0, 40)}...</p>
                    <p className="text-[11px] text-white/40 mt-1">
                      {new Date(dream.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="rounded-xl p-3 text-center"
          style={{ background: 'rgba(15, 10, 26, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
          <p className="text-[11px] text-white/40 leading-relaxed">
            ⚠️ {lang === 'ar' ? 'المحتوى المُولّد بواسطة الذكاء الاصطناعي - للأغراض الترفيهية فقط' : 'AI-generated content — For entertainment purposes only'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
