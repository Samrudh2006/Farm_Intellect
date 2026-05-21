/**
 * Real-time Voice Streaming Module
 * Supports chunked audio streaming and progressive response playback
 */

import { logger } from '../utils/logger.js';

export class VoiceStreamProcessor {
  private stream: ReadableStream<Uint8Array> | null = null;
  private audioContext: AudioContext | null = null;
  private audioBuffer: Float32Array[] = [];
  private isProcessing = false;

  /**
   * Initialize WebAudio context for real-time processing
   */
  async initializeAudioContext(): Promise<AudioContext> {
    if (this.audioContext) return this.audioContext;

    const audioContextClass =
      typeof AudioContext !== 'undefined' ? AudioContext : (window as any).webkitAudioContext;
    this.audioContext = new audioContextClass();
    return this.audioContext;
  }

  /**
   * Stream audio chunks and process in real-time
   */
  async *streamAudioChunks(
    arrayBuffer: ArrayBuffer,
    chunkSize: number = 4096
  ): AsyncGenerator<Uint8Array> {
    const buffer = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; i += chunkSize) {
      const chunk = buffer.slice(i, i + chunkSize);
      yield chunk;
      // Small delay to simulate real-time streaming
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  /**
   * Decode audio data and prepare for streaming
   */
  async decodeAudioStream(audioData: ArrayBuffer): Promise<AudioBuffer> {
    if (!this.audioContext) {
      await this.initializeAudioContext();
    }

    return new Promise((resolve, reject) => {
      if (!this.audioContext) {
        return reject(new Error('AudioContext not initialized'));
      }

      this.audioContext.decodeAudioData(
        audioData,
        resolve,
        (error) => {
          logger.error('Audio decode error:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Play audio buffer with streaming visualization
   */
  async playAudioStream(
    audioBuffer: AudioBuffer,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    if (!this.audioContext) {
      await this.initializeAudioContext();
    }

    return new Promise((resolve) => {
      const source = this.audioContext!.createBufferSource();
      source.buffer = audioBuffer;

      // Add gain for volume control
      const gainNode = this.audioContext!.createGain();
      gainNode.gain.value = 1.0;

      source.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);

      // Update progress
      const updateInterval = setInterval(() => {
        if (source.playbackRate.value > 0) {
          const progress = (source.context.currentTime * 100) / audioBuffer.duration;
          onProgress?.(Math.min(progress, 100));
        }
      }, 100);

      source.onended = () => {
        clearInterval(updateInterval);
        onProgress?.(100);
        resolve();
      };

      source.start(0);
    });
  }

  /**
   * Get real-time audio levels for visualization
   */
  async getAudioLevels(
    audioBuffer: AudioBuffer,
    bands: number = 32
  ): Promise<number[]> {
    const rawData = audioBuffer.getChannelData(0);
    const blockSize = Math.floor(rawData.length / bands);
    const levels: number[] = [];

    for (let i = 0; i < bands; i++) {
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[i * blockSize + j]);
      }
      levels.push((sum / blockSize) * 100);
    }

    return levels;
  }

  /**
   * Stop processing and cleanup
   */
  stop(): void {
    this.isProcessing = false;
    this.stream = null;
    this.audioBuffer = [];
  }
}

// Export singleton
export const voiceStreamProcessor = new VoiceStreamProcessor();
export default VoiceStreamProcessor;
