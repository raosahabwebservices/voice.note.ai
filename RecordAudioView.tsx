import React, { useState, useRef, useEffect } from 'react';
import { SmartNote, NoteCategory, NoteLanguage } from '../types';
import { Mic, Square, Sparkles, Volume2 } from 'lucide-react';

interface RecordAudioViewProps {
  onNoteCreated: (note: SmartNote) => void;
  token: string;
}

export const RecordAudioView: React.FC<RecordAudioViewProps> = ({
  onNoteCreated,
  token,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory>('Professional');
  const [selectedLanguage, setSelectedLanguage] = useState<NoteLanguage>('Bilingual (Hinglish)');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [, setJobStatus] = useState<string>('UPLOADING');
  const [jobProgress, setJobProgress] = useState<number>(0);
  const [jobStage, setJobStage] = useState<string>('Preparing upload...');
  const [, setTotalChunks] = useState<number>(1);
  const [, setCompletedChunks] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Polling effect for background job
  useEffect(() => {
    if (!jobId || !isProcessing) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch job status');
        const job = await res.json();

        setJobStatus(job.status);
        setJobProgress(job.progress || 0);
        setJobStage(job.currentStage || 'Processing...');
        setTotalChunks(job.totalChunks || 1);
        setCompletedChunks(job.completedChunks || 0);

        if (job.status === 'COMPLETED') {
          clearInterval(interval);
          setIsProcessing(false);
          if (job.resultNote) {
            onNoteCreated(job.resultNote);
          }
        } else if (job.status === 'FAILED') {
          clearInterval(interval);
          setIsProcessing(false);
          setErrorMsg(job.errorMessage || 'Audio processing failed on backend.');
        }
      } catch (e: any) {
        console.warn('Polling error:', e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, isProcessing, onNoteCreated, token]);

  const handleSimulateRecording = () => {
    const dummyBlob = new Blob(['dummy audio content'], { type: 'audio/webm' });
    setAudioBlob(dummyBlob);
    const url = URL.createObjectURL(dummyBlob);
    setAudioUrl(url);
    setRecordingSeconds(300);
    setCustomTitle('Sample Voice Recording Note');
    setErrorMsg(null);
  };

  const startRecording = async () => {
    setErrorMsg(null);
    audioChunksRef.current = [];
    setRecordingSeconds(0);
    setAudioBlob(null);
    setAudioUrl(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setIsPaused(false);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn("Microphone access failed, using simulator fallback:", err);
      handleSimulateRecording();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        timerRef.current = setInterval(() => {
          setRecordingSeconds(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleProcessRecording = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setJobProgress(5);
    setJobStage('Preparing recording for job queue...');

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        setJobProgress(15);
        setJobStage('Uploading recorded audio...');

        const response = await fetch('/api/jobs/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            audioData: base64String,
            mimeType: audioBlob.type || 'audio/webm',
            customTitle: customTitle.trim() || 'Voice Recording Note',
            category: selectedCategory,
            language: selectedLanguage,
            durationSeconds: Math.max(30, recordingSeconds),
            fileSize: audioBlob.size,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to create transcription job');
        }

        const data = await response.json();
        setJobId(data.jobId);
        setJobProgress(30);
      };
    } catch (e: any) {
      setIsProcessing(false);
      setErrorMsg(e.message || 'Failed to process audio recording');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn bg-slate-50 min-h-screen text-slate-900">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Record Live Voice Note</h1>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Speak naturally. Our AI will transcribe, summarize, extract key action items, and build structured notes instantly.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-center space-x-2">
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-6 py-10">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600 animate-spin">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">AI Processing Audio Recording</h3>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">{jobStage}</p>
            </div>
            <div className="max-w-md mx-auto w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div className="bg-blue-600 h-full transition-all duration-500 rounded-full" style={{ width: `${jobProgress}%` }} />
            </div>
            <p className="text-xs text-slate-500 font-medium">You can leave this page. We'll save your notes automatically.</p>
          </div>
        )}

        {!isProcessing && (
          <div className="space-y-6">
            <div className="py-12 bg-slate-50 border border-slate-200 rounded-3xl max-w-md mx-auto space-y-4 shadow-sm">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all ${
                isRecording && !isPaused ? 'bg-rose-100 border-2 border-rose-500 animate-pulse text-rose-600' : 'bg-blue-100 border border-blue-300 text-blue-600'
              }`}>
                <Mic className="w-10 h-10" />
              </div>
              <div className="text-4xl font-mono font-extrabold tracking-wider text-slate-900">
                {formatTime(recordingSeconds)}
              </div>
              <p className="text-xs text-slate-600 font-semibold">
                {isRecording ? (isPaused ? 'Recording paused' : 'Recording in progress...') : 'Ready to record'}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold shadow-md transition-all flex items-center space-x-2"
                >
                  <Mic className="w-5 h-5" />
                  <span>Start Recording</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={pauseRecording}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all border border-slate-300 shadow-sm"
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={stopRecording}
                    className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center space-x-2"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop Recording</span>
                  </button>
                </>
              )}
            </div>

            {!isRecording && !audioBlob && (
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 font-medium">
                <button
                  onClick={handleSimulateRecording}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all border border-slate-200 shadow-sm"
                >
                  ⚡ Test Simulator (5-min Recording)
                </button>
              </div>
            )}
          </div>
        )}

        {audioUrl && !isRecording && !isProcessing && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 max-w-lg mx-auto text-left shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
              <span className="flex items-center space-x-1">
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span>Playback Recording ({formatTime(recordingSeconds)})</span>
              </span>
            </div>
            <audio controls src={audioUrl} className="w-full h-10" />
          </div>
        )}

        {audioBlob && !isRecording && !isProcessing && (
          <div className="space-y-6 pt-6 border-t border-slate-200 max-w-lg mx-auto text-left">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Note Title (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Q3 Product Planning Sync"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Student', 'Entrepreneur', 'Professional', 'Content Creator'] as NoteCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedCategory === cat
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Output Language / भाषा</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Bilingual (Hinglish)', 'Hindi', 'English'] as NoteLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedLanguage === lang
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleProcessRecording}
              disabled={isProcessing}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-md transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Process Recording & Generate Smart Notes</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
