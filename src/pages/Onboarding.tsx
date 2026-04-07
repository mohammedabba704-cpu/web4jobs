import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { geminiService } from "../services/gemini";
import { Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [profession, setProfession] = useState("");
  const [goal, setGoal] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profession || !goal) return;

    setLoading(true);
    setError(null);
    try {
      const result = await geminiService.evaluateOnboarding(profession, goal, language);
      setEvaluation(result);
    } catch (error) {
      console.error("Evaluation failed:", error);
      setError("Failed to evaluate profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!auth.currentUser || !evaluation) return;

    setLoading(true);
    setError(null);
    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        email: auth.currentUser.email,
        target_profession: profession,
        target_language: language,
        estimated_level: evaluation.estimatedLevel,
        recommendations: evaluation.recommendations,
        created_at: serverTimestamp(),
      });
      onComplete();
      navigate("/");
    } catch (err: any) {
      console.error("Profile creation failed:", err);
      setError("Failed to save your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 relative">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-pro-purple-500/10 rounded-full blur-[120px] -z-10" />
      
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-3">{t("welcome")}</h1>
        <p className="text-white/60 text-lg">{t("onboardingTitle")}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-200 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {!evaluation ? (
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-8 shadow-2xl">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-white/50 uppercase tracking-widest">{t("languageLabel")}</label>
            <div className="flex gap-4">
              {["English", "French"].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`flex-1 py-4 rounded-2xl border font-bold transition-all ${
                    language === lang
                      ? "bg-white text-pro-purple-900 border-white shadow-xl shadow-white/10"
                      : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-white/50 uppercase tracking-widest">{t("professionLabel")}</label>
            <input
              type="text"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="e.g. Software Engineer, Marketing Manager"
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-pro-purple-400 focus:border-pro-purple-400 outline-none transition-all text-white placeholder:text-white/20"
              required
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-white/50 uppercase tracking-widest">{t("goalLabel")}</label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder={`e.g. I want to pass technical interviews and write professional emails in ${language}.`}
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-pro-purple-400 focus:border-pro-purple-400 outline-none transition-all h-32 resize-none text-white placeholder:text-white/20"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-pro-purple-900 px-6 py-5 rounded-2xl font-bold hover:bg-pro-purple-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-white/5"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pro-purple-900"></div>
            ) : (
              <>
                {t("evaluateBtn")}
                <Sparkles className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="glass-card p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{t("aiEvaluation")}</h2>
            <div className="flex gap-3">
              <span className="px-4 py-1.5 bg-white/10 text-white/80 rounded-full text-xs font-bold uppercase tracking-wider">
                {language}
              </span>
              <span className="px-4 py-1.5 bg-pro-purple-400 text-pro-purple-900 rounded-full text-xs font-bold uppercase tracking-wider">
                {evaluation.estimatedLevel}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-pro-purple-200">{t("recommendedPath")}</h3>
            <ul className="space-y-4">
              {evaluation.recommendations.map((rec: string, i: number) => (
                <li key={i} className="flex gap-4 text-white/70">
                  <div className="w-6 h-6 rounded-full bg-pro-purple-400/20 flex items-center justify-center text-pro-purple-300 font-bold text-xs flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span className="text-sm leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full bg-white text-pro-purple-900 px-6 py-5 rounded-2xl font-bold hover:bg-pro-purple-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-white/5"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pro-purple-900"></div>
            ) : (
              <>
                {t("startLearningBtn")}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
