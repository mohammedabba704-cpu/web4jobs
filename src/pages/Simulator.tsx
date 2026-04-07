import { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { geminiService } from "../services/gemini";
import { MessageSquare, Send, User, Bot, Sparkles, Trophy, Presentation, Users, ClipboardCheck, Network, ShieldAlert, Code, UserPlus, MonitorPlay } from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";

export default function Simulator() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState<string | null>(null);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      const d = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (d.exists()) setUserProfile(d.data());
    };
    fetchProfile();
  }, []);

  const startSimulation = (s: string) => {
    setScenario(s);
    const lang = userProfile?.target_language || "English";
    const initialMsg = lang === "French" 
      ? `Bonjour ! Je suis prêt pour notre simulation de ${s}. Comment devrions-nous commencer ?`
      : `Hello! I'm ready for our ${s} simulation. How should we begin?`;
    setMessages([{ role: "bot", content: initialMsg }]);
  };

  const handleSend = async () => {
    if (!input || !scenario || !auth.currentUser) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const reply = await geminiService.getSimulationReply(messages, input, scenario, userProfile?.target_language || "English");
      setMessages(prev => [...prev, { role: "bot", content: reply }]);
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const finishSimulation = async () => {
    if (!auth.currentUser || !scenario) return;
    setLoading(true);
    try {
      // Generate flashcards from session
      const cards = await geminiService.generateFlashcardsFromSimulation(messages, userProfile?.target_language || "English");
      for (const card of cards) {
        await addDoc(collection(db, "flashcards"), {
          ...card,
          user_id: auth.currentUser.uid,
          mastery_level: 1,
          review_date: serverTimestamp(),
          created_at: serverTimestamp()
        });
      }

      await addDoc(collection(db, "simulations"), {
        user_id: auth.currentUser.uid,
        scenario_id: scenario,
        chat_history: messages,
        created_at: serverTimestamp()
      });

      setSessionFinished(true);
    } catch (error) {
      console.error("Finishing simulation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const scenarios = [
    { id: "jobInterview", icon: MessageSquare },
    { id: "salaryNegotiation", icon: MessageSquare },
    { id: "clientMeeting", icon: MessageSquare },
    { id: "projectPitch", icon: MessageSquare },
    { id: "presentationSkills", icon: Presentation },
    { id: "teamCollaboration", icon: Users },
    { id: "performanceReview", icon: ClipboardCheck },
    { id: "networkingEvent", icon: Network },
    { id: "conflictResolution", icon: ShieldAlert },
    { id: "technicalInterview", icon: Code },
    { id: "onboardingSession", icon: UserPlus },
    { id: "productDemo", icon: MonitorPlay },
  ];

  if (!scenario) {
    return (
      <div className="space-y-8 py-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t("simulator")}</h1>
          <p className="text-white/60 text-lg">{t("simulationScenarios")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => startSimulation(t(s.id))}
              className="glass-card p-8 text-left group hover:bg-white/15 transition-all"
            >
              <div className="w-12 h-12 bg-pro-purple-500/20 rounded-xl flex items-center justify-center text-pro-purple-300 mb-4 group-hover:scale-110 transition-transform">
                <s.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t(s.id)}</h3>
              <p className="text-sm text-white/50">{t(`${s.id}Desc`)}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (sessionFinished) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 space-y-8">
        <div className="w-24 h-24 glass-card flex items-center justify-center mx-auto shadow-2xl">
          <Trophy className="w-12 h-12 text-pro-purple-300" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t("simulationComplete")}</h1>
          <p className="text-white/60">
            {t("simulationCompleteDesc")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => { setScenario(null); setSessionFinished(false); setMessages([]); }}
            className="px-8 py-4 bg-white text-pro-purple-900 rounded-2xl font-bold hover:bg-pro-purple-50 transition-all shadow-xl shadow-white/5"
          >
            {t("newSimulation")}
          </button>
          <button
            onClick={() => window.location.href = "/flashcards"}
            className="px-8 py-4 glass-button rounded-2xl font-bold text-white/60 hover:text-white"
          >
            {t("reviewFlashcards")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col glass-card overflow-hidden shadow-2xl border-white/10">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-pro-purple-500/30 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-bold text-lg">{scenario}</h2>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              {t("aiAssistantOnline")}
            </p>
          </div>
        </div>
        <button
          onClick={finishSimulation}
          className="glass-button px-6 py-2.5 rounded-xl text-sm font-bold"
        >
          {t("finishSession")}
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-4 max-w-[85%] sm:max-w-[75%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                m.role === "user" ? "bg-pro-purple-500 text-white" : "bg-white/10 text-pro-purple-200 border border-white/10"
              }`}>
                {m.role === "user" ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
              </div>
              <div className={`p-5 rounded-2xl text-sm leading-relaxed shadow-xl ${
                m.role === "user" 
                  ? "bg-gradient-to-br from-pro-purple-600 to-pro-purple-800 text-white rounded-tr-none border border-white/10" 
                  : "bg-white/5 backdrop-blur-sm text-white/90 rounded-tl-none border border-white/10"
              }`}>
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-pro-purple-200 border border-white/10">
                <Bot className="w-6 h-6" />
              </div>
              <div className="p-5 bg-white/5 backdrop-blur-sm rounded-2xl rounded-tl-none border border-white/10 flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-pro-purple-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-pro-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-pro-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/10 bg-white/5 backdrop-blur-md">
        <div className="flex gap-4 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder={t("typeMessage")}
            className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-pro-purple-400 focus:border-pro-purple-400 outline-none transition-all text-white placeholder:text-white/20"
          />
          <button
            onClick={handleSend}
            disabled={!input || loading}
            className="bg-white text-pro-purple-900 p-4 rounded-2xl hover:bg-pro-purple-50 transition-all disabled:opacity-50 shadow-xl shadow-white/5"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
