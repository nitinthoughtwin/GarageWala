// =============================================================
// Voice Engine — Local Browser Text-To-Speech (Phase 3)
// Utilizes speechSynthesis to speak character dialogues locally.
// Supports pitches, rates, and tracking to avoid repeating lines.
// =============================================================

import type { DialogueDef } from '../types';

interface VoiceConfig {
  pitch: number;
  rate: number;
  gender: 'male' | 'female';
}

const VOICE_CONFIGS: Record<string, VoiceConfig> = {
  PapaCat:    { pitch: 0.85, rate: 0.90, gender: 'male' },
  PapaRabbit: { pitch: 0.80, rate: 0.88, gender: 'male' },
  MamaCat:    { pitch: 1.05, rate: 0.95, gender: 'female' },
  MamaRabbit: { pitch: 1.10, rate: 0.92, gender: 'female' },
  KidCat:     { pitch: 1.45, rate: 1.05, gender: 'female' }, // higher pitch for child
  KidRabbit:  { pitch: 1.50, rate: 1.05, gender: 'female' },
  GrandpaCat: { pitch: 0.70, rate: 0.80, gender: 'male' },   // older, slower
  BabyCat:    { pitch: 1.80, rate: 1.20, gender: 'female' },  // very high pitch baby
  // backward compatibility
  Papa:       { pitch: 0.85, rate: 0.90, gender: 'male' },
  Mama:       { pitch: 1.05, rate: 0.95, gender: 'female' },
  Kid:        { pitch: 1.45, rate: 1.05, gender: 'female' },
};

export class VoiceEngine {
  private spokenIds = new Set<string>();
  private isEnabled = true;

  constructor() {
    // Check speech synthesis support
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('[VoiceEngine] Web Speech API is not supported in this environment.');
      this.isEnabled = false;
    }
  }

  /**
   * Speak a dialogue line if it hasn't been spoken for this play segment.
   */
  speak(dialogue: DialogueDef, id: string): void {
    if (!this.isEnabled) return;
    if (this.spokenIds.has(id)) return;

    // Stop current speaking line
    this.cancel();

    this.spokenIds.add(id);
    const config = VOICE_CONFIGS[dialogue.characterId] ?? { pitch: 1.0, rate: 1.0, gender: 'female' };

    const utterance = new SpeechSynthesisUtterance(dialogue.text);
    utterance.pitch = config.pitch;
    utterance.rate = config.rate;

    // Attempt to pick a matching gender voice if available
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(v => v.lang.startsWith('en')); // default English

    if (config.gender === 'female') {
      selectedVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) || selectedVoice;
    } else {
      selectedVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male')) || selectedVoice;
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    console.log(`[VoiceEngine] Speaking (${dialogue.characterId}): "${dialogue.text}"`);
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Stop all speech.
   */
  cancel(): void {
    if (!this.isEnabled) return;
    window.speechSynthesis.cancel();
  }

  /**
   * Reset tracking cache (e.g. on rewinding or loading a new scene).
   */
  reset(): void {
    this.cancel();
    this.spokenIds.clear();
    console.log('[VoiceEngine] Tracker cache cleared.');
  }
}
