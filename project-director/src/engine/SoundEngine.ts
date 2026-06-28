// =============================================================
// SoundEngine.ts (Phase 7 — Sound & Music synthesis)
// Client-side Web Audio API synthesizer generating BGM and SFX.
// Requires no file assets.
// =============================================================

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private bgmInterval: any = null;
  private isBgmPlaying = false;
  private musicVolume: GainNode | null = null;
  private sfxVolume: GainNode | null = null;

  private initCtx(): void {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
      
      // Setup master channels
      this.musicVolume = this.ctx.createGain();
      this.musicVolume.gain.setValueAtTime(0.2, this.ctx.currentTime); // Soft BGM
      this.musicVolume.connect(this.ctx.destination);

      this.sfxVolume = this.ctx.createGain();
      this.sfxVolume.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.sfxVolume.connect(this.ctx.destination);
    }
  }

  playBGM(): void {
    this.initCtx();
    if (!this.ctx || this.isBgmPlaying) return;

    // Resume context if suspended (browser security)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isBgmPlaying = true;
    console.log('[SoundEngine] Playing procedural BGM...');

    // Play a gentle pentatonic chord progression arpeggio loop
    const chords = [
      [60, 64, 67, 71], // Cmaj7 (C4, E4, G4, B4)
      [57, 60, 64, 67], // Am7 (A3, C4, E4, G4)
      [53, 57, 60, 64], // Fmaj7 (F3, A3, C4, E4)
      [55, 59, 62, 65], // G7 (G3, B3, D4, F4)
    ];

    let chordIdx = 0;
    let step = 0;

    const tickMusic = () => {
      if (!this.ctx || !this.isBgmPlaying || !this.musicVolume) return;

      const now = this.ctx.currentTime;
      const chord = chords[chordIdx];
      
      // Play a bass note on step 0
      if (step === 0) {
        this.playMellowNote(chord[0] - 12, 1.2, now, 0.05); // Bass (1 octave lower)
      }

      // Play arpeggiated note
      const note = chord[step % chord.length];
      this.playMellowNote(note, 0.4, now, 0.03);

      step++;
      if (step >= 8) {
        step = 0;
        chordIdx = (chordIdx + 1) % chords.length;
      }
    };

    // Trigger note every 300ms
    tickMusic();
    this.bgmInterval = setInterval(tickMusic, 300);
  }

  stopBGM(): void {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    console.log('[SoundEngine] Stopped BGM.');
  }

  playSFX(type: 'step' | 'hit' | 'cheer' | 'giggle'): void {
    this.initCtx();
    if (!this.ctx || !this.sfxVolume) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    if (type === 'step') {
      // Soft footstep thump (low frequency sweep)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxVolume);
      osc.start(now);
      osc.stop(now + 0.09);
    } 
    else if (type === 'hit') {
      // High impact cricket bat sound (triangle pop)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxVolume);
      osc.start(now);
      osc.stop(now + 0.16);
    } 
    else if (type === 'giggle') {
      // Quick rising chirps for giggling
      for (let i = 0; i < 3; i++) {
        const t = now + i * 0.1;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.frequency.setValueAtTime(650 + i * 80, t);
        osc.frequency.exponentialRampToValueAtTime(1000 + i * 80, t + 0.07);

        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

        osc.connect(gain);
        gain.connect(this.sfxVolume);
        osc.start(t);
        osc.stop(t + 0.08);
      }
    } 
    else if (type === 'cheer') {
      // Noise sweep simulating crowd cheer
      try {
        const bufferSize = this.ctx.sampleRate * 0.6; // 600ms
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Fill white noise
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        // Bandpass filter to make it sound cheering
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(1500, now + 0.4);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxVolume);
        
        source.start(now);
      } catch (e) {
        // Fallback tone if buffer fails
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(520, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.sfxVolume);
        osc.start(now);
        osc.stop(now + 0.31);
      }
    }
  }

  private playMellowNote(midiNote: number, duration: number, time: number, vol: number): void {
    if (!this.ctx || !this.musicVolume) return;

    // Convert MIDI note to frequency
    const freq = Math.pow(2, (midiNote - 69) / 12) * 440;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle'; // Cozy soft sound
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.05); // attack
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration); // decay

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicVolume);

    osc.start(time);
    osc.stop(time + duration + 0.05);
  }
}
export const soundEngine = new SoundEngine();
