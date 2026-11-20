import { type LlmProvider, MockLlmProvider } from './llm';
import { MockTtsProvider, type TtsProvider } from './tts';

/**
 * Provider selection by configuration. Only `mock` exists in Sprint 0;
 * adding a real (paid) provider requires Project Owner approval and an ADR.
 */
export function createLlmProvider(name: string): LlmProvider {
  switch (name) {
    case 'mock':
      return new MockLlmProvider();
    default:
      throw new Error(`Unsupported LLM provider "${name}". Only "mock" is available.`);
  }
}

export function createTtsProvider(name: string): TtsProvider {
  switch (name) {
    case 'mock':
      return new MockTtsProvider();
    default:
      throw new Error(`Unsupported TTS provider "${name}". Only "mock" is available.`);
  }
}
