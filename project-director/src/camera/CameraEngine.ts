// =============================================================
// Camera Engine
// Three predefined cameras: Wide, Medium, Close.
// Smoothly lerps between shots.
// =============================================================

import type { CameraState, CameraShot, Vec2 } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../layout/layouts';

const CAMERA_CONFIGS: Record<CameraShot, { scale: number; offsetX: number; offsetY: number }> = {
  Wide:   { scale: 1.0, offsetX: 0,    offsetY: 0 },
  Medium: { scale: 1.5, offsetX: -120, offsetY: -60 },
  Close:  { scale: 2.2, offsetX: -280, offsetY: -160 },
};

const LERP_SPEED = 3.5; // higher = faster transition

export class CameraEngine {
  private state: CameraState = {
    shot: 'Wide',
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    targetScale: 1,
    targetOffsetX: 0,
    targetOffsetY: 0,
  };

  getState(): CameraState {
    return { ...this.state };
  }

  /**
   * Set the target camera shot, optionally centering on a character position.
   */
  setShot(shot: CameraShot, focusPosition?: Vec2): void {
    if (this.state.shot === shot && !focusPosition) return;

    this.state.shot = shot;
    const config = CAMERA_CONFIGS[shot];

    if (focusPosition && shot !== 'Wide') {
      // Center camera on focus character
      const centerX = CANVAS_WIDTH  / 2;
      const centerY = CANVAS_HEIGHT / 2;
      const scale   = config.scale;

      this.state.targetOffsetX = centerX - focusPosition.x * scale;
      this.state.targetOffsetY = centerY - focusPosition.y * scale;
      this.state.targetScale   = scale;
    } else {
      this.state.targetScale   = config.scale;
      this.state.targetOffsetX = config.offsetX;
      this.state.targetOffsetY = config.offsetY;
    }

    console.log(`[CameraEngine] Switching to ${shot}`, focusPosition ? `(focus: ${JSON.stringify(focusPosition)})` : '');
  }

  /**
   * Tick — smoothly interpolate current camera toward target.
   * Must be called every frame with deltaTime in seconds.
   */
  tick(deltaTime: number): void {
    const t = Math.min(1, LERP_SPEED * deltaTime);
    this.state.scale   = lerp(this.state.scale,   this.state.targetScale,   t);
    this.state.offsetX = lerp(this.state.offsetX, this.state.targetOffsetX, t);
    this.state.offsetY = lerp(this.state.offsetY, this.state.targetOffsetY, t);
  }

  reset(): void {
    const config = CAMERA_CONFIGS['Wide'];
    this.state = {
      shot: 'Wide',
      scale: config.scale,
      offsetX: config.offsetX,
      offsetY: config.offsetY,
      targetScale: config.scale,
      targetOffsetX: config.offsetX,
      targetOffsetY: config.offsetY,
    };
  }

  /**
   * Apply camera transform to a canvas context.
   * Call before drawing scene elements.
   */
  applyTransform(ctx: CanvasRenderingContext2D): void {
    ctx.setTransform(
      this.state.scale, 0,
      0, this.state.scale,
      this.state.offsetX,
      this.state.offsetY,
    );
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
