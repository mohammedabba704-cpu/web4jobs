import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { 
  Play, 
  CheckCircle2, 
  ChevronRight, 
  Lightbulb, 
  TrendingUp,
  Mail,
  Handshake,
  MonitorPlay,
  MoreHorizontal,
  ChevronDown,
  GraduationCap,
  Mic2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../lib/LanguageContext";

export default function Dashboard() {
  const [stats, setStats] = useState({
    emails: 0,
    simulations: 0,
    flashcards: 0
  });
  const { t } = useLanguage();

  useEffect(() => {
    if (!auth.currentUser) return;

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
            {t("welcome")}, {auth.currentUser?.email?.split('@')[0] || "User"}!
          </h1>
          <p className="text-white/60 text-lg">
            {t("dashboardSubtitle")}
          </p>
        </div>
        <div className="flex gap-4">
          <Link to="/simulator" className="glass-button px-8 py-3 rounded-xl font-bold flex items-center gap-3 shadow-lg">
            <Play className="w-5 h-5 fill-current" />
            {t("takeALesson")}
          </Link>
          <Link to="/emails" className="glass-button px-8 py-3 rounded-xl font-bold flex items-center gap-3 shadow-lg">
            <CheckCircle2 className="w-5 h-5" />
            {t("startPractice")}
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Current Course Card */}
        <div className="lg:col-span-4 glass-card p-8 flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
            <GraduationCap className="w-32 h-32 -mr-10 -mt-10" />
          </div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white/70 uppercase tracking-widest text-sm">{t("currentCourse")}</h2>
              <MoreHorizontal className="w-6 h-6 text-white/40" />
            </div>
            <h3 className="text-3xl font-bold mb-2">{t("businessEnglish")}</h3>
            <p className="text-white/60 font-medium">{t("progress")}: 40%</p>
          </div>

          <div className="relative space-y-6">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-pro-purple-400 w-[40%] rounded-full shadow-[0_0_15px_rgba(159,122,234,0.5)]" />
            </div>
            <div className="flex gap-3">
              <Link to="/simulator" className="flex-1 glass-button py-3 rounded-xl text-sm font-bold text-center">
                {t("resumeCourse")}
              </Link>
              <Link to="/settings" className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-sm font-bold transition-all text-center">
                {t("changeCourse")}
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Practice Card */}
        <div className="lg:col-span-4 glass-card p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-pro-purple-500/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-pro-purple-300" />
            </div>
            <h2 className="text-xl font-bold">{t("quickPractice")}</h2>
          </div>
          
          <div className="space-y-4 flex-1">
            <Link to="/flashcards" className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-pro-purple-400/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-pro-purple-300" />
                </div>
                <span className="font-bold">{t("vocabularyQuiz")}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
            </Link>
            
            <Link to="/simulator" className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-pro-purple-400/20 rounded-full flex items-center justify-center">
                  <Mic2 className="w-5 h-5 text-pro-purple-300" />
                </div>
                <span className="font-bold">{t("speakingExercise")}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>

        {/* Daily Tip & Progress Overview Column */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          {/* Daily Tip */}
          <div className="glass-card p-6 bg-gradient-to-br from-pro-purple-600/40 to-pro-purple-800/40 border-pro-purple-400/30">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-yellow-400" />
              <h2 className="font-bold">{t("dailyTip")}</h2>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              {t("dailyTipContent")}
            </p>
          </div>

          {/* Progress Overview */}
          <div className="glass-card p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-pro-purple-300" />
                <h2 className="font-bold">{t("progressOverview")}</h2>
              </div>
              <ChevronDown className="w-4 h-4 text-white/40" />
            </div>

            <div className="flex-1 flex items-center justify-between gap-4">
              <div className="space-y-4">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{t("thisWeek")}</p>
                <div>
                  <p className="text-xs text-white/60 mb-1">{t("lessonsCompleted")}: <span className="text-white font-bold">3</span></p>
                  <p className="text-xs text-white/60">{t("wordsLearned")}: <span className="text-white font-bold">45</span></p>
                </div>
              </div>
              
              <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-white/10"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 * (1 - 0.6)}
                    className="text-pro-purple-400 drop-shadow-[0_0_8px_rgba(159,122,234,0.8)]"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">60%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Lessons */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{t("recommendedPath")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: t("emailWriting"), desc: t("effectiveEmailDesc"), icon: Mail },
            { title: t("negotiationSkills"), desc: t("negotiationDesc"), icon: Handshake },
            { title: t("presentationTechniques"), desc: t("presentationDesc"), icon: MonitorPlay },
          ].map((lesson, i) => (
            <div key={i} className="glass-card p-6 group hover:bg-white/15 transition-all">
              <div className="w-12 h-12 bg-pro-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <lesson.icon className="w-6 h-6 text-pro-purple-300" />
              </div>
              <h3 className="text-xl font-bold mb-2">{lesson.title}</h3>
              <p className="text-sm text-white/50 mb-6">{lesson.desc}</p>
              <Link to={lesson.title === t("emailWriting") ? "/emails" : "/simulator"} className="glass-button w-full py-2 rounded-lg text-sm font-bold text-center block">
                {t("start")}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Live Conversation Practice */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-pro-purple-900/40 to-pro-purple-600/20">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-pro-purple-400/20 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-4 h-4 bg-pro-purple-400 rounded-full" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t("liveConversation")}</h2>
            <p className="text-white/60">{t("upcomingSession")}: <span className="text-white font-bold">3:00 PM</span></p>
          </div>
        </div>
        <Link to="/simulator" className="glass-button px-10 py-3 rounded-xl font-bold flex items-center gap-3 group">
          {t("joinSession")}
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

