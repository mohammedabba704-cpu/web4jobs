import { useState } from "react";
import { CheckCircle2, ArrowRight, Brain, Target, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AIOrchestrator, CEFR_METADATA } from "../lib/orchestrator";

export default function PlacementTest() {
  const [step, setStep] = useState(0);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  // Just to show a dynamic response based on what they get wrong
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const navigate = useNavigate();

  const questions = [
    {
      q: "If I _____ rich, I would travel the world.",
      options: ["am", "was", "were", "will be"],
      correctIndex: 2,
      domain: "Grammar (Conditionals)",
      levelWeight: "B1"
    },
    {
      q: "Choisissez la bonne réponse : 'Hier, nous _____ au cinéma.'",
      options: ["allons", "sommes allés", "avons allé", "irions"],
      correctIndex: 1,
      domain: "Grammar (Passé Composé)",
      levelWeight: "A2"
    },
    {
      q: "What does 'to mitigate' mean?",
      options: ["To worsen", "To reduce severity", "To complain", "To calculate"],
      correctIndex: 1,
      domain: "Vocabulary",
      levelWeight: "C1"
    },
    {
      q: "Compréhension : 'Le train partira à 18h précise.' Que doit-on faire ?",
      options: ["Ne pas se dépêcher", "Être à l'heure", "Attendre demain", "Acheter un billet"],
      correctIndex: 1,
      domain: "Reading",
      levelWeight: "A1"
    },
    {
      q: "Which word is synonymous with 'ubiquitous'?",
      options: ["Rare", "Expensive", "Everywhere", "Temporary"],
      correctIndex: 2,
      domain: "Vocabulary",
      levelWeight: "C2"
    }
  ];

  const handleSelect = (idx: number) => {
    let newScore = score;
    let newWeaknesses = [...weaknesses];
    
    if (idx === questions[step].correctIndex) {
      newScore += 20; // 5 questions = 20 pts each
    } else {
      newWeaknesses.push(questions[step].domain);
    }
    
    setScore(newScore);
    setWeaknesses(newWeaknesses);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setCalculating(true);
      setTimeout(() => {
        setCalculating(false);
        const finalLevel = AIOrchestrator.evaluatePlacementTest(newScore);
        setResult(finalLevel);
      }, 2500);
    }
  };

  if (calculating) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          <Brain className="w-16 h-16 text-pro-purple-400 animate-pulse" />
          <div className="absolute -inset-4 border-4 border-pro-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">L'IA de Web4Jobs Lingo analyse vos réponses...</h2>
          <p className="text-white/60">Calcul du score de placement multilingue en cours.</p>
        </div>
      </div>
    );
  }

  if (result) {
    const uniqueWeaknesses = Array.from(new Set(weaknesses));
    const weaknessesText = uniqueWeaknesses.length > 0 ? uniqueWeaknesses.join(", ") : "certains concepts avancés";
    const levelInfo = CEFR_METADATA[result];

    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/20">
          <Target className="w-12 h-12 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-4">Votre Niveau Estimé : {result}</h1>
          <p className="text-xl text-white/70 leading-relaxed italic bg-white/5 p-6 rounded-xl border border-white/10">
            « Votre niveau estimé est {result}. Vous maîtrisez les bases de ce niveau ({levelInfo?.description}), mais vous devez renforcer {weaknessesText.toLowerCase()}. »
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="glass-card p-4 border border-green-500/30">
            <h3 className="font-bold text-green-400 mb-1">Score Total</h3>
            <p className="text-2xl font-bold">{score}%</p>
          </div>
          <div className="glass-card p-4 border border-orange-500/30">
            <h3 className="font-bold text-orange-400 mb-1">À Améliorer</h3>
            <p className="text-sm text-white/60">{weaknessesText}</p>
          </div>
        </div>

        <button onClick={() => navigate("/")} className="glass-button w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 mx-auto mt-8 bg-pro-purple-500/20 hover:bg-pro-purple-500/40 border border-pro-purple-500/50">
          Accéder à mon plan personnalisé <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
          <Compass className="w-8 h-8 text-pro-purple-400" />
          Test de Positionnement IA
        </h1>
        <p className="text-white/60">Déterminez votre niveau exact pour un parcours sur-mesure.</p>
        
        <div className="flex gap-2 mt-8">
          {questions.map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full ${i <= step ? "bg-pro-purple-500 shadow-[0_0_10px_rgba(159,122,234,0.5)]" : "bg-white/10"}`} />
          ))}
        </div>
      </div>

      <div className="glass-card p-8 shadow-2xl relative overflow-hidden">
        <span className="absolute top-4 right-4 text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-white/60">
          Question {step + 1} / {questions.length}
        </span>
        
        <div className="mb-8 mt-4">
          <span className="text-pro-purple-400 text-sm font-bold uppercase tracking-widest">{questions[step].domain}</span>
          <h2 className="text-2xl font-bold mt-2">{questions[step].q}</h2>
        </div>

        <div className="space-y-3">
          {questions[step].options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className="w-full bg-white/5 hover:bg-white/15 border border-white/10 p-4 rounded-xl text-left font-medium transition-all group flex items-center justify-between"
            >
              {opt}
              <CheckCircle2 className="w-5 h-5 opacity-0 group-hover:opacity-100 text-pro-purple-400 transform scale-50 group-hover:scale-100 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
