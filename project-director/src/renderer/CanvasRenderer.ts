// =============================================================
// Canvas Renderer
// Pure drawing module — no state mutation.
// Takes the current engine state and renders one frame.
// =============================================================

import type { CharacterState, LayoutDefinition, LayoutObject } from '../types';
import { drawCharacter } from '../characters/CharacterLibrary';
import type { CameraEngine } from '../camera/CameraEngine';

// ------------------------------------------------------------------
// Background & Layout Rendering
// ------------------------------------------------------------------

function drawLayoutObject(ctx: CanvasRenderingContext2D, obj: LayoutObject): void {
  const { position: p, width: w, height: h, color } = obj;

  ctx.save();
  ctx.fillStyle = color ?? '#888';

  switch (obj.type) {
    case 'counter': {
      ctx.fillRect(p.x, p.y, w, h);
      // subtle top highlight
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(p.x, p.y, w, 4);
      break;
    }

    case 'window': {
      // Frame
      ctx.fillStyle = '#92400e';
      ctx.fillRect(p.x - 8, p.y - 8, w + 16, h + 16);
      // Glass
      ctx.fillStyle = color ?? '#bae6fd';
      ctx.fillRect(p.x, p.y, w, h);
      // Sky gradient inside window
      const skyGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + h);
      skyGrad.addColorStop(0, '#7dd3fc');
      skyGrad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(p.x, p.y, w, h);
      // Window cross
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(p.x + w / 2, p.y);
      ctx.lineTo(p.x + w / 2, p.y + h);
      ctx.moveTo(p.x, p.y + h / 2);
      ctx.lineTo(p.x + w, p.y + h / 2);
      ctx.stroke();
      // Sun in window
      ctx.beginPath();
      ctx.arc(p.x + 40, p.y + 30, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#fde047';
      ctx.fill();
      break;
    }

    case 'table': {
      // Table top
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, w, 20, 4);
      ctx.fill();
      // Table legs
      ctx.fillStyle = '#78350f';
      [[p.x + 10, p.y + 20], [p.x + w - 25, p.y + 20]].forEach(([lx, ly]) => {
        ctx.fillRect(lx, ly, 15, h - 20);
      });
      break;
    }

    case 'chair': {
      // Chair seat
      ctx.fillStyle = color ?? '#78350f';
      ctx.beginPath();
      ctx.roundRect(p.x, p.y + 30, w, 18, 3);
      ctx.fill();
      // Chair back
      ctx.fillRect(p.x + 8, p.y, 10, 34);
      ctx.fillRect(p.x + w - 18, p.y, 10, 34);
      ctx.fillRect(p.x + 8, p.y, w - 16, 12);
      // Chair legs
      ctx.fillStyle = '#5c2d1e';
      [[p.x + 5, p.y + 48], [p.x + w - 20, p.y + 48]].forEach(([lx, ly]) => {
        ctx.fillRect(lx, ly, 8, 42);
      });
      break;
    }

    case 'stove': {
      // Stove body
      ctx.fillStyle = color ?? '#374151';
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, w, h, 6);
      ctx.fill();
      // Burners
      ctx.fillStyle = '#1f2937';
      [[p.x + 30, p.y + 20], [p.x + 90, p.y + 20]].forEach(([bx, by]) => {
        ctx.beginPath();
        ctx.arc(bx, by, 16, 0, Math.PI * 2);
        ctx.fill();
        // Burner ring (hot glow)
        ctx.beginPath();
        ctx.arc(bx, by, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.fillStyle = '#1f2937';
      });
      // Pot on left burner
      ctx.fillStyle = '#6b7280';
      ctx.beginPath();
      ctx.roundRect(p.x + 10, p.y - 28, 46, 30, 4);
      ctx.fill();
      // Steam
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth   = 3;
      ctx.lineCap     = 'round';
      [p.x + 22, p.x + 33, p.x + 44].forEach((sx) => {
        ctx.beginPath();
        ctx.moveTo(sx, p.y - 28);
        ctx.bezierCurveTo(sx - 5, p.y - 45, sx + 5, p.y - 52, sx, p.y - 65);
        ctx.stroke();
      });
      break;
    }

    case 'fridge': {
      ctx.fillStyle = color ?? '#e5e7eb';
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, w, h, 8);
      ctx.fill();
      // Fridge door line
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x + 5, p.y + h * 0.4);
      ctx.lineTo(p.x + w - 5, p.y + h * 0.4);
      ctx.stroke();
      // Handle
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(p.x + w - 15, p.y + 20, 6, 40);
      ctx.fillRect(p.x + w - 15, p.y + h * 0.45, 6, 40);
      break;
    }

    case 'plate': {
      ctx.beginPath();
      ctx.ellipse(p.x + w / 2, p.y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#f9fafb';
      ctx.fill();
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Food on plate
      ctx.beginPath();
      ctx.ellipse(p.x + w / 2, p.y + h / 2, w / 3, h / 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      break;
    }

    case 'cup': {
      ctx.fillStyle = color ?? '#fbbf24';
      ctx.beginPath();
      ctx.roundRect(p.x, p.y + h * 0.3, w, h * 0.7, [0, 0, 4, 4]);
      ctx.fill();
      // Cup top opening
      ctx.beginPath();
      ctx.ellipse(p.x + w / 2, p.y + h * 0.3, w / 2, h * 0.15, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fde68a';
      ctx.fill();
      // Handle
      ctx.beginPath();
      ctx.arc(p.x + w + 4, p.y + h * 0.55, 8, -Math.PI / 2, Math.PI / 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = color ?? '#fbbf24';
      ctx.stroke();
      break;
    }

    default: {
      ctx.fillRect(p.x, p.y, w, h);
    }
  }

  // ---- Garden-specific overrides (keyed by object ID) ----
  if (obj.id.startsWith('tree')) {
    ctx.save();
    const cx = p.x + w / 2;
    // Trunk
    ctx.fillStyle = '#92400e';
    ctx.fillRect(cx - 8, p.y + h * 0.6, 16, h * 0.4);
    // Canopy — 3 layered circles
    [[0, 0, w * 0.5], [-w * 0.22, h * 0.15, w * 0.38], [w * 0.22, h * 0.15, w * 0.38]].forEach(([ox, oy, r]) => {
      ctx.beginPath();
      ctx.arc(cx + ox, p.y + h * 0.4 + oy, r, 0, Math.PI * 2);
      ctx.fillStyle = color ?? '#15803d';
      ctx.fill();
    });
    // Lighter highlight on canopy
    ctx.beginPath();
    ctx.arc(cx - 10, p.y + h * 0.28, w * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(134,239,172,0.35)';
    ctx.fill();
    ctx.restore();
  }

  if (obj.id.startsWith('wickets')) {
    ctx.save();
    // 3 stumps
    const stumpW = 6;
    const stumpH = h * 0.85;
    ctx.fillStyle = '#fef3c7';
    [-12, 0, 12].forEach((ox) => {
      ctx.fillRect(p.x + w / 2 + ox - stumpW / 2, p.y, stumpW, stumpH);
    });
    // Bails (2 small crossbars at top)
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(p.x + w / 2 - 16, p.y - 4, 14, 5);
    ctx.fillRect(p.x + w / 2 + 2,  p.y - 4, 14, 5);
    ctx.restore();
  }

  if (obj.id.startsWith('bush')) {
    ctx.save();
    const cx = p.x + w / 2;
    const cy = p.y + h * 0.6;
    // Overlapping circles for bush shape
    [[0, 0, w * 0.42], [-w * 0.25, h * 0.12, w * 0.32], [w * 0.25, h * 0.12, w * 0.32],
     [0, -h * 0.18, w * 0.28]].forEach(([ox, oy, r]) => {
      ctx.beginPath();
      ctx.arc(cx + ox, cy + oy, r, 0, Math.PI * 2);
      ctx.fillStyle = color ?? '#16a34a';
      ctx.fill();
    });
    // Highlight
    ctx.beginPath();
    ctx.arc(cx - w * 0.1, cy - h * 0.2, w * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(134,239,172,0.4)';
    ctx.fill();
    ctx.restore();
  }

  if (obj.id === 'pitch') {
    ctx.save();
    // Cricket pitch — sandy/dirt rectangle with crease lines drawn on top
    const pitchGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + h);
    pitchGrad.addColorStop(0, '#d97706');
    pitchGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = pitchGrad;
    ctx.fillRect(p.x, p.y, w, h);
    // Pitch border
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(p.x, p.y, w, h);
    ctx.restore();
  }

  if (obj.id === 'ball') {
    ctx.save();
    const cx = p.x + w / 2;
    const cy = p.y + h / 2;
    // Ball base
    ctx.beginPath();
    ctx.arc(cx, cy, w / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    // Seam lines
    ctx.strokeStyle = '#fef2f2';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, w / 2 - 2, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, w / 2 - 2, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
    // Shine
    ctx.beginPath();
    ctx.arc(cx - 2, cy - 3, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();
    ctx.restore();
  }

  if (obj.id === 'sky' || obj.id.startsWith('grass') || obj.id === 'crease-near' || obj.id === 'crease-far') {
    // Already handled in drawBackground or pitch; skip the default rect redraw
    // (nothing extra to do — these get overridden by special drawing above)
  }

  ctx.restore();
}


// ------------------------------------------------------------------
// Scene background
// ------------------------------------------------------------------
function drawBackground(ctx: CanvasRenderingContext2D, layout: LayoutDefinition, canvasW: number, canvasH: number): void {
  if (layout.name === 'Garden') {
    // --- Garden / Outdoor background ---

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvasH * 0.63);
    skyGrad.addColorStop(0, '#38bdf8');
    skyGrad.addColorStop(0.6, '#7dd3fc');
    skyGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvasW, canvasH * 0.63);

    // Sun
    ctx.beginPath();
    ctx.arc(canvasW * 0.82, 70, 48, 0, Math.PI * 2);
    ctx.fillStyle = '#fde047';
    ctx.fill();
    // Sun glow
    ctx.beginPath();
    ctx.arc(canvasW * 0.82, 70, 64, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(253,224,71,0.18)';
    ctx.fill();

    // Fluffy clouds
    const drawCloud = (cx: number, cy: number, scale: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      [[-30,0,36],[0,-14,28],[30,0,36],[15,8,22],[-15,8,22]].forEach(([x,y,r]) => {
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
      });
      ctx.restore();
    };
    drawCloud(160, 80, 1);
    drawCloud(440, 55, 0.8);
    drawCloud(650, 95, 0.65);

    // Grass ground gradient
    const grassGrad = ctx.createLinearGradient(0, canvasH * 0.63, 0, canvasH);
    grassGrad.addColorStop(0, '#16a34a');
    grassGrad.addColorStop(0.4, '#15803d');
    grassGrad.addColorStop(1, '#14532d');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, canvasH * 0.63, canvasW, canvasH);

    // Grass texture — horizontal stripes (mowed look)
    for (let i = 0; i < 6; i++) {
      const y = canvasH * 0.63 + i * 28;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.03)';
      ctx.fillRect(0, y, canvasW, 14);
    }

    // Boundary rope (oval-ish white dashes)
    ctx.setLineDash([14, 8]);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(canvasW / 2, canvasH * 0.73, canvasW * 0.44, canvasH * 0.22, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

  } else {
    // --- Kitchen / Indoor background ---

    // Draw wall
    const wallGrad = ctx.createLinearGradient(0, 0, 0, canvasH * 0.72);
    wallGrad.addColorStop(0, '#fef9c3');
    wallGrad.addColorStop(1, '#fef3c7');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, canvasW, canvasH * 0.72);

    // Floor
    const floorGrad = ctx.createLinearGradient(0, canvasH * 0.72, 0, canvasH);
    floorGrad.addColorStop(0, '#d97706');
    floorGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, canvasH * 0.72, canvasW, canvasH);

    // Floor skirting
    ctx.fillStyle = '#92400e';
    ctx.fillRect(0, canvasH * 0.72, canvasW, 8);

    // Wallpaper pattern — subtle dots
    ctx.fillStyle = 'rgba(251, 191, 36, 0.1)';
    for (let wx = 30; wx < canvasW; wx += 60) {
      for (let wy = 30; wy < canvasH * 0.72; wy += 60) {
        ctx.beginPath();
        ctx.arc(wx, wy, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}


// ------------------------------------------------------------------
// Main render function
// ------------------------------------------------------------------
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  camera: CameraEngine,
  layout: LayoutDefinition,
  characters: CharacterState[],
  currentTime: number,
  canvasW: number,
  canvasH: number,
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

  // 5. Draw characters sorted by Y (painter's algorithm)
  const sortedChars = [...characters].sort((a, b) => a.position.y - b.position.y);
  for (const char of sortedChars) {
    drawCharacter(ctx, char, currentTime);
  }

  // 6. Reset transform for HUD
  ctx.setTransform(1, 0, 0, 1, 0, 0);
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
