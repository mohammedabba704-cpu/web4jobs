import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Mock DB for reset codes (in a real app, this would be in the database like Firestore or PostgreSQL)
  const resetCodes = new Map<string, { codeHash: string, expiresAt: number, verified: boolean, attempts: number }>();

  // Mock routes to satisfy backend requirements without interfering with Firebase auth
  app.post("/api/auth/register", async (req, res) => {
    const { fullName, email, password, professionalStatus } = req.body;

    if (!fullName || !email || !password || !professionalStatus) {
      return res.status(400).json({ message: "Veuillez remplir tous les champs." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email invalide." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères." });
    }

    try {
      const passwordHash = await bcrypt.hash(password, 10);
      // Construct learner user (would be saved to DB)
      const newLearner = {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        fullName,
        email,
        passwordHash, // In reality, we shouldn't return this, but keeping logic here
        professionalStatus,
        role: "learner",
        currentLevel: "non évalué",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.status(201).json({ 
        message: "Compte créé avec succès.", 
        learner: {
          id: newLearner.id,
          fullName: newLearner.fullName,
          email: newLearner.email,
          professionalStatus: newLearner.professionalStatus,
          role: newLearner.role,
          currentLevel: newLearner.currentLevel
        }
      });
    } catch (err) {
      console.error("Register mock error", err);
      res.status(500).json({ message: "Erreur serveur. Veuillez réessayer." });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    res.json({ 
      message: "Connexion réussie", 
      token: "mock_token", 
      learner: { 
        id: "mock_id", 
        fullName: "Utilisateur", 
        email: req.body.email || "", 
        professionalStatus: "Non Renseigné", 
        currentLevel: "non évalué" 
      } 
    });
  });

  app.get("/api/learners/me", (req, res) => {
    res.json({ 
      id: "mock_id", 
      fullName: "Utilisateur", 
      email: "email@example.com", 
      professionalStatus: "Non Renseigné", 
      role: "learner", 
      currentLevel: "non évalué" 
    });
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Veuillez entrer un email valide" });

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 10);

    resetCodes.set(email, {
      codeHash,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      verified: false,
      attempts: 0
    });

    console.log(`\n\n=== Code de réinitialisation pour ${email} : ${code} ===\n\n`);
    res.json({ 
      message: "Si cet email existe, un code de vérification a été envoyé.",
      devCode: process.env.NODE_ENV !== 'production' ? code : undefined
    });
  });

  app.post("/api/auth/verify-reset-code", async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code || code.length !== 6) {
      return res.status(400).json({ message: "Veuillez entrer un code à 6 chiffres." });
    }

    const record = resetCodes.get(email);
    if (!record) {
      return res.status(400).json({ message: "Code invalide ou expiré." });
    }

    if (Date.now() > record.expiresAt) {
      return res.status(400).json({ message: "Code expiré. Veuillez demander un nouveau code." });
    }

    if (record.attempts >= 5) {
      return res.status(400).json({ message: "Nombre maximum de tentatives atteint. Veuillez demander un nouveau code." });
    }

    const isValid = await bcrypt.compare(code, record.codeHash);
    if (!isValid) {
      record.attempts += 1;
      return res.status(400).json({ message: "Code invalide." });
    }

    record.verified = true;
    res.json({ message: "Code vérifié avec succès. Vous pouvez maintenant modifier votre mot de passe." });
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;
    const record = resetCodes.get(email);

    if (!record || !record.verified) {
      return res.status(400).json({ message: "Action non autorisée." });
    }

    if (Date.now() > record.expiresAt) {
      return res.status(400).json({ message: "Code expiré. Veuillez demander un nouveau code." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Les mots de passe ne correspondent pas." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères." });
    }

    // In a real app, update the passwordHash in the database here
    resetCodes.delete(email);

    res.json({ message: "Mot de passe modifié avec succès." });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
