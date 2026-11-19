import crypto from 'crypto';

class BezierMouseEngine {
  constructor() {
    this.history = [];
  }

  generateBezierPath(startX, startY, endX, endY, steps = 25) {
    const path = [];
    // Control points for natural curve deviation
    const controlX = startX + (endX - startX) * 0.5 + (Math.random() * 40 - 20);
    const controlY = startY + (endY - startY) * 0.5 + (Math.random() * 40 - 20);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Quadratic bezier formula: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
      const x = Math.round(Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * endX);
      const y = Math.round(Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * endY);
      const jitterX = x + Math.floor(Math.random() * 3 - 1);
      const jitterY = y + Math.floor(Math.random() * 3 - 1);
      path.push({ x: jitterX, y: jitterY, delay: Math.floor(Math.random() * 15 + 5) });
    }
    this.history.push({ start: { x: startX, y: startY }, end: { x: endX, y: endY }, steps: path.length });
    return path;
  }

  generateKeyDwellIntervals(text) {
    const intervals = [];
    for (let i = 0; i < text.length; i++) {
      // Natural human typing cadence: 60ms to 180ms dwell + variable pause
      const dwell = Math.floor(Math.random() * 120) + 60;
      const pause = Math.random() < 0.1 ? Math.floor(Math.random() * 300) + 150 : 0;
      intervals.push({ char: text[i], dwellTime: dwell, pauseAfter: pause });
    }
    return { totalChars: text.length, intervals };
  }
}

export const bezierMouse = new BezierMouseEngine();
