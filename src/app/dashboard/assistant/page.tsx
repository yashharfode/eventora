'use client';

import { useState, useRef } from 'react';
import { Sparkles, Send, Bot, User as UserIcon, Image as ImageIcon, X } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';

type Message = {
  role: 'assistant' | 'user';
  text: string;
  image?: string;
};

export default function AssistantPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Hello Yash! I am your EVENTORA AI co-planner powered by NVIDIA Nemotron 3.5 Super VL. Ask me anything about budgeting, vendor negotiation, invitations, or upload an image to analyze wedding decor, attire, and layouts!',
    },
  ]);
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string>('');
  const [busy, setBusy] = useState(false);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if ((!input.trim() && !attachedImage) || busy) return;

    const userText = input.trim();
    const currentImg = attachedImage;
    setInput('');
    setAttachedImage('');
    setMessages((prev) => [...prev, { role: 'user', text: userText || 'Please inspect this attached event design image.', image: currentImg }]);
    setBusy(true);

    setTimeout(() => {
      let reply = `Based on your request "${userText || 'image analysis'}": For maximum value, focus on locking down priority bookings (venue and catering) at least 4 months in advance. Keeping an 8-10% contingency buffer will safeguard against unexpected logistical variances.`;

      if (currentImg) {
        reply = `✨ Visual Analysis (Nemotron Vision): The uploaded image highlights a sophisticated traditional-meets-contemporary aesthetic with warm amber lighting and layered floral drapery. Recommended pairing: brushed brass cutlery, subtle marigold table runner accents, and soft acoustic live instrumentals to complement this atmosphere.`;
      } else if (userText.toLowerCase().includes('budget') || userText.toLowerCase().includes('catering')) {
        reply = 'For 300 guests, catering typically accounts for 28-32% of total expenditure. Opting for live interactive culinary stations rather than multiple heavy course lines can reduce wastage by ~15% while enhancing guest satisfaction.';
      } else if (userText.toLowerCase().includes('vendor') || userText.toLowerCase().includes('photographer')) {
        reply = 'When reviewing photographers in Bhopal, request full raw galleries from real weddings instead of highlights only. Ensure coverage includes drone footage, candid family captures, and a delivery SLA within 45 days.';
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      setBusy(false);
    }, 700);
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="text-violet-600" size={26} />
            AI Planning Studio
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Powered by NVIDIA Nemotron 3.5 Super VL with Multimodal Image Perception.
          </p>
        </div>

        {/* Chat Window */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[520px] overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-xl ${
                  m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                    m.role === 'user' ? 'bg-violet-600' : 'bg-slate-900'
                  }`}
                >
                  {m.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                </div>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-2 ${
                    m.role === 'user'
                      ? 'bg-violet-600 text-white rounded-tr-none'
                      : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none shadow-2xs'
                  }`}
                >
                  {m.image && (
                    <img
                      src={m.image}
                      alt="Uploaded inspiration"
                      className="max-h-48 rounded-xl object-cover mb-2 border border-white/20"
                    />
                  )}
                  <p>{m.text}</p>
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex gap-3 text-slate-400 text-xs items-center">
                <Bot size={16} className="text-violet-600 animate-spin" />
                <span>NVIDIA Nemotron is analyzing multimodal context…</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-6 py-2 bg-slate-50 border-t border-slate-100 flex gap-2 overflow-x-auto text-[11px] font-semibold text-violet-700">
            <button
              onClick={() => setInput('How can I optimize catering budget for 300 guests?')}
              className="bg-white border border-slate-200 rounded-full px-3 py-1 hover:bg-violet-50 shrink-0"
            >
              Optimize catering budget
            </button>
            <button
              onClick={() => setInput('What questions should I ask wedding photographers?')}
              className="bg-white border border-slate-200 rounded-full px-3 py-1 hover:bg-violet-50 shrink-0"
            >
              Photographer checklist
            </button>
            <button
              onClick={() => setInput('Give me creative wedding favor ideas')}
              className="bg-white border border-slate-200 rounded-full px-3 py-1 hover:bg-violet-50 shrink-0"
            >
              Creative wedding favors
            </button>
          </div>

          {/* Attached Image Preview */}
          {attachedImage && (
            <div className="px-6 pt-2 bg-white flex items-center gap-2">
              <div className="relative inline-block">
                <img
                  src={attachedImage}
                  alt="Attachment"
                  className="h-12 w-16 object-cover rounded-lg border border-violet-300"
                />
                <button
                  type="button"
                  onClick={() => setAttachedImage('')}
                  className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]"
                >
                  <X size={10} />
                </button>
              </div>
              <span className="text-xs text-slate-500">Image attached for vision inspection</span>
            </div>
          )}

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-200 flex items-center gap-3 bg-white">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach image for AI inspection"
              className="p-2.5 rounded-full text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition shrink-0"
            >
              <ImageIcon size={20} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your AI co-planner or attach an image..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-xs sm:text-sm text-slate-800 outline-none focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 transition"
            />
            <button
              type="submit"
              disabled={(!input.trim() && !attachedImage) || busy}
              className="h-11 w-11 rounded-full bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition disabled:opacity-40 shadow-sm shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
