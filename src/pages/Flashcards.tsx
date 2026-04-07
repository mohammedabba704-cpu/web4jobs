import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { BookOpen, Trash2, RotateCcw, Volume2, Sparkles, CheckCircle2, XCircle, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";

export default function Flashcards() {
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLanguage, setUserLanguage] = useState("English");
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      const d = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (d.exists()) setUserLanguage(d.data().target_language || "English");
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    let q = query(
      collection(db, "flashcards"),
      where("user_id", "==", auth.currentUser.uid),
      orderBy("created_at", "desc")
    );

    if (levelFilter !== null) {
      q = query(
        collection(db, "flashcards"),
        where("user_id", "==", auth.currentUser.uid),
        where("mastery_level", "==", levelFilter),
        orderBy("created_at", "desc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCards(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
      setCurrentIndex(0);
      setIsFlipped(false);
    });

    return () => unsubscribe();
  }, [levelFilter]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "flashcards", id));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const updateMastery = async (id: string, delta: number) => {
    const card = cards.find(c => c.id === id);
    if (!card) return;
    const newLevel = Math.max(1, Math.min(5, (card.mastery_level || 1) + delta));
    try {
      await updateDoc(doc(db, "flashcards", id), {
        mastery_level: newLevel
      });
    } catch (error) {
      console.error("Update mastery failed:", error);
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = userLanguage === "English" ? "en-US" : "fr-FR";
    window.speechSynthesis.speak(utterance);
  };

  const getLevelColor = (level: number) => {
    const colors = [
      "bg-white/10 text-white/60 border-white/10",
      "bg-blue-500/20 text-blue-300 border-blue-500/30",
      "bg-purple-500/20 text-purple-300 border-purple-500/30",
      "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    ];
    return colors[level - 1] || colors[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pro-purple-400"></div>
      </div>
    );
  }

  if (cards.length === 0 && levelFilter === null) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 space-y-8">
        <div className="w-24 h-24 glass-card flex items-center justify-center mx-auto shadow-2xl">
          <BookOpen className="w-12 h-12 text-pro-purple-300" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t("noFlashcardsTitle")}</h1>
          <p className="text-white/60">{t("noFlashcardsDesc")}</p>
        </div>
        <button
          onClick={() => window.location.href = "/simulator"}
          className="px-8 py-4 bg-white text-pro-purple-900 rounded-2xl font-bold hover:bg-pro-purple-50 transition-all inline-flex items-center gap-3 shadow-xl shadow-white/5"
        >
          {t("startSimulationBtn")}
          <Sparkles className="w-5 h-5" />
        </button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const translationLang = userLanguage === "English" ? "French" : "English";

  return (
    <div className="max-w-2xl mx-auto space-y-10 py-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t("flashcards")}</h1>
          <p className="text-white/60 text-lg">
            {cards.length > 0 
              ? t("cardOf", { current: currentIndex + 1, total: cards.length })
              : t("noFlashcards")}
          </p>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <Filter className="w-4 h-4 text-white/40 mr-2 flex-shrink-0" />
          <button
            onClick={() => setLevelFilter(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              levelFilter === null 
                ? "bg-white text-pro-purple-900 border-white" 
                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
            }`}
          >
            {t("viewAll")}
          </button>
          {[1, 2, 3, 4, 5].map(lvl => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                levelFilter === lvl 
                  ? "bg-white text-pro-purple-900 border-white" 
                  : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
              }`}
            >
              {t(`level${lvl}`)}
            </button>
          ))}
        </div>
      </div>

      {cards.length > 0 ? (
        <>
          {/* Card Container */}
          <div className="perspective-1000 h-[450px] relative group">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={`w-full h-full transition-all duration-700 preserve-3d cursor-pointer relative ${
                isFlipped ? "rotate-y-180" : ""
              }`}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden glass-card flex flex-col items-center justify-center p-12 text-center shadow-2xl">
                <div className="absolute top-8 left-8">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getLevelColor(currentCard.mastery_level || 1)}`}>
                    {t(`level${currentCard.mastery_level || 1}`)}
                  </span>
                </div>
                <span className="text-xs font-bold text-pro-purple-300 uppercase tracking-widest mb-6">{userLanguage}</span>
                <h2 className="text-5xl font-bold mb-10 tracking-tight">{currentCard.word_en}</h2>
                <button
                  onClick={(e) => { e.stopPropagation(); speak(currentCard.word_en); }}
                  className="w-16 h-16 glass-button rounded-full flex items-center justify-center text-white shadow-lg"
                >
                  <Volume2 className="w-8 h-8" />
                </button>
                <p className="mt-12 text-white/30 text-xs font-bold uppercase tracking-widest">{t("clickToFlip")}</p>
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-pro-purple-600 to-pro-purple-800 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-12 text-center text-white border border-white/20">
                <span className="text-xs font-bold text-pro-purple-200 uppercase tracking-widest mb-6">{t("translationLabel", { lang: translationLang })}</span>
                <h2 className="text-5xl font-bold mb-10 tracking-tight">{currentCard.translation_fr}</h2>
                <div className="bg-black/20 backdrop-blur-sm p-6 rounded-2xl max-w-sm border border-white/10">
                  <p className="text-sm italic text-white/80 leading-relaxed">"{currentCard.context_example}"</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mastery Controls */}
          <div className="flex justify-center gap-6">
            <button
              onClick={() => updateMastery(currentCard.id, -1)}
              disabled={currentCard.mastery_level <= 1}
              className="flex items-center gap-3 px-6 py-3 bg-red-500/20 text-red-200 border border-red-500/30 rounded-2xl text-sm font-bold hover:bg-red-500/30 transition-all disabled:opacity-30"
            >
              <XCircle className="w-5 h-5" />
              {t("markAsDifficult")}
            </button>
            <button
              onClick={() => updateMastery(currentCard.id, 1)}
              disabled={currentCard.mastery_level >= 5}
              className="flex items-center gap-3 px-6 py-3 bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 rounded-2xl text-sm font-bold hover:bg-emerald-500/30 transition-all disabled:opacity-30"
            >
              <CheckCircle2 className="w-5 h-5" />
              {t("markAsLearned")}
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6">
            <button
              onClick={() => handleDelete(currentCard.id)}
              className="w-14 h-14 glass-button rounded-2xl flex items-center justify-center text-white/40 hover:text-red-400 transition-colors"
              title={t("deleteCard")}
            >
              <Trash2 className="w-6 h-6" />
            </button>

            <div className="flex gap-4">
              <button
                disabled={currentIndex === 0}
                onClick={() => { setCurrentIndex(prev => prev - 1); setIsFlipped(false); }}
                className="px-8 py-4 glass-button rounded-2xl font-bold text-white/60 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                disabled={currentIndex === cards.length - 1}
                onClick={() => { setCurrentIndex(prev => prev + 1); setIsFlipped(false); }}
                className="px-8 py-4 bg-white text-pro-purple-900 rounded-2xl font-bold hover:bg-pro-purple-50 transition-all disabled:opacity-30 shadow-xl shadow-white/5"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-24 glass-card border-2 border-dashed border-white/10">
          <Filter className="w-16 h-16 text-white/20 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">{t("noFlashcardsTitle")}</h2>
          <p className="text-white/50 mb-8">Aucune carte trouvée pour ce niveau.</p>
          <button
            onClick={() => setLevelFilter(null)}
            className="text-pro-purple-300 font-bold hover:text-pro-purple-200 transition-colors"
          >
            {t("viewAll")}
          </button>
        </div>
      )}

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
