import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sparkles, LogIn } from 'lucide-react';
import {
  onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User
} from 'firebase/auth';
import {
  collection, query, where, onSnapshot, doc, setDoc, addDoc,
  updateDoc, deleteDoc, serverTimestamp, orderBy, limit, Timestamp
} from 'firebase/firestore';
import { cn } from './lib/utils';
import { Language, Dream, DreamStyle, GenerationType, UserProfile } from './types';
import { TRANSLATIONS } from './constants';
import DreamInput from './components/DreamInput';
import GenerationView from './components/GenerationView';
import Library from './components/Library';
import HomePage from './components/HomePage';
import ProfilePage from './components/ProfilePage';
import DreamDetailPage from './components/DreamDetailPage';
import BottomNav, { AppView } from './components/BottomNav';
import { enhancePrompt, generateDreamImage, generateDreamVideo, generateDreamTitle } from './services/ai';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [view, setView] = useState<AppView>('home');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentDream, setCurrentDream] = useState<Partial<Dream> | null>(null);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setIsAuthReady(true);
      if (!user) { setUserProfile(null); setDreams([]); }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authUser) return;
    const userDocRef = doc(db, 'users', authUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setUserProfile(data);
        if (data.language) setLang(data.language);
      } else {
        const initialProfile: UserProfile = {
          uid: authUser.uid, email: authUser.email || '',
          displayName: authUser.displayName || 'Dreamer',
          photoURL: authUser.photoURL || `https://picsum.photos/seed/${authUser.uid}/200`,
          language: lang, credits: 5, isPremium: false
        };
        setDoc(userDocRef, initialProfile).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${authUser.uid}`));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${authUser.uid}`));
    return () => unsubscribe();
  }, [authUser]);

  useEffect(() => {
    if (!authUser) return;
    const dreamsRef = collection(db, 'dreams');
    const q = query(dreamsRef, where('userId', '==', authUser.uid), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dreamsList = snapshot.docs.map(d => {
        const data = d.data();
        return { ...data, id: d.id, createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt } as Dream;
      });
      setDreams(dreamsList);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'dreams'));
    return () => unsubscribe();
  }, [authUser]);

  const handleLogin = async () => { try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch (e) { console.error(e); } };
  const handleLogout = async () => { try { await signOut(auth); setView('home'); } catch (e) { console.error(e); } };

  const handleGenerate = async (description: string, type: GenerationType, style: DreamStyle, wantInterpretation: boolean) => {
    if (!userProfile || userProfile.credits <= 0) { alert(t.noDreams); return; }
    if (type === 'video' && typeof (window as any).aistudio !== 'undefined') {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) await (window as any).aistudio.openSelectKey();
    }
    setIsGenerating(true);
    try {
      const enhanced = await enhancePrompt(description, style);
      const title = await generateDreamTitle(description);
      let mediaUrl = '';
      if (type === 'image') { mediaUrl = await generateDreamImage(enhanced); }
      else { mediaUrl = await generateDreamVideo(enhanced); }
      const dream: Partial<Dream> = { title, description, enhancedPrompt: enhanced, mediaUrl, mediaType: type, style, createdAt: Date.now(), language: lang };
      if (wantInterpretation) {
        try { const { interpretDream } = await import('./services/interpretation'); dream.interpretation = await interpretDream(description, lang); }
        catch (err) { console.error(err); }
      }
      setCurrentDream(dream);
      setView('result');
      const userDocRef = doc(db, 'users', authUser!.uid);
      await updateDoc(userDocRef, { credits: userProfile.credits - 1 });
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message.includes('Requested entity was not found')) {
        alert('API Key error. Please check your GEMINI_API_KEY.');
        if (typeof (window as any).aistudio !== 'undefined') await (window as any).aistudio.openSelectKey();
      } else { alert(t.error); }
    } finally { setIsGenerating(false); }
  };

  const handleSave = async () => {
    if (currentDream && authUser) {
      try {
        await addDoc(collection(db, 'dreams'), { ...currentDream, userId: authUser.uid, createdAt: serverTimestamp() });
        setView('library'); setCurrentDream(null);
      } catch (e) { handleFirestoreError(e, OperationType.CREATE, 'dreams'); }
    }
  };

  const handleToggleFavorite = async (dreamId: string) => {
    if (!authUser) return;
    try { const dream = dreams.find(d => d.id === dreamId); if (dream) await updateDoc(doc(db, 'dreams', dreamId), { isFavorite: !dream.isFavorite }); }
    catch (e) { handleFirestoreError(e, OperationType.UPDATE, `dreams/${dreamId}`); }
  };

  const handleDeleteDream = async (dreamId: string) => {
    if (!authUser) return;
    try { await deleteDoc(doc(db, 'dreams', dreamId)); setView('library'); setSelectedDream(null); }
    catch (e) { handleFirestoreError(e, OperationType.DELETE, `dreams/${dreamId}`); }
  };

  const handleUpdateDream = async (dream: Dream) => {
    if (!authUser) return;
    try { await updateDoc(doc(db, 'dreams', dream.id), { interpretation: dream.interpretation }); }
    catch (e) { handleFirestoreError(e, OperationType.UPDATE, `dreams/${dream.id}`); }
  };

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    if (authUser) updateDoc(doc(db, 'users', authUser.uid), { language: newLang });
  };

  const handleSelectDream = (dream: Dream) => { setSelectedDream(dream); setView('dream-detail'); };

  if (!isAuthReady) {
    return (<div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0a1a' }}><Sparkles className="w-12 h-12 text-purple-500 animate-pulse" /></div>);
  }

  return (
    <div className="min-h-screen dream-gradient-bg" dir={isRTL ? 'rtl' : 'ltr'}>
      <AnimatePresence mode="wait">
        {!authUser ? (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="text-center space-y-8">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
                <motion.div className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #ec4899 100%)', boxShadow: '0 0 40px rgba(124,58,237,0.3), 0 0 80px rgba(99,102,241,0.15)' }}
                  animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
                  <Moon size={44} className="text-white" />
                </motion.div>
                <h1 className="text-4xl font-bold" style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.appName}</h1>
                <p className="text-white/40 text-lg max-w-xs mx-auto">{t.tagline}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <motion.button whileTap={{ scale: 0.96 }} onClick={handleLogin}
                  className="px-8 py-4 rounded-2xl bg-white text-black font-bold flex items-center gap-3 hover:bg-white/90 transition-all mx-auto"
                  style={{ boxShadow: '0 0 30px rgba(255,255,255,0.1)' }}>
                  <LogIn className="w-6 h-6" /><span>Login with Google</span>
                </motion.button>
              </motion.div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-[11px] text-white/30">{t.disclaimer}</motion.p>
            </div>
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              {view === 'home' && (<motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}><HomePage lang={lang} dreams={dreams} userProfile={userProfile} onViewChange={(v) => setView(v as AppView)} onSelectDream={handleSelectDream} /></motion.div>)}
              {view === 'create' && (<motion.div key="create" initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isRTL ? 20 : -20 }} transition={{ duration: 0.3 }}><DreamInput lang={lang} onGenerate={handleGenerate} isGenerating={isGenerating} /></motion.div>)}
              {view === 'result' && currentDream && (<motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}><GenerationView dream={currentDream} lang={lang} onSave={handleSave} onReset={() => { setCurrentDream(null); setView('create'); }} onToggleFavorite={() => {}} isFavorite={false} /></motion.div>)}
              {view === 'library' && (<motion.div key="library" initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isRTL ? 20 : -20 }} transition={{ duration: 0.3 }}><Library dreams={dreams} lang={lang} onSelect={handleSelectDream} /></motion.div>)}
              {view === 'profile' && (<motion.div key="profile" initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isRTL ? 20 : -20 }} transition={{ duration: 0.3 }}><ProfilePage lang={lang} userProfile={userProfile} onLangChange={handleLangChange} dreamsCount={dreams.length} /></motion.div>)}
              {view === 'dream-detail' && selectedDream && (<motion.div key="dream-detail" initial={{ opacity: 0, x: isRTL ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isRTL ? -20 : 20 }} transition={{ duration: 0.3 }}><DreamDetailPage dream={selectedDream} lang={lang} onBack={() => setView('library')} onToggleFavorite={handleToggleFavorite} onDelete={handleDeleteDream} onUpdateDream={handleUpdateDream} /></motion.div>)}
            </AnimatePresence>
            <BottomNav currentView={view} onViewChange={setView} lang={lang} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
