import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('resetEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setError("Aucun email associé à cette session. Veuillez recommencer.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
       setError("Aucun email valide.");
       return;
    }
    
    if (!formData.password || !formData.confirmPassword) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          newPassword: formData.password, 
          confirmPassword: formData.confirmPassword 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Une erreur est survenue.");
      }

      setSuccess(true);
      sessionStorage.removeItem('resetEmail');
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue, veuillez réessayer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-pro-purple-950">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-pro-purple-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-pro-purple-700/20 rounded-full blur-[120px]" />

      <div className="max-w-md w-full glass-card p-10 relative z-10 shadow-2xl shadow-black/20">
        <Link to="/verify-reset-code" className="absolute top-6 left-6 text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        
        <div className="text-center mb-8 pt-4">
          <div className="w-16 h-16 bg-pro-purple-500/20 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4 overflow-hidden border border-pro-purple-500/30">
            <Lock className="w-8 h-8 text-pro-purple-300" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Réinitialiser le mot de passe</h1>
          <p className="text-white/60">Saisissez votre nouveau mot de passe ci-dessous.</p>
        </div>

        {success ? (
          <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-lg font-bold text-green-400 mb-2">Mot de passe modifié avec succès</h2>
            <p className="text-sm text-white/60 mb-6">Vous allez être redirigé vers la page de connexion.</p>
            <Link to="/login" className="glass-button w-full py-3 rounded-xl font-bold flex justify-center">
              Se connecter
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Nouveau mot de passe</label>
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
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Confirmer mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input 
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="••••••••"
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
              disabled={loading || !email}
              className="w-full bg-pro-purple-500 hover:bg-pro-purple-400 disabled:opacity-50 text-white mt-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-pro-purple-500/20"
            >
              {loading ? "Modification..." : "Modifier le mot de passe"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
