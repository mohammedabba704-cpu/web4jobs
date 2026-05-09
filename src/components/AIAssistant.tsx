import { useState } from "react";
import { MessageCircle, X, Sparkles, Send } from "lucide-react";
import { generateText } from "../lib/gemini";
import ReactMarkdown from "react-markdown";

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: "Bonjour ! Je suis ton assistant pédagogique IA. Je peux t'expliquer des leçons, corriger tes erreurs, traduire des phrases ou te recommander des cours/vidéos. Comment puis-je t'aider aujourd'hui ?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const prompt = `
Tu es l'assistant IA pédagogique de la plateforme Web4Jobs Lingo.
L'utilisateur apprend l'anglais ou le français.
Tu dois :
- expliquer les leçons simplement
- corriger les réponses
- donner des exemples clairs
- reformuler ou traduire si demandé
- recommander des vidéos YouTube pertinentes si ça aide
Sois encourageant, concis et formateur.

Message de l'utilisateur : "${userMsg}"
      `;
      const response = await generateText(prompt);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Désolé, je rencontre une erreur de connexion." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl bg-pro-purple-500 hover:bg-pro-purple-400 transition-all transform hover:scale-110 z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-[360px] h-[550px] max-h-[80vh] flex flex-col bg-[#1A1C29] border border-white/10 rounded-2xl shadow-2xl z-50 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pro-purple-400" />
            <span className="font-bold">Assistant IA</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${m.role === 'user' ? 'bg-pro-purple-500 text-white' : 'bg-white/10 text-white/90'}`}>
                <div className="markdown-body text-sm prose prose-invert">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-2xl px-4 py-3 flex gap-2 items-center">
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-75" />
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/10 bg-white/5 rounded-b-2xl">
          <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pose-moi une question..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-pro-purple-500 transition-colors"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-pro-purple-500/20 text-pro-purple-300 rounded-lg transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
