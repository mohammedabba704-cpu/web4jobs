import { coursesData } from '../data/coursesData';

export interface CEFRLevel {
  id: string; // A1, A2, B1, B2, C1, C2
  description: string;
  requirements: string[]; // required metrics to pass to next level
  regressionKeywords: string[]; // keywords or triggers that make orchestrator regress
}

export const CEFR_METADATA: Record<string, CEFRLevel> = {
  "A1": {
    id: "A1",
    description: "Débutant - Peut comprendre et utiliser des expressions familières et quotidiennes ainsi que des énoncés très simples.",
    requirements: [
      "Taux de réussite aux quiz A1 > 70%",
      "Au moins 8 cours A1 terminés",
      "Vocabulaire de base maîtrisé (Salutations, Présentation)"
    ],
    regressionKeywords: [] // Cannot regress below A1
  },
  "A2": {
    id: "A2",
    description: "Débutant avancé - Peut comprendre des phrases isolées et des expressions fréquemment utilisées (ex: infos personnelles, achats).",
    requirements: [
      "Taux de réussite aux quiz A2 > 75%",
      "Maîtrise du passé composé et de l'imparfait (ou past simple/continuous)",
      "Au moins 8 cours A2 terminés"
    ],
    regressionKeywords: [
      "Échecs répétés sur les temps du passé",
      "Vocabulaire quotidien non acquis",
      "3 abandons de leçons consécutifs"
    ]
  },
  "B1": {
    id: "B1",
    description: "Intermédiaire - Peut comprendre les points essentiels quand un langage clair et standard est utilisé.",
    requirements: [
      "Taux de réussite aux quiz B1 > 80%",
      "Capacité à faire un récit cohérent",
      "Compréhension orale (Listening) score > 75%"
    ],
    regressionKeywords: [
      "Difficulté de compréhension globale",
      "Scores de conjugaison < 60%"
    ]
  },
  "B2": {
    id: "B2",
    description: "Intermédiaire avancé - Peut comprendre le contenu essentiel de sujets concrets ou abstraits dans un texte complexe.",
    requirements: [
      "Argumentation fluide mesurée",
      "Scores aux tests écrits > 80%",
      "Compréhension des nuances B2"
    ],
    regressionKeywords: [
      "Erreurs de syntaxe graves répétées",
      "Incapacité à débattre ou argumenter"
    ]
  },
  "C1": {
    id: "C1",
    description: "Avancé - Peut s'exprimer spontanément et couramment sans trop devoir chercher ses mots. Linguistique fluide.",
    requirements: [
      "Maîtrise des expressions idiomatiques",
      "Compréhension de contenus implicites"
    ],
    regressionKeywords: [
      "Trop d'hésitations dans l'expression",
      "Manque de vocabulaire spécialisé"
    ]
  },
  "C2": {
    id: "C2",
    description: "Maîtrise - Peut comprendre sans effort pratiquement tout ce qu'il/elle lit ou entend. Résumer et reconstruire des arguments.",
    requirements: [
      "Niveau natif ou bilingue atteint"
    ],
    regressionKeywords: [
      "Confusion sur des textes académiques complexes"
    ]
  }
};

export class AIOrchestrator {
  
  /**
   * Evaluates placement test answers and assigns a level.
   * Si score_test < 30 : niveau = A1
   * Si score_test entre 30 et 50 : niveau = A2
   * Si score_test entre 50 et 70 : niveau = B1
   * Si score_test entre 70 et 85 : niveau = B2
   * Si score_test > 85 : niveau = C1
   */
  static evaluatePlacementTest(scorePercentage: number): string {
    if (scorePercentage > 85) return "C1";
    if (scorePercentage >= 70 && scorePercentage <= 85) return "B2";
    if (scorePercentage >= 50 && scorePercentage < 70) return "B1";
    if (scorePercentage >= 30 && scorePercentage < 50) return "A2";
    return "A1";
  }

  /**
   * Monitor learner's ongoing progress and recommend level adjustments
   * Si moyenne_quiz < 50 pendant 3 cours : recommander révision, proposer retour au niveau inférieur
   * Si moyenne_quiz > 80 pendant 5 cours : proposer passage au niveau supérieur
   */
  static adjustLevel(userProfile: any, recentPerformances: any[]) {
    // Check for explicit difficulties:
    // S'il ne termine pas les exercices, répète plusieurs fois, etc.
    const lastScores = recentPerformances.map(p => p.score);
    const avg = lastScores.reduce((a,b) => a+b, 0) / (lastScores.length || 1);
    
    const currentLevel = userProfile.cefrLevel || "A1";

    // Downward adjustment logic
    if (avg < 50 && lastScores.length >= 3 && currentLevel !== "A1") {
      const levelsMap = ["A1", "A2", "B1", "B2", "C1", "C2"];
      const currentIndex = levelsMap.indexOf(currentLevel);
      const newLevel = levelsMap[currentIndex - 1];
      
      return {
        action: "DOWNGRADE",
        reason: "Nous avons détecté que ce module est encore difficile. Nous allons te proposer quelques cours de révision pour renforcer tes bases.",
        newLevel
      };
    }

    // Upward adjustment logic
    if (avg >= 80 && lastScores.length >= 5 && currentLevel !== "C2") {
      const levelsMap = ["A1", "A2", "B1", "B2", "C1", "C2"];
      const currentIndex = levelsMap.indexOf(currentLevel);
      const newLevel = levelsMap[currentIndex + 1];

      return {
        action: "UPGRADE",
        reason: `Moyenne excellente (${Math.round(avg)}%) sur 5 activités. Félicitations, vous maîtrisez les bases ! Promotion recommandée au niveau ${newLevel}.`,
        newLevel
      };
    }

    return {
      action: "MAINTAIN",
      reason: `Rythme stable. Maintien au niveau ${currentLevel}.`
    };
  }

  /**
   * Recommends courses based on current level and weak points
   */
  static recommendCourses(userProfile: any, limit: number = 3) {
    const targetLang = userProfile.target_language;
    const currentLevel = userProfile.cefrLevel || "A1";
    const weakSkill = userProfile.weakestSkill || "Grammar";

    const allCourses = coursesData as any[];
    
    // 1. Get courses for target lang and level
    let levelCourses = allCourses.filter((c: any) => 
      c.language === targetLang && c.level === currentLevel
    );

    // 2. Prioritize weak skills
    let priorityCourses = levelCourses.filter(c => 
      c.category.toLowerCase().includes(weakSkill.toLowerCase()) ||
      c.title.toLowerCase().includes(weakSkill.toLowerCase())
    );
    
    // 3. Fallback to other courses in the same level
    let otherCourses = levelCourses.filter(c => 
      !c.category.toLowerCase().includes(weakSkill.toLowerCase()) &&
      !c.title.toLowerCase().includes(weakSkill.toLowerCase())
    );

    let recommendations = [...priorityCourses, ...otherCourses].slice(0, limit);

    return {
      recommendations,
      reason: `Nous recommandons ces cours niveau ${currentLevel} en ciblant vos faiblesses en ${weakSkill}.`
    }
  }
}
