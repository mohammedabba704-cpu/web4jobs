import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

import { User as FirebaseUser } from "firebase/auth";

export default function Login({ user: currentUser }: { user: FirebaseUser | null }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (currentUser && !loading && !success) {
      navigate("/");
    }
  }, [currentUser, loading, success, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Mot de passe incorrect ou compte introuvable");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("L'authentification par email/mot de passe n'est pas activée. Veuillez l'activer dans la console Firebase.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Erreur réseau : Connexion bloquée. Veuillez désactiver votre bloqueur de publicités ou vérifier votre connexion internet.");
      } else {
        setError("Veuillez vérifier vos identifiants");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-pro-purple-950">
      {/* Background decorative elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-pro-purple-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-pro-purple-700/20 rounded-full blur-[120px]" />

      <div className="max-w-md w-full glass-card p-10 relative z-10 shadow-2xl shadow-black/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4 overflow-hidden p-2">
            <img 
              src="https://web4jobs.com/wp-content/uploads/2021/04/logo-web4jobs-1.png" 
              alt="Web4jobs" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">Connexion</h1>
          <p className="text-white/60">Content de vous revoir !</p>
        </div>

        {success ? (
          <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-green-400 mb-2">Connexion réussie</h2>
            <p className="text-sm text-white/60">Redirection vers votre espace...</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="nom@exemple.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pro-purple-500 transition-all text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input 
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pro-purple-500 transition-all text-white"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-pro-purple-500 focus:ring-pro-purple-500/50 focus:ring-offset-0"
                  />
                  <span className="text-sm text-white/80 select-none hover:text-white transition-colors">Se souvenir de moi</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-bold text-white/60 hover:text-white transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-pro-purple-500 hover:bg-pro-purple-400 disabled:opacity-50 text-white mt-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-pro-purple-500/20"
            >
              {loading ? "Chargement..." : "Se connecter"}
            </button>

            <div className="text-center mt-6">
              <p className="text-sm text-white/60">
                Vous n'avez pas de compte ?{' '}
                <Link to="/register" className="text-pro-purple-400 font-bold hover:text-pro-purple-300">
                  S'inscrire
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
