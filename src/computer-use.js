import { chromium } from 'playwright';
import path from 'path';
import { CONFIG } from './config.js';

class ComputerUseController {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async initialize() {
    if (!this.browser) {
      const isHeadless = CONFIG.HEADLESS !== false || process.env.CI || process.env.WSL_INTEROP || process.env.WSL_DISTRO_NAME || !process.env.DISPLAY;
      const launchArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-infobars',
        '--disable-blink-features=AutomationControlled'
      ];
      this.browser = await chromium.launch({
        headless: isHeadless,
        args: launchArgs
      });
      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 800 }
      });
      this.page = await this.context.newPage();
    }
  }

  async navigate(url) {
    await this.initialize();
    await this.page.goto(url);
    return { success: true, url };
  }

  async click(selector) {
    await this.initialize();
    await this.page.click(selector);
    return { success: true, action: 'click', selector };
  }

  async type(selector, text) {
    await this.initialize();
    await this.page.fill(selector, text);
    return { success: true, action: 'type', selector };
  }

  async screenshot(filePath = './screenshot.png') {
    await this.initialize();
    const absPath = path.resolve(filePath);
    await this.page.screenshot({ path: absPath, fullPage: true });
    return { success: true, path: absPath };
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }
  }
}

export const computerUse = new ComputerUseController();
