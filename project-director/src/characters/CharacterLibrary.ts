// =============================================================
// Character Library — Upgraded for Phase 2
// Dispatches rendering to CatFamily or RabbitFamily dynamically
// and handles all Phase 2 procedural animation offsets.
// =============================================================

import type { CharacterState, AnimationName } from '../types';
import { drawCat } from './CatFamily';
import { drawRabbit } from './RabbitFamily';
import { createCharacterStateFromRegistry } from './CharacterRegistry';

// Keep backward-compatible export for creation
export function createCharacterState(
  id: string,
  position: { x: number; y: number }
): CharacterState {
  return createCharacterStateFromRegistry(id, position);
}

// Interface of options passed to drawing helpers
interface DrawingOffsets {
  headY: number;
  armAngle: number;
  legAngle: number;
  mouthOpen: number;
  eyeClosed: boolean;
  bodyY: number;
  extraArm?: number;
  legBend?: number;
  useStick?: boolean;
  holdNewspaper?: boolean;
  hopHeight?: number;
  isSleeping?: boolean;
}

// ------------------------------------------------------------------
// Public API: Draw character based on species
// ------------------------------------------------------------------
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  state: CharacterState,
  time: number
): void {
  const animName = state.currentAnimation;
  const progress = state.animationProgress;
  const offsets = getAnimationOffsets(animName, time, progress);

  if (state.isSpeaking) {
    offsets.mouthOpen = (Math.sin(time * 12) + 1) * 0.25;
  }

  // Setup species-specific extras
  const isGrandpa = state.id.includes('Grandpa');
  const isPapaRabbit = state.id.includes('PapaRabbit');

  const finalOffsets: DrawingOffsets = {
    ...offsets,
    useStick: isGrandpa && animName !== 'sleep',
    holdNewspaper: isPapaRabbit && animName === 'read',
    isSleeping: animName === 'sleep',
  };

  ctx.save();

  // Lay down flat if sleeping
  if (animName === 'sleep') {
    ctx.translate(state.position.x, state.position.y);
    ctx.rotate(-Math.PI / 2);
    ctx.translate(-state.position.x, -state.position.y);
  }

  if (state.species === 'rabbit') {
    drawRabbit(
      ctx,
      state.position.x,
      state.position.y,
      state.scale,
      state.facingRight,
      state.color,
      finalOffsets
    );
  } else {
    drawCat(
      ctx,
      state.position.x,
      state.position.y,
      state.scale,
      state.facingRight,
      state.color,
      finalOffsets
    );
  }

  ctx.restore();
}

// ------------------------------------------------------------------
// Animation offset calculator — pure function
// ------------------------------------------------------------------
function getAnimationOffsets(
  animation: AnimationName,
  time: number,
  _progress: number
): DrawingOffsets {
  const base: DrawingOffsets = {
    headY: 0,
    armAngle: 0.2, // relaxed arms default
    legAngle: 0,
    mouthOpen: 0,
    eyeClosed: false,
    bodyY: 0,
  };

  switch (animation) {
    case 'idle': {
      const breathe = Math.sin(time * 1.5) * 1.8;
      return { ...base, headY: breathe, bodyY: breathe };
    }

    case 'walk': {
      const walkCycle = Math.sin(time * 6);
      const bounce = Math.abs(Math.sin(time * 6)) * -3;
      return { ...base, legAngle: walkCycle * 0.4, armAngle: -walkCycle * 0.3, bodyY: bounce };
    }

    case 'sit': {
      return { ...base, bodyY: 16, headY: 3, legAngle: 0.6, legBend: 0.3, armAngle: 0.5 };
    }

    case 'eat': {
      const eatCycle = Math.sin(time * 3) * 0.5 + 0.5;
      const chew = Math.sin(time * 6) * 0.15;
      return {
        ...base,
        bodyY: 16,
        headY: 3,
        legAngle: 0.6,
        legBend: 0.3,
        armAngle: -0.8 - eatCycle * 0.5,
        mouthOpen: chew > 0 ? chew * 2 : 0,
      };
    }

    case 'wave': {
      const wave = Math.sin(time * 5) * 0.5;
      return { ...base, armAngle: -1.4 - wave * 0.4 };
    }

    case 'cook': {
      const stir = Math.sin(time * 3) * 0.5;
      const stir2 = Math.cos(time * 3) * 0.2;
      return { ...base, armAngle: -0.4 + stir, extraArm: 0.4, headY: stir2 };
    }

    case 'talk': {
      const talk = (Math.sin(time * 8) + 1) * 0.25;
      return { ...base, mouthOpen: talk, headY: Math.sin(time * 2) * 1 };
    }

    case 'blink': {
      return { ...base, eyeClosed: true };
    }

    // Cricket
    case 'bat': {
      const swingPhase = (time % 2.2);
      let armAngle = 0.2;
      let bodyY = 0;
      let legAngle = 0;
      if (swingPhase < 0.5) {
        armAngle = 0.8 * (swingPhase / 0.5);
        bodyY = -4;
      } else if (swingPhase < 0.9) {
        const t2 = (swingPhase - 0.5) / 0.4;
        armAngle = 0.8 - 2.8 * t2;
        bodyY = -2;
        legAngle = 0.2 * t2;
      } else {
        const t3 = (swingPhase - 0.9) / 1.3;
        armAngle = -2.0 + 1.0 * t3;
        bodyY = Math.sin(t3 * Math.PI) * -3;
        legAngle = 0.2 * (1 - t3);
      }
      return { ...base, armAngle, legAngle, bodyY, headY: -2 };
    }

    case 'bowl': {
      const bowlPhase = (time % 2.5);
      let armAngle = 0.2;
      let legAngle = 0;
      let bodyY = 0;
      if (bowlPhase < 1.0) {
        const jog = Math.sin(bowlPhase * 10);
        legAngle = jog * 0.35;
        armAngle = -jog * 0.25;
        bodyY = Math.abs(jog) * -2;
      } else if (bowlPhase < 1.5) {
        const t2 = (bowlPhase - 1.0) / 0.5;
        armAngle = -1.8 * t2;
        bodyY = -6 * Math.sin(t2 * Math.PI);
        legAngle = 0.5 * t2;
      } else {
        const t3 = (bowlPhase - 1.5) / 1.0;
        armAngle = -1.8 + 2.6 * t3;
        legAngle = 0.5 - 0.5 * t3;
        bodyY = 4 * t3;
      }
      return { ...base, armAngle, legAngle, bodyY };
    }

    case 'field': {
      const sway = Math.sin(time * 1.8) * 0.05;
      return { ...base, legAngle: 0.2, armAngle: 0.4 + sway, bodyY: 8, headY: 1 };
    }

    case 'run': {
      const sprint = Math.sin(time * 9);
      const bounce = Math.abs(Math.sin(time * 9)) * -4;
      return { ...base, legAngle: sprint * 0.55, armAngle: -sprint * 0.45, bodyY: bounce, headY: -2 };
    }

    case 'celebrate': {
      const jump = Math.abs(Math.sin(time * 5)) * -18;
      const armWav = Math.sin(time * 8) * 0.4;
      return { ...base, bodyY: jump, armAngle: -1.5 - armWav, extraArm: -1.5 + armWav, headY: -2, mouthOpen: 0.25 };
    }

    case 'cheer': {
      const clap = Math.sin(time * 8) * 0.3;
      const shout = (Math.sin(time * 5) + 1) * 0.2;
      return { ...base, armAngle: -0.6 + clap, extraArm: -0.6 - clap, mouthOpen: shout, headY: Math.sin(time * 3) * 1.5 };
    }

    // Phase 2 — General
    case 'jump': {
      const height = Math.abs(Math.sin(time * 4)) * -25;
      return { ...base, bodyY: height, armAngle: -1.2, extraArm: -1.2, legAngle: 0.3 };
    }

    case 'dance': {
      const swayX = Math.sin(time * 4) * 0.2;
      const waveL = Math.sin(time * 6) * 0.6;
      const waveR = Math.cos(time * 6) * 0.6;
      return {
        ...base,
        bodyY: Math.abs(Math.sin(time * 8)) * -4,
        headY: Math.sin(time * 4) * 2,
        armAngle: -0.8 + waveL,
        extraArm: -0.8 + waveR,
        legAngle: swayX,
      };
    }

    case 'sleep': {
      return { ...base, bodyY: 16, legAngle: 0.5, legBend: 0.4, armAngle: 0.8, extraArm: 0.8, eyeClosed: true, headY: Math.sin(time * 0.8) * 1.2 };
    }

    case 'think': {
      const headTil = Math.sin(time * 1) * 1.5;
      return { ...base, armAngle: -1.2, extraArm: 0.3, headY: headTil, mouthOpen: 0 };
    }

    case 'point': {
      return { ...base, armAngle: -1.5, extraArm: 0.2 };
    }

    case 'angry': {
      const jitter = Math.sin(time * 25) * 1.5;
      return {
        ...base,
        headY: jitter,
        armAngle: 0.8,
        extraArm: -0.8,
        mouthOpen: 0.3,
      };
    }

    case 'surprised': {
      return { ...base, headY: -4, armAngle: -1.6, extraArm: -1.6, mouthOpen: 0.4 };
    }

    // Phase 2 — Rabbit-specific
    case 'hop': {
      const hop = Math.abs(Math.sin(time * 5.5)) * -24;
      const legA = Math.sin(time * 5.5) * 0.3;
      return { ...base, hopHeight: hop, legAngle: legA, armAngle: -0.6 };
    }

    case 'garden': {
      const bend = Math.sin(time * 3.5) * 0.3;
      return {
        ...base,
        bodyY: 10 + bend * 10,
        armAngle: 0.6 + bend,
        extraArm: 0.6 - bend,
        legAngle: 0.2,
      };
    }

    case 'read': {
      return {
        ...base,
        bodyY: 10,
        armAngle: 1.2,
        extraArm: -1.2,
        legAngle: 0.5,
        legBend: 0.3,
      };
    }

    // Phase 2 — Cat-specific
    case 'crawl': {
      const crawlCycle = Math.sin(time * 7);
      return {
        ...base,
        bodyY: 18 + Math.abs(crawlCycle) * -2,
        legAngle: crawlCycle * 0.3,
        armAngle: -crawlCycle * 0.3,
        legBend: 0.5,
      };
    }

    case 'doze': {
      const droop = Math.max(0, Math.sin(time * 1.2)) * 6;
      const sleeping = (time % 4) > 1.5;
      return { ...base, headY: droop, bodyY: droop / 2, eyeClosed: sleeping };
    }

    case 'limp-walk': {
      const walkCycle = Math.sin(time * 4);
      const lean = Math.sin(time * 4) * 1.5;
      return {
        ...base,
        legAngle: walkCycle * 0.25,
        armAngle: 0.5, // hand on stick
        extraArm: -walkCycle * 0.15,
        bodyY: lean,
      };
    }

    case 'giggle': {
      const jitter = Math.sin(time * 14) * 1.2;
      return {
        ...base,
        bodyY: jitter,
        headY: jitter * 0.6,
        armAngle: -0.5,
        extraArm: -0.5,
        mouthOpen: 0.2,
      };
    }

    default:
      return base;
  }
}
