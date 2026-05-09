const fs = require('fs');

const englishTopics = {
  A1: [
    { title: 'Alphabet et prononciation', cat: 'Pronunciation', desc: "Learn the English alphabet and basic sounds." },
    { title: 'Salutations', cat: 'Vocabulary', desc: "Basic greetings and farewells." },
    { title: 'Se présenter', cat: 'Speaking', desc: "How to introduce yourself." },
    { title: 'Verbe “to be”', cat: 'Grammar', desc: "Using the verb to be." },
    { title: 'Articles : a / an / the', cat: 'Grammar', desc: "Definite and indefinite articles." },
    { title: 'Pronoms personnels', cat: 'Grammar', desc: "Subject and object pronouns." },
    { title: 'Vocabulaire de base', cat: 'Vocabulary', desc: "Everyday vocabulary." },
    { title: 'Questions simples', cat: 'Grammar', desc: "Forming simple questions." },
    { title: 'Nombres, jours, mois', cat: 'Vocabulary', desc: "Numbers, days of the week, months." },
    { title: 'Conversations simples', cat: 'Speaking', desc: "Basic conversational phrases." }
  ],
  A2: [
    { title: 'Présent simple', cat: 'Grammar', desc: "Habits and facts." },
    { title: 'Présent continu', cat: 'Grammar', desc: "Things happening now." },
    { title: 'Passé simple', cat: 'Grammar', desc: "Completed actions in the past." },
    { title: 'Futur avec “will” et “going to”', cat: 'Grammar', desc: "Future plans and predictions." },
    { title: 'Adjectifs et comparatifs', cat: 'Grammar', desc: "Comparing things." },
    { title: 'Prépositions', cat: 'Grammar', desc: "Prepositions of time and place." },
    { title: 'Vocabulaire de la vie quotidienne', cat: 'Vocabulary', desc: "Daily routines." },
    { title: 'Commander au restaurant', cat: 'Speaking', desc: "Ordering food and drinks." },
    { title: 'Parler de sa routine', cat: 'Speaking', desc: "Describing a typical day." },
    { title: 'Écrire un court paragraphe', cat: 'Writing', desc: "Writing simple texts." }
  ],
  B1: [
    { title: 'Present perfect', cat: 'Grammar', desc: "Experiences and changes." },
    { title: 'Past continuous', cat: 'Grammar', desc: "Interrupted past actions." },
    { title: 'Modal verbs', cat: 'Grammar', desc: "Ability, permission, obligation." },
    { title: 'Conditionnel type 1', cat: 'Grammar', desc: "Real conditions." },
    { title: 'Compréhension de textes courts', cat: 'Reading', desc: "Reading comprehension." },
    { title: 'Conversation professionnelle simple', cat: 'Business', desc: "Office conversations." },
    { title: 'Écrire un email simple', cat: 'Writing', desc: "Email writing basics." },
    { title: 'Décrire une expérience', cat: 'Speaking', desc: "Talking about past events." },
    { title: 'Donner son opinion', cat: 'Speaking', desc: "Expressing thoughts." }
  ],
  B2: [
    { title: 'Conditionnels avancés', cat: 'Grammar', desc: "Unreal and hypothetical situations." },
    { title: 'Voix passive', cat: 'Grammar', desc: "Focusing on the action." },
    { title: 'Discours indirect', cat: 'Grammar', desc: "Reported speech." },
    { title: 'Connecteurs logiques', cat: 'Grammar', desc: "Linking words and phrases." },
    { title: 'Argumentation', cat: 'Speaking', desc: "Debating and arguing." },
    { title: 'Compréhension orale avancée', cat: 'Listening', desc: "Understanding fast speech." },
    { title: 'Rédaction d’email professionnel', cat: 'Writing', desc: "Formal emails." },
    { title: 'Présentation orale', cat: 'Speaking', desc: "Giving a presentation." },
    { title: 'Vocabulaire business', cat: 'Business', desc: "Business terminology." }
  ],
  C1: [
    { title: 'Anglais académique', cat: 'Reading', desc: "Academic texts." },
    { title: 'Anglais professionnel avancé', cat: 'Business', desc: "Advanced business English." },
    { title: 'Débats', cat: 'Speaking', desc: "Complex debates." },
    { title: 'Analyse d’articles', cat: 'Reading', desc: "Analyzing news." },
    { title: 'Rédaction structurée', cat: 'Writing', desc: "Essays and reports." },
    { title: 'Nuances de vocabulaire', cat: 'Vocabulary', desc: "Subtle differences in meaning." },
    { title: 'Expressions idiomatiques', cat: 'Vocabulary', desc: "Idioms and phrasal verbs." },
    { title: 'Préparation entretien', cat: 'Business', desc: "Job interviews." },
    { title: 'Présentation avancée', cat: 'Speaking', desc: "Keynote speaking." }
  ]
};

const frenchTopics = {
  A1: [
    { title: 'Alphabet et sons', cat: 'Pronunciation', desc: "Apprendre alphabet et sons." },
    { title: 'Salutations', cat: 'Vocabulary', desc: "Dire bonjour et au revoir." },
    { title: 'Se présenter', cat: 'Speaking', desc: "Parler de soi." },
    { title: 'Verbes être et avoir', cat: 'Grammar', desc: "Base de la grammaire." },
    { title: 'Articles définis et indéfinis', cat: 'Grammar', desc: "Le, la, les, un, une, des." },
    { title: 'Pronoms personnels', cat: 'Grammar', desc: "Je, tu, il..." },
    { title: 'Vocabulaire de base', cat: 'Vocabulary', desc: "Mots du quotidien." },
    { title: 'Nombres, jours, mois', cat: 'Vocabulary', desc: "Compter et dire la date." },
    { title: 'Questions simples', cat: 'Grammar', desc: "Poser des questions." },
    { title: 'Conversations simples', cat: 'Speaking', desc: "Dialogues basiques." }
  ],
  A2: [
    { title: 'Présent de l’indicatif', cat: 'Grammar', desc: "Les 3 groupes de verbes." },
    { title: 'Passé composé', cat: 'Grammar', desc: "Parler du passé." },
    { title: 'Futur proche', cat: 'Grammar', desc: "Aller + infinitif." },
    { title: 'Adjectifs qualificatifs', cat: 'Grammar', desc: "Décrire des choses." },
    { title: 'Prépositions', cat: 'Grammar', desc: "Lieu et temps." },
    { title: 'Décrire sa routine', cat: 'Speaking', desc: "Activités journalières." },
    { title: 'Commander au restaurant', cat: 'Speaking', desc: "Interaction pratique." },
    { title: 'Parler de sa famille', cat: 'Speaking', desc: "Vocabulaire familial." },
    { title: 'Écrire un court texte', cat: 'Writing', desc: "Production écrite A2." },
    { title: 'Comprendre une conversation', cat: 'Listening', desc: "Compréhension orale." }
  ],
  B1: [
    { title: 'Imparfait', cat: 'Grammar', desc: "Détails et souvenirs." },
    { title: 'Futur simple', cat: 'Grammar', desc: "Projets d'avenir." },
    { title: 'Conditionnel présent', cat: 'Grammar', desc: "Politesse et hypothèse." },
    { title: 'Expression de l’opinion', cat: 'Speaking', desc: "Donner son avis." },
    { title: 'Compréhension de textes', cat: 'Reading', desc: "Lire des articles." },
    { title: 'Rédiger un email simple', cat: 'Writing', desc: "Correspondance." },
    { title: 'Raconter une expérience', cat: 'Speaking', desc: "Récit structuré." },
    { title: 'Décrire un projet', cat: 'Speaking', desc: "Présenter une idée." },
    { title: 'Conversation semi-pro', cat: 'Business', desc: "Échanges au travail." }
  ],
  B2: [
    { title: 'Subjonctif', cat: 'Grammar', desc: "Doutes et obligations." },
    { title: 'Discours indirect', cat: 'Grammar', desc: "Rapporter des paroles." },
    { title: 'Connecteurs logiques', cat: 'Grammar', desc: "Structurer son discours." },
    { title: 'Argumentation', cat: 'Speaking', desc: "Défendre une idée." },
    { title: 'Compréhension orale avancée', cat: 'Listening', desc: "Écouter des natifs." },
    { title: 'Rédaction professionnelle', cat: 'Writing', desc: "Lettres et emails formels." },
    { title: 'Présentation orale', cat: 'Speaking', desc: "Exposés B2." },
    { title: 'Débat structuré', cat: 'Speaking', desc: "Discuter en groupe." },
    { title: 'Vocabulaire professionnel', cat: 'Business', desc: "Termes d'entreprise." }
  ],
  C1: [
    { title: 'Français académique', cat: 'Reading', desc: "Textes universitaires." },
    { title: 'Français professionnel avancé', cat: 'Business', desc: "Négociations." },
    { title: 'Analyse d’articles', cat: 'Reading', desc: "Esprit critique." },
    { title: 'Rédaction avancée', cat: 'Writing', desc: "Essais, synthèses." },
    { title: 'Débats complexes', cat: 'Speaking', desc: "Sujets de société." },
    { title: 'Nuances de style', cat: 'Writing', desc: "Registres de langue." },
    { title: 'Expressions idiomatiques', cat: 'Vocabulary', desc: "Parler comme un natif." },
    { title: 'Préparation entretien', cat: 'Business', desc: "Savoir se vendre." },
    { title: 'Communication proactive', cat: 'Business', desc: "Leadership en français." }
  ]
};

const mandatoryPlaylist = {
  title: "Les Essentiels (Playlist Complète)",
  url: "https://www.youtube.com/watch?v=2sCXhPefmz8&list=PLcoQWyFpRIxgcTcTpz-hmpDqhcRq701sb",
  channel: "Ressource Recommandée",
  type: "Playlist",
  reason: "Playlist indispensable pour maîtriser ce niveau.",
  isPlaylist: true
};

const videoEnglish = {
  A1: [
    { title: "English Grammar Course for Beginners", url: "https://www.youtube.com/watch?v=avyVINxCQgA", channel: "Shaw English Online", type: "Grammar", reason: "Complete basics for A1 learners, very popular.", isPlaylist: false },
    { title: "Basic English Conversations", url: "https://www.youtube.com/watch?v=F0OqAWqGhc0", channel: "EnglishClass101", type: "Speaking", reason: "Real-life early conversational practice.", isPlaylist: false }
  ],
  A2: [
    { title: "English Phrases for Everyday", url: "https://www.youtube.com/watch?v=2vTWL72eB4A", channel: "Learn English with TV Series", type: "Vocabulary", reason: "Engaging way to learn A2 expressions.", isPlaylist: false }
  ],
  B1: [
    { title: "B1 English Listening Test", url: "https://www.youtube.com/watch?v=33K16P1S-qU", channel: "EnglishClass101", type: "Listening", reason: "Good benchmark for B1 proficiency.", isPlaylist: false }
  ],
  B2: [
    { title: "Advanced English Grammar", url: "https://www.youtube.com/watch?v=H2k4XyQzK8M", channel: "mmmEnglish", type: "Grammar", reason: "Nuanced B2 grammar.", isPlaylist: false }
  ],
  C1: [
    { title: "C1 Advanced Speaking", url: "https://www.youtube.com/watch?v=mHnQtiH5q08", channel: "Cambridge English", type: "Speaking", reason: "Real C1 exam speaking examples.", isPlaylist: false }
  ]
};

const videoFrench = {
  A1: [
    { title: "Learn French in 25 Minutes - ALL the Basics", url: "https://www.youtube.com/watch?v=ujDtm0hZyII", channel: "FrenchPod101", type: "Vocabulary", reason: "Comprehensive basic introduction.", isPlaylist: false },
    { title: "French Greetings", url: "https://www.youtube.com/watch?v=8y41aN0tJtk", channel: "Learn French with Alexa", type: "Speaking", reason: "Clear and popular entry-level teacher.", isPlaylist: false }
  ],
  A2: [
    { title: "Le Passé Composé", url: "https://www.youtube.com/watch?v=nVQfA6k4V7o", channel: "Learn French with Alexa", type: "Grammar", reason: "The most important A2 grammar tense.", isPlaylist: false }
  ],
  B1: [
    { title: "L'Imparfait vs Le Passé Composé", url: "https://www.youtube.com/watch?v=9_C-X32C-8Y", channel: "Français Authentique", type: "Grammar", reason: "Classic B1 difficulty addressed clearly.", isPlaylist: false }
  ],
  B2: [
    { title: "L'art de l'argumentation", url: "https://www.youtube.com/watch?v=0hV3aXw6pX8", channel: "innerFrench", type: "Speaking", reason: "B2 requires opinion defending.", isPlaylist: false }
  ],
  C1: [
    { title: "Comment parler comme un natif", url: "https://www.youtube.com/watch?v=R9K1x4g1Wcw", channel: "Comme une Française", type: "Speaking", reason: "Mastering slurred speech and idioms.", isPlaylist: false }
  ]
};

let courses = [];
let idCounter = 1;

function genCourses(lang, topicsObj, videosObj) {
  Object.keys(topicsObj).forEach(level => {
    let topics = topicsObj[level];
    
    // Ensure we have 10
    while(topics.length < 10) topics.push(topics[0]);

    topics.slice(0, 10).forEach(topic => {
      let vids = [...(videosObj[level] || [])];
      vids.push(mandatoryPlaylist); // Include mandatory playlist for every course

      courses.push({
        id: idCounter++,
        language: lang,
        level: level,
        category: topic.cat,
        title: topic.title,
        description: topic.desc,
        objectives: ["Maîtriser ce concept", "Appliquer au quotidien", "Valider le quiz IA"],
        content: "Contenu pédagogique détaillé pour ce module...",
        examples: ["Exemple 1", "Exemple 2"],
        exercises: [{id: 1, title: "Exercice interactif 1"}],
        quizzes: [{id: 1, title: "Quiz de validation"}],
        quizCorrection: "Voici les réponses détaillées...",
        duration: Math.floor(Math.random() * 2 + 1) + "h " + Math.floor(Math.random() * 60) + "m",
        difficulty: level,
        videos: vids,
        nextCourseId: idCounter // simple link
      });
    });
  });
}

genCourses("English", englishTopics, videoEnglish);
genCourses("French", frenchTopics, videoFrench);

const content = "export const coursesData = " + JSON.stringify(courses, null, 2) + ";";

fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/coursesData.ts', content);
console.log("Done");
