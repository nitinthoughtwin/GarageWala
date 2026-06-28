// =============================================================
// Canvas Renderer — Upgraded for Phase 2
// Pure drawing module — no state mutation.
// Handles complex rendering of all layout object types with high aesthetics.
// =============================================================

import type { CharacterState, LayoutDefinition, LayoutObject, DialogueDef } from '../types';
import { drawCharacter } from '../characters/CharacterLibrary';
import type { CameraEngine } from '../camera/CameraEngine';

// ------------------------------------------------------------------
// Background Rendering (Per Layout name)
// ------------------------------------------------------------------
function drawBackground(
  ctx: CanvasRenderingContext2D,
  layout: LayoutDefinition,
  canvasW: number,
  canvasH: number
): void {
  const name = layout.name;

  if (name === 'Garden' || name === 'Park') {
    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvasH * 0.6);
    skyGrad.addColorStop(0, '#38bdf8');
    skyGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvasW, canvasH * 0.6);

    // Sun & Glow
    ctx.beginPath();
    ctx.arc(canvasW * 0.85, 75, 42, 0, Math.PI * 2);
    ctx.fillStyle = '#fde047';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(canvasW * 0.85, 75, 58, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(253, 224, 71, 0.15)';
    ctx.fill();

    // Clouds
    const drawCloud = (cx: number, cy: number, scale: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      [[-24, 0, 28], [0, -12, 24], [24, 0, 28], [12, 6, 18], [-12, 6, 18]].forEach(([x, y, r]) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    };
    drawCloud(180, 90, 1.0);
    drawCloud(480, 60, 0.8);
    drawCloud(720, 100, 0.7);

    // Ground Grass
    const grassGrad = ctx.createLinearGradient(0, canvasH * 0.6, 0, canvasH);
    grassGrad.addColorStop(0, '#22c55e');
    grassGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, canvasH * 0.6, canvasW, canvasH);

    // Grass lines for texture
    ctx.fillStyle = 'rgba(21, 128, 61, 0.15)';
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(0, canvasH * 0.6 + i * 25, canvasW, 10);
    }

    if (name === 'Garden') {
      // Cricket boundary rope
      ctx.setLineDash([12, 8]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(canvasW / 2, canvasH * 0.75, canvasW * 0.45, canvasH * 0.2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  } else if (name === 'Bedtime') {
    // Night sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvasH * 0.72);
    skyGrad.addColorStop(0, '#090d16');
    skyGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvasW, canvasH * 0.72);

    // Stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    [[120, 50], [280, 90], [540, 40], [720, 120], [890, 60], [200, 160], [620, 150]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 1.5 + 1, 0, Math.PI * 2);
      ctx.fill();
    });

    // Indoor floor (Dark wood)
    const floorGrad = ctx.createLinearGradient(0, canvasH * 0.72, 0, canvasH);
    floorGrad.addColorStop(0, '#2e1e0f');
    floorGrad.addColorStop(1, '#1a1008');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, canvasH * 0.72, canvasW, canvasH);

    // Skirting board
    ctx.fillStyle = '#150c05';
    ctx.fillRect(0, canvasH * 0.72, canvasW, 6);
  } else {
    // Indoor/Wall background (Kitchen, Living Room, School, Birthday, Market)
    let wallColor = '#fef3c7'; // default yellow
    let wallGradColor = '#fef9c3';
    let floorColor = '#b45309'; // default wood
    let floorGradColor = '#d97706';

    if (name === 'Living Room') {
      wallColor = '#1e3a8a'; // Deep blue
      wallGradColor = '#2563eb';
      floorColor = '#451a03'; // Rich dark wood
      floorGradColor = '#78350f';
    } else if (name === 'School') {
      wallColor = '#ea580c'; // Warm school orange
      wallGradColor = '#f97316';
      floorColor = '#78350f';
      floorGradColor = '#92400e';
    } else if (name === 'Birthday Party') {
      wallColor = '#db2777'; // Festive pink
      wallGradColor = '#f472b6';
      floorColor = '#15803d'; // Green party carpet
      floorGradColor = '#22c55e';
    } else if (name === 'Market') {
      wallColor = '#fed7aa'; // Pastel orange wall/sky
      wallGradColor = '#ffedd5';
      floorColor = '#854d0e'; // Earthy cobblestone floor
      floorGradColor = '#a16207';
    }

    // Draw Wall
    const wallGrad = ctx.createLinearGradient(0, 0, 0, canvasH * 0.7);
    wallGrad.addColorStop(0, wallGradColor);
    wallGrad.addColorStop(1, wallColor);
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, canvasW, canvasH * 0.7);

    // Draw Floor
    const floorGrad = ctx.createLinearGradient(0, canvasH * 0.7, 0, canvasH);
    floorGrad.addColorStop(0, floorGradColor);
    floorGrad.addColorStop(1, floorColor);
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, canvasH * 0.7, canvasW, canvasH);

    // Skirting
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, canvasH * 0.7, canvasW, 8);

    // Subtle indoor wallpapers
    if (name === 'Kitchen') {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.08)';
      for (let wx = 30; wx < canvasW; wx += 60) {
        for (let wy = 30; wy < canvasH * 0.7; wy += 60) {
          ctx.beginPath(); ctx.arc(wx, wy, 3, 0, Math.PI * 2); ctx.fill();
        }
      }
    } else if (name === 'Birthday Party') {
      // Draw party confetti on wall
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let i = 0; i < 40; i++) {
        const cx = (i * 27) % canvasW;
        const cy = (i * 13) % (canvasH * 0.65);
        ctx.fillRect(cx, cy, 6, 6);
      }
    }
  }
}

// ------------------------------------------------------------------
// Individual Object Renderer
// ------------------------------------------------------------------
function drawLayoutObject(ctx: CanvasRenderingContext2D, obj: LayoutObject): void {
  const { position: p, width: w, height: h, color } = obj;

  ctx.save();
  ctx.fillStyle = color ?? '#888';

  switch (obj.type) {
    case 'counter': {
      ctx.fillRect(p.x, p.y, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(p.x, p.y, w, 4);
      break;
    }

    case 'window': {
      ctx.fillStyle = '#78350f'; // Dark wood frame
      ctx.fillRect(p.x - 6, p.y - 6, w + 12, h + 12);
      ctx.fillStyle = color ?? '#bae6fd';
      ctx.fillRect(p.x, p.y, w, h);
      // Glass sheen
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + w * 0.4, p.y);
      ctx.lineTo(p.x, p.y + h * 0.4);
      ctx.closePath();
      ctx.fill();
      // Grid lines
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(p.x + w / 2, p.y);
      ctx.lineTo(p.x + w / 2, p.y + h);
      ctx.moveTo(p.x, p.y + h / 2);
      ctx.lineTo(p.x + w, p.y + h / 2);
      ctx.stroke();
      break;
    }

    case 'table': {
      ctx.fillStyle = color ?? '#92400e';
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, w, 18, 4);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      [[p.x + 15, p.y + 18], [p.x + w - 30, p.y + 18]].forEach(([lx, ly]) => {
        ctx.fillRect(lx, ly, 15, h - 18);
      });
      break;
    }

    case 'chair': {
      ctx.fillStyle = color ?? '#78350f';
      ctx.beginPath();
      ctx.roundRect(p.x, p.y + 25, w, 15, 3);
      ctx.fill();
      ctx.fillRect(p.x + 6, p.y, 8, 25);
      ctx.fillRect(p.x + w - 14, p.y, 8, 25);
      ctx.fillRect(p.x + 6, p.y, w - 12, 10);
      ctx.fillStyle = '#5c2d1e';
      [[p.x + 4, p.y + 40], [p.x + w - 12, p.y + 40]].forEach(([lx, ly]) => {
        ctx.fillRect(lx, ly, 8, h - 40);
      });
      break;
    }

    case 'fridge': {
      ctx.fillStyle = color ?? '#e5e7eb';
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, w, h, 6);
      ctx.fill();
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + h * 0.38);
      ctx.lineTo(p.x + w, p.y + h * 0.38);
      ctx.stroke();
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(p.x + w - 12, p.y + 20, 5, 30);
      ctx.fillRect(p.x + w - 12, p.y + h * 0.44, 5, 35);
      break;
    }

    case 'stove': {
      // Stove (Kitchen or used as a base for wickets in Garden)
      if (obj.id.startsWith('wickets')) {
        // Draw Wickets
        ctx.fillStyle = '#f59e0b'; // golden stumps
        const stumpW = 5;
        [-12, 0, 12].forEach((ox) => {
          ctx.fillRect(p.x + w / 2 + ox - stumpW / 2, p.y, stumpW, h);
        });
        // Bails
        ctx.fillStyle = '#d97706';
        ctx.fillRect(p.x + w / 2 - 15, p.y - 4, 13, 4);
        ctx.fillRect(p.x + w / 2 + 2, p.y - 4, 13, 4);
      } else {
        // Normal Stove
        ctx.fillStyle = color ?? '#374151';
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, w, h, 6);
        ctx.fill();
        ctx.fillStyle = '#1f2937';
        [[p.x + 25, p.y + 18], [p.x + w - 45, p.y + 18]].forEach(([bx, by]) => {
          ctx.beginPath();
          ctx.arc(bx, by, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(bx, by, 8, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
          ctx.fillStyle = '#1f2937';
        });
        // Pot
        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.roundRect(p.x + 12, p.y - 20, 40, 24, 3);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        [p.x + 22, p.x + 32, p.x + 42].forEach((sx) => {
          ctx.beginPath();
          ctx.moveTo(sx, p.y - 20);
          ctx.bezierCurveTo(sx - 3, p.y - 30, sx + 3, p.y - 35, sx, p.y - 45);
          ctx.stroke();
        });
      }
      break;
    }

    case 'plate': {
      ctx.beginPath();
      ctx.ellipse(p.x + w / 2, p.y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      break;
    }

    case 'cup': {
      // Cup (Kitchen or Cricket ball in Garden)
      if (obj.id === 'ball') {
        // Red Cricket Ball
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(p.x + w / 2, p.y + h / 2, w / 2, 0, Math.PI * 2);
        ctx.fill();
        // Seam
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x + w / 2, p.y + h / 2, w / 2 - 2, 0.2, Math.PI - 0.2);
        ctx.stroke();
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(p.x + w / 2 - 3, p.y + h / 2 - 3, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Normal Cup
        ctx.fillStyle = color ?? '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(p.x, p.y + h * 0.2, w, h * 0.8, [0, 0, 4, 4]);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(p.x + w / 2, p.y + h * 0.2, w / 2, h * 0.1, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a';
        ctx.fill();
      }
      break;
    }

    // --- Phase 2: Living Room ---
    case 'sofa': {
      ctx.fillStyle = color ?? '#dc2626'; // couch red
      // Backrest
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, w, h - 20, 8);
      ctx.fill();
      // Cushions / Seat
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.roundRect(p.x + 10, p.y + 40, w - 20, h - 45, 6);
      ctx.fill();
      // Armrests
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.roundRect(p.x - 10, p.y + 30, 20, h - 30, 8);
      ctx.roundRect(p.x + w - 10, p.y + 30, 20, h - 30, 8);
      ctx.fill();
      break;
    }

    case 'tv': {
      // Stand
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(p.x + w / 2 - 20, p.y + h - 20, 40, 20);
      ctx.fillRect(p.x + w / 2 - 40, p.y + h - 5, 80, 5);
      // Screen Frame
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, w, h - 20, 6);
      ctx.fill();
      // Screen Glass
      ctx.fillStyle = '#111827';
      ctx.fillRect(p.x + 8, p.y + 8, w - 16, h - 36);
      // Small screen detail/shine
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath();
      ctx.moveTo(p.x + 8, p.y + 8);
      ctx.lineTo(p.x + w * 0.6, p.y + 8);
      ctx.lineTo(p.x + 8, p.y + h - 28);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'lamp': {
      // Base/Stick
      ctx.fillStyle = '#9ca3af';
      ctx.fillRect(p.x + w / 2 - 3, p.y + 40, 6, h - 40);
      ctx.fillRect(p.x + w / 2 - 20, p.y + h - 5, 40, 5);
      // Lampshade
      ctx.fillStyle = color ?? '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(p.x + w / 2 - 25, p.y + 40);
      ctx.lineTo(p.x + w / 2 - 15, p.y);
      ctx.lineTo(p.x + w / 2 + 15, p.y);
      ctx.lineTo(p.x + w / 2 + 25, p.y + 40);
      ctx.closePath();
      ctx.fill();
      // Light glow polygon (semi-transparent)
      ctx.fillStyle = 'rgba(252,211,77,0.12)';
      ctx.beginPath();
      ctx.moveTo(p.x + w / 2 - 20, p.y + 40);
      ctx.lineTo(p.x + w / 2 + 20, p.y + 40);
      ctx.lineTo(p.x + w / 2 + 180, p.y + h);
      ctx.lineTo(p.x + w / 2 - 180, p.y + h);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'bookshelf': {
      ctx.fillStyle = color ?? '#7c2d12'; // Mahogany
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, w, h, 4);
      ctx.fill();
      // Shelves
      ctx.fillStyle = '#451a03';
      ctx.fillRect(p.x + 6, p.y + h * 0.3, w - 12, 6);
      ctx.fillRect(p.x + 6, p.y + h * 0.65, w - 12, 6);
      // Colorful books
      const bookColors = ['#ef4444', '#3b82f6', '#10b981', '#fbbf24', '#a855f7', '#f97316'];
      const drawBooks = (sy: number) => {
        let bx = p.x + 10;
        while (bx < p.x + w - 20) {
          const bw = Math.random() * 8 + 6;
          const bh = Math.random() * 25 + 30;
          ctx.fillStyle = bookColors[Math.floor(Math.random() * bookColors.length)];
          ctx.fillRect(bx, sy - bh, bw, bh);
          bx += bw + 3;
        }
      };
      drawBooks(p.y + h * 0.3);
      drawBooks(p.y + h * 0.65);
      drawBooks(p.y + h - 8);
      break;
    }

    case 'carpet': {
      ctx.fillStyle = color ?? '#ec4899';
      ctx.beginPath();
      ctx.ellipse(p.x + w / 2, p.y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Pattern
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(p.x + w / 2, p.y + h / 2, w * 0.4, h * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    // --- Phase 2: Park ---
    case 'tree': {
      const cx = p.x + w / 2;
      // Trunk
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(cx - 10, p.y + h * 0.5, 20, h * 0.5);
      // Leaves (multiple green circles)
      ctx.fillStyle = color ?? '#15803d';
      [[0, -10, w * 0.5], [-w * 0.25, h * 0.1, w * 0.38], [w * 0.25, h * 0.1, w * 0.38]].forEach(([ox, oy, r]) => {
        ctx.beginPath();
        ctx.arc(cx + ox, p.y + h * 0.35 + oy, r, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    case 'bush': {
      // Re-use bush logic
      const cx = p.x + w / 2;
      const cy = p.y + h * 0.6;
      ctx.fillStyle = color ?? '#22c55e';
      [[0, 0, w * 0.45], [-w * 0.25, h * 0.1, w * 0.35], [w * 0.25, h * 0.1, w * 0.35]].forEach(([ox, oy, r]) => {
        ctx.beginPath();
        ctx.arc(cx + ox, cy + oy, r, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    case 'pond': {
      ctx.fillStyle = color ?? '#60a5fa'; // Blue pond water
      ctx.beginPath();
      ctx.ellipse(p.x + w / 2, p.y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 3;
      ctx.stroke();
      // Ripples
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(p.x + w / 2 - 10, p.y + h / 2, w * 0.3, h * 0.25, 0, 0, Math.PI * 1.5);
      ctx.stroke();
      break;
    }

    case 'bench': {
      ctx.fillStyle = color ?? '#92400e';
      // Legs
      ctx.fillRect(p.x + 20, p.y + h * 0.4, 12, h * 0.6);
      ctx.fillRect(p.x + w - 32, p.y + h * 0.4, 12, h * 0.6);
      // Seat
      ctx.beginPath();
      ctx.roundRect(p.x, p.y + h * 0.4, w, 12, 2);
      ctx.fill();
      // Backrest
      ctx.fillRect(p.x, p.y, w, 15);
      ctx.fillRect(p.x + 20, p.y, 8, h * 0.4);
      ctx.fillRect(p.x + w - 28, p.y, 8, h * 0.4);
      break;
    }

    case 'swing': {
      // Swing A-frame
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(p.x + 20, p.y + h);
      ctx.lineTo(p.x + w / 2, p.y);
      ctx.lineTo(p.x + w - 20, p.y + h);
      ctx.stroke();
      // Chains
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x + w / 2 - 20, p.y);
      ctx.lineTo(p.x + w / 2 - 20, p.y + h * 0.65);
      ctx.moveTo(p.x + w / 2 + 20, p.y);
      ctx.lineTo(p.x + w / 2 + 20, p.y + h * 0.65);
      ctx.stroke();
      // Swing Seat
      ctx.fillStyle = '#b45309';
      ctx.fillRect(p.x + w / 2 - 30, p.y + h * 0.65, 60, 10);
      break;
    }

    case 'flower': {
      const cx = p.x + w / 2;
      // Stem
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, p.y + h);
      ctx.lineTo(cx, p.y + 12);
      ctx.stroke();
      // Petals
      ctx.fillStyle = color ?? '#ef4444';
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        const px = cx + Math.cos(angle) * 8;
        const py = p.y + 12 + Math.sin(angle) * 8;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      // Center
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(cx, p.y + 12, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // --- Phase 2: School classroom ---
    case 'blackboard': {
      ctx.fillStyle = '#1e293b'; // dark border
      ctx.fillRect(p.x - 8, p.y - 8, w + 16, h + 16);
      ctx.fillStyle = color ?? '#065f46'; // blackboard green
      ctx.fillRect(p.x, p.y, w, h);
      // Chalk writings
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 18px "Space Grotesk"';
      ctx.fillText('A B C', p.x + 30, p.y + 40);
      ctx.fillText('1 + 1 = 2', p.x + 30, p.y + 80);
      // Chalk tray
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(p.x - 8, p.y + h, w + 16, 8);
      break;
    }

    case 'desk': {
      ctx.fillStyle = color ?? '#b45309';
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, w, 15, 3);
      ctx.fill();
      // Legs
      ctx.fillStyle = '#451a03';
      ctx.fillRect(p.x + 10, p.y + 15, 12, h - 15);
      ctx.fillRect(p.x + w - 22, p.y + 15, 12, h - 15);
      break;
    }

    case 'bookbag': {
      ctx.fillStyle = color ?? '#ef4444';
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, w, h, 6);
      ctx.fill();
      // Straps / Pocket
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(p.x + 6, p.y + 12, w - 12, h - 18);
      break;
    }

    // --- Phase 2: Birthday Party ---
    case 'banner': {
      // Birthday bunting flags
      const segments = 10;
      const segW = w / segments;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(p.x + w / 2, p.y + 30, p.x + w, p.y);
      ctx.stroke();

      const flagColors = ['#ef4444', '#3b82f6', '#10b981', '#fbbf24', '#a855f7'];
      for (let i = 0; i < segments; i++) {
        const tx = p.x + i * segW + segW / 2;
        // Approximate quadratic curve Y position
        const t = (i + 0.5) / segments;
        const ty = p.y + 4 * t * (1 - t) * 30;

        ctx.fillStyle = flagColors[i % flagColors.length];
        ctx.beginPath();
        ctx.moveTo(tx - segW / 2, ty);
        ctx.lineTo(tx + segW / 2, ty);
        ctx.lineTo(tx, ty + 24);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case 'cake': {
      // 2 tiers cake
      // Bottom tier
      ctx.fillStyle = '#fbcfe8'; // Pink frost
      ctx.beginPath();
      ctx.roundRect(p.x + 10, p.y + 25, w - 20, 40, [4, 4, 0, 0]);
      ctx.fill();
      // Top tier
      ctx.fillStyle = '#fce7f3';
      ctx.beginPath();
      ctx.roundRect(p.x + 22, p.y + 5, w - 44, 20, [4, 4, 0, 0]);
      ctx.fill();
      // Sprinkles / frosting lines
      ctx.fillStyle = '#db2777';
      ctx.fillRect(p.x + 10, p.y + 35, w - 20, 4);
      ctx.fillRect(p.x + 22, p.y + 12, w - 44, 3);
      // Candles
      ctx.fillStyle = '#fbbf24';
      [[p.x + w / 2 - 12, p.y - 8], [p.x + w / 2, p.y - 12], [p.x + w / 2 + 12, p.y - 8]].forEach(([cx2, cy2]) => {
        ctx.fillRect(cx2 - 2, cy2, 4, 15);
        // Fire
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(cx2, cy2 - 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
      });
      break;
    }

    case 'gift': {
      ctx.fillStyle = color ?? '#3b82f6';
      ctx.fillRect(p.x, p.y + 10, w, h - 10);
      // Ribbon cross
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(p.x + w / 2 - 5, p.y + 10, 10, h - 10);
      ctx.fillRect(p.x, p.y + h / 2 + 2, w, 8);
      // Bow on top
      ctx.beginPath();
      ctx.arc(p.x + w / 2 - 6, p.y + 6, 6, 0, Math.PI * 2);
      ctx.arc(p.x + w / 2 + 6, p.y + 6, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'balloon': {
      const cx = p.x + w / 2;
      const cy = p.y + h * 0.4;
      // String
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy + h * 0.4);
      ctx.quadraticCurveTo(cx - 15, cy + h * 0.65, cx, p.y + h);
      ctx.stroke();
      // Balloon
      ctx.fillStyle = color ?? '#ef4444';
      ctx.beginPath();
      ctx.ellipse(cx, cy, w / 2, h * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      // Knot
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy + h * 0.35);
      ctx.lineTo(cx + 4, cy + h * 0.35);
      ctx.lineTo(cx, cy + h * 0.35 + 5);
      ctx.closePath();
      ctx.fill();
      break;
    }

    // --- Phase 2: Bedtime ---
    case 'moon': {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(p.x + w / 2, p.y + h / 2, w / 2, -Math.PI / 2, Math.PI / 2);
      // clip crescent
      ctx.arc(p.x + w / 2 + 8, p.y + h / 2, w / 2 - 4, Math.PI / 2, -Math.PI / 2, true);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'bed': {
      // Wood frame
      ctx.fillStyle = '#78350f';
      ctx.fillRect(p.x, p.y + h - 35, w, 20); // main frame
      ctx.fillRect(p.x, p.y + h - 50, 15, 50); // headboard left
      ctx.fillRect(p.x + w - 15, p.y + h - 25, 15, 25); // footboard right
      // Mattress
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(p.x + 15, p.y + h - 45, w - 30, 15);
      // Pillow
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(p.x + 25, p.y + h - 55, 45, 12, 3);
      ctx.fill();
      // Blanket
      ctx.fillStyle = color ?? '#3b82f6';
      ctx.beginPath();
      ctx.roundRect(p.x + 70, p.y + h - 50, w - 85, 20, 2);
      ctx.fill();
      break;
    }

    // --- Phase 2: Market ---
    case 'stall': {
      // Table base
      ctx.fillStyle = '#b45309';
      ctx.fillRect(p.x + 10, p.y + h - 60, w - 20, 60);
      // Pillars
      ctx.fillStyle = '#78350f';
      ctx.fillRect(p.x + 15, p.y, 8, h - 60);
      ctx.fillRect(p.x + w - 23, p.y, 8, h - 60);
      // Awning
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(p.x, p.y, w, 25);
      ctx.fillStyle = '#ffffff';
      const stripeW = w / 6;
      for (let i = 1; i < 6; i += 2) {
        ctx.fillRect(p.x + i * stripeW, p.y, stripeW, 25);
      }
      break;
    }

    case 'umbrella': {
      // Stick
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(p.x + w / 2 - 4, p.y + h * 0.4, 8, h * 0.6);
      // Canopy
      ctx.fillStyle = color ?? '#ef4444';
      ctx.beginPath();
      ctx.arc(p.x + w / 2, p.y + h * 0.45, w / 2, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      // Alternate stripes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(p.x + w / 2, p.y + h * 0.45);
      ctx.arc(p.x + w / 2, p.y + h * 0.45, w / 2, Math.PI + 0.5, Math.PI + 1.1);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(p.x + w / 2, p.y + h * 0.45);
      ctx.arc(p.x + w / 2, p.y + h * 0.45, w / 2, Math.PI + 2.0, Math.PI + 2.6);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'basket': {
      ctx.fillStyle = color ?? '#d97706'; // wicker brown
      ctx.beginPath();
      ctx.roundRect(p.x, p.y + h * 0.3, w, h * 0.7, [0, 0, 8, 8]);
      ctx.fill();
      // Fruit (red apples inside)
      ctx.fillStyle = '#ef4444';
      [[8, 10], [w / 2, 8], [w - 12, 11], [15, 6], [w - 18, 6]].forEach(([ox, oy]) => {
        ctx.beginPath();
        ctx.arc(p.x + ox, p.y + h * 0.3 - oy + 10, 8, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    default: {
      ctx.fillRect(p.x, p.y, w, h);
    }
  }

  ctx.restore();
}

// Helper to draw a speech bubble
function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number
): void {
  ctx.save();
  ctx.font = '500 13px sans-serif';
  
  // Wrap text
  const maxWidth = 180;
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  // Calculate bubble dimensions
  const lineHeight = 16;
  const paddingX = 12;
  const paddingY = 8;
  let maxLineWidth = 0;
  
  for (const line of lines) {
    const w = ctx.measureText(line).width;
    if (w > maxLineWidth) maxLineWidth = w;
  }
  
  const bubbleW = maxLineWidth + paddingX * 2;
  const bubbleH = lines.length * lineHeight + paddingY * 2;
  
  // Position bubble above character head (x, y is top of head)
  const bx = x - bubbleW / 2;
  const by = y - bubbleH - 12; // 12px gap

  // Draw shadow
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;

  // Draw bubble body
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(bx, by, bubbleW, bubbleH, 8);
  ctx.fill();

  // Reset shadow for border & text
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Draw pointer tail (triangle)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(x - 8, by + bubbleH);
  ctx.lineTo(x + 8, by + bubbleH);
  ctx.lineTo(x, by + bubbleH + 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Draw text
  ctx.fillStyle = '#1e293b';
  lines.forEach((line, idx) => {
    ctx.fillText(line, bx + paddingX, by + paddingY + idx * lineHeight + 11);
  });

  ctx.restore();
}

// Helper to draw transition overlay
function drawTransitionOverlay(
  ctx: CanvasRenderingContext2D,
  type: 'fade' | 'iris' | 'cut',
  progress: number,
  w: number,
  h: number
): void {
  if (progress >= 1.0 || progress <= 0) return;
  
  ctx.save();
  ctx.fillStyle = '#000000';

  if (type === 'fade') {
    const opacity = 1 - progress;
    ctx.globalAlpha = opacity;
    ctx.fillRect(0, 0, w, h);
  } else if (type === 'iris') {
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    const maxRadius = Math.sqrt(w * w + h * h) / 2;
    const r = maxRadius * progress;
    ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  camera: CameraEngine,
  layout: LayoutDefinition,
  characters: CharacterState[],
  currentTime: number,
  canvasW: number,
  canvasH: number,
  dialogues: DialogueDef[] = [],
  transitionType?: 'fade' | 'iris' | 'cut',
  transitionProgress?: number
): void {
  // 1. Clear
  ctx.clearRect(0, 0, canvasW, canvasH);

  // 2. Apply camera transform
  camera.applyTransform(ctx);

  // 3. Draw background
  drawBackground(ctx, layout, canvasW, canvasH);

  // 4. Draw layout objects sorted by zIndex
  const sorted = [...layout.objects].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  for (const obj of sorted) {
    drawLayoutObject(ctx, obj);
  }

  // 5. Draw characters sorted by Y
  const sortedChars = [...characters].sort((a, b) => a.position.y - b.position.y);
  for (const char of sortedChars) {
    drawCharacter(ctx, char, currentTime);
  }

  // Find currently active dialogues
  const activeDialogues = dialogues.filter(
    (d) => currentTime >= d.start && currentTime <= d.end
  );

  // 6. Draw Speech Bubbles (under camera transform so they scale with zoom)
  activeDialogues.forEach((d) => {
    const speaker = characters.find((c) => c.id === d.characterId);
    if (speaker) {
      const headYOffset = speaker.species === 'rabbit' ? -80 : -85;
      const headX = speaker.position.x;
      const headY = speaker.position.y + headYOffset * speaker.scale;
      drawSpeechBubble(ctx, d.text, headX, headY);
    }
  });

  // 7. Reset transform for HUD and Subtitles
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // 8. Render Subtitles overlay at the bottom
  if (activeDialogues.length > 0) {
    ctx.save();
    
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, canvasH - 55, canvasW, 55);
    
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, canvasH - 55, canvasW, 2);
    
    activeDialogues.forEach((d) => {
      const cleanName = d.characterId.replace(/([A-Z])/g, ' $1').trim();
      
      ctx.textAlign = 'center';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(cleanName, canvasW / 2, canvasH - 34);

      ctx.font = '500 14px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`"${d.text}"`, canvasW / 2, canvasH - 15);
    });

    ctx.restore();
  }

  // 8.5 Draw Watermark (Screen Space)
  ctx.save();
  ctx.textAlign = 'right';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 3;
  ctx.fillText('🎬 DIRECTOR.AI POC', canvasW - 12, 22);
  ctx.restore();

  // 9. Draw Transition Overlay
  if (transitionType && transitionProgress !== undefined) {
    drawTransitionOverlay(ctx, transitionType, transitionProgress, canvasW, canvasH);
  }
}

// ------------------------------------------------------------------
// FPS counter
// ------------------------------------------------------------------
export function drawFPS(ctx: CanvasRenderingContext2D, fps: number): void {
  ctx.save();
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(8, 8, 72, 22);
  ctx.fillStyle = '#a3e635';
  ctx.fillText(`FPS: ${fps.toFixed(0)}`, 14, 24);
  ctx.restore();
}
