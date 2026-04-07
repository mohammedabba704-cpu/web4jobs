import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useLanguage } from "../lib/LanguageContext";
import { Save, User as UserIcon, Globe, Briefcase, CheckCircle2, AlertCircle } from "lucide-react";

export default function Settings() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  
  const [profession, setProfession] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfession(data.profession || "");
          setTargetLanguage(data.target_language || "English");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    
    setSaving(true);
    setSaveStatus("idle");
    
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        profession,
        target_language: targetLanguage
      });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Error updating settings:", error);
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pro-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold mb-2">{t("settings")}</h1>
        <p className="text-white/60 text-lg">Manage your account preferences and learning goals.</p>
      </div>

      <div className="glass-card p-8 space-y-8">
        {/* Profile Section */}
        <div className="flex items-center gap-6 pb-8 border-b border-white/10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pro-purple-400 to-pro-purple-600 border-4 border-white/10 flex items-center justify-center overflow-hidden">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.uid}`} 
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">{auth.currentUser?.email?.split('@')[0] || "User"}</h2>
            <p className="text-white/40 text-sm">{auth.currentUser?.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Target Profession */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-white/60 uppercase tracking-wider">
              <Briefcase className="w-4 h-4" />
              Target Profession
            </label>
            <input
              type="text"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="e.g. Software Engineer, Sales Manager"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pro-purple-500 transition-all"
            />
            <p className="text-xs text-white/30 italic">This helps us tailor your interview simulations and email corrections.</p>
          </div>

          {/* Learning Language */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-white/60 uppercase tracking-wider">
              <Globe className="w-4 h-4" />
              Learning Language
            </label>
            <div className="grid grid-cols-2 gap-4">
              {["English", "French"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setTargetLanguage(lang)}
                  className={`px-4 py-3 rounded-xl border font-bold transition-all ${
                    targetLanguage === lang
                      ? "bg-pro-purple-500 border-pro-purple-400 text-white shadow-lg shadow-pro-purple-500/20"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {saveStatus === "success" && (
              <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium animate-in fade-in slide-in-from-left-2">
                <CheckCircle2 className="w-4 h-4" />
                Settings saved successfully!
              </span>
            )}
            {saveStatus === "error" && (
              <span className="flex items-center gap-1.5 text-red-400 text-sm font-medium animate-in fade-in slide-in-from-left-2">
                <AlertCircle className="w-4 h-4" />
                Failed to save settings.
              </span>
            )}
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-white text-pro-purple-900 px-8 py-3 rounded-xl font-bold hover:bg-pro-purple-50 transition-all disabled:opacity-50 shadow-xl shadow-white/5"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-pro-purple-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
