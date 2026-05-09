import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, User as FirebaseUser } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Mail, Lock, User as UserIcon, Briefcase, AlertCircle } from "lucide-react";

export default function Register({ user: currentUser }: { user: FirebaseUser | null }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    professionalStatus: "Étudiant"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (currentUser && !loading && !success) {
      navigate("/");
    }
  }, [currentUser, loading, success, navigate]);

  const statuses = [
    "Étudiant",
    "Stagiaire",
    "Salarié",
    "Chercheur d'emploi",
    "Entrepreneur",
    "Autre"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password || !formData.professionalStatus) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Email invalide.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create user in Firebase Auth (which acts as the secure hashed password store)
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Save learner profile in matching "learners" collection
      const learnerData = {
        id: user.uid,
        fullName: formData.fullName,
        email: formData.email,
        professionalStatus: formData.professionalStatus,
        role: "learner",
        currentLevel: "non évalué",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, "learners", user.uid), learnerData);
      
      // Also save in "users" collection to avoid breaking existing app logic that depends on "users" collection
      await setDoc(doc(db, "users", user.uid), learnerData, { merge: true });

      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 1500);
      
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("Cet email est déjà utilisé.");
      } else if (err.code === "auth/invalid-email") {
        setError("Email invalide.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("L'authentification par email/mot de passe n'est pas activée. Veuillez l'activer dans la console Firebase (Authentication > Sign-in method).");
      } else if (err.code === "auth/network-request-failed") {
        setError("Erreur réseau : Connexion à Firebase bloquée. Veuillez désactiver votre bloqueur de publicités (Adblock, Brave Shields, etc.) ou vérifier votre connexion internet, puis réessayer.");
      } else {
        setError(`Erreur serveur (${err.code || "inconnue"}). Veuillez réessayer.`);
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
          <h1 className="text-3xl font-bold mb-2">Inscription</h1>
          <p className="text-white/60">Créez votre compte pour commencer votre apprentissage</p>
        </div>

        {success ? (
          <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
              <span className="text-2xl text-green-400">✓</span>
            </div>
            <h2 className="text-xl font-bold text-green-400 mb-2">Compte créé avec succès.</h2>
            <p className="text-sm text-white/60">Redirection vers votre espace...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Nom complet</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input 
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Jean Dupont"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pro-purple-500 transition-all text-white"
                />
              </div>
            </div>

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
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Situation professionnelle</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <select 
                  value={formData.professionalStatus}
                  onChange={(e) => setFormData({...formData, professionalStatus: e.target.value})}
                  className="w-full bg-[#202235] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pro-purple-500 transition-all text-white appearance-none"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
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
              {loading ? "Création en cours..." : "Créer mon compte"}
            </button>

            <div className="text-center mt-6">
              <p className="text-sm text-white/60">
                Vous avez déjà un compte ?{' '}
                <Link to="/login" className="text-pro-purple-400 font-bold hover:text-pro-purple-300">
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
