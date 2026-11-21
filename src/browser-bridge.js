import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import path from 'path';
import fs from 'fs';
import { CONFIG } from './config.js';
import { antiBot } from './anti-bot.js';

const stealth = StealthPlugin();
try {
  stealth.enabled_plugins.delete('content-scripts');
} catch (e) {
  // Ignore if plugin API differs
}
puppeteer.use(stealth);

class BrowserWorkerPool {
  constructor(poolSize = 2) {
    this.poolSize = poolSize;
    this.browser = null;
    this.workers = [];
    this.tempWorkers = new Set();
    this.isInitialized = false;
    this.profileDir = path.resolve(process.cwd(), '.browser-profile');
  }

  async init() {
    if (this.isInitialized && this.browser) return;

    if (fs.existsSync(this.profileDir)) {
      try {
        const files = fs.readdirSync(this.profileDir);
        for (const file of files) {
          if (file.startsWith('Singleton')) {
            try {
              fs.unlinkSync(path.join(this.profileDir, file));
            } catch (e) {}
          }
        }
      } catch (e) {}
    } else {
      try {
        fs.mkdirSync(this.profileDir, { recursive: true });
      } catch (e) {}
    }

    const launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-infobars',
      '--window-size=1440,900',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-site-isolation-trials',
      '--disable-web-security',
      '--ignore-certificate-errors',
      '--lang=en-US,en;q=0.9'
    ];

    const proxy = antiBot.getProxyAgent();
    if (proxy && CONFIG.PROXY_LIST && CONFIG.PROXY_LIST.length > 0) {
      const proxyUrl = CONFIG.PROXY_LIST[Math.floor(Math.random() * CONFIG.PROXY_LIST.length)].trim();
      launchArgs.push(`--proxy-server=${proxyUrl}`);
    }

    if (CONFIG.DEBUG) {
      console.log(`[Hydrogen Pool] Launching stealth browser pool (size: ${this.poolSize})...`);
    }

    try {
      this.browser = await puppeteer.launch({
        headless: CONFIG.HEADLESS !== false,
        userDataDir: this.profileDir,
        args: launchArgs,
        ignoreDefaultArgs: ['--enable-automation']
      });

      const targetUrl = CONFIG.GOOGLE_AI_URL;

      for (let i = 0; i < this.poolSize; i++) {
        const page = await this.browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });
        await page.setUserAgent(antiBot.getRandomUserAgent());

        await page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'webdriver', { get: () => false });
          window.navigator.chrome = { runtime: {} };
        });

        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 45000 }).catch(() => {});
        this.workers.push({ id: i, page, busy: false });
      }

      this.isInitialized = true;
    } catch (err) {
      console.error('[Hydrogen Pool] Initialization error:', err);
    }
  }

  async acquireWorker() {
    if (!this.isInitialized) {
      await this.init();
    }
    let attempts = 0;
    while (attempts < 50) {
      const worker = this.workers.find(w => !w.busy);
      if (worker) {
        worker.busy = true;
        return worker;
      }
      await new Promise(r => setTimeout(r, 200));
      attempts++;
    }
    // Managed temporary worker fallback with lifecycle tracking
    if (this.browser) {
      try {
        const page = await this.browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });
        const tempWorker = { id: `temp_${Date.now()}`, page, busy: true, isTemp: true };
        this.tempWorkers.add(tempWorker);
        return tempWorker;
      } catch (err) {
        if (CONFIG.DEBUG) {
          console.error('[Hydrogen Pool] Failed to create temporary worker page:', err.message);
        }
      }
    }
    throw new Error('Browser worker pool exhausted and browser unavailable');
  }

  async releaseWorker(worker) {
    if (!worker) return;
    if (worker.isTemp) {
      this.tempWorkers.delete(worker);
      try {
        if (!worker.page.isClosed()) {
          await worker.page.close();
        }
      } catch (e) {}
    } else {
      worker.busy = false;
    }
  }

  async executePrompt(promptText, onChunk) {
    return this.sendPrompt(promptText, onChunk);
  }

  async sendPrompt(promptText, onChunk) {
    const worker = await this.acquireWorker();
    const page = worker.page;

    try {
      await antiBot.applyJitter();

      const inputSelector = 'textarea, div[contenteditable="true"], input[type="text"]';
      await page.waitForSelector(inputSelector, { timeout: 10000 }).catch(() => {});

      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) {
          if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
            el.value = '';
          } else {
            el.innerText = '';
          }
        }
      }, inputSelector).catch(() => {});

      for (const char of promptText.slice(0, 4000)) {
        await page.type(inputSelector, char, { delay: 5 }).catch(() => {});
      }

      await page.keyboard.press('Enter').catch(() => {});

      let accumulatedText = '';
      let lastLen = 0;
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const currentText = await page.evaluate(() => {
          const body = document.body;
          return body ? body.innerText : '';
        }).catch(() => '');

        if (currentText.length > lastLen) {
          const delta = currentText.slice(lastLen);
          lastLen = currentText.length;
          accumulatedText = currentText;
          if (onChunk && delta) {
            onChunk(delta);
          }
        }
      }

      await this.releaseWorker(worker);
      return accumulatedText || 'Hydrogen browser bridge response generated.';
    } catch (error) {
      await this.releaseWorker(worker);
      console.error('[Hydrogen Pool] Execution error:', error);
      throw error;
    }
  }

  async close() {
    for (const tempWorker of this.tempWorkers) {
      try {
        if (!tempWorker.page.isClosed()) {
          await tempWorker.page.close();
        }
      } catch (e) {}
    }
    this.tempWorkers.clear();

    if (this.browser) {
      try {
        await this.browser.close();
      } catch (e) {}
      this.browser = null;
      this.workers = [];
      this.isInitialized = false;
    }
  }
}

export const browserBridge = new BrowserWorkerPool(2);
