import React, { useState, useEffect } from 'react';
import { SmartNote, NoteCategory, NoteLanguage } from '../types';
import { Upload, Sparkles, FileText } from 'lucide-react';

interface UploadAudioViewProps {
  onNoteCreated: (note: SmartNote) => void;
  token: string;
}

export const UploadAudioView: React.FC<UploadAudioViewProps> = ({
  onNoteCreated,
  token,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [, setAudioUrl] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory>('Professional');
  const [selectedLanguage, setSelectedLanguage] = useState<NoteLanguage>('Bilingual (Hinglish)');
  const [rawTextTranscript, setRawTextTranscript] = useState('');
  const [inputType, setInputType] = useState<'audio' | 'text'>('audio');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [, setJobStatus] = useState<string>('UPLOADING');
  const [jobProgress, setJobProgress] = useState<number>(0);
  const [jobStage, setJobStage] = useState<string>('Preparing upload...');
  const [, setTotalChunks] = useState<number>(1);
  const [, setCompletedChunks] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setAudioUrl(URL.createObjectURL(file));
      if (!customTitle) {
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setCustomTitle(cleanName.replace(/[-_]/g, ' '));
      }
      setErrorMsg(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setAudioUrl(URL.createObjectURL(file));
      if (!customTitle) {
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setCustomTitle(cleanName.replace(/[-_]/g, ' '));
      }
      setErrorMsg(null);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    setJobProgress(5);
    setJobStage('Reading file...');

    try {
      if (inputType === 'text') {
        if (!rawTextTranscript.trim()) {
          throw new Error('Please enter raw transcript text');
        }
        const response = await fetch('/api/jobs/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            rawTranscript: rawTextTranscript,
            customTitle: customTitle.trim() || 'Text Note Summary',
            category: selectedCategory,
            language: selectedLanguage,
            durationSeconds: 120,
            fileSize: rawTextTranscript.length,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to process text transcript');
        }

        const data = await response.json();
        setJobId(data.jobId);
        setJobProgress(40);
        return;
      }

      if (!selectedFile) {
        throw new Error('Please select an audio file to upload');
      }

      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        setJobProgress(15);
        setJobStage('Uploading audio file...');

        const response = await fetch('/api/jobs/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            audioData: base64String,
            mimeType: selectedFile.type || 'audio/mp3',
            customTitle: customTitle.trim() || selectedFile.name.replace(/\.[^/.]+$/, ""),
            category: selectedCategory,
            language: selectedLanguage,
            durationSeconds: 180,
            fileSize: selectedFile.size,
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
      setErrorMsg(e.message || 'Failed to upload audio file');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn bg-slate-50 min-h-screen text-slate-900">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Upload Audio or Paste Transcript</h1>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Upload MP3, WAV, M4A, AAC or paste raw notes. Our AI processes them instantly into structured summaries.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {isProcessing && (
          <div className="space-y-6 py-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600 animate-spin">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">AI Processing Upload</h3>
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
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setInputType('audio')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${inputType === 'audio' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-600'}`}
              >
                📁 Audio File Upload
              </button>
              <button
                onClick={() => setInputType('text')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${inputType === 'text' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-600'}`}
              >
                📝 Raw Text Transcript
              </button>
            </div>

            {inputType === 'audio' ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-10 text-center space-y-4 bg-slate-50 transition-all cursor-pointer"
                onClick={() => document.getElementById('audioFileInput')?.click()}
              >
                <input
                  id="audioFileInput"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                  <Upload className="w-8 h-8" />
                </div>
                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to process</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">Drag & drop your audio file here, or click to browse</p>
                    <p className="text-xs text-slate-500">Supports MP3, WAV, M4A, AAC, WEBM up to 100MB</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Paste Transcript or Meeting Notes</label>
                <textarea
                  rows={6}
                  placeholder="Paste your meeting notes, raw lecture transcript, or bullet points here..."
                  value={rawTextTranscript}
                  onChange={(e) => setRawTextTranscript(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Note Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Annual Budget Review 2026"
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
                onClick={handleSubmit}
                disabled={isProcessing || (inputType === 'audio' && !selectedFile) || (inputType === 'text' && !rawTextTranscript.trim())}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-md transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Process & Generate Smart Notes</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
