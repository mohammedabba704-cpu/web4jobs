import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";

export default function VerifyResetCode() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    // Retrieve email if user just came from the ForgotPassword page
    const storedEmail = sessionStorage.getItem('resetEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleResendCode = async () => {
    if (!email) return;

    setResendLoading(true);
    setError("");
    setResendSuccess(false);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Une erreur est survenue lors du renvoi du code.");
      }

      if (data.devCode) {
        console.log("🛠️ DEV MODE - Code de réinitialisation : ", data.devCode);
        alert(`🛠️ MODE DÉVELOPPEMENT\n\nVotre nouveau code de réinitialisation est : ${data.devCode}\n\n(Ce message n'apparaîtra pas en production)`);
      }

      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || "Impossible de renvoyer le code.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    
    if (code.length !== 6) {
      setError("Veuillez entrer un code à 6 chiffres.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Code invalide.");
      }

      setSuccess(true);
      // Keep email in session storage but clear code for security
      setTimeout(() => {
        navigate("/reset-password");
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-pro-purple-950">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-pro-purple-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-pro-purple-700/20 rounded-full blur-[120px]" />

      <div className="max-w-md w-full glass-card p-10 relative z-10 shadow-2xl shadow-black/20">
        <Link to="/forgot-password" className="absolute top-6 left-6 text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        
        <div className="text-center mb-8 pt-4">
          <div className="w-16 h-16 bg-pro-purple-500/20 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4 overflow-hidden border border-pro-purple-500/30">
            <ShieldCheck className="w-8 h-8 text-pro-purple-300" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Vérification du code</h1>
          <p className="text-white/60">Entrez le code à 6 chiffres que vous avez reçu par email.</p>
        </div>

        {success ? (
          <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-lg font-bold text-green-400 mb-2">Code vérifié avec succès.</h2>
            <p className="text-white/60 text-sm">Vous allez être redirigé...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Email</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pro-purple-500 transition-all text-white/50 cursor-not-allowed"
                readOnly
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Code à 6 chiffres</label>
              <input 
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Ex: 482915"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-pro-purple-500 transition-all text-white"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {resendSuccess && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Nouveau code envoyé.</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-pro-purple-500 hover:bg-pro-purple-400 disabled:opacity-50 text-white mt-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-pro-purple-500/20"
            >
              {loading ? "Vérification..." : "Vérifier le code"}
            </button>

            <div className="text-center mt-6">
              <p className="text-sm text-white/60">
                Code non reçu ?{' '}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendLoading || !email}
                  className="text-pro-purple-400 font-bold hover:text-pro-purple-300 disabled:opacity-50 disabled:hover:text-pro-purple-400 transition-colors"
                >
                  {resendLoading ? "Renvoi en cours..." : "Renvoyer le code"}
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
