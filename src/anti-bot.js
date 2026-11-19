import { CONFIG } from './config.js';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

class AntiBotManager {
  constructor() {
    this.keyIndex = 0;
    this.proxyIndex = 0;
    this.keyFailures = new Map();
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0'
    ];
    this.stealthScript = `
      // God-tier anti-bot stealth injections
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });

      window.chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {}
      };

      // WebGL Vendor & Renderer Masking
      const getParameterProxyHandler = {
        apply: function(target, ctx, args) {
          const param = args[0];
          if (param === 37445) return 'Intel Inc.';
          if (param === 37446) return 'Intel Iris OpenGL Engine';
          return Reflect.apply(target, ctx, args);
        }
      };
      try {
        WebGLRenderingContext.prototype.getParameter = new Proxy(WebGLRenderingContext.prototype.getParameter, getParameterProxyHandler);
        WebGL2RenderingContext.prototype.getParameter = new Proxy(WebGL2RenderingContext.prototype.getParameter, getParameterProxyHandler);
      } catch (e) {}

      // Canvas Fingerprint Noise Injection
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(type) {
        try {
          const ctx = this.getContext('2d');
          if (ctx) {
            const imageData = ctx.getImageData(0, 0, this.width || 10, this.height || 10);
            imageData.data[0] = imageData.data[0] ^ 1;
            ctx.putImageData(imageData, 0, 0);
          }
        } catch (e) {}
        return originalToDataURL.apply(this, arguments);
      };
    `;
  }

  async applyStealthToPage(page) {
    try {
      await page.evaluateOnNewDocument(this.stealthScript);
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Ch-Ua': '"Chromium";v="125", "Google Chrome";v="125", "Not-A.Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Linux"'
      });
    } catch (e) {
      if (CONFIG.DEBUG) {
        console.warn('[Hydrogen Anti-Bot] Failed to apply stealth script to page:', e.message);
      }
    }
  }

  getNextApiKey() {
    const keys = CONFIG.GEMINI_API_KEYS;
    if (!keys || keys.length === 0) {
      return CONFIG.GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    }
    let attempts = 0;
    while (attempts < keys.length) {
      const key = keys[this.keyIndex];
      this.keyIndex = (this.keyIndex + 1) % keys.length;
      const failures = this.keyFailures.get(key) || 0;
      if (failures < 5) {
        return key;
      }
      attempts++;
    }
    // If all keys exceed failure threshold, reset failure counts to prevent permanent deadlock
    if (CONFIG.DEBUG) {
      console.warn('[Hydrogen Anti-Bot] All API keys exceeded failure threshold. Resetting failure cache.');
    }
    this.keyFailures.clear();
    const fallbackKey = keys[this.keyIndex];
    this.keyIndex = (this.keyIndex + 1) % keys.length;
    return fallbackKey;
  }

  reportKeyFailure(key) {
    if (!key) return;
    const count = (this.keyFailures.get(key) || 0) + 1;
    this.keyFailures.set(key, count);
    if (CONFIG.DEBUG) {
      console.warn(`[Hydrogen Anti-Bot] API Key failure reported (failures: ${count}). Rotating key.`);
    }
  }

  getProxyAgent() {
    if (!CONFIG.PROXY_LIST || CONFIG.PROXY_LIST.length === 0) {
      return null;
    }
    const proxyUrl = CONFIG.PROXY_LIST[this.proxyIndex].trim();
    this.proxyIndex = (this.proxyIndex + 1) % CONFIG.PROXY_LIST.length;

    try {
      const parsedUrl = new URL(proxyUrl);
      if (!['http:', 'https:', 'socks:', 'socks4:', 'socks5:'].includes(parsedUrl.protocol)) {
        throw new Error(`Unsupported proxy protocol: ${parsedUrl.protocol}`);
      }

      if (CONFIG.DEBUG) {
        console.log(`[Hydrogen Anti-Bot] Using proxy: ${proxyUrl.replace(/:[^:@]*@/, ':****@')}`);
      }

      if (proxyUrl.startsWith('socks')) {
        return new SocksProxyAgent(proxyUrl);
      } else {
        return new HttpsProxyAgent(proxyUrl);
      }
    } catch (err) {
      if (CONFIG.DEBUG) {
        console.error(`[Hydrogen Anti-Bot] Invalid proxy URL format (${proxyUrl}):`, err.message);
      }
      return null;
    }
  }

  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  getFakeDnsHeaders(agentId = 'default') {
    const randomIp = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    return {
      'User-Agent': this.getRandomUserAgent(),
      'X-Forwarded-For': randomIp,
      'X-Real-IP': randomIp,
      'X-Hydrogen-Agent-ID': agentId,
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Ch-Ua': '"Chromium";v="125", "Google Chrome";v="125", "Not-A.Brand";v="99"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Linux"'
    };
  }

  async applyJitter() {
    const min = CONFIG.JITTER_MIN_MS;
    const max = CONFIG.JITTER_MAX_MS;
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export const antiBot = new AntiBotManager();
