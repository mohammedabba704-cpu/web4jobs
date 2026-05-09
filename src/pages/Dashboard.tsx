import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot, getDoc, doc } from "firebase/firestore";
import { 
  Play, 
  CheckCircle2, 
  ChevronRight, 
  Lightbulb, 
  TrendingUp,
  Brain,
  MonitorPlay,
  MoreHorizontal,
  ChevronDown,
  GraduationCap,
  Target,
  AlertTriangle,
  Youtube
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../lib/LanguageContext";
import { AIOrchestrator, CEFR_METADATA } from "../lib/orchestrator";

export default function Dashboard() {
  const [stats, setStats] = useState({
    emails: 0,
    simulations: 0,
    flashcards: 0
  });
  const [learnerData, setLearnerData] = useState<any>(null);
  const { t } = useLanguage();

  // Mock User Profile for AI Orchestrator
  const userProfile = {
    cefrLevel: learnerData?.currentLevel !== 'non évalué' && learnerData?.currentLevel ? learnerData.currentLevel : "A1",
    target_language: "English",
    weakestSkill: "Grammar",
    strongestSkill: "Vocabulary",
    averageScore: 45, // Below 50 to trigger downgrade alert based on rules
    completedCourses: 4,
    recentPerformances: [
      { score: 40 }, { score: 45 }, { score: 50 }, { score: 45 }
    ] // Average ~45
  };

  const levelInfo = CEFR_METADATA[userProfile.cefrLevel] || CEFR_METADATA["A1"];
  const levelAdjustment = AIOrchestrator.adjustLevel(userProfile, userProfile.recentPerformances);
  const recommendationsInfo = AIOrchestrator.recommendCourses(userProfile, 3);

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchLearner = async () => {
      try {
        const docSnap = await getDoc(doc(db, "learners", auth.currentUser!.uid));
        if (docSnap.exists()) {
          setLearnerData(docSnap.data());
        }
      } catch (err) {
        console.error("Failed to load learner data", err);
      }
    };
    fetchLearner();

    const qEmails = query(collection(db, "emails"), where("user_id", "==", auth.currentUser.uid));
    const qSims = query(collection(db, "simulations"), where("user_id", "==", auth.currentUser.uid));
    const qCards = query(collection(db, "flashcards"), where("user_id", "==", auth.currentUser.uid));

    const unsubEmails = onSnapshot(qEmails, (s) => setStats(prev => ({ ...prev, emails: s.size })));
    const unsubSims = onSnapshot(qSims, (s) => setStats(prev => ({ ...prev, simulations: s.size })));
    const unsubCards = onSnapshot(qCards, (s) => setStats(prev => ({ ...prev, flashcards: s.size })));

    return () => {
      unsubEmails();
      unsubSims();
      unsubCards();
    };
  }, []);

  return (
    <div className="space-y-10 py-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            {t("welcome")}, {learnerData?.fullName || auth.currentUser?.email?.split('@')[0] || "User"}!
          </h1>
          <p className="text-white/60 text-lg">
            Voici ton espace d'apprentissage Web4Jobs Lingo.
          </p>
        </div>
        <div className="flex gap-4">
          {learnerData?.currentLevel === 'non évalué' || !learnerData?.currentLevel ? (
            <Link to="/placement" className="bg-pro-purple-500 hover:bg-pro-purple-400 px-8 py-3 rounded-xl font-bold flex items-center gap-3 shadow-lg transition-all text-white">
              <Brain className="w-5 h-5" />
              Passer le test de niveau
            </Link>
          ) : (
            <Link to="/courses" className="bg-pro-purple-500 hover:bg-pro-purple-400 px-8 py-3 rounded-xl font-bold flex items-center gap-3 shadow-lg transition-all text-white">
              <Play className="w-5 h-5" />
              Continuer mon parcours
            </Link>
          )}
        </div>
      </div>

      {/* Profil Apprenant */}
      <div className="glass-card p-6 border border-white/10 flex flex-wrap gap-6 items-center w-full">
        <div className="flex flex-col">
          <span className="text-white/60 text-xs font-bold uppercase">Email</span>
          <span className="text-white font-medium">{learnerData?.email || auth.currentUser?.email}</span>
        </div>
        <div className="w-px h-10 bg-white/10 hidden md:block"></div>
        <div className="flex flex-col">
          <span className="text-white/60 text-xs font-bold uppercase">Situation Pro</span>
          <span className="text-white font-medium">{learnerData?.professionalStatus || 'Non renseignée'}</span>
        </div>
        <div className="w-px h-10 bg-white/10 hidden md:block"></div>
        <div className="flex flex-col">
          <span className="text-white/60 text-xs font-bold uppercase">Niveau Actuel</span>
          <span className="text-pro-purple-400 font-bold">{learnerData?.currentLevel || 'non évalué'}</span>
        </div>
      </div>

      {/* AI Alert System */}
      {(levelAdjustment.action === "DOWNGRADE" || levelAdjustment.action === "UPGRADE") && (
        <div className={`p-6 rounded-2xl border flex items-start gap-4 shadow-2xl ${
          levelAdjustment.action === "DOWNGRADE" 
          ? "bg-red-500/10 border-red-500/30" 
          : "bg-green-500/10 border-green-500/30"
        }`}>
          <div className={`p-3 rounded-xl ${levelAdjustment.action === "DOWNGRADE" ? "bg-red-500/20" : "bg-green-500/20"}`}>
            {levelAdjustment.action === "DOWNGRADE" ? <AlertTriangle className="w-6 h-6 text-red-400" /> : <TrendingUp className="w-6 h-6 text-green-400" />}
          </div>
          <div className="flex-1">
            <h3 className={`font-bold text-lg mb-1 ${levelAdjustment.action === "DOWNGRADE" ? "text-red-400" : "text-green-400"}`}>
              {levelAdjustment.action === "DOWNGRADE" ? "Alerte de niveau : Difficultés détectées" : "Progression fulgurante !"}
            </h3>
            <p className="text-white/80 leading-relaxed mb-4">{levelAdjustment.reason}</p>
            <button className={`px-6 py-2 rounded-lg font-bold text-sm ${
              levelAdjustment.action === "DOWNGRADE" ? "bg-red-500/20 border border-red-500/30 hover:bg-red-500/30" : "bg-green-500/20 border border-green-500/30 hover:bg-green-500/30"
            }`}>
              {levelAdjustment.action === "DOWNGRADE" ? `Accepter le retour en ${levelAdjustment.newLevel}` : `Passer au niveau ${levelAdjustment.newLevel}`}
            </button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Current Level Card */}
        <div className="glass-card p-6 flex flex-col justify-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <Target className="w-24 h-24" />
           </div>
           <h2 className="text-white/60 font-medium mb-1">Niveau Actuel</h2>
           <h3 className="text-4xl font-bold text-pro-purple-400 mb-2">{userProfile.cefrLevel}</h3>
           <p className="text-sm text-white/50">{levelInfo?.description.substring(0, 50)}...</p>
        </div>

        {/* Global Progress */}
        <div className="glass-card p-6 flex flex-col justify-center relative overflow-hidden group">
           <h2 className="text-white/60 font-medium mb-1">Score Moyen</h2>
           <h3 className={`text-4xl font-bold mb-2 ${userProfile.averageScore < 50 ? 'text-red-400' : 'text-green-400'}`}>{userProfile.averageScore}%</h3>
           <p className="text-sm text-white/50">{userProfile.completedCourses} cours terminés ce mois-ci</p>
        </div>

        {/* Strong Skills */}
        <div className="glass-card p-6 flex flex-col justify-center">
           <h2 className="text-white/60 font-medium mb-1">Compétence Forte</h2>
           <div className="flex items-center gap-3 mt-2">
             <div className="p-2 bg-green-500/20 rounded-lg">
               <TrendingUp className="w-6 h-6 text-green-400" />
             </div>
             <span className="font-bold text-xl">{userProfile.strongestSkill}</span>
           </div>
        </div>

        {/* Weak Skills */}
        <div className="glass-card p-6 flex flex-col justify-center">
           <h2 className="text-white/60 font-medium mb-1">À Améliorer</h2>
           <div className="flex items-center gap-3 mt-2">
             <div className="p-2 bg-orange-500/20 rounded-lg">
               <CheckCircle2 className="w-6 h-6 text-orange-400" />
             </div>
             <span className="font-bold text-xl">{userProfile.weakestSkill}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recommended Path column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-3">
             <Brain className="w-6 h-6 text-pro-purple-400" />
             <h2 className="text-2xl font-bold">Plan Personnalisé IA</h2>
          </div>
          <p className="text-white/60">{recommendationsInfo.reason}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendationsInfo.recommendations.map((course: any, i: number) => (
              <div key={i} className="glass-card p-6 flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs bg-pro-purple-500/20 text-pro-purple-300 px-2 py-1 rounded">{course.category}</span>
                    <span className="text-xs bg-white/10 px-2 py-1 rounded">{course.level}</span>
                  </div>
                  <h3 className="font-bold mb-2 group-hover:text-pro-purple-300 transition-colors">{course.title}</h3>
                  <p className="text-sm text-white/50 mb-6">{course.duration}</p>
                </div>
                <Link to="/courses" className="glass-button w-full py-2 rounded-lg text-sm font-bold text-center block">
                  {t("start")}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Video Recommendations */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-3">
             <Youtube className="w-6 h-6 text-red-500" />
             <h2 className="text-2xl font-bold">Vidéos Recommandées</h2>
          </div>
          
          <div className="space-y-4">
            {(recommendationsInfo.recommendations[0]?.videos || []).slice(0, 3).map((video: any, i: number) => (
              <a key={i} href={video.url} target="_blank" rel="noreferrer" className="block glass-card p-4 hover:bg-white/10 transition-all border border-transparent hover:border-red-500/30 group">
                <h4 className="font-bold text-sm mb-1 group-hover:text-red-400 transition-colors line-clamp-1">{video.title}</h4>
                <p className="text-xs text-white/50 line-clamp-2">{video.reason}</p>
              </a>
            ))}
            
            <a href="https://www.youtube.com/watch?v=2sCXhPefmz8&list=PLcoQWyFpRIxgcTcTpz-hmpDqhcRq701sb" target="_blank" rel="noreferrer" className="block p-4 mt-4 bg-pro-purple-900/40 border border-pro-purple-500/30 rounded-xl hover:bg-pro-purple-800/40 transition-all">
              <h4 className="font-bold text-sm mb-1 text-pro-purple-300">Playlist Obligatoire - Fondamentaux</h4>
              <p className="text-xs text-white/60">Une sélection IA pour renforcer vos acquis généraux.</p>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

