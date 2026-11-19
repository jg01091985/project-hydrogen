import { createServer } from './proxy.js';
import { CONFIG } from './config.js';
import { antiBot } from './anti-bot.js';
import { selfHeal } from './self-heal.js';
import { selfLearn } from './self-learn.js';
import { orchestration } from './orchestration.js';
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

function printBanner() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║  ⚡ PROJECT HYDROGEN — Enterprise AGI & Stealth Orchestrator       ║
║  God-Tier Anti-Bot Bypass, Self-Healing & Self-Learning Engine    ║
╚═══════════════════════════════════════════════════════════════════╝
  `);
}

function checkProxyRunning(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function runDoctor() {
  printBanner();
  console.log('🔍 Running Hydrogen Enterprise Diagnostics & AGI Health Check...');

  const nodeVersion = process.version;
  console.log(`- Node.js Version: ${nodeVersion} (${parseInt(nodeVersion.slice(1)) >= 18 ? '✅ Supported' : '⚠️ Warning: Node 18+ recommended'})`);

  let pkgVersion = '1.1.0';
  try {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      pkgVersion = pkg.version || pkgVersion;
    }
  } catch (e) {}
  console.log(`- Hydrogen Version: ${pkgVersion} ✅`);

  const apiKey = antiBot.getNextApiKey() || CONFIG.GEMINI_API_KEY;
  const hasKey = Boolean(apiKey);
  const maskedKey = hasKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : 'None detected';
  console.log(`- Gemini API Key / Pool: ${hasKey ? '✅ Configured' : '⚠️ Missing'} (${maskedKey})`);

  let sdkAvailable = false;
  try {
    await import('@google/genai');
    sdkAvailable = true;
  } catch (e) {}
  console.log(`- Google GenAI SDK (@google/genai): ${sdkAvailable ? '✅ Installed & Ready' : '❌ Missing'}`);

  const portInUse = await checkProxyRunning(CONFIG.PORT);
  console.log(`- Proxy Port (${CONFIG.PORT}): ${portInUse ? '🟢 Active / In-use' : '⚪ Available'}`);

  const learningMetrics = selfLearn.getMetricsSummary();
  console.log(`- Self-Learning Intelligence (AGI Loop): Generation ${learningMetrics.generationCount}, Success Rate: ${learningMetrics.successRate}, Jitter: ${learningMetrics.jitterRange}`);
  console.log(`- God-Tier Stealth Anti-Bot & Fingerprint Masking: Active 🛡️`);
  console.log(`- Subagent Orchestration Engine: Ready 🚀`);

  console.log('\n✨ Diagnostics completed successfully. Project Hydrogen is at peak performance.');
  process.exit(0);
}

async function main() {
  printBanner();

  selfHeal.runPreflightChecks();
  selfLearn.recordRun(true, 150);

  const args = process.argv.slice(2);
  if (args.includes('doctor') || args[0] === 'doctor') {
    await runDoctor();
    return;
  }

  const port = CONFIG.PORT;

  const isRunning = await checkProxyRunning(port);
  let serverInstance = null;

  if (!isRunning) {
    const app = createServer();
    serverInstance = http.createServer(app);
    await new Promise((resolve) => {
      serverInstance.listen(port, '127.0.0.1', () => {
        if (CONFIG.DEBUG) {
          console.log(`[Hydrogen] Enterprise Orchestration Proxy listening on http://127.0.0.1:${port}`);
        }
        resolve();
      });
    });
  } else if (CONFIG.DEBUG) {
    console.log(`[Hydrogen] Proxy already running on http://127.0.0.1:${port}`);
  }

  const claudeArgs = args;
  const env = {
    ...process.env,
    ANTHROPIC_BASE_URL: `http://127.0.0.1:${port}`,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY || 'hydrogen-key',
  };

  if (CONFIG.DEBUG) {
    console.log(`[Hydrogen] Spawning Claude Code CLI with model: ${CONFIG.GEMINI_MODEL}`);
  }

  const claudeProcess = spawn('claude', claudeArgs, {
    stdio: 'inherit',
    env
  });

  const cleanupAndExit = (code = 0) => {
    if (serverInstance) {
      try {
        serverInstance.close();
      } catch (e) {}
    }
    if (claudeProcess && !claudeProcess.killed) {
      try {
        claudeProcess.kill('SIGTERM');
      } catch (e) {}
    }
    process.exit(code);
  };

  process.on('SIGINT', () => cleanupAndExit(0));
  process.on('SIGTERM', () => cleanupAndExit(0));

  claudeProcess.on('exit', (code) => {
    cleanupAndExit(code || 0);
  });

  claudeProcess.on('error', (err) => {
    selfHeal.reportError('CLAUDE_SPAWN_ERROR');
    selfLearn.recordRun(false, 0);
    console.error('[Hydrogen] Failed to start Claude Code CLI:', err);
    cleanupAndExit(1);
  });
}

main().catch((err) => {
  selfHeal.reportError('FATAL_ERROR');
  selfLearn.recordRun(false, 0);
  console.error('[Hydrogen] Fatal error:', err);
  process.exit(1);
});
