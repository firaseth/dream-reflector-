import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Crown, Zap, Globe, Info, Moon, Star, Infinity, Shield, Palette, Loader2 } from 'lucide-react';
import { Language, TRANSLATIONS } from '../constants';
import type { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface ProfilePageProps {
  lang: Language;
  userProfile: UserProfile | null;
  onLangChange: (lang: Language) => void;
  dreamsCount: number;
}

export default function ProfilePage({ lang, userProfile, onLangChange, dreamsCount }: ProfilePageProps) {
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';
  const credits = userProfile?.credits ?? 5;
  const isPremium = userProfile?.isPremium ?? false;
  const maxCredits = isPremium ? 50 : 5;
  const creditPercent = Math.min((credits / maxCredits) * 100, 100);
  const [resetCountdown, setResetCountdown] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setResetCountdown(isRTL ? `${hours} ساعة ${mins} دقيقة` : `${hours}h ${mins}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [isRTL]);

  const benefits = [
    { icon: <Infinity size={16} />, text: isRTL ? 'رصيد غير محدود' : 'Unlimited credits' },
    { icon: <Star size={16} />, text: isRTL ? 'أنماط مميزة' : 'Exclusive styles' },
    { icon: <Shield size={16} />, text: isRTL ? 'بدون إعلانات' : 'Ad-free' },
    { icon: <Palette size={16} />, text: isRTL ? 'أولوية التوليد' : 'Priority generation' },
  ];

  return (
    <div className="relative min-h-screen px-5 pt-8 pb-28">
      <div className="floating-orb floating-orb-1" />
      <div className="floating-orb floating-orb-2" />
      <div className="relative z-10 space-y-5">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1">
          <h1 className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            👤 {isRTL ? 'حسابي' : 'Profile'}
          </h1>
          <p className="text-xs text-white/40">{isRTL ? 'إدارة حسابك والإعدادات' : 'Manage your account & settings'}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="dream-gradient-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1, #ec4899)', boxShadow: '0 0 20px rgba(124,58,237,0.2)' }}>
            <span className="text-2xl">🌙</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white">{userProfile?.displayName || (isRTL ? 'الحالم' : 'Dreamer')}</h2>
            <p className="text-xs text-white/40">
              {isPremium ? (isRTL ? 'الباقة المميزة ✨' : 'Premium ✨') : (isRTL ? 'الباقة المجانية' : 'Free Plan')}
            </p>
          </div>
          {isPremium && (
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              <Crown size={12} className="inline ml-1" /> {isRTL ? 'مميز' : 'PRO'}
            </span>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="dream-gradient-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-yellow-400" />
              <span className="text-sm font-bold text-white">{t.credits}</span>
            </div>
            <span className="text-sm text-white/40">{credits} / {maxCredits}</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${creditPercent}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #6366f1, #ec4899)' }} />
          </div>
          <div className="flex items-center justify-between text-[11px] text-white/40">
            <span>{isRTL ? 'إعادة تعيين الرصيد في' : 'Resets in'}</span>
            <span className="text-purple-300">{resetCountdown}</span>
          </div>
        </motion.div>

        {!isPremium && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <motion.button whileTap={{ scale: 0.96 }}
              className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)', boxShadow: '0 0 30px rgba(245,158,11,0.15)' }}>
              <Crown size={22} /> {t.premium}
            </motion.button>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {benefits.map((b, i) => (
                <div key={i} className="dream-gradient-card rounded-xl p-3 flex items-center gap-2">
                  <span className="text-yellow-400">{b.icon}</span>
                  <span className="text-xs text-white/50">{b.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Info size={16} className="text-purple-400" /> {t.settings}
          </h3>
          <div className="dream-gradient-card rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-blue-400" />
              <span className="text-sm text-white">{t.language}</span>
            </div>
            <button onClick={() => onLangChange(lang === 'ar' ? 'en' : 'ar')}
              className="text-xs px-3 py-1.5 rounded-lg dream-gradient-card border border-white/10 text-white/60">
              {lang === 'ar' ? 'العربية' : 'English'}
            </button>
          </div>
          <div className="dream-gradient-card rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon size={18} className="text-purple-400" />
              <span className="text-sm text-white">{isRTL ? 'المظهر' : 'Theme'}</span>
            </div>
            <span className="text-xs text-white/40">{isRTL ? 'داكن ☾' : 'Dark ☾'}</span>
          </div>
          <div className="dream-gradient-card rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-3">
              <Info size={18} className="text-purple-400" />
              <span className="text-sm text-white">{isRTL ? 'حول التطبيق' : 'About'}</span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              {isRTL ? 'عاكس مرئي للأحلام هو تطبيق يستخدم الذكاء الاصطناعي لتحويل أوصاف الأحلام إلى لوحات فنية مذهلة وتقديم تفسيرات نفسية وروحية.'
                : 'Dream Reflector uses AI to transform dream descriptions into stunning visual art and provide psychological and spiritual interpretations.'}
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="rounded-xl p-3 text-center"
          style={{ background: 'rgba(15,10,26,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(124,58,237,0.1)' }}>
          <p className="text-[11px] text-white/40 leading-relaxed">
            ⚠️ {isRTL ? 'المحتوى المُولّد بواسطة الذكاء الاصطناعي - للأغراض الترفيهية فقط' : 'AI-generated content — For entertainment purposes only'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
