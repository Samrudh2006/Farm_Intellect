/**
 * Audio Quality Service
 * Real-time audio metrics, noise detection, and preprocessing for farm environments
 */

export interface AudioMetrics {
  rms: number; // Root Mean Square (volume level)
  peakLevel: number; // Peak amplitude
  snr: number; // Signal-to-Noise Ratio (dB)
  noiseLevel: number; // Estimated noise floor
  spectralCentroid: number; // Frequency center of mass
  zeroCrossingRate: number; // Speech indicator
  energy: number; // Total energy
  isSpeech: boolean; // VAD (Voice Activity Detection)
}

export interface NoiseProfile {
  id: string;
  name: string;
  frequency: string; // "low" (machinery), "mid" (traffic), "high" (wind)
  intensity: number; // 0-1 scale
  description: string;
  examples: string[];
}

// Noise profiles for Indian farm environments
export const NOISE_PROFILES: Record<string, NoiseProfile> = {
  quiet: {
    id: "quiet",
    name: "Quiet Field",
    frequency: "low",
    intensity: 0.1,
    description: "Early morning or calm weather",
    examples: ["birds", "light wind"],
  },
  tractor: {
    id: "tractor",
    name: "Tractor Running",
    frequency: "low",
    intensity: 0.8,
    description: "Farm machinery operation",
    examples: ["diesel engine", "hydraulics", "tire noise"],
  },
  market: {
    id: "market",
    name: "Market/Bazaar",
    frequency: "mid",
    intensity: 0.9,
    description: "Crowded agricultural market",
    examples: ["voices", "traffic", "vendors"],
  },
  wind: {
    id: "wind",
    name: "Strong Wind",
    frequency: "high",
    intensity: 0.7,
    description: "Windy conditions",
    examples: ["wind noise", "rustling leaves"],
  },
  rain: {
    id: "rain",
    name: "Rain",
    frequency: "mid",
    intensity: 0.6,
    description: "Rainy conditions",
    examples: ["rain on surface", "water drops"],
  },
};

/**
 * Analyze audio buffer and compute metrics
 */
export function analyzeAudio(
  audioBuffer: Float32Array,
  sampleRate: number = 16000
): AudioMetrics {
  const frameSize = 512;
  const overlapping = true;

  // RMS (volume level)
  let sum = 0;
  for (let i = 0; i < audioBuffer.length; i++) {
    sum += audioBuffer[i] * audioBuffer[i];
  }
  const rms = Math.sqrt(sum / audioBuffer.length);

  // Peak level
  let peakLevel = 0;
  for (let i = 0; i < audioBuffer.length; i++) {
    peakLevel = Math.max(peakLevel, Math.abs(audioBuffer[i]));
  }

  // Zero crossing rate (indicator of speech vs. noise)
  let zeroCrossings = 0;
  for (let i = 1; i < audioBuffer.length; i++) {
    if ((audioBuffer[i] >= 0 && audioBuffer[i - 1] < 0) ||
        (audioBuffer[i] < 0 && audioBuffer[i - 1] >= 0)) {
      zeroCrossings++;
    }
  }
  const zeroCrossingRate = zeroCrossings / audioBuffer.length;

  // Spectral centroid (frequency content)
  const fft = performFFT(audioBuffer.slice(0, frameSize));
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < fft.magnitude.length; i++) {
    const freq = (i * sampleRate) / frameSize;
    numerator += freq * fft.magnitude[i];
    denominator += fft.magnitude[i];
  }

  const spectralCentroid = denominator > 0 ? numerator / denominator : 0;

  // Estimate noise floor (low energy, high frequency content)
  const lowFreqEnergy = fft.magnitude.slice(0, 10).reduce((a, b) => a + b, 0);
  const highFreqEnergy = fft.magnitude.slice(fft.magnitude.length - 10).reduce((a, b) => a + b, 0);
  const noiseLevel = highFreqEnergy / Math.max(lowFreqEnergy, 0.01);

  // SNR estimation (Signal-to-Noise Ratio)
  const snrDb = 20 * Math.log10(rms / Math.max(noiseLevel * 0.01, 0.001));

  // Total energy
  const energy = rms * rms;

  // Voice Activity Detection (simple threshold-based)
  const speechThreshold = 0.02; // Threshold for RMS
  const isSpeech = rms > speechThreshold && zeroCrossingRate > 0.05;

  return {
    rms: Math.round(rms * 10000) / 10000,
    peakLevel: Math.round(peakLevel * 10000) / 10000,
    snr: Math.round(snrDb * 10) / 10,
    noiseLevel: Math.round(noiseLevel * 100) / 100,
    spectralCentroid: Math.round(spectralCentroid),
    zeroCrossingRate: Math.round(zeroCrossingRate * 100) / 100,
    energy: Math.round(energy * 10000) / 10000,
    isSpeech,
  };
}

/**
 * Simple FFT implementation (Radix-2)
 */
function performFFT(
  data: Float32Array,
  windowSize: number = 512
): { magnitude: number[]; phase: number[] } {
  const N = Math.min(data.length, windowSize);
  const padded = new Float32Array(N);

  // Hamming window
  for (let i = 0; i < N; i++) {
    padded[i] = data[i] * (0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1)));
  }

  // Simplified FFT (using simple DFT for smaller windows)
  const real = new Array(N).fill(0);
  const imag = new Array(N).fill(0);

  for (let k = 0; k < N; k++) {
    for (let n = 0; n < N; n++) {
      const angle = (-2 * Math.PI * k * n) / N;
      real[k] += padded[n] * Math.cos(angle);
      imag[k] += padded[n] * Math.sin(angle);
    }
  }

  const magnitude = real.map((r, i) => Math.sqrt(r * r + imag[i] * imag[i]));
  const phase = real.map((r, i) => Math.atan2(imag[i], r));

  return { magnitude: magnitude.slice(0, N / 2), phase: phase.slice(0, N / 2) };
}

/**
 * Spectral subtraction for noise reduction
 */
export function spectralSubtraction(
  audioBuffer: Float32Array,
  noiseProfile: NoiseProfile,
  reductionFactor: number = 0.8
): Float32Array {
  const frameSize = 512;
  const hopSize = frameSize / 2;
  const output = new Float32Array(audioBuffer.length);

  // Process audio in overlapping frames
  for (let frameStart = 0; frameStart + frameSize <= audioBuffer.length; frameStart += hopSize) {
    const frame = audioBuffer.slice(frameStart, frameStart + frameSize);
    const fft = performFFT(frame);

    // Reduce noise based on profile
    const noiseFactor = noiseProfile.intensity * reductionFactor;

    const processedMagnitude = fft.magnitude.map((mag) => {
      const noiseMagnitude = mag * noiseFactor;
      return Math.max(mag - noiseMagnitude, mag * 0.1); // Keep at least 10%
    });

    // Inverse FFT (simplified - reconstruct from magnitude)
    const processedFrame = new Float32Array(frameSize);
    for (let n = 0; n < frameSize / 2; n++) {
      processedFrame[n] = processedMagnitude[n] * Math.cos(fft.phase[n]);
    }

    // Overlap-add
    for (let i = 0; i < frameSize; i++) {
      output[frameStart + i] = (output[frameStart + i] || 0) + processedFrame[i] / 2;
    }
  }

  return output;
}

/**
 * Low-pass filter (300-3400 Hz speech band)
 */
export function applyLowPassFilter(
  audioBuffer: Float32Array,
  cutoffFrequency: number = 3400,
  sampleRate: number = 16000
): Float32Array {
  const filtered = new Float32Array(audioBuffer.length);

  // Simple 1st order IIR filter
  const RC = 1.0 / (2 * Math.PI * cutoffFrequency);
  const dt = 1.0 / sampleRate;
  const alpha = dt / (RC + dt);

  filtered[0] = audioBuffer[0];
  for (let i = 1; i < audioBuffer.length; i++) {
    filtered[i] = alpha * audioBuffer[i] + (1 - alpha) * filtered[i - 1];
  }

  return filtered;
}

/**
 * Normalize audio levels to prevent clipping
 */
export function normalizeAudio(
  audioBuffer: Float32Array,
  targetRMS: number = 0.05
): Float32Array {
  let sum = 0;
  for (let i = 0; i < audioBuffer.length; i++) {
    sum += audioBuffer[i] * audioBuffer[i];
  }

  const currentRMS = Math.sqrt(sum / audioBuffer.length);
  const normalizationFactor = targetRMS / Math.max(currentRMS, 0.001);

  const normalized = new Float32Array(audioBuffer.length);
  for (let i = 0; i < audioBuffer.length; i++) {
    normalized[i] = Math.max(-1, Math.min(1, audioBuffer[i] * normalizationFactor));
  }

  return normalized;
}

/**
 * Voice Activity Detection (VAD)
 */
export function detectVoiceActivity(
  audioBuffer: Float32Array,
  sampleRate: number = 16000
): { hasVoice: boolean; confidence: number } {
  const metrics = analyzeAudio(audioBuffer, sampleRate);

  // Score based on multiple indicators
  let score = 0;

  // RMS energy (speech typically > 0.02)
  if (metrics.rms > 0.02) score += 0.3;

  // Zero crossing rate (speech has mid-range ZCR)
  if (metrics.zeroCrossingRate > 0.05 && metrics.zeroCrossingRate < 0.5) score += 0.3;

  // SNR (speech has higher SNR)
  if (metrics.snr > 5) score += 0.2;

  // Spectral properties (speech centered around 300-3400 Hz)
  if (metrics.spectralCentroid > 200 && metrics.spectralCentroid < 4000) score += 0.2;

  return {
    hasVoice: score > 0.5,
    confidence: score,
  };
}

/**
 * Calibrate noise filter for current environment
 */
export function calibrateNoiseFilter(
  calibrationAudio: Float32Array,
  sampleRate: number = 16000
): { profile: NoiseProfile; calibrationLevel: number } {
  const metrics = analyzeAudio(calibrationAudio, sampleRate);

  // Determine noise profile based on audio characteristics
  let profile = NOISE_PROFILES.quiet;

  if (metrics.spectralCentroid < 500) {
    profile = NOISE_PROFILES.tractor; // Low frequency = machinery
  } else if (metrics.rms > 0.3) {
    profile = NOISE_PROFILES.market; // High RMS = crowded
  } else if (metrics.spectralCentroid > 3000) {
    profile = NOISE_PROFILES.wind; // High frequency = wind
  }

  return {
    profile,
    calibrationLevel: metrics.noiseLevel,
  };
}

/**
 * Get audio quality recommendations
 */
export function getAudioQualityRecommendations(metrics: AudioMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.snr < 10) {
    recommendations.push("High background noise detected. Move away from machinery or use noise cancellation.");
  }

  if (metrics.peakLevel > 0.9) {
    recommendations.push("Audio is clipping. Reduce microphone volume or move farther from noise source.");
  }

  if (metrics.rms < 0.01) {
    recommendations.push("Microphone level is very low. Speak louder or move microphone closer.");
  }

  if (!metrics.isSpeech) {
    recommendations.push("No speech detected. Make sure microphone is working and you're speaking.");
  }

  if (metrics.spectralCentroid < 200 || metrics.spectralCentroid > 4000) {
    recommendations.push("Audio frequency outside normal speech range. Check microphone quality.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Audio quality is good.");
  }

  return recommendations;
}
