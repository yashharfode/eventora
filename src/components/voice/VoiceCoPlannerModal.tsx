'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  VolumeX,
  Send,
  Sparkles,
  X,
  CheckCircle,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { getEvents, StoredEvent } from '@/lib/storage';
import {
  getSpeechToTextService,
  getTextToSpeechService,
} from '@/features/voice/speech-adapter';
import { VoiceCoPlannerOrchestrator } from '@/features/voice/orchestrator';
import {
  VoiceMessage,
  ActionProposal,
  SupportedLanguage,
  SpeechStatus,
} from '@/features/voice/types';
import VoiceWaveform from './VoiceWaveform';

const SUGGESTED_COMMANDS = [
  'Explain my complete event plan',
  'How much have I spent so far?',
  'Reduce my budget to 12 lakh',
  'Which tasks are overdue?',
  'Show vendor booking status',
];

interface VoiceCoPlannerModalProps {
  currentEventId?: string;
  onEventUpdated?: (event: StoredEvent) => void;
}

export default function VoiceCoPlannerModal({
  currentEventId,
  onEventUpdated,
}: VoiceCoPlannerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [events, setEvents] = useState<StoredEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [language, setLanguage] = useState<SupportedLanguage>('en-IN');
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isSpeakingVoice, setIsSpeakingVoice] = useState(false);
  
  const orchestratorRef = useRef<VoiceCoPlannerOrchestrator | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize events & orchestrator
  useEffect(() => {
    const loaded = getEvents();
    setEvents(loaded);

    const targetId = currentEventId || (loaded.length > 0 ? loaded[0].id : '');
    setSelectedEventId(targetId);

    const activeEv = loaded.find((e) => e.id === targetId) || loaded[0];
    orchestratorRef.current = new VoiceCoPlannerOrchestrator(activeEv);

    // Initial greeting
    setMessages([
      {
        id: 'msg_init',
        role: 'assistant',
        text: `Namaste! I am your **EVENTORA Intelligent Voice Co-Planner**.\n\nI am connected to your event **"${activeEv?.name || 'My Event'}"**. You can speak or type to check budgets, explain the plan, or request changes like *"Reduce budget to 12 lakh"*.`,
        spokenSummary: `Welcome to Eventora Voice Co-Planner. I am ready to help you plan ${activeEv?.name || 'your event'}.`,
        timestamp: Date.now(),
      },
    ]);
  }, [currentEventId]);

  // Update orchestrator when selected event changes
  useEffect(() => {
    if (selectedEventId && events.length > 0) {
      const ev = events.find((e) => e.id === selectedEventId);
      if (ev && orchestratorRef.current) {
        orchestratorRef.current.setEvent(ev);
      }
    }
  }, [selectedEventId, events]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, liveTranscript]);

  // Handle speech recognition
  function toggleListening() {
    const stt = getSpeechToTextService();
    const tts = getTextToSpeechService();

    if (status === 'listening') {
      stt.stop();
      setStatus('idle');
      if (liveTranscript.trim()) {
        const textToProcess = liveTranscript.trim();
        setLiveTranscript('');
        handleProcessInput(textToProcess);
      }
      return;
    }

    // Stop TTS if speaking
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
          handleProcessInput(transcript.trim());
        }
      },
      (errorMsg) => {
        setStatus('failed');
        setMessages((prev) => [
          ...prev,
          {
            id: 'msg_err_' + Date.now(),
            role: 'system',
            text: `⚠️ Voice input note: ${errorMsg || 'Microphone error'}. You can also type your message in the text box below.`,
            timestamp: Date.now(),
          },
        ]);
        setTimeout(() => setStatus('idle'), 3000);
      },
      () => {
        setStatus((prev) => (prev === 'listening' ? 'idle' : prev));
      },
      language
    );
  }

  // Process text or speech through orchestrator
  async function handleProcessInput(text: string) {
    if (!text.trim() || !orchestratorRef.current) return;

    const userMsg: VoiceMessage = {
      id: 'msg_u_' + Date.now(),
      role: 'user',
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLiveTranscript('');
    setStatus('thinking');

    try {
      const res = await orchestratorRef.current.processUserInput(text, language);
      setStatus('idle');
      setMessages((prev) => [...prev, res.message]);

      if (res.message.proposal) {
              }

      if (res.updatedEvent) {
        // Refresh local events list
        const refreshed = getEvents();
        setEvents(refreshed);
                if (onEventUpdated) onEventUpdated(res.updatedEvent);
      }

      // Spoken TTS playback
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

  function handleStopSpeech() {
    const tts = getTextToSpeechService();
    tts.stop();
    setIsSpeakingVoice(false);
  }

  function handleExecuteProposal(_proposal?: ActionProposal) {
    handleProcessInput('Confirm');
  }

  function handleDiscardProposal() {
    handleProcessInput('Cancel');
      }

  const activeEventObj = events.find((e) => e.id === selectedEventId) || events[0];

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 py-3.5 rounded-full shadow-2xl hover:shadow-violet-500/40 transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/20"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-violet-300" />
          </span>

          <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles size={16} className="text-white animate-spin" style={{ animationDuration: '6s' }} />
          </div>

          <div className="text-left">
            <span className="block text-xs font-black tracking-wider uppercase">Voice Co-Planner</span>
            <span className="block text-[10px] text-violet-200">Talk to your event</span>
          </div>

          <Mic size={18} className="text-white ml-1 group-hover:scale-110 transition" />
        </button>
      </div>

      {/* Slide-over Dialog / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center shadow-inner">
                  <Mic size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight flex items-center gap-2 text-white">
                    EVENTORA Voice Co-Planner
                    <span className="text-[10px] bg-violet-500/30 text-violet-300 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                      Live
                    </span>
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-300 flex items-center gap-1">
                      <Layers size={11} className="text-violet-400" />
                      {activeEventObj ? activeEventObj.name : 'Select Event'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Selector */}
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-violet-500 font-medium"
                >
                  <option value="en-IN">English (India)</option>
                  <option value="hi-IN">Hindi (हिंदी)</option>
                  <option value="hinglish">Hinglish</option>
                  <option value="en-US">English (US)</option>
                </select>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Event Switcher Bar */}
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                Active Context:
              </span>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1 font-semibold text-slate-800 outline-none focus:border-violet-500 text-xs max-w-[260px] truncate"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.event_type})
                  </option>
                ))}
              </select>
            </div>

            {/* Waveform Status Banner */}
            <div className="px-5 py-2 flex items-center justify-between bg-violet-50/50 border-b border-violet-100 min-h-[44px]">
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
                  onClick={handleStopSpeech}
                  className="ml-auto text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 bg-white border border-rose-200 px-2.5 py-1 rounded-full shadow-2xs"
                >
                  <VolumeX size={13} />
                  Stop Voice
                </button>
              )}
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-[90%] ${
                    m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                      m.role === 'user'
                        ? 'bg-violet-600'
                        : 'bg-slate-900 border border-violet-500/30'
                    }`}
                  >
                    {m.role === 'user' ? 'You' : <Sparkles size={13} className="text-violet-400" />}
                  </div>

                  <div className="space-y-2">
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-violet-600 text-white rounded-tr-none shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                      }`}
                    >
                      {m.text}
                    </div>

                    {/* Proposal Action Card */}
                    {m.proposal && m.proposal.status === 'pending' && (
                      <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 space-y-3 shadow-sm animate-in fade-in duration-200">
                        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                          <AlertTriangle size={15} className="text-amber-600" />
                          <span>Requires Your Confirmation</span>
                        </div>

                        <div className="text-xs text-slate-700 space-y-1 bg-white/80 p-3 rounded-xl border border-amber-200">
                          <div className="font-bold text-slate-900">{m.proposal.title}</div>
                          <div className="text-slate-600">{m.proposal.description}</div>
                          {m.proposal.financialImpactSummary && (
                            <div className="mt-1 font-semibold text-violet-700">
                              Financial Impact: {m.proposal.financialImpactSummary}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleExecuteProposal(m.proposal!)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <CheckCircle size={14} />
                            Approve & Apply
                          </button>
                          <button
                            onClick={handleDiscardProposal}
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

              {/* Live Transcription Pill */}
              {liveTranscript && (
                <div className="flex gap-2 items-center bg-violet-100 border border-violet-200 text-violet-900 px-4 py-2.5 rounded-2xl text-xs max-w-sm animate-pulse">
                  <Mic size={14} className="text-violet-600 animate-spin" />
                  <span className="italic truncate">{liveTranscript}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Commands Bar */}
            <div className="px-5 py-2.5 bg-white border-t border-slate-200/60 overflow-x-auto whitespace-nowrap flex gap-2">
              {SUGGESTED_COMMANDS.map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => handleProcessInput(cmd)}
                  className="bg-slate-100 hover:bg-violet-50 hover:text-violet-700 text-slate-600 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-slate-200/80 transition shrink-0"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Input Bar & Mic Trigger */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleProcessInput(inputText);
                }}
                className="flex items-center gap-2"
              >
                {/* Voice Mic Button */}
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

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    status === 'listening'
                      ? 'Listening to your voice...'
                      : 'Ask anything or say "Reduce budget to 12 lakh"...'
                  }
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 transition"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="h-11 w-11 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white flex items-center justify-center shrink-0 transition shadow-xs"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
