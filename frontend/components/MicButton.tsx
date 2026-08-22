'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Send, Loader2, Sparkles } from 'lucide-react';
import { useShoppingStore } from '@/store/useShoppingStore';
import { AudioWaveform } from './AudioWaveform';

export const MicButton: React.FC = () => {
  const {
    isListening,
    isProcessing,
    rawTranscript,
    needsClarification,
    clarifyingQuestion,
    setListening,
    setRawTranscript,
    processVoiceText
  } = useShoppingStore();

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [manualText, setManualText] = useState('');
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = 'en-IN'; // Supports English and Hinglish phrases

        rec.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          transcriptRef.current = currentTranscript;
          setRawTranscript(currentTranscript);
        };

        rec.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setListening(false);
        };

        rec.onend = () => {
          setListening(false);
          const finalTranscript = transcriptRef.current;
          if (finalTranscript && finalTranscript.trim()) {
            processVoiceText(finalTranscript);
            transcriptRef.current = '';
          }
        };

        recognitionRef.current = rec;
      }
    }
  }, [setListening, setRawTranscript, processVoiceText]);

  const toggleMic = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      setListening(false);
    } else {
      setRawTranscript('');
      transcriptRef.current = '';
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(audioStream);
        setListening(true);
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      } catch (err) {
        console.error('Microphone access error:', err);
        setListening(false);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualText.trim()) {
      setRawTranscript(manualText);
      processVoiceText(manualText);
      setManualText('');
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-4 p-4 glass-panel rounded-2xl shadow-2xl relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
          isListening
            ? 'bg-gradient-to-r from-emerald-500/10 via-violet-500/10 to-amber-500/10 opacity-100'
            : 'opacity-0'
        }`}
      />

      {/* Spoken Clarification Banner if triggered */}
      {needsClarification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-amber-500/20 border border-amber-500/50 rounded-xl p-3 text-amber-200 text-sm text-center font-medium shadow-lg"
        >
          <Sparkles className="inline-block w-4 h-4 mr-2 text-amber-400 animate-spin" />
          {clarifyingQuestion}
        </motion.div>
      )}

      {/* Main Mic Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMic}
        disabled={isProcessing}
        className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
          isListening
            ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white glow-emerald ring-4 ring-emerald-400/40 animate-pulse'
            : isProcessing
            ? 'bg-slate-800 text-emerald-400 border border-emerald-500/50'
            : 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-violet-500/30 hover:shadow-violet-500/50'
        }`}
      >
        {isProcessing ? (
          <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
        ) : isListening ? (
          <Mic className="w-10 h-10 animate-bounce" />
        ) : (
          <Mic className="w-10 h-10" />
        )}
      </motion.button>

      {/* Real-time Waveform Canvas */}
      <AudioWaveform isListening={isListening} stream={stream} />

      {/* Real-time Speech Transcript Display */}
      <div className="w-full text-center px-4 min-h-[1.5rem]">
        <p className="text-sm font-medium text-slate-300 transition-all italic">
          {rawTranscript ? (
            <span className="text-emerald-400 font-semibold">"{rawTranscript}"</span>
          ) : isListening ? (
            <span className="text-slate-400 animate-pulse">Listening... speak your order (e.g. "do packet Maggi add karo")</span>
          ) : isProcessing ? (
            <span className="text-violet-400 animate-pulse">Processing command & parsing intent...</span>
          ) : (
            <span className="text-slate-400">Tap mic to speak or type command below</span>
          )}
        </p>
      </div>

      {/* Manual Input Fallback */}
      <form onSubmit={handleManualSubmit} className="w-full flex items-center gap-2 pt-2">
        <input
          type="text"
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder="Type command e.g., 'Add 2L milk' or 'do packet Maggi add karo'"
          className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all"
        />
        <button
          type="submit"
          disabled={!manualText.trim() || isProcessing}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl px-4 py-2.5 flex items-center justify-center transition-all shadow-lg shadow-emerald-950/40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
