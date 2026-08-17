import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Command } from 'lucide-react';
import { ActiveTab, UserProfile } from '../types';

interface VoiceCommandAssistantProps {
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: UserProfile;
  showToast: (msg: string) => void;
}

export const VoiceCommandAssistant: React.FC<VoiceCommandAssistantProps> = ({
  setActiveTab,
  currentUser,
  showToast,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript.toLowerCase();
        setTranscript(text);

        if (event.results[current].isFinal) {
          processCommand(text);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognitionInstance(recognition);
    }
  }, []);

  const processCommand = (cmd: string) => {
    if (cmd.includes('dashboard') || cmd.includes('home')) {
      setActiveTab('dashboard');
      showToast('🎤 Voice Command: Opening Dashboard');
    } else if (cmd.includes('note') || cmd.includes('record') || cmd.includes('audio')) {
      setActiveTab('record');
      showToast('🎤 Voice Command: Opening Voice Recorder');
    } else if (cmd.includes('list') || cmd.includes('my notes') || cmd.includes('saved')) {
      setActiveTab('notes');
      showToast('🎤 Voice Command: Opening My Notes');
    } else if (cmd.includes('upload')) {
      setActiveTab('upload');
      showToast('🎤 Voice Command: Opening Audio Upload');
    } else if (cmd.includes('pricing') || cmd.includes('sale') || cmd.includes('pre-sale')) {
      setActiveTab('presale');
      showToast('🎤 Voice Command: Opening Pre-Sale & Pricing');
    } else if (cmd.includes('doc') || cmd.includes('prd')) {
      setActiveTab('documentation');
      showToast('🎤 Voice Command: Opening Documentation / PRD');
    } else if (cmd.includes('admin') && currentUser.role === 'ADMIN') {
      setActiveTab('admin' as any);
      showToast('🎤 Voice Command: Opening Admin Console');
    } else {
      showToast(`🎤 Heard: "${cmd}" (Try "go to dashboard" or "new note")`);
    }
  };

  const toggleListening = () => {
    if (!recognitionInstance) {
      alert('Speech Recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionInstance.stop();
      setIsListening(false);
    } else {
      try {
        setTranscript('Listening for voice commands...');
        recognitionInstance.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center space-x-2">
      <button
        onClick={toggleListening}
        title="Hands-free Voice Navigation (Click to speak command)"
        className={`flex items-center space-x-2 px-4 py-3 rounded-2xl shadow-xl transition-all font-medium text-xs border ${
          isListening
            ? 'bg-rose-600 text-white border-rose-500 animate-pulse scale-105 shadow-rose-600/30'
            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-lg'
        }`}
      >
        {isListening ? <Mic className="w-4 h-4 text-white animate-spin" /> : <Command className="w-4 h-4 text-blue-600" />}
        <span className="hidden sm:inline font-semibold">
          {isListening ? 'Listening...' : 'Voice Commands'}
        </span>
      </button>

      {isListening && (
        <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-xl text-xs text-slate-700 max-w-xs truncate animate-fadeIn">
          <span className="font-bold text-blue-600 mr-1">🎙️ Say:</span> "{transcript || 'dashboard, notes, record...'}"
        </div>
      )}
    </div>
  );
};
