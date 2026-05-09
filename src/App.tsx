import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import Layout from "./components/Layout";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import EmailAssistant from "./pages/EmailAssistant";
import Simulator from "./pages/Simulator";
import Flashcards from "./pages/Flashcards";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

import { LanguageProvider } from "./lib/LanguageContext";
import CourseCatalog from './pages/CourseCatalog';
import CourseView from './pages/CourseView';
import AdminDashboard from './pages/AdminDashboard';
import PlacementTest from './pages/PlacementTest';

import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyResetCode from './pages/VerifyResetCode';
import ResetPassword from './pages/ResetPassword';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    let unsubDoc = () => {};
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const timeout = setTimeout(() => {
          console.warn("Firestore profile fetch timeout (offline mode?)");
          setLoading(false);
        }, 5000);

        // Use onSnapshot to immediately react when the document is created during registration
        unsubDoc = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
          clearTimeout(timeout);
          setHasProfile(docSnap.exists());
          setLoading(false);
        }, (error) => {
          clearTimeout(timeout);
          console.error("Error fetching user profile:", error);
          setLoading(false);
        });
      } else {
        setHasProfile(false);
        setLoading(false);
        unsubDoc();
      }
    });
    return () => {
      unsubscribe();
      unsubDoc();
    };
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
          <Route path="/login" element={<Login user={user} />} />
          <Route path="/register" element={<Register user={user} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-reset-code" element={<VerifyResetCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
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
            <Route path="/courses" element={user ? <CourseCatalog /> : <Navigate to="/login" />} />
            <Route path="/courses/:id" element={user ? <CourseView /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user ? <AdminDashboard /> : <Navigate to="/login" />} />
            <Route path="/placement" element={user ? <PlacementTest /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  );
}
