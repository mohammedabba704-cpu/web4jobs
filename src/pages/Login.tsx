import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { LogIn, Mail, ArrowLeft, CheckCircle2, AlertCircle, X } from "lucide-react";

export default function Login() {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setResetStatus("loading");
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetStatus("success");
    } catch (error: any) {
      console.error("Reset failed:", error);
      setResetStatus("error");
      setErrorMessage(error.message || "Failed to send reset email. Please check the address.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-pro-purple-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-pro-purple-700/20 rounded-full blur-[120px]" />

      <div className="max-w-md w-full glass-card p-10 text-center relative z-10 shadow-2xl shadow-black/20">
        <div className="mb-10">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-6 rotate-3 hover:rotate-0 transition-transform shadow-white/20 overflow-hidden p-2">
            <img 
              src="https://web4jobs.com/wp-content/uploads/2021/04/logo-web4jobs-1.png" 
              alt="Web4jobs" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Web4jobs lingo</h1>
          <p className="text-white/60">AI-powered professional French and English learning platform for job seekers.</p>
        </div>

        <div className="space-y-8">
          <div className="bg-white/5 p-6 rounded-2xl text-left border border-white/5">
            <h2 className="font-bold text-pro-purple-200 mb-4 flex items-center gap-2">
              <div className="w-5 h-5 bg-white rounded-md flex items-center justify-center overflow-hidden p-0.5">
                <img 
                  src="https://web4jobs.com/wp-content/uploads/2021/04/logo-web4jobs-1.png" 
                  alt="Web4jobs" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              Why Web4jobs lingo?
            </h2>
            <ul className="text-sm text-white/70 space-y-3">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-pro-purple-400 rounded-full" />
                AI-powered email correction
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-pro-purple-400 rounded-full" />
                Realistic interview simulations
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-pro-purple-400 rounded-full" />
                Smart flashcards from your sessions
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-pro-purple-400 rounded-full" />
                Personalized learning path
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white text-pro-purple-900 px-6 py-4 rounded-2xl font-bold hover:bg-pro-purple-50 transition-all shadow-xl shadow-pro-purple-900/20 active:scale-[0.98]"
            >
              <LogIn className="w-5 h-5" />
              Sign in with Google
            </button>

            <button 
              onClick={() => setIsResetModalOpen(true)}
              className="text-sm font-medium text-white/40 hover:text-white transition-colors"
            >
              Forgot Password?
            </button>
          </div>
          
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
            By signing in, you agree to our terms and conditions.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="max-w-sm w-full glass-card p-8 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => {
                setIsResetModalOpen(false);
                setResetStatus("idle");
                setResetEmail("");
              }}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-pro-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-pro-purple-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Reset Password</h2>
              <p className="text-sm text-white/60">Enter your email and we'll send you a link to reset your password.</p>
            </div>

            {resetStatus === "success" ? (
              <div className="text-center space-y-4 py-4">
                <div className="flex justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-400" />
                </div>
                <p className="text-sm font-medium">Check your inbox! We've sent a reset link to {resetEmail}.</p>
                <button 
                  onClick={() => setIsResetModalOpen(false)}
                  className="w-full glass-button py-3 rounded-xl text-sm font-bold"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider pl-1">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pro-purple-500 transition-all"
                  />
                </div>

                {resetStatus === "error" && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{errorMessage}</p>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={resetStatus === "loading"}
                  className="w-full bg-pro-purple-500 hover:bg-pro-purple-400 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-pro-purple-500/20"
                >
                  {resetStatus === "loading" ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
