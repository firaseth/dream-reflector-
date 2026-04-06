import React from 'react';
import { motion } from 'motion/react';
import { Home, Sparkles, BookOpen, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { Language, TRANSLATIONS } from '../constants';

export type AppView = 'home' | 'create' | 'library' | 'profile' | 'result' | 'dream-detail';

interface BottomNavProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  lang: Language;
}

const navItems = [
  { view: 'home' as AppView, icon: Home, labelKey: 'home' as const },
  { view: 'library' as AppView, icon: BookOpen, labelKey: 'myLibrary' as const },
  { view: 'create' as AppView, icon: Sparkles, labelKey: 'createDream' as const, isCenter: true },
  { view: 'profile' as AppView, icon: User, labelKey: 'profile' as const },
];

export default function BottomNav({ currentView, onViewChange, lang }: BottomNavProps) {
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  const isActive = (view: AppView) => {
    if (view === 'create') return currentView === 'create' || currentView === 'result';
    return currentView === view;
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-purple-500/15"
      style={{
        background: 'rgba(10, 6, 20, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {navItems.map((item) => {
          const active = isActive(item.view);

          if (item.isCenter) {
            return (
              <button
                key={item.view}
                onClick={() => onViewChange(item.view)}
                className="relative flex flex-col items-center justify-center -mt-6"
              >
                <motion.div
                  whileTap={{ scale: 0.92 }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #ec4899 100%)',
                    boxShadow: '0 0 30px rgba(124, 58, 237, 0.25), 0 0 60px rgba(99, 102, 241, 0.15)',
                  }}
                >
                  <item.icon size={24} className="text-white" />
                </motion.div>
                <span className={cn('text-[10px] mt-1', active ? 'text-purple-300' : 'text-white/40')}>
                  {t[item.labelKey]}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className="bottom-nav-item flex flex-col items-center justify-center gap-1 py-2 px-4 relative transition-all"
            >
              <item.icon size={22} className={cn('transition-colors', active ? 'text-purple-300' : 'text-white/40')} />
              <span className={cn('text-[10px]', active ? 'text-purple-300' : 'text-white/40')}>
                {t[item.labelKey]}
              </span>
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 w-5 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #7c3aed, #ec4899)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
