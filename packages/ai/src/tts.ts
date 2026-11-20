/** Provider-agnostic TTS boundary (ADR-007). */
export interface TtsRequest {
  text: string;
  voice?: string;
}

export interface TtsResult {
  provider: string;
  voice: string;
  mimeType: 'audio/wav';
  audio: Buffer;
  durationMs: number;
  characters: number;
  estimatedCostVnd: number;
}

export interface TtsProvider {
  readonly name: string;
  synthesize(request: TtsRequest): Promise<TtsResult>;
}

const SAMPLE_RATE = 8000;
/** Approximate Vietnamese narration speed used to size mock audio. */
const CHARS_PER_SECOND = 15;

/** Build a mono 16-bit PCM WAV file of silence. */
export function silentWav(durationMs: number, sampleRate = SAMPLE_RATE): Buffer {
  const samples = Math.round((durationMs / 1000) * sampleRate);
  const dataBytes = samples * 2;
  const buffer = Buffer.alloc(44 + dataBytes);
  buffer.write('RIFF', 0, 'ascii');
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write('WAVE', 8, 'ascii');
  buffer.write('fmt ', 12, 'ascii');
  buffer.writeUInt32LE(16, 16); // PCM chunk size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36, 'ascii');
  buffer.writeUInt32LE(dataBytes, 40);
  return buffer;
}

/** Free, offline TTS that returns silent audio sized to the text length. */
export class MockTtsProvider implements TtsProvider {
  readonly name = 'mock';

  async synthesize(request: TtsRequest): Promise<TtsResult> {
    const characters = request.text.length;
    const durationMs = Math.max(500, Math.round((characters / CHARS_PER_SECOND) * 1000));
    return {
      provider: this.name,
      voice: request.voice || 'mock-vi-neutral',
      mimeType: 'audio/wav',
      audio: silentWav(durationMs),
      durationMs,
      characters,
      estimatedCostVnd: 0,
    };
  }
}
