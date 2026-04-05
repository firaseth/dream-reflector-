import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Moon, 
  Sun, 
  Library as LibraryIcon, 
  Sparkles, 
  Settings as SettingsIcon,
  Plus,
  LogOut,
  User as UserIcon,
  Globe,
  ChevronLeft,
  LogIn
} from 'lucide-react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { cn } from './lib/utils';
import { Language, Dream, UserProfile } from './types';
import { TRANSLATIONS } from './constants';
import DreamInput from './components/DreamInput';
import GenerationView from './components/GenerationView';
import Library from './components/Library';
import { enhancePrompt, generateDreamImage, generateDreamVideo } from './services/ai';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [view, setView] = useState<'home' | 'library' | 'settings' | 'generation'>('home');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentDream, setCurrentDream] = useState<Partial<Dream> | null>(null);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setIsAuthReady(true);
      if (!user) {
        setUserProfile(null);
        setDreams([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // User Profile Listener
  useEffect(() => {
    if (!authUser) return;

    const userDocRef = doc(db, 'users', authUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setUserProfile(data);
        if (data.language) setLang(data.language);
      } else {
        // Create initial profile
        const initialProfile: UserProfile = {
          uid: authUser.uid,
          email: authUser.email || '',
          displayName: authUser.displayName || 'Dreamer',
          photoURL: authUser.photoURL || `https://picsum.photos/seed/${authUser.uid}/200`,
          language: lang,
          credits: 5,
          isPremium: false
        };
        setDoc(userDocRef, initialProfile).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${authUser.uid}`));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${authUser.uid}`));

    return () => unsubscribe();
  }, [authUser]);

  // Dreams Listener
  useEffect(() => {
    if (!authUser) return;

    const dreamsRef = collection(db, 'dreams');
    const q = query(
      dreamsRef, 
      where('userId', '==', authUser.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dreamsList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt
        } as Dream;
      });
      setDreams(dreamsList);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'dreams'));

    return () => unsubscribe();
  }, [authUser]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView('home');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleGenerate = async (description: string, type: 'image' | 'video', style: string) => {
    if (!userProfile || userProfile.credits <= 0) {
      alert("Not enough credits!");
      return;
    }

    if (type === 'video') {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
        // After opening the dialog, we assume the user will select a key and we proceed.
      }
    }

    setIsGenerating(true);
    try {
      const enhanced = await enhancePrompt(description, style);
      let mediaUrl = '';
      
      if (type === 'image') {
        mediaUrl = await generateDreamImage(enhanced);
      } else {
        mediaUrl = await generateDreamVideo(enhanced);
      }

      setCurrentDream({
        description,
        enhancedPrompt: enhanced,
        mediaUrl,
        mediaType: type,
        createdAt: Date.now(),
        language: lang
      });
      setView('generation');

      // Deduct credit
      const userDocRef = doc(db, 'users', authUser!.uid);
      await updateDoc(userDocRef, {
        credits: userProfile.credits - 1
      });
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        alert("API Key error. Please re-select your API key.");
        await (window as any).aistudio.openSelectKey();
      } else {
        alert(t.error);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (currentDream && authUser) {
      try {
        const dreamsRef = collection(db, 'dreams');
        const dreamData = {
          ...currentDream,
          userId: authUser.uid,
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(dreamsRef), dreamData);
        setView('library');
        setCurrentDream(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'dreams');
      }
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between dreamy-glass">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold font-display dreamy-text-gradient hidden sm:block">
            {t.appName}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {userProfile && (
            <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white/80">{userProfile.credits}</span>
            </div>
          )}
          <button 
            onClick={() => {
              const newLang = lang === 'en' ? 'ar' : 'en';
              setLang(newLang);
              if (authUser) {
                updateDoc(doc(db, 'users', authUser.uid), { language: newLang });
              }
            }}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white/60"
          >
            <Globe className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-8 pb-24">
        <AnimatePresence mode="wait">
          {!authUser ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-bold font-display">{t.appName}</h2>
                <p className="text-white/40 max-w-xs mx-auto">{t.tagline}</p>
              </div>
              <button
                onClick={handleLogin}
                className="px-8 py-4 rounded-2xl bg-white text-black font-bold flex items-center gap-3 hover:bg-white/90 transition-all active:scale-95"
              >
                <LogIn className="w-6 h-6" />
                <span>Login with Google</span>
              </button>
            </motion.div>
          ) : (
            <>
              {view === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <div className="text-center space-y-4 px-6">
                    <h2 className="text-4xl sm:text-5xl font-bold font-display tracking-tight">
                      {t.tagline}
                    </h2>
                    <p className="text-white/40 text-lg max-w-md mx-auto">
                      Turn your subconscious visions into cinematic reality.
                    </p>
                  </div>
                  <DreamInput 
                    lang={lang} 
                    onGenerate={handleGenerate} 
                    isGenerating={isGenerating} 
                  />
                </motion.div>
              )}

              {view === 'generation' && currentDream && (
                <motion.div
                  key="generation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="px-6 mb-4">
                    <button 
                      onClick={() => setView('home')}
                      className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                    >
                      <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
                      <span>Back</span>
                    </button>
                  </div>
                  <GenerationView 
                    dream={currentDream} 
                    lang={lang} 
                    onSave={handleSave}
                    onReset={() => {
                      setCurrentDream(null);
                      setView('home');
                    }}
                  />
                </motion.div>
              )}

              {view === 'library' && (
                <motion.div
                  key="library"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className="px-6">
                    <h2 className="text-3xl font-bold font-display">{t.myLibrary}</h2>
                  </div>
                  <Library 
                    dreams={dreams} 
                    lang={lang} 
                    onSelect={(dream) => {
                      setCurrentDream(dream);
                      setView('generation');
                    }} 
                  />
                </motion.div>
              )}

              {view === 'settings' && userProfile && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-xl mx-auto px-6 space-y-8"
                >
                  <h2 className="text-3xl font-bold font-display">{t.settings}</h2>
                  
                  <div className="space-y-4">
                    <div className="p-6 rounded-3xl dreamy-glass flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <img src={userProfile.photoURL} alt={userProfile.displayName} />
                        </div>
                        <div>
                          <p className="font-bold">{userProfile.displayName}</p>
                          <p className="text-sm text-white/40">{userProfile.email}</p>
                        </div>
                      </div>
                      <button onClick={handleLogout}>
                        <LogOut className="w-6 h-6 text-red-400 cursor-pointer" />
                      </button>
                    </div>

                    <div className="p-6 rounded-3xl dreamy-glass space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-purple-400" />
                          <span>{t.language}</span>
                        </div>
                        <select 
                          value={lang}
                          onChange={(e) => {
                            const newLang = e.target.value as Language;
                            setLang(newLang);
                            updateDoc(doc(db, 'users', authUser.uid), { language: newLang });
                          }}
                          className="bg-white/5 border-none rounded-xl px-4 py-2 focus:ring-0"
                        >
                          <option value="en">English</option>
                          <option value="ar">العربية</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-5 h-5 text-yellow-400" />
                          <span>{t.credits}</span>
                        </div>
                        <span className="font-bold">{userProfile.credits}</span>
                      </div>

                      <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold hover:opacity-90 transition-opacity">
                        {t.premium}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {authUser && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 py-4 dreamy-glass flex items-center justify-around">
          <button 
            onClick={() => setView('home')}
            className={cn(
              "p-3 rounded-2xl transition-all duration-300",
              view === 'home' ? "bg-purple-600 text-white" : "text-white/40 hover:bg-white/5"
            )}
          >
            <Plus className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setView('library')}
            className={cn(
              "p-3 rounded-2xl transition-all duration-300",
              view === 'library' ? "bg-purple-600 text-white" : "text-white/40 hover:bg-white/5"
            )}
          >
            <LibraryIcon className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setView('settings')}
            className={cn(
              "p-3 rounded-2xl transition-all duration-300",
              view === 'settings' ? "bg-purple-600 text-white" : "text-white/40 hover:bg-white/5"
            )}
          >
            <SettingsIcon className="w-6 h-6" />
          </button>
        </nav>
      )}
    </div>
  );
}
