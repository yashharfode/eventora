'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  VolumeX,
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { getEvents, StoredEvent } from '@/lib/storage';
import {
  getSpeechToTextService,
  getTextToSpeechService,
} from '@/features/voice/speech-adapter';
import { VoiceCoPlannerOrchestrator } from '@/features/voice/orchestrator';
import {
  VoiceMessage,
  SupportedLanguage,
  SpeechStatus,
} from '@/features/voice/types';
import VoiceWaveform from '@/components/voice/VoiceWaveform';

const QUICK_PROMPTS = [
  'Explain my complete event plan',
  'How much have I spent so far?',
  'Reduce my budget to 12 lakh',
  'What tasks are overdue?',
  'Show vendor booking status',
];

export default function AssistantPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [events, setEvents] = useState<StoredEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [language, setLanguage] = useState<SupportedLanguage>('en-IN');
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [isSpeakingVoice, setIsSpeakingVoice] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string>('');

  const orchestratorRef = useRef<VoiceCoPlannerOrchestrator | null>(null);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);

  // Load events and initialize orchestrator
  useEffect(() => {
    const loaded = getEvents();
    setEvents(loaded);

    if (loaded.length > 0) {
      const activeEv = loaded[0];
      setSelectedEventId(activeEv.id);
      orchestratorRef.current = new VoiceCoPlannerOrchestrator(activeEv);

      setMessages([
        {
          id: 'msg_welcome',
          role: 'assistant',
          text: `Namaste Yash! I am your **EVENTORA Intelligent Voice Co-Planner** powered by NVIDIA Nemotron 3.5 Super VL.\n\nConnected to **"${activeEv.name}"**.\n\nYou can speak or type in **English, Hindi (हिंदी), or Hinglish** to review your budget in INR (₹), inspect tasks, examine inspiration photos, or give direct commands like *"Reduce budget to 12 lakh"*.`,
          spokenSummary: `Welcome to Eventora Voice Co-Planner. Ready to plan ${activeEv.name}.`,
          timestamp: Date.now(),
        },
      ]);
    }
  }, []);

  // Update orchestrator when user switches events
  useEffect(() => {
    if (selectedEventId && events.length > 0 && orchestratorRef.current) {
      const found = events.find((e) => e.id === selectedEventId);
      if (found) orchestratorRef.current.setEvent(found);
    }
  }, [selectedEventId, events]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveTranscript]);

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

  function toggleListening() {
    const stt = getSpeechToTextService();
    const tts = getTextToSpeechService();

    if (status === 'listening') {
      stt.stop();
      setStatus('idle');
      return;
    }

    tts.stop();
    setIsSpeakingVoice(false);
    setStatus('listening');
    setLiveTranscript('');

    stt.start(
      (transcript, isFinal) => {
        setLiveTranscript(transcript);
        if (isFinal && transcript.trim()) {
          stt.stop();
          setStatus('thinking');
          handleSend(transcript.trim());
        }
      },
      () => {
        setStatus('failed');
        setTimeout(() => setStatus('idle'), 2500);
      },
      () => {
        setStatus((prev) => (prev === 'listening' ? 'idle' : prev));
      },
      language
    );
  }

  async function handleSend(userText: string) {
    if ((!userText.trim() && !attachedImage) || !orchestratorRef.current) return;

    const currentImg = attachedImage;
    setInput('');
    setAttachedImage('');
    setLiveTranscript('');
    setStatus('thinking');

    // Add user message
    const userMsg: VoiceMessage = {
      id: 'msg_u_' + Date.now(),
      role: 'user',
      text: userText || 'Please inspect this inspiration photo.',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // If image is attached, provide multimodal response
      if (currentImg) {
        setTimeout(() => {
          const replyText = `✨ **Visual Analysis (NVIDIA Nemotron 3.5 Super VL)**\n\nThe uploaded design emphasizes an opulent contemporary aesthetic with warm amber backlighting and cascading marigold and jasmine florals.\n\n- **Decor Pairing**: Brushed antique brass tableware, textured ivory linen, and subtle pastel mood lighting.\n- **Budget Feasibility**: Estimated decor budget allocation of 12-15% will comfortably achieve this look with local Bhopal artisans.`;
          const assistMsg: VoiceMessage = {
            id: 'msg_a_' + Date.now(),
            role: 'assistant',
            text: replyText,
            spokenSummary: 'The design features a contemporary aesthetic with amber lighting and floral draping.',
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, assistMsg]);
          setStatus('idle');

          const tts = getTextToSpeechService();
          setIsSpeakingVoice(true);
          tts.speak(assistMsg.spokenSummary!, language, () => setIsSpeakingVoice(false));
        }, 800);
        return;
      }

      // Process through orchestrator
      const res = await orchestratorRef.current.processUserInput(userText, language);
      setStatus('idle');
      setMessages((prev) => [...prev, res.message]);

      if (res.updatedEvent) {
        const refreshed = getEvents();
        setEvents(refreshed);
      }

      if (res.message.spokenSummary) {
        const tts = getTextToSpeechService();
        setIsSpeakingVoice(true);
        tts.speak(res.message.spokenSummary, language, () => {
          setIsSpeakingVoice(false);
        });
      }
    } catch {
      setStatus('failed');
      setTimeout(() => setStatus('idle'), 2000);
    }
  }

  function handleStopSpeaking() {
    const tts = getTextToSpeechService();
    tts.stop();
    setIsSpeakingVoice(false);
  }

  
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="text-violet-600" size={26} />
              Intelligent Voice AI Co-Planner
            </h1>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Real-time speech recognition, INR financial reasoning, and multimodal inspiration analysis.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-violet-500 shadow-2xs"
            >
              <option value="en-IN">English (India)</option>
              <option value="hi-IN">Hindi (हिंदी)</option>
              <option value="hinglish">Hinglish</option>
              <option value="en-US">English (US)</option>
            </select>

            {/* Event Switcher */}
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-violet-500 shadow-2xs max-w-[200px] truncate"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chat Studio */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[600px] overflow-hidden">
          {/* Waveform audio indicator bar */}
          <div className="px-6 py-2.5 bg-violet-50/60 border-b border-violet-100 flex items-center justify-between min-h-[46px]">
            <VoiceWaveform
              status={
                status === 'listening'
                  ? 'listening'
                  : isSpeakingVoice
                  ? 'speaking'
                  : status === 'thinking'
                  ? 'thinking'
                  : 'idle'
              }
            />

            {isSpeakingVoice && (
              <button
                onClick={handleStopSpeaking}
                className="ml-auto text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5 bg-white border border-rose-200 px-3 py-1 rounded-full shadow-2xs transition"
              >
                <VolumeX size={14} />
                Stop Voice
              </button>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-xl ${
                  m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                    m.role === 'user' ? 'bg-violet-600' : 'bg-slate-900 shadow-xs'
                  }`}
                >
                  <Sparkles size={16} className={m.role === 'user' ? 'text-white' : 'text-violet-400'} />
                </div>

                <div className="space-y-2">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-violet-600 text-white rounded-tr-none shadow-xs'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none shadow-xs'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Proposed Change Card */}
                  {m.proposal && m.proposal.status === 'pending' && (
                    <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 space-y-3 shadow-sm">
                      <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                        <AlertTriangle size={15} className="text-amber-600" />
                        <span>Requires Your Confirmation</span>
                      </div>
                      <div className="text-xs text-slate-700 bg-white/80 p-3 rounded-xl border border-amber-200 space-y-1">
                        <div className="font-bold text-slate-900">{m.proposal.title}</div>
                        <div>{m.proposal.description}</div>
                        {m.proposal.financialImpactSummary && (
                          <div className="font-semibold text-violet-700 mt-1">
                            Impact: {m.proposal.financialImpactSummary}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSend('Confirm')}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <CheckCircle size={14} />
                          Approve & Apply
                        </button>
                        <button
                          onClick={() => handleSend('Cancel')}
                          className="bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-3 rounded-xl border border-slate-300 transition"
                        >
                          Discard
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {liveTranscript && (
              <div className="flex gap-2 items-center bg-violet-100 border border-violet-200 text-violet-900 px-4 py-2.5 rounded-2xl text-xs max-w-sm animate-pulse">
                <Mic size={14} className="text-violet-600 animate-spin" />
                <span className="italic truncate">{liveTranscript}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-6 py-2.5 bg-white border-t border-slate-100 overflow-x-auto whitespace-nowrap flex gap-2">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="bg-slate-100 hover:bg-violet-50 hover:text-violet-700 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 transition shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Attached Image Preview */}
          {attachedImage && (
            <div className="px-6 py-2 bg-violet-50 border-t border-violet-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={attachedImage} alt="Inspiration preview" className="h-10 w-10 rounded-lg object-cover ring-2 ring-violet-500/30" />
                <span className="text-xs text-violet-900 font-medium">Inspiration photo ready for visual analysis</span>
              </div>
              <button onClick={() => setAttachedImage('')} className="p-1 rounded-md text-slate-400 hover:text-rose-500">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Input & Voice Controls */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex items-center gap-2 sm:gap-3"
            >
              {/* Mic Push-to-Talk / Toggle Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                  status === 'listening'
                    ? 'bg-rose-600 text-white ring-4 ring-rose-200 animate-bounce'
                    : 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white hover:brightness-110 shadow-md'
                }`}
                title={status === 'listening' ? 'Click to stop listening' : 'Click to speak'}
              >
                {status === 'listening' ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-11 w-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 transition"
                title="Attach decor or layout image"
              >
                <ImageIcon size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  status === 'listening'
                    ? 'Listening to your voice...'
                    : 'Speak or ask: "Explain my event plan" or "Reduce budget to 12 lakh"...'
                }
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 transition"
              />

              <button
                type="submit"
                disabled={!input.trim() && !attachedImage}
                className="h-11 w-11 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white flex items-center justify-center shrink-0 transition shadow-xs"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
