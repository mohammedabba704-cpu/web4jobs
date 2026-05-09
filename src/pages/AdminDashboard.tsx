import { useState, useEffect } from "react";
import { BrainCircuit, AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";

export default function AdminDashboard() {
  const { t } = useLanguage();
  
  // Mock AI Decisions Log
  const aiLogs = [
    { id: 1, user: "sarah.connor@gmail.com", action: "Downgrade Level", from: "B2", to: "B1", reason: "Taux de réussite en Grammaire < 50% sur les 3 derniers Quiz.", status: "Auto-Applied", date: "2 mins ago" },
    { id: 2, user: "john.doe@tech.com", action: "Unlock Advanced Module", from: "C1", to: "C1+", reason: "Passage du test de négociation avec > 95% de précision.", status: "Auto-Applied", date: "1 heure" },
    { id: 3, user: "marie.curie@lab.fr", action: "Remediation Triggered", from: "A2", to: "A2", reason: "Erreurs répétées sur le Passé Composé. Redirection vers module A1.2.", status: "Pending Review", date: "3 heures" },
  ];

  return (
    <div className="space-y-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-pro-purple-400" />
            AI Orchestrator Admin
          </h1>
          <p className="text-white/60 text-lg">Supervisez les décisions pédagogiques de l'IA.</p>
        </div>
        <div className="glass-card px-6 py-3 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="font-bold text-sm">Moteur IA Actif</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border border-pro-purple-500/20">
          <h3 className="text-white/60 font-medium mb-2">Décisions IA (24h)</h3>
          <p className="text-4xl font-bold">1,204</p>
          <p className="text-green-400 text-sm mt-2 flex items-center gap-1">↑ 12% vs yesterday</p>
        </div>
        <div className="glass-card p-6 border border-orange-500/20">
          <h3 className="text-white/60 font-medium mb-2">Rétrogradations auto</h3>
          <p className="text-4xl font-bold">45</p>
          <p className="text-orange-400 text-sm mt-2">Niveaux ajustés à la baisse</p>
        </div>
        <div className="glass-card p-6 border border-red-500/20">
          <h3 className="text-white/60 font-medium mb-2">Risque de décrochage (Alertes)</h3>
          <p className="text-4xl font-bold">12</p>
          <p className="text-red-400 text-sm mt-2">Apprenants nécessitant une intervention</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="font-bold text-xl">Logs d'Ajustement Pédagogique (AI Orchestrator)</h2>
          <button className="text-sm font-bold text-pro-purple-400 hover:text-pro-purple-300 transition-colors">Voir tout</button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-4 text-sm font-bold text-white/50 uppercase tracking-widest">Apprenant</th>
                <th className="p-4 text-sm font-bold text-white/50 uppercase tracking-widest">Modification</th>
                <th className="p-4 text-sm font-bold text-white/50 uppercase tracking-widest">Raison IA</th>
                <th className="p-4 text-sm font-bold text-white/50 uppercase tracking-widest">Statut</th>
                <th className="p-4 text-sm font-bold text-white/50 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {aiLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-sm">{log.user}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <span className="bg-white/10 px-2 py-1 rounded text-white/70">{log.from}</span>
                      <ArrowRight className="w-4 h-4 text-white/40" />
                      <span className={`px-2 py-1 rounded ${log.action.includes('Downgrade') || log.action.includes('Remediation') ? 'bg-orange-500/20 text-orange-300' : 'bg-green-500/20 text-green-300'}`}>
                        {log.to}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-white/70 max-w-xs truncate" title={log.reason}>{log.reason}</td>
                  <td className="p-4">
                    {log.status === "Auto-Applied" ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full w-max">
                        <CheckCircle2 className="w-3 h-3" /> Appliqué
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full w-max">
                        <ShieldAlert className="w-3 h-3" /> En attente validation
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {log.status === "Pending Review" && (
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-green-500/20 text-green-300 font-bold text-xs rounded hover:bg-green-500/30 transition-colors">Valider</button>
                        <button className="px-3 py-1 bg-red-500/20 text-red-300 font-bold text-xs rounded hover:bg-red-500/30 transition-colors">Ignorer</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
