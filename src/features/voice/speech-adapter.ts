'use client';

import {
  ISpeechToTextService,
  ITextToSpeechService,
  SupportedLanguage,
} from './types';

// SpeechRecognition type declarations for browsers
type SpeechRecognitionEvent = Event & {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
};

type SpeechRecognitionInstance = EventTarget & {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export class BrowserSpeechToTextService implements ISpeechToTextService {
  private recognition: SpeechRecognitionInstance | null = null;
  private isListening = false;
  private latestTranscript = '';
  private deliveredFinal = false;

  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  start(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    lang: SupportedLanguage = 'en-IN'
  ): void {
    if (!this.isSupported()) {
      onError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or use typed input.');
      return;
    }

    try {
      this.stop();
      this.latestTranscript = '';
      this.deliveredFinal = false;

      const SpeechRecognitionConstructor =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognitionConstructor) {
        onError('Speech recognition constructor unavailable.');
        return;
      }

      this.recognition = new SpeechRecognitionConstructor();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      // Map language
      let speechLang = 'en-IN';
      if (lang === 'hi-IN' || lang === 'hinglish') {
        speechLang = 'hi-IN';
      } else if (lang === 'en-US') {
        speechLang = 'en-US';
      }
      this.recognition.lang = speechLang;

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = '';
        let isFinal = false;

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          transcript += res[0].transcript;
          if (res.isFinal) isFinal = true;
        }

        const trimmed = transcript.trim();
        this.latestTranscript = trimmed;
        if (isFinal) {
          this.deliveredFinal = true;
        }
        onResult(trimmed, isFinal);
      };

      this.recognition.onerror = (event: { error: string }) => {
        this.isListening = false;
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          onError('Microphone permission blocked. Please allow microphone access in your browser site settings.');
        } else if (event.error === 'no-speech') {
          // No speech detected, graceful ignore
        } else if (event.error === 'network') {
          onError('Speech service network error. Please check your internet connection.');
        } else {
          onError(`Speech recognition error (${event.error}). Please use typed input.`);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.latestTranscript && !this.deliveredFinal) {
          this.deliveredFinal = true;
          onResult(this.latestTranscript, true);
        }
        onEnd();
      };

      this.recognition.start();
      this.isListening = true;
    } catch (err) {
      this.isListening = false;
      onError(err instanceof Error ? err.message : 'Failed to initialize microphone speech recognition.');
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        this.recognition.abort();
      }
    }
    this.isListening = false;
  }
}

export class BrowserTextToSpeechService implements ITextToSpeechService {
  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  }

  speak(text: string, lang: SupportedLanguage = 'en-IN', onEnd?: () => void): void {
    if (!this.isSupported()) {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.stop(); // Stop any currently playing audio

      // Clean speech text (strip markdown asterisks, hashes, backticks)
      const cleanText = text
        .replace(/[*#_`~]/g, '')
        .replace(/₹/g, 'Rupees ')
        .replace(/\b(\d+)L\b/gi, '$1 Lakh')
        .replace(/\b(\d+)Cr\b/gi, '$1 Crore')
        .trim();

      if (!cleanText) {
        if (onEnd) onEnd();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Select matching voice if available
      const voices = window.speechSynthesis.getVoices();
      let targetLang = 'en-IN';
      if (lang === 'hi-IN' || lang === 'hinglish') targetLang = 'hi-IN';

      const matchingVoice = voices.find(
        (v) => v.lang === targetLang || v.lang.toLowerCase().includes(targetLang.toLowerCase())
      );
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.volume = 1.0;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      // Slight timeout to ensure clean reset on Chromium
      setTimeout(() => {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
        } catch {
          if (onEnd) onEnd();
        }
      }, 50);
    } catch {
      if (onEnd) onEnd();
    }
  }

  stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  pause(): void {
    if (this.isSupported()) {
      window.speechSynthesis.pause();
    }
  }

  resume(): void {
    if (this.isSupported()) {
      window.speechSynthesis.resume();
    }
  }

  isSpeaking(): boolean {
    if (!this.isSupported()) return false;
    return window.speechSynthesis.speaking;
  }
}

// Singleton instances
let defaultSTT: ISpeechToTextService | null = null;
let defaultTTS: ITextToSpeechService | null = null;

export function getSpeechToTextService(): ISpeechToTextService {
  if (!defaultSTT) defaultSTT = new BrowserSpeechToTextService();
  return defaultSTT;
}

export function getTextToSpeechService(): ITextToSpeechService {
  if (!defaultTTS) defaultTTS = new BrowserTextToSpeechService();
  return defaultTTS;
}
