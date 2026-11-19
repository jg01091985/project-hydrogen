import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

function computeDirectoryPort(basePort = 31337) {
  const cwd = process.cwd();
  const hash = crypto.createHash('md5').update(cwd).digest('hex');
  const offset = parseInt(hash.substring(0, 4), 16) % 1000;
  return basePort + offset;
}

function parsePort(val) {
  const parsed = parseInt(val, 10);
  if (Number.isInteger(parsed) && parsed > 0 && parsed <= 65535) {
    return parsed;
  }
  return computeDirectoryPort(31337);
}

function parsePositiveInt(val, defaultVal) {
  const parsed = parseInt(val, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : defaultVal;
}

export const CONFIG = {
  PORT: parsePort(process.env.HYDROGEN_PORT || process.env.PORT),
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-pro',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
  GEMINI_API_KEYS: process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()).filter(Boolean) : [],
  GOOGLE_AI_URL: process.env.GOOGLE_AI_URL || 'https://aistudio.google.com/',
  PROXY_LIST: process.env.PROXY_LIST ? process.env.PROXY_LIST.split(',').map(p => p.trim()).filter(Boolean) : [],
  HEADLESS: process.env.HEADLESS !== 'false',
  USE_SDK: process.env.HYDROGEN_USE_SDK !== 'false',
  JITTER_MIN_MS: parsePositiveInt(process.env.HYDROGEN_JITTER_MIN, 50),
  JITTER_MAX_MS: parsePositiveInt(process.env.HYDROGEN_JITTER_MAX, 200),
  MAX_RETRIES: parsePositiveInt(process.env.HYDROGEN_MAX_RETRIES, 3),
  DEBUG: process.env.HYDROGEN_DEBUG === 'true' || false,
};
