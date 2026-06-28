// =============================================================
// Cat Family — 5 Characters (Phase 7 — High Fidelity Update)
// Papa Cat, Mama Cat, Kid Cat, Grandpa Cat, Baby Cat
// All drawn procedurally with rich gradients, outlines, rosy cheeks
// and floor shadows.
// =============================================================

import type { CharacterColors, CharacterProfile } from '../types';

export const CAT_COLORS: Record<string, CharacterColors> = {
  PapaCat: {
    body:         '#f59e0b',
    head:         '#fbbf24',
    ears:         '#e08e0b',
    eyeWhite:     '#ffffff',
    eyePupil:     '#0f172a',
    mouth:        '#78350f',
    tail:         '#d97706',
    outfit:       '#2563eb',
    outfitAccent: '#1d4ed8',
  },
  MamaCat: {
    body:         '#ea580c',
    head:         '#f97316',
    ears:         '#c2410c',
    eyeWhite:     '#ffffff',
    eyePupil:     '#0f172a',
    mouth:        '#7c2d12',
    tail:         '#c2410c',
    outfit:       '#ec4899',
    outfitAccent: '#db2777',
  },
  KidCat: {
    body:         '#84cc16',
    head:         '#a3e635',
    ears:         '#65a30d',
    eyeWhite:     '#ffffff',
    eyePupil:     '#0f172a',
    mouth:        '#3f6212',
    tail:         '#65a30d',
    outfit:       '#8b5cf6',
    outfitAccent: '#7c3aed',
  },
  GrandpaCat: {
    body:         '#64748b',
    head:         '#94a3b8',
    ears:         '#475569',
    eyeWhite:     '#ffffff',
    eyePupil:     '#1e293b',
    mouth:        '#334155',
    tail:         '#475569',
    outfit:       '#b45309',
    outfitAccent: '#78350f',
  },
  BabyCat: {
    body:         '#fbbf24',
    head:         '#fde68a',
    ears:         '#d97706',
    eyeWhite:     '#ffffff',
    eyePupil:     '#0f172a',
    mouth:        '#b45309',
    tail:         '#d97706',
    outfit:       '#38bdf8',
    outfitAccent: '#0ea5e9',
  },
};

export const CAT_SCALES: Record<string, number> = {
  PapaCat:    1.0,
  MamaCat:    0.92,
  KidCat:     0.72,
  GrandpaCat: 0.95,
  BabyCat:    0.45,
};

export const CAT_PROFILES: CharacterProfile[] = [
  { id: 'PapaCat',    species: 'cat', displayName: 'Papa Cat',    family: 'Cat Family',    role: 'Father', signature: 'sit'      },
  { id: 'MamaCat',    species: 'cat', displayName: 'Mama Cat',    family: 'Cat Family',    role: 'Mother', signature: 'cook'     },
  { id: 'KidCat',     species: 'cat', displayName: 'Kid Cat',     family: 'Cat Family',    role: 'Child',  signature: 'wave'     },
  { id: 'GrandpaCat', species: 'cat', displayName: 'Grandpa Cat', family: 'Cat Family',    role: 'Elder',  signature: 'doze'     },
  { id: 'BabyCat',    species: 'cat', displayName: 'Baby Cat',    family: 'Cat Family',    role: 'Baby',   signature: 'giggle'   },
];

export function drawCat(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  facingRight: boolean,
  color: CharacterColors,
  anim: {
    headY: number;
    armAngle: number;
    legAngle: number;
    mouthOpen: number;
    eyeClosed: boolean;
    bodyY: number;
    extraArm?: number;
    legBend?: number;
    useStick?: boolean;
    tinyScale?: boolean;
    isSleeping?: boolean;
  },
): void {
  const dir = facingRight ? 1 : -1;
  const cy2 = cy + anim.bodyY;

  // --- Floor Shadow (drawn relative to the ground) ---
  if (!anim.isSleeping) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(cx, cy2);
  ctx.scale(dir * scale, scale);

  const strokeStyle = '#1e293b';
  const lineWidth = 2.5;

  // --- Helper to stroke current path ---
  const applyStroke = () => {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  // --- Tail ---
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-15, -10);
  ctx.bezierCurveTo(-45, -45, -55, -75, -25, -85);
  ctx.lineWidth = 10;
  ctx.strokeStyle = color.tail;
  ctx.lineCap = 'round';
  ctx.stroke();
  // tail dark outline
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // --- Legs ---
  const legBend = anim.legBend ?? 0;
  [-12, 12].forEach((lx, i) => {
    const lg = i === 0 ? anim.legAngle : -anim.legAngle;
    ctx.save();
    ctx.translate(lx, 5);
    ctx.rotate(lg + legBend);
    
    // Leg gradient
    const legGrad = ctx.createLinearGradient(0, 0, 0, 34);
    legGrad.addColorStop(0, color.body);
    legGrad.addColorStop(1, color.ears);

    ctx.beginPath();
    ctx.roundRect(-8, 0, 16, 34, 8);
    ctx.fillStyle = legGrad;
    ctx.fill();
    applyStroke();
    
    // Feet paw
    ctx.beginPath();
    ctx.ellipse(0, 34, 11, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = color.head;
    ctx.fill();
    applyStroke();
    ctx.restore();
  });

  // --- Body & Outfit Gradients ---
  const bodyGrad = ctx.createLinearGradient(0, -68, 0, 8);
  bodyGrad.addColorStop(0, color.body);
  bodyGrad.addColorStop(1, color.ears);

  const outfitGrad = ctx.createLinearGradient(0, -50, 0, 8);
  outfitGrad.addColorStop(0, color.outfit);
  outfitGrad.addColorStop(1, color.outfitAccent);

  // --- Body ---
  ctx.beginPath();
  ctx.ellipse(0, -30, 30, 40, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  applyStroke();

  // --- Outfit ---
  ctx.beginPath();
  ctx.ellipse(0, -22, 24, 30, 0, 0, Math.PI * 2);
  ctx.fillStyle = outfitGrad;
  ctx.fill();
  applyStroke();

  // --- Left arm ---
  ctx.save();
  ctx.translate(-24, -40);
  ctx.rotate(anim.armAngle);
  ctx.beginPath();
  ctx.roundRect(-7, 0, 14, 30, 7);
  ctx.fillStyle = outfitGrad;
  ctx.fill();
  applyStroke();
  
  ctx.beginPath();
  ctx.arc(0, 32, 9, 0, Math.PI * 2);
  ctx.fillStyle = color.head;
  ctx.fill();
  applyStroke();
  ctx.restore();

  // --- Right arm (optional extra angle) ---
  ctx.save();
  ctx.translate(24, -40);
  ctx.rotate(anim.extraArm ?? -anim.armAngle * 0.5);
  ctx.beginPath();
  ctx.roundRect(-7, 0, 14, 30, 7);
  ctx.fillStyle = outfitGrad;
  ctx.fill();
  applyStroke();

  ctx.beginPath();
  ctx.arc(0, 32, 9, 0, Math.PI * 2);
  ctx.fillStyle = color.head;
  ctx.fill();
  applyStroke();
  ctx.restore();

  // --- Grandpa stick ---
  if (anim.useStick) {
    ctx.save();
    ctx.translate(28, -32);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 70);
    ctx.stroke();
    // highlight stick
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(1, 5);
    ctx.lineTo(1, 65);
    ctx.stroke();
    // Curved top
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 10, Math.PI, Math.PI * 1.7);
    ctx.stroke();
    ctx.restore();
  }

  // --- Head & Ears ---
  const headY = -82 + anim.headY;

  // --- Ears ---
  [[-18, headY - 24], [18, headY - 24]].forEach(([ex, ey]) => {
    ctx.beginPath();
    ctx.moveTo(ex - 12, ey + 8);
    ctx.lineTo(ex, ey - 20);
    ctx.lineTo(ex + 12, ey + 8);
    ctx.closePath();
    ctx.fillStyle = color.ears;
    ctx.fill();
    applyStroke();
    
    // inner ear
    ctx.beginPath();
    ctx.moveTo(ex - 6, ey + 4);
    ctx.lineTo(ex, ey - 10);
    ctx.lineTo(ex + 6, ey + 4);
    ctx.closePath();
    ctx.fillStyle = '#fda4af';
    ctx.fill();
  });

  // --- Head ---
  const headGrad = ctx.createRadialGradient(0, headY - 10, 6, 0, headY, 34);
  headGrad.addColorStop(0, '#ffffff');
  headGrad.addColorStop(0.3, color.head);
  headGrad.addColorStop(1, color.body);

  ctx.beginPath();
  ctx.arc(0, headY, 33, 0, Math.PI * 2);
  ctx.fillStyle = headGrad;
  ctx.fill();
  applyStroke();

  // --- Rosy Cheeks (premium cartoon blush) ---
  ctx.save();
  ctx.fillStyle = 'rgba(244, 63, 94, 0.35)'; // Rose blush
  ctx.beginPath();
  ctx.arc(-16, headY + 5, 6, 0, Math.PI * 2);
  ctx.arc(16, headY + 5, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- Eyes ---
  [[-11, headY - 7], [11, headY - 7]].forEach(([ex, ey]) => {
    ctx.beginPath();
    ctx.ellipse(ex, ey, 8, anim.eyeClosed ? 2 : 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = color.eyeWhite;
    ctx.fill();
    applyStroke();

    if (!anim.eyeClosed) {
      // pupil
      ctx.beginPath();
      ctx.arc(ex + 1.5, ey, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = color.eyePupil;
      ctx.fill();

      // eye highlights (sparkles)
      ctx.beginPath();
      ctx.arc(ex + 2.8, ey - 2.2, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // minor highlight
      ctx.beginPath();
      ctx.arc(ex + 0.2, ey + 2, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  });

  // --- Nose ---
  ctx.beginPath();
  ctx.arc(0, headY + 5, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = '#fda4af';
  ctx.fill();
  applyStroke();

  // --- Whiskers ---
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
  [[-7, headY + 6], [7, headY + 6]].forEach(([wx, wy], si) => {
    const d2 = si === 0 ? -1 : 1;
    [-1, 0, 1].forEach((row) => {
      ctx.beginPath();
      ctx.moveTo(wx, wy + row * 4);
      ctx.lineTo(wx + d2 * 28, wy + row * 4 - row * 1.5);
      ctx.stroke();
    });
  });

  // --- Mouth ---
  ctx.beginPath();
  if (anim.mouthOpen > 0.1) {
    ctx.ellipse(0, headY + 15, 7, anim.mouthOpen * 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = color.mouth;
    ctx.fill();
    applyStroke();
  } else {
    ctx.moveTo(-8, headY + 15);
    ctx.quadraticCurveTo(0, headY + 20, 8, headY + 15);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = color.mouth;
    ctx.stroke();
  }

  // --- Baby Pacifier or Bow detail ---
  if (anim.tinyScale) {
    ctx.save();
    ctx.translate(0, headY + 12);
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}
