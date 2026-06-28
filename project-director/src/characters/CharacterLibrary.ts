// =============================================================
// Character Library — Procedural Cat Character Definitions
// All characters drawn with Canvas 2D API — no external assets.
// =============================================================

import type { CharacterColors, CharacterState, AnimationName } from '../types';

// ------------------------------------------------------------------
// Color Palettes
// ------------------------------------------------------------------
export const CHARACTER_COLORS: Record<string, CharacterColors> = {
  Papa: {
    body:         '#f59e0b', // warm amber
    head:         '#fbbf24',
    ears:         '#f59e0b',
    eyeWhite:     '#ffffff',
    eyePupil:     '#1e293b',
    mouth:        '#92400e',
    tail:         '#f59e0b',
    outfit:       '#1d4ed8', // blue shirt
    outfitAccent: '#1e40af',
  },
  Mama: {
    body:         '#f97316', // orange
    head:         '#fb923c',
    ears:         '#f97316',
    eyeWhite:     '#ffffff',
    eyePupil:     '#1e293b',
    mouth:        '#9a3412',
    tail:         '#f97316',
    outfit:       '#db2777', // pink apron
    outfitAccent: '#be185d',
  },
  Kid: {
    body:         '#a3e635', // lime green
    head:         '#bef264',
    ears:         '#a3e635',
    eyeWhite:     '#ffffff',
    eyePupil:     '#1e293b',
    mouth:        '#4d7c0f',
    tail:         '#a3e635',
    outfit:       '#7c3aed', // purple
    outfitAccent: '#6d28d9',
  },
};

// ------------------------------------------------------------------
// Character scale constants
// ------------------------------------------------------------------
export const CHARACTER_SCALES: Record<string, number> = {
  Papa: 1.0,
  Mama: 0.9,
  Kid:  0.7,
};

// ------------------------------------------------------------------
// Factory: build initial CharacterState
// ------------------------------------------------------------------
export function createCharacterState(
  id: string,
  position: { x: number; y: number },
): CharacterState {
  const colors = CHARACTER_COLORS[id] ?? CHARACTER_COLORS['Papa'];
  const scale  = CHARACTER_SCALES[id] ?? 1.0;

  return {
    id,
    position: { ...position },
    currentAnimation: 'idle' as AnimationName,
    animationProgress: 0,
    facingRight: id !== 'Mama', // Mama faces left toward stove
    color: colors,
    scale,
  };
}

// ------------------------------------------------------------------
// Canvas drawing helpers
// ------------------------------------------------------------------

function drawCatCharacter(
  ctx: CanvasRenderingContext2D,
  state: CharacterState,
  animOffset: { headY: number; armAngle: number; legAngle: number; mouthOpen: number; eyeClosed: boolean; bodyY: number },
): void {
  const { position, color, scale, facingRight } = state;
  const cx = position.x;
  const cy = position.y + animOffset.bodyY;
  const s  = scale;
  const dir = facingRight ? 1 : -1;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(dir * s, s);

  // ---- Tail ----
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-15, -10);
  ctx.bezierCurveTo(-45, -40, -50, -70, -20, -80);
  ctx.lineWidth = 8;
  ctx.strokeStyle = color.tail;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  // ---- Body (torso) ----
  ctx.beginPath();
  ctx.ellipse(0, -30, 28, 38, 0, 0, Math.PI * 2);
  ctx.fillStyle = color.body;
  ctx.fill();

  // ---- Outfit / shirt ----
  ctx.beginPath();
  ctx.ellipse(0, -22, 22, 28, 0, 0, Math.PI * 2);
  ctx.fillStyle = color.outfit;
  ctx.fill();

  // ---- Left Arm ----
  const armBase = { x: -22, y: -40 };
  const leftArmAngle = animOffset.armAngle;
  ctx.save();
  ctx.translate(armBase.x, armBase.y);
  ctx.rotate(leftArmAngle);
  ctx.beginPath();
  ctx.roundRect(-6, 0, 12, 32, 6);
  ctx.fillStyle = color.outfit;
  ctx.fill();
  // Hand
  ctx.beginPath();
  ctx.arc(0, 34, 8, 0, Math.PI * 2);
  ctx.fillStyle = color.head;
  ctx.fill();
  ctx.restore();

  // ---- Right Arm ----
  const rightArmAngle = -leftArmAngle * 0.6;
  ctx.save();
  ctx.translate(-armBase.x, armBase.y);
  ctx.rotate(rightArmAngle);
  ctx.beginPath();
  ctx.roundRect(-6, 0, 12, 32, 6);
  ctx.fillStyle = color.outfit;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 34, 8, 0, Math.PI * 2);
  ctx.fillStyle = color.head;
  ctx.fill();
  ctx.restore();

  // ---- Legs ----
  const legY = 4;
  [-12, 12].forEach((lx, i) => {
    const legAngle = i === 0 ? animOffset.legAngle : -animOffset.legAngle;
    ctx.save();
    ctx.translate(lx, legY);
    ctx.rotate(legAngle);
    ctx.beginPath();
    ctx.roundRect(-7, 0, 14, 38, 7);
    ctx.fillStyle = color.body;
    ctx.fill();
    // Foot
    ctx.beginPath();
    ctx.ellipse(0, 40, 10, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = color.body;
    ctx.fill();
    ctx.restore();
  });

  // ---- Head ----
  const headY = -80 + animOffset.headY;
  ctx.beginPath();
  ctx.arc(0, headY, 34, 0, Math.PI * 2);
  ctx.fillStyle = color.head;
  ctx.fill();

  // ---- Ears ----
  [[-20, headY - 26], [20, headY - 26]].forEach(([ex, ey]) => {
    ctx.beginPath();
    ctx.moveTo(ex - 12, ey + 8);
    ctx.lineTo(ex, ey - 20);
    ctx.lineTo(ex + 12, ey + 8);
    ctx.closePath();
    ctx.fillStyle = color.ears;
    ctx.fill();
    // Inner ear
    ctx.beginPath();
    ctx.moveTo(ex - 6, ey + 4);
    ctx.lineTo(ex, ey - 10);
    ctx.lineTo(ex + 6, ey + 4);
    ctx.closePath();
    ctx.fillStyle = '#fda4af';
    ctx.fill();
  });

  // ---- Eyes ----
  [[-12, headY - 8], [12, headY - 8]].forEach(([ex, ey]) => {
    // White
    ctx.beginPath();
    ctx.ellipse(ex, ey, 8, animOffset.eyeClosed ? 2 : 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = color.eyeWhite;
    ctx.fill();
    if (!animOffset.eyeClosed) {
      // Pupil
      ctx.beginPath();
      ctx.arc(ex + 2, ey, 4, 0, Math.PI * 2);
      ctx.fillStyle = color.eyePupil;
      ctx.fill();
      // Shine
      ctx.beginPath();
      ctx.arc(ex + 3, ey - 2, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  });

  // ---- Nose ----
  ctx.beginPath();
  ctx.arc(0, headY + 4, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#fda4af';
  ctx.fill();

  // ---- Whiskers ----
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#92400e';
  [[-8, headY + 4], [8, headY + 4]].forEach(([wx, wy], si) => {
    const dir2 = si === 0 ? -1 : 1;
    [-1, 0, 1].forEach((row) => {
      ctx.beginPath();
      ctx.moveTo(wx, wy + row * 6);
      ctx.lineTo(wx + dir2 * 32, wy + row * 6 - row * 2);
      ctx.stroke();
    });
  });

  // ---- Mouth ----
  const mouthOpen = animOffset.mouthOpen;
  ctx.beginPath();
  if (mouthOpen > 0.1) {
    ctx.ellipse(0, headY + 14, 8, mouthOpen * 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = color.mouth;
    ctx.fill();
  } else {
    ctx.moveTo(-8, headY + 14);
    ctx.quadraticCurveTo(0, headY + 20, 8, headY + 14);
    ctx.lineWidth = 2;
    ctx.strokeStyle = color.mouth;
    ctx.stroke();
  }

  ctx.restore();
}

// ------------------------------------------------------------------
// Public API: draw a character given its state + animation offsets
// ------------------------------------------------------------------
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  state: CharacterState,
  time: number,
): void {
  const offsets = getAnimationOffsets(state.currentAnimation, time, state.animationProgress);
  drawCatCharacter(ctx, state, offsets);
}

// ------------------------------------------------------------------
// Animation offset calculator — pure function, no mutation
// ------------------------------------------------------------------
interface AnimOffset {
  headY: number;
  armAngle: number;
  legAngle: number;
  mouthOpen: number;
  eyeClosed: boolean;
  bodyY: number;
}

function getAnimationOffsets(
  animation: AnimationName,
  time: number,
  _progress: number,
): AnimOffset {
  const base: AnimOffset = {
    headY: 0,
    armAngle: 0,
    legAngle: 0,
    mouthOpen: 0,
    eyeClosed: false,
    bodyY: 0,
  };

  switch (animation) {
    case 'idle': {
      // Gentle breathing bob
      const breathe = Math.sin(time * 1.5) * 2;
      return { ...base, headY: breathe, bodyY: breathe };
    }

    case 'walk': {
      // Leg swing + body bounce
      const walkCycle = Math.sin(time * 6);
      const bounce    = Math.abs(Math.sin(time * 6)) * -3;
      return { ...base, legAngle: walkCycle * 0.4, armAngle: -walkCycle * 0.3, bodyY: bounce };
    }

    case 'sit': {
      // Compressed body, arm resting
      return { ...base, bodyY: 18, headY: 4, legAngle: 0.7 };
    }

    case 'eat': {
      // Arm oscillates toward mouth
      const eatCycle = Math.sin(time * 3) * 0.5 + 0.5;
      const chew     = Math.sin(time * 6) * 0.15;
      return { ...base, bodyY: 18, headY: 4, armAngle: -0.8 - eatCycle * 0.5, mouthOpen: chew > 0 ? chew * 2 : 0 };
    }

    case 'wave': {
      // One arm raised, oscillating
      const wave = Math.sin(time * 5) * 0.5;
      return { ...base, armAngle: -1.2 - wave * 0.4 };
    }

    case 'cook': {
      // Stirring motion — arm circles
      const stir  = Math.sin(time * 3) * 0.6;
      const stir2 = Math.cos(time * 3) * 0.3;
      return { ...base, armAngle: -0.5 + stir, headY: stir2 };
    }

    case 'talk': {
      const talk = (Math.sin(time * 8) + 1) * 0.3;
      return { ...base, mouthOpen: talk };
    }

    case 'blink': {
      const blinkPhase = (time % 4) < 0.15;
      return { ...base, eyeClosed: blinkPhase };
    }

    // ---- Cricket animations ----

    case 'bat': {
      // Batting swing — big arm arc, forward lean, weight shift
      // Swing repeats every ~2s: windup → strike → follow-through
      const swingPhase = (time % 2.2);
      let armAngle = 0;
      let bodyY    = 0;
      let legAngle = 0;
      if (swingPhase < 0.5) {
        // Windup: arms go back
        armAngle = 0.8 * (swingPhase / 0.5);
        bodyY    = -4;
      } else if (swingPhase < 0.9) {
        // Strike: arms swing through fast
        const t2 = (swingPhase - 0.5) / 0.4;
        armAngle = 0.8 - 2.8 * t2;   // sweeping down/forward
        bodyY    = -2;
        legAngle = 0.2 * t2;
      } else {
        // Follow-through: arms come up other side
        const t3 = (swingPhase - 0.9) / 1.3;
        armAngle = -2.0 + 1.0 * t3;
        bodyY    = Math.sin(t3 * Math.PI) * -3;
        legAngle = 0.2 * (1 - t3);
      }
      return { ...base, armAngle, legAngle, bodyY, headY: -2 };
    }

    case 'bowl': {
      // Bowling run-up + release
      // Repeats every ~2.5s
      const bowlPhase = (time % 2.5);
      let armAngle = 0;
      let legAngle = 0;
      let bodyY    = 0;
      if (bowlPhase < 1.0) {
        // Run-up: jogging motion
        const jog  = Math.sin(bowlPhase * 10);
        legAngle   = jog * 0.35;
        armAngle   = -jog * 0.25;
        bodyY      = Math.abs(jog) * -2;
      } else if (bowlPhase < 1.5) {
        // Leap + cock arm overhead
        const t2 = (bowlPhase - 1.0) / 0.5;
        armAngle = -1.8 * t2;         // arm goes overhead
        bodyY    = -6 * Math.sin(t2 * Math.PI);
        legAngle = 0.5 * t2;
      } else {
        // Release — arm whips through fast
        const t3 = (bowlPhase - 1.5) / 1.0;
        armAngle = -1.8 + 2.6 * t3;  // arm sweeps forward and down
        legAngle = 0.5 - 0.5 * t3;
        bodyY    = 4 * t3;
      }
      return { ...base, armAngle, legAngle, bodyY };
    }

    case 'field': {
      // Fielder ready stance — crouching, alert, slight sway
      const sway = Math.sin(time * 1.8) * 0.06;
      return {
        ...base,
        legAngle: 0.3,
        armAngle: 0.4 + sway,
        bodyY: 10,
        headY: 2,
      };
    }

    case 'run': {
      // Fast sprint — exaggerated leg swing, forward lean
      const sprint = Math.sin(time * 9);
      const bounce = Math.abs(Math.sin(time * 9)) * -4;
      return {
        ...base,
        legAngle: sprint * 0.55,
        armAngle: -sprint * 0.45,
        bodyY: bounce,
        headY: -2,
      };
    }

    case 'celebrate': {
      // Jump + both arms up, spin joy
      const jump   = Math.abs(Math.sin(time * 5)) * -20;
      const armWav = Math.sin(time * 8) * 0.4;
      return {
        ...base,
        bodyY: jump,
        armAngle: -1.5 - armWav,
        headY: -3,
        mouthOpen: 0.3,
      };
    }

    case 'cheer': {
      // Clapping + mouth open (watching from boundary)
      const clap = Math.sin(time * 7);
      const shout = (Math.sin(time * 6) + 1) * 0.25;
      return {
        ...base,
        armAngle: -0.8 + clap * 0.5,
        mouthOpen: shout,
        headY: Math.sin(time * 3) * 2,
      };
    }

    default:
      return base;
  }
}
