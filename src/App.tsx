import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import Layout from "./components/Layout";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import EmailAssistant from "./pages/EmailAssistant";
import Simulator from "./pages/Simulator";
import Flashcards from "./pages/Flashcards";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

import { LanguageProvider } from "./lib/LanguageContext";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        setHasProfile(userDoc.exists());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-pro-purple-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pro-purple-400"></div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          
          <Route element={<Layout user={user} />}>
            <Route
              path="/"
              element={
                user ? (
                  hasProfile ? <Dashboard /> : <Navigate to="/onboarding" />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/onboarding"
              element={user ? <Onboarding onComplete={() => setHasProfile(true)} /> : <Navigate to="/login" />}
            />
            <Route path="/emails" element={user ? <EmailAssistant /> : <Navigate to="/login" />} />
            <Route path="/simulator" element={user ? <Simulator /> : <Navigate to="/login" />} />
            <Route path="/flashcards" element={user ? <Flashcards /> : <Navigate to="/login" />} />
            <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  );
}
