import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { User, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { 
  LayoutDashboard, 
  Mail, 
  MessageSquare, 
  BookOpen, 
  LogOut, 
  User as UserIcon, 
  Globe,
  Settings,
  Mic2,
  PenTool,
  GraduationCap,
  Sparkles,
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import { cn } from "../lib/utils";
import { useLanguage } from "../lib/LanguageContext";

interface LayoutProps {
  user: User | null;
}

export default function Layout({ user }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const toggleLanguage = async () => {
    if (!user) return;
    const newLang = language === "English" ? "French" : "English";
    try {
      await updateDoc(doc(db, "users", user.uid), {
        target_language: newLang
      });
    } catch (error) {
      console.error("Failed to update language:", error);
    }
  };

  const sidebarItems = [
    { name: t("dashboard"), path: "/", icon: LayoutDashboard },
    { name: t("myCourses"), path: "/simulator", icon: GraduationCap },
    { name: t("vocabulary"), path: "/flashcards", icon: BookOpen },
    { name: t("speaking"), path: "/simulator", icon: Mic2 },
    { name: t("writing"), path: "/emails", icon: PenTool },
    { name: t("settings"), path: "/settings", icon: Settings },
  ];

  const topNavItems = [
    { name: t("dashboard"), path: "/" },
    { name: t("lessons"), path: "/simulator" },
    { name: t("practice"), path: "/emails" },
    { name: t("progress"), path: "/" },
  ];

  if (!user) return <Outlet />;

  return (
    <div className="min-h-screen flex text-white overflow-hidden bg-pro-purple-950">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-pro-purple-900/95 backdrop-blur-xl border-r border-white/10 flex flex-col z-50 transition-transform duration-300 lg:relative lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/10 overflow-hidden p-1">
              <img 
                src="https://web4jobs.com/wp-content/uploads/2021/04/logo-web4jobs-1.png" 
                alt="Web4jobs" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Web4jobs lingo</h1>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 text-white/60 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                location.pathname === item.path
                  ? "bg-white/15 text-white shadow-lg shadow-black/10"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-6 space-y-4">
          {/* Today's Goal Widget */}
          <div className="glass-card p-4 space-y-3">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">{t("todaysGoal")}</p>
            <p className="text-sm font-bold">{t("complete2Lessons")}</p>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-pro-purple-400 w-1/2 rounded-full" />
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold text-white/40">
              <span>1/2</span>
              <div className="flex items-center gap-1">
                <span className="text-orange-400">🔥</span> 5 Days
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            {t("logout")}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative w-full overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 lg:h-20 flex items-center justify-between px-4 lg:px-10 z-10 border-b border-white/5 lg:border-none">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-white/60 hover:text-white bg-white/5 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <nav className="hidden lg:flex items-center gap-8">
              {topNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-sm font-medium transition-all relative py-2",
                    location.pathname === item.path
                      ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white"
                      : "text-white/60 hover:text-white"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Mobile Logo (only visible when sidebar is hidden) */}
            <Link to="/" className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md overflow-hidden p-1">
                <img 
                  src="https://web4jobs.com/wp-content/uploads/2021/04/logo-web4jobs-1.png" 
                  alt="Web4jobs" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-bold text-lg tracking-tight">Web4jobs lingo</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <button className="hidden sm:flex glass-button px-4 lg:px-5 py-2 rounded-full text-xs lg:text-sm font-bold items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span className="hidden md:inline">{t("aiTutor")}</span>
            </button>
            
            <button 
              onClick={toggleLanguage}
              className="glass-button p-2 rounded-full"
              title={language === "English" ? "Switch to French" : "Passer à l'anglais"}
            >
              <Globe className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>

            <div className="flex items-center gap-2 lg:gap-3 pl-3 lg:pl-6 border-l border-white/10">
              <div className="hidden sm:block text-right">
                <p className="text-xs lg:text-sm font-bold truncate max-w-[100px]">{user.email?.split('@')[0] || "User"}</p>
                <p className="text-[8px] lg:text-[10px] text-white/40 font-bold uppercase tracking-widest">Premium</p>
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-pro-purple-400 to-pro-purple-600 border-2 border-white/20 flex items-center justify-center overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <ChevronDown className="hidden lg:block w-4 h-4 text-white/40" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto px-4 lg:px-10 pb-10 pt-4 lg:pt-0">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
