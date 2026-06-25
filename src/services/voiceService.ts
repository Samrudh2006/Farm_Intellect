import { apiFetch } from '@/lib/api';

const API_BASE = '/api/voice';

export interface VoiceProcessRequest {
  audioBuffer: string;
  language: string;
  mimeType?: string;
}

export interface VoiceProcessResponse {
  success: boolean;
  transcription: string;
  response: string;
  audioBase64: string;
  language: string;
}

export interface VoiceStreamRequest {
  audioChunks: string[];
  language: string;
  mimeType?: string;
  isFinal?: boolean;
}

export interface VoiceInteractionHistory {
  interactions: Array<{
    id: string;
    transcription: string;
    response: string;
    language: string;
    status: 'completed' | 'pending' | 'failed';
    createdAt: string;
  }>;
}

class VoiceService {
  /**
   * Process single audio buffer and get response
   */
  async processAudio(request: VoiceProcessRequest): Promise<VoiceProcessResponse> {
    try {
      return await apiFetch<VoiceProcessResponse>(`${API_BASE}/process`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.error('[v0] Voice processing error:', error);
      throw error;
    }
  }

  /**
   * Process streamed audio chunks
   */
  async processAudioStream(request: VoiceStreamRequest): Promise<VoiceProcessResponse> {
    try {
      return await apiFetch<VoiceProcessResponse>(`${API_BASE}/process-stream`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.error('[v0] Voice stream processing error:', error);
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  async getHistory(
    limit: number = 20,
    language?: string
  ): Promise<VoiceInteractionHistory> {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (language) {
        params.append('language', language);
      }

      return await apiFetch<VoiceInteractionHistory>(`${API_BASE}/history?${params}`);
    } catch (error) {
      console.error('[v0] Failed to fetch history:', error);
      throw error;
    }
  }

  /**
   * Convert audio blob to base64
   */
  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Record audio from microphone
   */
  async recordAudio(durationMs: number = 10000): Promise<Blob> {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
          const chunks: Blob[] = [];

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            stream.getTracks().forEach(track => track.stop());
            const blob = new Blob(chunks, { type: 'audio/webm' });
            resolve(blob);
          };

          mediaRecorder.start();

          // Auto-stop after duration
          setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          }, durationMs);
        })
        .catch(reject);
    });
  }

  /**
   * Play audio from base64 encoded string
   */
  playAudio(audioBase64: string, format: 'wav' | 'webm' = 'wav'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const audioElement = new Audio();
        const mimeType = format === 'wav' ? 'audio/wav' : 'audio/webm';
        audioElement.src = `data:${mimeType};base64,${audioBase64}`;

        audioElement.onended = () => resolve();
        audioElement.onerror = () => reject(new Error('Failed to play audio'));

        audioElement.play().catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Check if browser supports voice features
   */
  isSupported(): boolean {
    const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
    const hasAudioContext =
      typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined';
    const hasGetUserMedia =
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

    return hasMediaRecorder && hasAudioContext && hasGetUserMedia;
  }

  /**
   * Set auth token (deprecated)
   */
  setAuthToken(token: string | null) {
    // Deprecated: Auth token is automatically handled by the Supabase session in apiFetch
  }
}

// Export singleton instance
export const voiceService = new VoiceService();

// Export class for testing
export default VoiceService;
