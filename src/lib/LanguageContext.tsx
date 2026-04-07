import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { translations } from "./translations";

interface LanguageContextType {
  language: string;
  t: (key: string, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [userLanguage, setUserLanguage] = useState("English");

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const unsubscribeDoc = onSnapshot(doc(db, "users", user.uid), (doc) => {
          if (doc.exists()) {
            setUserLanguage(doc.data().target_language || "English");
          }
        });
        return () => unsubscribeDoc();
      } else {
        setUserLanguage("English");
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const t = (key: string, params?: Record<string, any>) => {
    let text = translations[userLanguage]?.[key] || translations["English"]?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v.toString());
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language: userLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
