import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { geminiService } from "../services/gemini";
import { Send, Sparkles, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import Markdown from "react-markdown";
import { useLanguage } from "../lib/LanguageContext";

export default function EmailAssistant() {
  const [text, setText] = useState("");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [userLanguage, setUserLanguage] = useState("English");
  const { t } = useLanguage();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      const d = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (d.exists()) setUserLanguage(d.data().target_language || "English");
    };
    fetchProfile();
  }, []);

  const handleCorrect = async () => {
    if (!text || !auth.currentUser) return;

    setLoading(true);
    try {
      const correction = await geminiService.correctEmail(text, tone, userLanguage);
      setResult(correction);

      await addDoc(collection(db, "emails"), {
        user_id: auth.currentUser.uid,
        original_text: text,
        corrected_text: correction.correctedText,
        grammar_feedback: correction.feedback,
        created_at: serverTimestamp(),
      });
    } catch (error) {
      console.error("Correction failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 py-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t("emailAssistant")}</h1>
          <p className="text-white/60 text-lg">{t("emailAssistantSubtitle")}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setText(""); setResult(null); }}
            className="w-12 h-12 glass-button rounded-2xl flex items-center justify-center text-white/40 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Input Section */}
        <div className="glass-card p-8 space-y-8 shadow-2xl">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-white/50 uppercase tracking-widest">{t("selectTone")}</label>
            <div className="flex gap-4">
              <button
                onClick={() => setTone("professional")}
                className={`flex-1 py-4 rounded-2xl border font-bold transition-all ${
                  tone === "professional" ? "bg-white text-pro-purple-900 border-white shadow-xl shadow-white/10" : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                }`}
              >
                {t("professional")}
              </button>
              <button
                onClick={() => setTone("friendly")}
                className={`flex-1 py-4 rounded-2xl border font-bold transition-all ${
                  tone === "friendly" ? "bg-white text-pro-purple-900 border-white shadow-xl shadow-white/10" : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                }`}
              >
                {t("friendly")}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-white/50 uppercase tracking-widest">{t("emailDraft")}</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("emailDraftPlaceholder")}
              className="w-full h-80 p-6 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-pro-purple-400 focus:border-pro-purple-400 outline-none transition-all resize-none text-white placeholder:text-white/20 leading-relaxed"
            />
          </div>

          <button
            onClick={handleCorrect}
            disabled={loading || !text}
            className="w-full bg-white text-pro-purple-900 px-6 py-5 rounded-2xl font-bold hover:bg-pro-purple-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-white/5"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pro-purple-900"></div>
            ) : (
              <>
                {t("correctEmailBtn")}
                <Sparkles className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="space-y-8">
          {result ? (
            <div className="glass-card p-8 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 shadow-2xl">
              <div className="space-y-6">
                <h2 className="text-sm font-bold text-pro-purple-300 uppercase tracking-widest">{t("correctedVersion")}</h2>
                <div className="p-6 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 prose prose-invert max-w-none">
                  <Markdown>{result.correctedText}</Markdown>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-sm font-bold text-pro-purple-300 uppercase tracking-widest">{t("feedback")}</h2>
                <div className="space-y-4">
                  {result.feedback.map((f: any, i: number) => (
                    <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-all">
                      {f.type === "grammar" ? (
                        <AlertCircle className="w-6 h-6 text-pro-purple-400 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                      )}
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white group-hover:text-pro-purple-200 transition-colors">{f.error}</p>
                        <p className="text-xs text-white/50 leading-relaxed">{f.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 glass-card border-2 border-dashed border-white/10 min-h-[500px]">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10">
                <Send className="w-10 h-10 text-white/20" />
              </div>
              <h2 className="text-2xl font-bold mb-3">{t("readyToHelp")}</h2>
              <p className="text-white/40 max-w-xs leading-relaxed">
                {t("readyToHelpDesc")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
