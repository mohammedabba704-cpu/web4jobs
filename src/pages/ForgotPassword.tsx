import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, AlertCircle } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Veuillez entrer un email valide.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Une erreur est survenue");
      }

      if (data.devCode) {
        console.log("🛠️ DEV MODE - Code de réinitialisation : ", data.devCode);
        alert(`🛠️ MODE DÉVELOPPEMENT\n\nVotre code de réinitialisation est : ${data.devCode}\n\n(Ce message n'apparaîtra pas en production)`);
      }

      // Store email temporarily so Verify page doesn't have to ask again
      sessionStorage.setItem('resetEmail', email);
      navigate("/verify-reset-code");
      
    } catch (err: any) {
      setError(err.message || "Veuillez entrer un email valide.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-pro-purple-950">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-pro-purple-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-pro-purple-700/20 rounded-full blur-[120px]" />

      <div className="max-w-md w-full glass-card p-10 relative z-10 shadow-2xl shadow-black/20">
        <Link to="/login" className="absolute top-6 left-6 text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        
        <div className="text-center mb-8 pt-4">
          <div className="w-16 h-16 bg-pro-purple-500/20 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4 overflow-hidden border border-pro-purple-500/30">
            <Mail className="w-8 h-8 text-pro-purple-300" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Mot de passe oublié</h1>
          <p className="text-white/60">Entrez votre adresse email pour recevoir un code de vérification à 6 chiffres.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pro-purple-500 transition-all text-white"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-pro-purple-500 hover:bg-pro-purple-400 disabled:opacity-50 text-white mt-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-pro-purple-500/20"
          >
            {loading ? "Envoi en cours..." : "Envoyer le code"}
          </button>
        </form>
      </div>
    </div>
  );
}
