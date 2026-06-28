// =============================================================
// Rabbit Family — 3 Characters (Phase 7 — High Fidelity Update)
// Papa Rabbit, Mama Rabbit, Kid Rabbit
// Drawn procedurally — long floppy ears, rosy cheeks, outlines,
// floor shadows, and gradients.
// =============================================================

import type { CharacterColors, CharacterProfile } from '../types';

export const RABBIT_COLORS: Record<string, CharacterColors> = {
  PapaRabbit: {
    body:         '#e2e8f0',
    head:         '#f1f5f9',
    ears:         '#cbd5e1',
    eyeWhite:     '#ffffff',
    eyePupil:     '#dc2626',
    mouth:        '#64748b',
    tail:         '#f8fafc',
    outfit:       '#1e3a8a',
    outfitAccent: '#172554',
  },
  MamaRabbit: {
    body:         '#fce7f3',
    head:         '#fdf2f8',
    ears:         '#fbcfe8',
    eyeWhite:     '#ffffff',
    eyePupil:     '#be185d',
    mouth:        '#9f1239',
    tail:         '#fff0f6',
    outfit:       '#16a34a',
    outfitAccent: '#14532d',
  },
  KidRabbit: {
    body:         '#ccfbf1',
    head:         '#f0fdfa',
    ears:         '#99f6e4',
    eyeWhite:     '#ffffff',
    eyePupil:     '#0d9488',
    mouth:        '#115e59',
    tail:         '#f0fdf4',
    outfit:       '#ea580c',
    outfitAccent: '#c2410c',
  },
};

export const RABBIT_SCALES: Record<string, number> = {
  PapaRabbit: 1.0,
  MamaRabbit: 0.9,
  KidRabbit:  0.68,
};

export const RABBIT_PROFILES: CharacterProfile[] = [
  { id: 'PapaRabbit', species: 'rabbit', displayName: 'Papa Rabbit', family: 'Rabbit Family', role: 'Father', signature: 'read'   },
  { id: 'MamaRabbit', species: 'rabbit', displayName: 'Mama Rabbit', family: 'Rabbit Family', role: 'Mother', signature: 'garden' },
  { id: 'KidRabbit',  species: 'rabbit', displayName: 'Kid Rabbit',  family: 'Rabbit Family', role: 'Child',  signature: 'hop'    },
];

export function drawRabbit(
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
    hopHeight?: number;
    holdNewspaper?: boolean;
    isSleeping?: boolean;
  },
): void {
  const dir    = facingRight ? 1 : -1;
  const hopY   = anim.hopHeight ?? 0;
  const cy2    = cy + anim.bodyY + hopY;

  // --- Floor Shadow ---
  if (!anim.isSleeping) {
    ctx.save();
    ctx.translate(cx, cy); // Ground level shadow stays grounded
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.ellipse(0, 0, 34, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(cx, cy2);
  ctx.scale(dir * scale, scale);

  const strokeStyle = '#1e293b';
  const lineWidth = 2.5;

  const applyStroke = () => {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  // --- Fluffy round tail (drawn behind body) ---
  ctx.save();
  ctx.beginPath();
  ctx.arc(-22, -15, 17, 0, Math.PI * 2);
  ctx.fillStyle = color.tail;
  ctx.fill();
  applyStroke();
  
  // fluffy details
  ctx.beginPath();
  ctx.arc(-24, -13, 9, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fill();
  ctx.restore();

  // --- Legs ---
  const legBend = anim.legBend ?? 0;
  [-11, 11].forEach((lx, i) => {
    const lg = i === 0 ? anim.legAngle : -anim.legAngle;
    ctx.save();
    ctx.translate(lx, 6);
    ctx.rotate(lg + legBend);
    
    // Leg Gradient
    const legGrad = ctx.createLinearGradient(0, 0, 0, 36);
    legGrad.addColorStop(0, color.body);
    legGrad.addColorStop(1, color.ears);

    ctx.beginPath();
    ctx.roundRect(-8, 0, 16, 34, 8);
    ctx.fillStyle = legGrad;
    ctx.fill();
    applyStroke();
    
    // Rabbit Feet (longer than cats)
    ctx.beginPath();
    ctx.ellipse(2, 34, 13, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = color.head;
    ctx.fill();
    applyStroke();
    ctx.restore();
  });

  // --- Gradients for Body & Outfit ---
  const bodyGrad = ctx.createLinearGradient(0, -65, 0, 8);
  bodyGrad.addColorStop(0, color.body);
  bodyGrad.addColorStop(1, color.ears);

  const outfitGrad = ctx.createLinearGradient(0, -48, 0, 8);
  outfitGrad.addColorStop(0, color.outfit);
  outfitGrad.addColorStop(1, color.outfitAccent);

  // --- Body ---
  ctx.beginPath();
  ctx.ellipse(0, -25, 28, 38, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  applyStroke();

  // --- Outfit ---
  ctx.beginPath();
  ctx.ellipse(0, -18, 22, 28, 0, 0, Math.PI * 2);
  ctx.fillStyle = outfitGrad;
  ctx.fill();
  applyStroke();

  // --- Left arm ---
  ctx.save();
  ctx.translate(-22, -36);
  ctx.rotate(anim.armAngle);
  ctx.beginPath();
  ctx.roundRect(-6, 0, 12, 28, 6);
  ctx.fillStyle = outfitGrad;
  ctx.fill();
  applyStroke();
  
  ctx.beginPath();
  ctx.ellipse(0, 30, 8, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = color.head;
  ctx.fill();
  applyStroke();
  ctx.restore();

  // --- Right arm (newspaper or default) ---
  ctx.save();
  ctx.translate(22, -36);
  ctx.rotate(anim.extraArm ?? -anim.armAngle * 0.4);
  ctx.beginPath();
  ctx.roundRect(-6, 0, 12, 28, 6);
  ctx.fillStyle = outfitGrad;
  ctx.fill();
  applyStroke();
  
  ctx.beginPath();
  ctx.ellipse(0, 30, 8, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = color.head;
  ctx.fill();
  applyStroke();

  // --- Newspaper Prop ---
  if (anim.holdNewspaper) {
    ctx.save();
    ctx.translate(8, 24);
    ctx.rotate(0.25);
    
    // Shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
    ctx.fillRect(-2, 2, 38, 26);

    // Paper sheets
    ctx.fillStyle = '#f8fafc'; // clean paper white
    ctx.beginPath();
    ctx.roundRect(0, 0, 36, 24, 3);
    ctx.fill();
    applyStroke();

    // Newspaper title header
    ctx.fillStyle = '#475569';
    ctx.fillRect(4, 3, 28, 4);

    // Mock print lines
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(4, 9, 28, 2);
    ctx.fillRect(4, 13, 20, 2);
    ctx.fillRect(4, 17, 24, 2);
    
    ctx.restore();
  }
  ctx.restore();

  // --- Head & Ears ---
  const headY = -76 + anim.headY;

  // --- Long Floppy Droopy Ears ---
  [[-15, headY - 20], [15, headY - 20]].forEach(([ex, ey], idx) => {
    ctx.save();
    ctx.translate(ex, ey);
    // Droop ears: tilt outwards
    const tilt = idx === 0 ? -0.35 : 0.35;
    ctx.rotate(tilt);

    // Outer ear
    ctx.beginPath();
    ctx.roundRect(-10, -32, 20, 42, 10);
    ctx.fillStyle = color.ears;
    ctx.fill();
    applyStroke();

    // Inner ear
    ctx.beginPath();
    ctx.roundRect(-5, -28, 10, 34, 5);
    ctx.fillStyle = '#fda4af';
    ctx.fill();
    ctx.restore();
  });

  // --- Head ---
  const headGrad = ctx.createRadialGradient(0, headY - 10, 6, 0, headY, 34);
  headGrad.addColorStop(0, '#ffffff');
  headGrad.addColorStop(0.3, color.head);
  headGrad.addColorStop(1, color.body);

  ctx.beginPath();
  ctx.arc(0, headY, 34, 0, Math.PI * 2);
  ctx.fillStyle = headGrad;
  ctx.fill();
  applyStroke();

  // --- Rosy Cheeks ---
  ctx.save();
  ctx.fillStyle = 'rgba(244, 63, 94, 0.32)'; // soft pink
  ctx.beginPath();
  ctx.arc(-18, headY + 6, 6.5, 0, Math.PI * 2);
  ctx.arc(18, headY + 6, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- Eyes ---
  [[-11, headY - 7], [11, headY - 7]].forEach(([ex, ey]) => {
    ctx.beginPath();
    ctx.ellipse(ex, ey, 8.5, anim.eyeClosed ? 2 : 9.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = color.eyeWhite;
    ctx.fill();
    applyStroke();

    if (!anim.eyeClosed) {
      // pupil (colorful red or green)
      ctx.beginPath();
      ctx.arc(ex + 1.2, ey, 4.8, 0, Math.PI * 2);
      ctx.fillStyle = color.eyePupil;
      ctx.fill();

      // main highlight sparkle
      ctx.beginPath();
      ctx.arc(ex + 2.5, ey - 2, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // minor highlight
      ctx.beginPath();
      ctx.arc(ex + 0.1, ey + 2, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  });

  // --- Nose (rounder for rabbits) ---
  ctx.beginPath();
  ctx.arc(0, headY + 6, 6, 0, Math.PI * 2);
  ctx.fillStyle = color.eyePupil; // matches pupil accent color
  ctx.fill();
  applyStroke();

  // --- Mouth ---
  ctx.beginPath();
  if (anim.mouthOpen > 0.1) {
    ctx.ellipse(0, headY + 16, 7, anim.mouthOpen * 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = color.mouth;
    ctx.fill();
    applyStroke();
  } else {
    ctx.moveTo(-7, headY + 16);
    ctx.quadraticCurveTo(0, headY + 21, 7, headY + 16);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = color.mouth;
    ctx.stroke();
  }

  ctx.restore();
}
