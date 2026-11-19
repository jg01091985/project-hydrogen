class StealthEvasionEngine {
  constructor() {
    this.stealthScripts = `
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });

      const getParameterProxy = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return 'Intel Inc.';
        if (parameter === 37446) return 'Intel Iris OpenGL Engine';
        return getParameterProxy.apply(this, arguments);
      };

      const toDataURLProxy = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(type) {
        const ctx = this.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'rgba(0,0,0,0.01)';
          ctx.fillRect(0, 0, 1, 1);
        }
        return toDataURLProxy.apply(this, arguments);
      };
    `;
  }

  getEvasionScript() {
    return this.stealthScripts;
  }

  generateHumanJitter() {
    return Math.floor(Math.random() * 150) + 75;
  }
}

export const stealthEvasion = new StealthEvasionEngine();
