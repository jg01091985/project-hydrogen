import { AnthropicGeminiTranslator } from '../src/translator.js';
import assert from 'assert';

export function runTranslatorTests() {
  console.log('Running Translator Tests...');

  // 1. Request translation with system prompt, messages, and tools
  const anthropicReq = {
    model: 'hydrogen',
    system: 'System instruction text',
    messages: [
      { role: 'user', content: 'Hello Gemini' },
      { role: 'assistant', content: [{ type: 'tool_use', id: 'toolu_123', name: 'my_func', input: { a: 1 } }] },
      { role: 'user', content: [{ type: 'tool_result', tool_use_id: 'toolu_123', content: 'success' }] }
    ],
    max_tokens: 300,
    temperature: 0.5,
    tools: [
      {
        name: 'test_tool',
        description: 'A test tool',
        input_schema: { type: 'object', properties: { x: { type: 'number' } } }
      }
    ]
  };

  const payload = AnthropicGeminiTranslator.translateRequest(anthropicReq);
  assert.strictEqual(payload.systemInstruction.parts[0].text, 'System instruction text');
  assert.strictEqual(payload.contents.length, 3);
  assert.strictEqual(payload.contents[0].role, 'user');
  assert.strictEqual(payload.contents[1].role, 'model');
  assert.strictEqual(payload.contents[1].parts[0].functionCall.name, 'my_func');
  assert.strictEqual(payload.contents[2].role, 'user');
  assert.strictEqual(payload.contents[2].parts[0].functionResponse.name, 'my_func');
  assert.strictEqual(payload.contents[2].parts[0].functionResponse.response.output, 'success');
  assert.strictEqual(payload.tools[0].functionDeclarations[0].name, 'test_tool');
  assert.strictEqual(payload.generationConfig.maxOutputTokens, 300);
  assert.strictEqual(payload.generationConfig.temperature, 0.5);

  // 2. Response translation with text and function call
  const geminiRes = {
    candidates: [
      {
        content: {
          parts: [
            { text: 'Result text' },
            { functionCall: { name: 'test_tool', args: { x: 42 } } }
          ]
        },
        finishReason: 'STOP'
      }
    ],
    usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 20 }
  };

  const anthropicRes = AnthropicGeminiTranslator.translateResponse(geminiRes, 'hydrogen');
  assert.strictEqual(anthropicRes.type, 'message');
  assert.strictEqual(anthropicRes.content.length, 2);
  assert.strictEqual(anthropicRes.content[0].type, 'text');
  assert.strictEqual(anthropicRes.content[1].type, 'tool_use');
  assert.strictEqual(anthropicRes.content[1].name, 'test_tool');
  assert.deepStrictEqual(anthropicRes.content[1].input, { x: 42 });
  assert.strictEqual(anthropicRes.stop_reason, 'tool_use');
  assert.strictEqual(anthropicRes.usage.input_tokens, 10);
  assert.strictEqual(anthropicRes.usage.output_tokens, 20);

  console.log('✅ Translator Tests Passed.');
}
