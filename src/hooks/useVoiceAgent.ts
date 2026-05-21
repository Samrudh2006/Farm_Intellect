/**
 * useVoiceAgent Hook
 * Provides voice recording, processing, and playback functionality
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { voiceService } from '@/services/voiceService';

export interface UseVoiceAgentOptions {
  autoPlayResponse?: boolean;
  maxRecordingDuration?: number;
  onTranscription?: (text: string) => void;
  onResponse?: (text: string) => void;
  onError?: (error: string) => void;
}

export const useVoiceAgent = (options: UseVoiceAgentOptions = {}) => {
  const {
    autoPlayResponse = true,
    maxRecordingDuration = 30000,
    onTranscription,
    onResponse,
    onError,
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioElementRef.current = new Audio();
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  // Format duration in mm:ss
  const formatDuration = useCallback((ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Start recording
  const startRecording = useCallback(async (language: string = 'en') => {
    try {
      setError(null);
      setCurrentTranscription('');
      setCurrentResponse('');
      audioChunksRef.current = [];
      setRecordingDuration(0);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        stream.getTracks().forEach(track => track.stop());
        
        // Process the recorded audio
        await processRecordedAudio(audioBlob, language);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Timer for recording duration
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= maxRecordingDuration) {
            stopRecording();
            return prev;
          }
          return prev + 100;
        });
      }, 100);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to access microphone';
      console.error('[v0] Recording start error:', err);
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [maxRecordingDuration, onError]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  }, [isRecording]);

  // Process recorded audio
  const processRecordedAudio = useCallback(
    async (audioBlob: Blob, language: string) => {
      try {
        setIsProcessing(true);
        setError(null);

        // Convert blob to base64
        const audioBase64 = await voiceService.blobToBase64(audioBlob);

        // Send to backend
        const result = await voiceService.processAudio({
          audioBuffer: audioBase64,
          language: language.split('-')[0],
          mimeType: 'audio/webm',
        });

        setCurrentTranscription(result.transcription);
        onTranscription?.(result.transcription);

        setCurrentResponse(result.response);
        onResponse?.(result.response);

        // Auto-play response if enabled
        if (autoPlayResponse && result.audioBase64) {
          await playResponse(result.audioBase64);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to process audio';
        console.error('[v0] Audio processing error:', err);
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setIsProcessing(false);
      }
    },
    [autoPlayResponse, onTranscription, onResponse, onError]
  );

  // Play audio response
  const playResponse = useCallback(async (audioBase64: string) => {
    try {
      if (!audioElementRef.current) return;

      setIsSpeaking(true);
      const audioData = `data:audio/wav;base64,${audioBase64}`;
      audioElementRef.current.src = audioData;

      await new Promise((resolve, reject) => {
        if (!audioElementRef.current) return reject('No audio element');

        audioElementRef.current.onended = () => {
          setIsSpeaking(false);
          resolve(null);
        };

        audioElementRef.current.onerror = () => {
          setIsSpeaking(false);
          reject('Failed to play audio');
        };

        audioElementRef.current.play().catch(reject);
      });
    } catch (err) {
      console.error('[v0] Playback error:', err);
      setIsSpeaking(false);
    }
  }, []);

  // Stop playback
  const stopPlayback = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  }, []);

  // Get interaction history
  const getHistory = useCallback(async (limit: number = 20, language?: string) => {
    try {
      return await voiceService.getHistory(limit, language);
    } catch (err) {
      console.error('[v0] Failed to fetch history:', err);
      throw err;
    }
  }, []);

  // Check if voice features are supported
  const isSupported = voiceService.isSupported();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      stopPlayback();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [stopRecording, stopPlayback]);

  return {
    // State
    isRecording,
    isProcessing,
    isSpeaking,
    currentTranscription,
    currentResponse,
    recordingDuration,
    recordingDurationFormatted: formatDuration(recordingDuration),
    error,
    isSupported,

    // Methods
    startRecording,
    stopRecording,
    playResponse,
    stopPlayback,
    getHistory,
    formatDuration,
  };
};

export default useVoiceAgent;
