import React, { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Brain, Search, PlayCircle, BookOpen, Video, Filter, ExternalLink, Library } from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";
import { coursesData } from "../data/coursesData";

// Memoized Card Component to prevent lag on list changes
const CourseCard = React.memo(({ course }: { course: any }) => {
  return (
    <div className="glass-card p-6 flex flex-col group cursor-pointer hover:bg-white/10 transition-all border border-white/5 hover:border-pro-purple-500/50">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          course.level.startsWith('A') ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
          course.level.startsWith('B') ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
          'bg-orange-500/20 text-orange-300 border border-orange-500/30'
        }`}>
          Niveau {course.level}
        </span>
        <span className="text-xs bg-white/10 px-3 py-1 rounded-full">{course.duration}</span>
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-pro-purple-300 transition-colors">{course.title}</h3>
      <p className="text-white/60 text-sm mb-4 line-clamp-2">{course.description}</p>
      
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded text-white/70">{course.category}</span>
        <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded text-white/70">Interactif</span>
      </div>

      <div className="mt-auto space-y-3">
        <Link to={`/courses/${course.id}`} onClick={(e) => e.stopPropagation()} className="glass-button w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 group-hover:bg-pro-purple-500 group-hover:border-pro-purple-400 transition-all">
          <PlayCircle className="w-5 h-5" />
          Commencer le cours
        </Link>

        {course.videos && course.videos.length > 0 && (
          <a href={course.videos[0].url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
            <Video className="w-4 h-4 text-red-400" />
            {course.videos[0].isPlaylist ? "Voir la playlist" : "Voir la vidéo"}
            <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
          </a>
        )}
      </div>
    </div>
  );
});

export default function CourseCatalog() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"courses" | "youtube">("courses");
  const [targetLanguage, setTargetLanguage] = useState<"English" | "French">("English");
  const [levelFilter, setLevelFilter] = useState("All");

  // Prevent expensive recalculation with useMemo
  const filteredCourses = useMemo(() => {
    return coursesData.filter(c => 
      c.language === targetLanguage && 
      (levelFilter === "All" || c.level === levelFilter)
    );
  }, [targetLanguage, levelFilter]);

  // Extract YT videos optimally
  const uniqueYT = useMemo(() => {
    const vids = coursesData
      .filter(c => c.language === targetLanguage && (levelFilter === "All" || c.level === levelFilter))
      .flatMap(c => c.videos || []);
    
    // Remove duplicates based on URL
    return vids.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);
  }, [targetLanguage, levelFilter]);

  // Use useCallback for handlers
  const handleLanguageChange = useCallback((lang: "English" | "French") => {
    setTargetLanguage(lang);
  }, []);

  const handleLevelChange = useCallback((lvl: string) => {
    setLevelFilter(lvl);
  }, []);

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-pro-purple-400" />
            Catalogue de Cours
          </h1>
          <p className="text-white/60 text-lg">
            Explorez nos cours structurés et nos recommandations vidéo.
          </p>
        </div>
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
          <button 
            onClick={() => handleLanguageChange("English")}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${targetLanguage === "English" ? "bg-pro-purple-500 text-white shadow-lg" : "text-white/60 hover:text-white"}`}
          >
            English
          </button>
          <button 
            onClick={() => handleLanguageChange("French")}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${targetLanguage === "French" ? "bg-pro-purple-500 text-white shadow-lg" : "text-white/60 hover:text-white"}`}
          >
            Français
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("courses")}
          className={`flex items-center gap-2 font-bold px-4 py-2 border-b-2 transition-all ${activeTab === "courses" ? "border-pro-purple-400 text-white" : "border-transparent text-white/50 hover:text-white"}`}
        >
          <Brain className="w-5 h-5" />
          Cours & Modules ({filteredCourses.length})
        </button>
        <button
          onClick={() => setActiveTab("youtube")}
          className={`flex items-center gap-2 font-bold px-4 py-2 border-b-2 transition-all ${activeTab === "youtube" ? "border-pro-purple-400 text-white" : "border-transparent text-white/50 hover:text-white"}`}
        >
          <Library className="w-5 h-5" />
          Vidéos & Playlists ({uniqueYT.length})
        </button>
      </div>

      {/* Filters (with optimization to ensure no lag) */}
      <div className="flex flex-wrap items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 mr-2">
          <Filter className="w-5 h-5 text-white/40" />
          <span className="text-sm font-bold text-white/60">Filtrer par niveau :</span>
        </div>
        {["All", "A1", "A2", "B1", "B2", "C1"].map(lvl => (
          <button
            key={lvl}
            onClick={() => handleLevelChange(lvl)}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${levelFilter === lvl ? "bg-white text-pro-purple-900" : "bg-white/10 text-white hover:bg-white/20"}`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "courses" ? (
        filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/10 rounded-2xl">
             <BookOpen className="w-16 h-16 text-white/20 mb-4" />
             <h3 className="text-xl font-bold text-white/60 mb-2">Aucun cours trouvé</h3>
             <p className="text-white/40 max-w-md">Nous n'avons pas encore de contenu détaillé pour cette sélection exacte. Essayez de modifier les filtres !</p>
          </div>
        )
      ) : (
        uniqueYT.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {uniqueYT.map((yt, i) => (
              <a key={i} href={yt.url} target="_blank" rel="noopener noreferrer" className="glass-card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 hover:bg-white/10 transition-all border border-white/5 hover:border-red-500/50 group text-center sm:text-left">
                <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-8 h-8 text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-3 mb-2">
                    {/* No explicit target level but we have type */}
                    <span className="text-xs font-bold text-pro-purple-300 bg-pro-purple-500/10 px-2 py-0.5 rounded">{yt.type}</span>
                    {yt.isPlaylist && <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded">Playlist</span>}
                  </div>
                  <h3 className="font-bold text-lg mb-2 leading-tight group-hover:text-red-400 transition-colors">{yt.title}</h3>
                  <p className="text-sm text-white/50 mb-3 line-clamp-2">{yt.reason}</p>
                  
                  <div className="flex items-center justify-center sm:justify-between w-full">
                    <span className="text-sm text-white/40 flex items-center gap-2">
                       {yt.channel}
                    </span>
                    <span className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1">
                       {yt.isPlaylist ? "Voir la playlist" : "Voir la vidéo"} <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/10 rounded-2xl">
             <Video className="w-16 h-16 text-white/20 mb-4" />
             <h3 className="text-xl font-bold text-white/60 mb-2">Ressource vidéo bientôt disponible</h3>
             <p className="text-white/40 max-w-md">Nous sommes en train de rajouter de délicieuses playlists YouTube pour cette section.</p>
          </div>
        )
      )}
    </div>
  );
}
