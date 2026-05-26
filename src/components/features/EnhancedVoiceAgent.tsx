'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Volume2, Copy, Trash2, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { apiBaseUrl } from '@/lib/api';

interface VoiceInteraction {
  id: string;
  transcription: string;
  response: string;
  language: string;
  audioBase64?: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

interface EnhancedVoiceAgentProps {
  userId?: string;
  className?: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
  'en-IN': 'English',
  'hi-IN': 'Hindi',
  'pa-IN': 'Punjabi',
  'ta-IN': 'Tamil',
  'te-IN': 'Telugu',
  'kn-IN': 'Kannada',
  'mr-IN': 'Marathi',
  'gu-IN': 'Gujarati',
  'bn-IN': 'Bengali',
  'ur-IN': 'Urdu',
  'or-IN': 'Odia',
  'as-IN': 'Assamese',
  'ml-IN': 'Malayalam',
  'kok-IN': 'Konkani',
  'mai-IN': 'Maithili',
  'mni-IN': 'Manipuri',
  'sat-IN': 'Santali',
  'brx-IN': 'Bodo',
  'doi-IN': 'Dogri',
  'sd-IN': 'Sindhi',
  'ks-IN': 'Kashmiri',
  'sa-IN': 'Sanskrit',
};

const ALL_LANGUAGES = Object.entries(LANGUAGE_LABELS).map(([code, name]) => ({
  code,
  name,
}));

export const EnhancedVoiceAgent = ({
  userId,
  className,
}: EnhancedVoiceAgentProps) => {
  const { language: appLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [interactions, setInteractions] = useState<VoiceInteraction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [noiseProfile, setNoiseProfile] = useState<"standard" | "outdoor">("outdoor");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio context and history on mount
  useEffect(() => {
    loadInteractionHistory();
    audioElementRef.current = new Audio();
  }, []);

  // Load interaction history
  const loadInteractionHistory = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${apiBaseUrl}/api/voice/history?limit=20&language=${selectedLanguage}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setInteractions(data.interactions || []);
      }
    } catch (err) {
      console.error('[v0] Failed to load history:', err);
    }
  };

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: noiseProfile === "outdoor",
          sampleRate: noiseProfile === "outdoor" ? 16000 : 44100,
          channelCount: 1,
        },
      });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setCurrentTranscription('');
      setCurrentResponse('');
    } catch (err) {
      console.error('[v0] Recording error:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  }, [noiseProfile, selectedLanguage]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Process audio through backend
  const processAudio = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      setError(null);

      // Convert blob to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Audio = (reader.result as string).split(',')[1];

        const token = localStorage.getItem('authToken');
        const response = await fetch(`${apiBaseUrl}/api/voice/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            audioBuffer: base64Audio,
            language: selectedLanguage.split('-')[0],
            noiseEnvironment: noiseProfile,
            mimeType: 'audio/webm',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to process voice');
        }

        const data = await response.json();
        console.log('[v0] Voice processing response:', data);

        setCurrentTranscription(data.transcription);
        setCurrentResponse(data.response);

        // Auto-play synthesized response
        if (data.audioBase64 && audioElementRef.current) {
          playAudioResponse(data.audioBase64);
        }

        // Add to history
        const interaction: VoiceInteraction = {
          id: Date.now().toString(),
          transcription: data.transcription,
          response: data.response,
          language: data.language,
          audioBase64: data.audioBase64,
          timestamp: new Date().toISOString(),
          status: 'completed',
        };
        setInteractions(prev => [interaction, ...prev]);
        setSuccessMessage('Response generated successfully!');

        setTimeout(() => setSuccessMessage(null), 3000);
      };
      reader.readAsDataURL(audioBlob);
    } catch (err) {
      console.error('[v0] Audio processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process audio');
    } finally {
      setIsProcessing(false);
    }
  };

  // Play audio response
  const playAudioResponse = (audioBase64: string) => {
    if (!audioElementRef.current) return;

    try {
      setIsSpeaking(true);
      const audioData = `data:audio/wav;base64,${audioBase64}`;
      audioElementRef.current.src = audioData;

      audioElementRef.current.onended = () => {
        setIsSpeaking(false);
      };

      audioElementRef.current.play().catch(err => {
        console.error('[v0] Audio playback error:', err);
        setIsSpeaking(false);
      });
    } catch (err) {
      console.error('[v0] Failed to play audio:', err);
      setIsSpeaking(false);
    }
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccessMessage('Copied to clipboard!');
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  // Clear all interactions
  const clearHistory = () => {
    setInteractions([]);
    setCurrentTranscription('');
    setCurrentResponse('');
  };

  return (
    <div className={cn('w-full max-w-4xl mx-auto space-y-6', className)}>
      {/* Language Selector */}
      <Card className='p-4'>
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <h3 className='text-sm font-semibold'>Select Language</h3>
            <p className='text-xs text-muted-foreground'>Bhashini hardening: outdoor noise shield is enabled by default.</p>
          </div>
          <div className='flex items-center gap-2'>
            <select
            value={selectedLanguage}
            onChange={(e) => {
              setSelectedLanguage(e.target.value);
              loadInteractionHistory();
            }}
            className='px-3 py-2 border rounded-lg text-sm bg-white'
          >
            {ALL_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
            </select>
            <select
              value={noiseProfile}
              onChange={(e) => setNoiseProfile(e.target.value as "standard" | "outdoor")}
              className='px-3 py-2 border rounded-lg text-sm bg-white'
            >
              <option value='outdoor'>Outdoor Noise Shield</option>
              <option value='standard'>Standard Mode</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Recording Controls */}
      <Card className='p-6 space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Voice Assistant</h3>
          <div className='flex gap-2'>
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              variant={isRecording ? 'destructive' : 'default'}
              className='gap-2'
            >
              {isRecording ? (
                <>
                  <MicOff className='h-4 w-4' />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className='h-4 w-4' />
                  Start Recording
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Status Indicators */}
        {isRecording && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2'>
            <div className='h-2 w-2 bg-red-500 rounded-full animate-pulse' />
            <span className='text-sm text-red-600'>Recording in progress...</span>
          </div>
        )}

        {isProcessing && (
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2'>
            <div className='h-2 w-2 bg-blue-500 rounded-full animate-spin' />
            <span className='text-sm text-blue-600'>Processing your request...</span>
          </div>
        )}

        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
            <p className='text-sm text-red-600'>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className='bg-green-50 border border-green-200 rounded-lg p-3'>
            <p className='text-sm text-green-600'>{successMessage}</p>
          </div>
        )}
      </Card>

      {/* Current Interaction Display */}
      {(currentTranscription || currentResponse) && (
        <Card className='p-6 space-y-4'>
          <h3 className='text-lg font-semibold'>Latest Response</h3>

          {currentTranscription && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <label className='text-sm font-medium'>Your Question:</label>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => copyToClipboard(currentTranscription)}
                  className='h-6 px-2'
                >
                  <Copy className='h-3 w-3' />
                </Button>
              </div>
              <div className='bg-gray-50 p-3 rounded-lg text-sm leading-relaxed'>
                {currentTranscription}
              </div>
            </div>
          )}

          {currentResponse && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <label className='text-sm font-medium'>AI Response:</label>
                <div className='flex gap-1'>
                  {currentResponse && audioElementRef.current?.src && (
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => audioElementRef.current?.play()}
                      disabled={isSpeaking}
                      className='h-6 px-2'
                    >
                      <Volume2 className='h-3 w-3' />
                    </Button>
                  )}
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => copyToClipboard(currentResponse)}
                    className='h-6 px-2'
                  >
                    <Copy className='h-3 w-3' />
                  </Button>
                </div>
              </div>
              <div className='bg-blue-50 p-3 rounded-lg text-sm leading-relaxed'>
                {currentResponse}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Interaction History */}
      {interactions.length > 0 && (
        <Card className='p-6 space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>Conversation History</h3>
            <Button
              size='sm'
              variant='outline'
              onClick={clearHistory}
              className='gap-1'
            >
              <Trash2 className='h-3 w-3' />
              Clear
            </Button>
          </div>

          <div className='space-y-3 max-h-96 overflow-y-auto'>
            {interactions.map(interaction => (
              <div
                key={interaction.id}
                className='border rounded-lg p-3 space-y-2 hover:bg-gray-50 transition'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <p className='text-xs text-gray-500'>
                      {new Date(interaction.timestamp).toLocaleString()} • {LANGUAGE_LABELS[interaction.language] || interaction.language}
                    </p>
                    <p className='text-sm font-medium mt-1 line-clamp-2'>
                      {interaction.transcription}
                    </p>
                  </div>
                  {interaction.status === 'completed' && (
                    <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded'>
                      Done
                    </span>
                  )}
                </div>
                <p className='text-sm text-gray-700 line-clamp-3'>
                  {interaction.response}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card className='p-4 bg-blue-50 border-blue-200'>
        <h4 className='text-sm font-semibold text-blue-900 mb-2'>How it works:</h4>
        <ul className='text-sm text-blue-800 space-y-1'>
          <li>• Select your preferred language</li>
          <li>• Click "Start Recording" and ask your farming question</li>
          <li>• AI will transcribe and provide agricultural advice</li>
          <li>• Listen to the response or read the transcript</li>
        </ul>
      </Card>
    </div>
  );
};

export default EnhancedVoiceAgent;
