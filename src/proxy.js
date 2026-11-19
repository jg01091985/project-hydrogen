import express from 'express';
import { CONFIG } from './config.js';
import { antiBot } from './anti-bot.js';
import { browserBridge } from './browser-bridge.js';
import { sdkBridge } from './sdk-bridge.js';
import { WebToolTranslator, AnthropicGeminiTranslator } from './translator.js';

export function createServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  app.use((req, res, next) => {
    if (CONFIG.DEBUG) {
      console.log(`[Hydrogen Proxy] ${req.method} ${req.url}`);
    }
    next();
  });

  app.post('/v1/messages', async (req, res) => {
    let clientDisconnected = false;
    req.on('close', () => {
      clientDisconnected = true;
      if (CONFIG.DEBUG) {
        console.log('[Hydrogen Proxy] Client connection closed by client during request handling.');
      }
    });

    try {
      await antiBot.applyJitter();

      const anthropicBody = req.body;
      const isStreaming = anthropicBody.stream === true;
      const modelName = anthropicBody.model || CONFIG.GEMINI_MODEL;
      const tools = anthropicBody.tools || [];
      const apiKey = antiBot.getNextApiKey() || CONFIG.GEMINI_API_KEY;

      let useSdkEngine = CONFIG.USE_SDK || Boolean(apiKey);

      if (useSdkEngine) {
        try {
          if (isStreaming) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const msgId = `msg_${Math.random().toString(36).substring(2, 22)}`;
            res.write(`event: message_start\ndata: ${JSON.stringify({
              type: 'message_start',
              message: {
                id: msgId,
                type: 'message',
                role: 'assistant',
                content: [],
                model: modelName,
                stop_reason: null,
                stop_sequence: null,
                usage: { input_tokens: 15, output_tokens: 1 }
              }
            })}\n\n`);

            let blockIndex = 0;

            res.write(`event: content_block_start\ndata: ${JSON.stringify({
              type: 'content_block_start',
              index: blockIndex,
              content_block: { type: 'text', text: '' }
            })}\n\n`);

            await sdkBridge.generateContentStream(
              anthropicBody,
              modelName,
              (textChunk) => {
                if (clientDisconnected) return;
                res.write(`event: content_block_delta\ndata: ${JSON.stringify({
                  type: 'content_block_delta',
                  index: blockIndex,
                  delta: { type: 'text_delta', text: textChunk }
                })}\n\n`);
              },
              (completeText) => {
                // Completed
              }
            );

            if (clientDisconnected) return;

            res.write(`event: content_block_stop\ndata: ${JSON.stringify({
              type: 'content_block_stop',
              index: blockIndex
            })}\n\n`);

            res.write(`event: message_delta\ndata: ${JSON.stringify({
              type: 'message_delta',
              delta: { stop_reason: 'end_turn', stop_sequence: null },
              usage: { output_tokens: 100 }
            })}\n\n`);

            res.write(`event: message_stop\ndata: ${JSON.stringify({
              type: 'message_stop'
            })}\n\n`);

            res.end();
            return;
          } else {
            const sdkResponse = await sdkBridge.generateContent(anthropicBody, modelName);
            if (clientDisconnected) return;
            res.json(sdkResponse);
            return;
          }
        } catch (sdkError) {
          if (clientDisconnected) return;
          if (CONFIG.DEBUG) {
            console.warn('[Hydrogen Proxy] SDK Engine failed, falling back to Browser Bridge:', sdkError.message);
          }
        }
      }

      if (clientDisconnected) return;

      // Browser Bridge Fallback Execution
      let fullPrompt = '';
      if (anthropicBody.system) {
        if (typeof anthropicBody.system === 'string') {
          fullPrompt += `[System Instruction]\n${anthropicBody.system}\n\n`;
        } else if (Array.isArray(anthropicBody.system)) {
          fullPrompt += `[System Instruction]\n` + anthropicBody.system.map(s => s.text || '').join('\n') + `\n\n`;
        }
      }

      const messages = anthropicBody.messages || [];
      for (const msg of messages) {
        const rolePrefix = msg.role === 'assistant' ? 'Assistant: ' : 'User: ';
        let contentStr = '';
        if (typeof msg.content === 'string') {
          contentStr = msg.content;
        } else if (Array.isArray(msg.content)) {
          for (const block of msg.content) {
            if (block.type === 'text') {
              contentStr += block.text || '';
            } else if (block.type === 'tool_use') {
              contentStr += `\n[Tool Use: ${block.name}(${JSON.stringify(block.input)})]\n`;
            } else if (block.type === 'tool_result') {
              let resContent = block.content;
              if (Array.isArray(resContent)) {
                resContent = resContent.map(c => c.text || JSON.stringify(c)).join('\n');
              }
              contentStr += `\n[Tool Result for ${block.tool_use_id}]:\n${resContent}\n`;
            }
          }
        }
        fullPrompt += `${rolePrefix}${contentStr}\n`;
      }
      fullPrompt += 'Assistant: ';
      fullPrompt = WebToolTranslator.enrichPromptWithTools(fullPrompt, tools);

      let accumulatedText = '';
      await browserBridge.executePrompt(fullPrompt, (chunk) => {
        if (!clientDisconnected) {
          accumulatedText += chunk;
        }
      });

      if (clientDisconnected) return;

      if (isStreaming) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const msgId = `msg_${Math.random().toString(36).substring(2, 22)}`;
        res.write(`event: message_start\ndata: ${JSON.stringify({
          type: 'message_start',
          message: {
            id: msgId,
            type: 'message',
            role: 'assistant',
            content: [],
            model: modelName,
            stop_reason: null,
            stop_sequence: null,
            usage: { input_tokens: 10, output_tokens: 1 }
          }
        })}\n\n`);

        const parsedResponse = WebToolTranslator.parseResponseForTools(accumulatedText, modelName);
        let blockIndex = 0;

        for (const block of parsedResponse.content) {
          if (clientDisconnected) break;
          res.write(`event: content_block_start\ndata: ${JSON.stringify({
            type: 'content_block_start',
            index: blockIndex,
            content_block: block.type === 'tool_use' ? {
              type: 'tool_use',
              id: block.id,
              name: block.name,
              input: {}
            } : { type: 'text', text: '' }
          })}\n\n`);

          if (block.type === 'text') {
            res.write(`event: content_block_delta\ndata: ${JSON.stringify({
              type: 'content_block_delta',
              index: blockIndex,
              delta: { type: 'text_delta', text: block.text }
            })}\n\n`);
          } else if (block.type === 'tool_use') {
            res.write(`event: content_block_delta\ndata: ${JSON.stringify({
              type: 'content_block_delta',
              index: blockIndex,
              delta: {
                type: 'input_json_delta',
                partial_json: JSON.stringify(block.input)
              }
            })}\n\n`);
          }

          res.write(`event: content_block_stop\ndata: ${JSON.stringify({
            type: 'content_block_stop',
            index: blockIndex
          })}\n\n`);
          blockIndex++;
        }

        if (!clientDisconnected) {
          res.write(`event: message_delta\ndata: ${JSON.stringify({
            type: 'message_delta',
            delta: { stop_reason: parsedResponse.stop_reason, stop_sequence: null },
            usage: { output_tokens: 50 }
          })}\n\n`);

          res.write(`event: message_stop\ndata: ${JSON.stringify({
            type: 'message_stop'
          })}\n\n`);

          res.end();
        }

      } else {
        const parsedResponse = WebToolTranslator.parseResponseForTools(accumulatedText, modelName);
        if (!clientDisconnected) {
          res.json(parsedResponse);
        }
      }

    } catch (error) {
      if (!clientDisconnected) {
        console.error('[Hydrogen Proxy] Error handling request:', error);
        res.status(500).json({
          type: 'error',
          error: {
            type: 'api_error',
            message: error.message || 'Internal Hydrogen Proxy Error'
          }
        });
      }
    }
  });

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'hydrogen-enterprise-proxy',
      mode: 'dual-engine-sdk-browser-bridge',
      version: '1.1.0'
    });
  });

  return app;
}
