import { GoogleGenAI } from '@google/genai';
import { CONFIG } from './config.js';
import { antiBot } from './anti-bot.js';
import { AnthropicGeminiTranslator } from './translator.js';

export class SdkBridge {
  constructor() {
    // Lazily initialized per request with rotation
  }

  getClient(apiKey) {
    const key = apiKey || antiBot.getNextApiKey() || CONFIG.GEMINI_API_KEY;
    return new GoogleGenAI({ apiKey: key });
  }

  isRetryableError(err) {
    if (!err) return true;
    const status = err.status || err.statusCode || (err.response && err.response.status);
    if (status) {
      // Do not retry 4xx client errors except 429 (rate limit)
      if (status >= 400 && status < 500 && status !== 429) {
        return false;
      }
    }
    const msg = (err.message || '').toLowerCase();
    if (msg.includes('bad request') || msg.includes('unauthorized') || msg.includes('forbidden') || msg.includes('not found')) {
      return false;
    }
    return true;
  }

  async generateContent(anthropicBody, modelName = 'hydrogen') {
    const apiKey = antiBot.getNextApiKey();
    const ai = this.getClient(apiKey);
    const geminiPayload = AnthropicGeminiTranslator.translateRequest(anthropicBody);
    const primaryModel = CONFIG.GEMINI_MODEL || 'gemini-4-hydrogen';
    const modelsToTry = [...new Set([primaryModel, 'gemini-2.5-pro'])];

    let lastErr = null;
    for (const geminiModel of modelsToTry) {
      let attempts = 0;
      while (attempts < CONFIG.MAX_RETRIES) {
        try {
          const response = await ai.models.generateContent({
            model: geminiModel,
            contents: geminiPayload.contents,
            config: {
              ...geminiPayload.generationConfig,
              systemInstruction: geminiPayload.systemInstruction,
              tools: geminiPayload.tools
            }
          });
          return AnthropicGeminiTranslator.translateResponse(response, modelName);
        } catch (err) {
          lastErr = err;
          antiBot.reportKeyFailure(apiKey);

          if (!this.isRetryableError(err)) {
            if (CONFIG.DEBUG) {
              console.warn(`[Hydrogen SdkBridge] Model ${geminiModel} non-retryable error:`, err.message);
            }
            break;
          }

          attempts++;
          const backoff = Math.min(10000, 300 * Math.pow(2, attempts) + Math.random() * 200);
          await new Promise(r => setTimeout(r, backoff));
        }
      }
      if (CONFIG.DEBUG) {
        console.warn(`[Hydrogen SdkBridge] Model ${geminiModel} exhausted retries, falling back if available...`);
      }
    }
    throw lastErr || new Error('SdkBridge generation failed across all models after max retries');
  }

  async generateContentStream(anthropicBody, modelName = 'hydrogen', onChunk, onComplete) {
    const apiKey = antiBot.getNextApiKey();
    const ai = this.getClient(apiKey);
    const geminiPayload = AnthropicGeminiTranslator.translateRequest(anthropicBody);
    const primaryModel = CONFIG.GEMINI_MODEL || 'gemini-4-hydrogen';
    const modelsToTry = [...new Set([primaryModel, 'gemini-2.5-pro'])];

    let lastErr = null;
    for (const geminiModel of modelsToTry) {
      let attempts = 0;
      while (attempts < CONFIG.MAX_RETRIES) {
        try {
          const responseStream = await ai.models.generateContentStream({
            model: geminiModel,
            contents: geminiPayload.contents,
            config: {
              ...geminiPayload.generationConfig,
              systemInstruction: geminiPayload.systemInstruction,
              tools: geminiPayload.tools
            }
          });

          let accumulatedText = '';
          for await (const chunk of responseStream) {
            const text = chunk.text || '';
            if (text) {
              accumulatedText += text;
              if (onChunk) onChunk(text);
            }
          }
          if (onComplete) onComplete(accumulatedText);
          return accumulatedText;
        } catch (err) {
          lastErr = err;
          antiBot.reportKeyFailure(apiKey);

          if (!this.isRetryableError(err)) {
            if (CONFIG.DEBUG) {
              console.warn(`[Hydrogen SdkBridge] Model ${geminiModel} non-retryable stream error:`, err.message);
            }
            break;
          }

          attempts++;
          const backoff = Math.min(10000, 300 * Math.pow(2, attempts) + Math.random() * 200);
          await new Promise(r => setTimeout(r, backoff));
        }
      }
      if (CONFIG.DEBUG) {
        console.warn(`[Hydrogen SdkBridge] Model ${geminiModel} stream exhausted retries, falling back if available...`);
      }
    }
    throw lastErr || new Error('SdkBridge streaming failed across all models after max retries');
  }
}

export const sdkBridge = new SdkBridge();
