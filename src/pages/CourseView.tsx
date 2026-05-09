import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { coursesData } from "../data/coursesData";
import { CheckCircle2, PlayCircle, BookOpen, ChevronLeft, Award, AlertTriangle, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function CourseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Simulate network fetch
    setTimeout(() => {
      const found = coursesData.find((c) => c.id === Number(id));
      if (found) {
        setCourse(found);
      }
      setLoading(false);
    }, 800);
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Loader2 className="w-10 h-10 animate-spin text-pro-purple-400 mb-4" />
        <h2 className="text-xl font-bold text-white/80">Chargement de la leçon...</h2>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Erreur : Leçon introuvable</h2>
        <p className="text-white/60 mb-6">Les données de cette leçon ne se sont pas chargées correctement.</p>
        <button onClick={() => navigate("/courses")} className="glass-button px-6 py-3 rounded-xl font-bold">
          Retour au catalogue
        </button>
      </div>
    );
  }

  const handleComplete = () => {
    setCompleted(true);
    // Real implementation: save progress to Firebase
  };

  // YouTube URL validator and embed converter
  const getYouTubeEmbedUrl = (url?: string): string | null => {
    if (!url || typeof url !== 'string' || url.trim() === '') return null;
    
    try {
      // Check for watch URL or share URL and extract ID
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);

      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
      
      // If it's already a valid embed URL, return it as is
      if (url.includes('youtube.com/embed/')) {
        return url;
      }
    } catch (e) {
      console.error("Erreur parsing URL YouTube:", e);
      return null;
    }
    
    return null; // Not a valid YouTube URL format
  };

  const mainVideo = course.videos && course.videos[0];
  const embedUrl = mainVideo ? getYouTubeEmbedUrl(mainVideo.url) : null;
  const isVideoAvailable = !!embedUrl;

  return (
    <div className="space-y-8 py-6 max-w-4xl mx-auto">
      {/* Back button */}
      <button onClick={() => navigate("/courses")} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
        <ChevronLeft className="w-5 h-5" />
        Retour au catalogue
      </button>

      {/* Header */}
      <div className="glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BookOpen className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex gap-3 items-center">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10">{course.language}</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-pro-purple-500/20 text-pro-purple-300 border border-pro-purple-500/30">Niveau {course.level}</span>
          </div>
          <h1 className="text-4xl font-bold">{course.title}</h1>
          <p className="text-xl text-white/70 max-w-2xl">{course.description}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          {/* Objectifs */}
          <section className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-4">Objectifs pédagogiques</h2>
            <ul className="space-y-3">
              {course.objectives?.map((obj: string, i: number) => (
                <li key={i} className="flex gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />
                  <span className="text-white/80">{obj}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Leçon / Contenu */}
          <section className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-4">Leçon</h2>
            <div className="prose prose-invert max-w-none text-white/80">
               <p>{course.content}</p>
               {course.examples && (
                 <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                   <h4 className="font-bold mb-2">Exemples:</h4>
                   <ul className="list-disc pl-5">
                     {course.examples.map((ex: string, i: number) => <li key={i}>{ex}</li>)}
                   </ul>
                 </div>
               )}
            </div>
          </section>

          {/* Video Integration */}
          <section className="glass-card p-6 border-red-500/30">
             <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
               <PlayCircle className="text-red-500" />
               Ressource Vidéo
             </h2>

             {/* Video Handling Container */}
             <div className="bg-black/40 rounded-xl overflow-hidden border border-white/10 mb-4">
               {/* State 1: Fallback UI when URL is invalid or empty */}
               {!isVideoAvailable ? (
                 <div className="flex flex-col items-center justify-center p-12 text-center bg-white/5">
                   <AlertTriangle className="w-12 h-12 text-yellow-500 mb-3" />
                   <h3 className="font-bold text-lg mb-1">Vidéo temporairement indisponible</h3>
                   <p className="text-sm text-white/60 max-w-sm">Le lien de cette ressource est cassé, incomplet ou introuvable. Veuillez continuer avec le format texte.</p>
                 </div>
               ) : (
                 /* State 2: Iframe ready to play */
                 <div className="aspect-video w-full bg-black relative">
                   {/* Preview Overlay before user clicks play to avoid heavy unneeded iframe loads */}
                   {!videoStarted && !iframeError ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gradient-to-t from-black/80 to-black/20">
                        <p className="text-white font-bold text-lg drop-shadow-md mb-4 px-4 text-center">{mainVideo.title}</p>
                        <button 
                          onClick={() => setVideoStarted(true)}
                          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 transition-transform hover:scale-105 text-white rounded-full font-bold shadow-lg shadow-red-500/20"
                        >
                          <PlayCircle className="w-6 h-6" />
                          Commencer la vidéo
                        </button>
                     </div>
                   ) : (
                     /* Actual embedded iframe */
                     <iframe 
                       src={embedUrl} 
                       title={mainVideo?.title || "Lecteur vidéo de cours"}
                       className="w-full h-full border-0"
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                       allowFullScreen
                       onLoad={() => console.log("Video iframe loaded successfully")}
                       onError={() => setIframeError(true)}
                     />
                   )}
                 </div>
               )}
             </div>

             {mainVideo && (
                <div className="px-2">
                  <p className="text-white/60 text-sm">{mainVideo.reason}</p>
                </div>
             )}
          </section>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 sticky top-6">
            <h3 className="font-bold text-lg mb-4">Progression</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 opacity-50">
                <CheckCircle2 className="w-5 h-5" />
                <span>Leçon lue</span>
              </div>
              <div className="flex items-center gap-3 opacity-50">
                <CheckCircle2 className="w-5 h-5" />
                <span>Vidéo visionnée</span>
              </div>
              <div className="flex items-center gap-3 opacity-50">
                <CheckCircle2 className="w-5 h-5" />
                <span>Quiz validé</span>
              </div>
            </div>

            {completed ? (
              <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-xl text-center">
                <Award className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <h4 className="font-bold text-green-400">Leçon terminée !</h4>
              </div>
            ) : (
              <button 
                onClick={handleComplete} 
                className="w-full glass-button py-3 rounded-xl font-bold text-center"
              >
                Valider ce cours
              </button>
            )}

            {/* If video doesn't exist, change button styling */}
            {!isVideoAvailable && !completed && (
              <button 
                disabled
                className="w-full py-3 mt-4 rounded-xl font-bold border border-white/5 bg-white/5 text-white/30 cursor-not-allowed"
                title="Vidéo indisponible, bouton désactivé"
              >
                Regarder la vidéo
              </button>
            )}

            {completed && course.nextCourseId && (
              <Link to={`/courses/${course.nextCourseId}`} onClick={() => { setCompleted(false); setVideoStarted(false); }} className="block w-full text-center py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all mt-4">
                Prochain cours
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
