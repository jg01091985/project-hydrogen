export class AnthropicGeminiTranslator {
  /**
   * Converts Anthropic Messages API request body to Google Gemini API request body.
   */
  static translateRequest(anthropicBody) {
    if (!anthropicBody || typeof anthropicBody !== 'object') {
      anthropicBody = {};
    }
    const {
      model,
      messages = [],
      system,
      max_tokens,
      temperature,
      top_p,
      top_k,
      tools = [],
      tool_choice
    } = anthropicBody;

    const geminiContents = [];
    let systemInstruction = undefined;

    if (system) {
      if (typeof system === 'string') {
        systemInstruction = { parts: [{ text: system }] };
      } else if (Array.isArray(system)) {
        const text = system.map(s => (s && s.text) ? s.text : '').join('\n');
        systemInstruction = { parts: [{ text }] };
      }
    }

    const toolIdToName = new Map();
    if (Array.isArray(messages)) {
      for (const msg of messages) {
        if (msg && msg.content && Array.isArray(msg.content)) {
          for (const block of msg.content) {
            if (block && block.type === 'tool_use' && block.id && block.name) {
              toolIdToName.set(block.id, block.name);
            }
          }
        }
      }
    }

    if (Array.isArray(messages)) {
      for (const msg of messages) {
        if (!msg) continue;
        const role = msg.role === 'assistant' ? 'model' : 'user';
        const parts = [];

        const content = msg.content;
        if (typeof content === 'string') {
          parts.push({ text: content });
        } else if (Array.isArray(content)) {
          for (const block of content) {
            if (!block) continue;
            if (block.type === 'text') {
              parts.push({ text: block.text || '' });
            } else if (block.type === 'image') {
              if (block.source && block.source.data) {
                parts.push({
                  inlineData: {
                    mimeType: block.source.media_type || 'image/jpeg',
                    data: block.source.data
                  }
                });
              }
            } else if (block.type === 'tool_use') {
              parts.push({
                functionCall: {
                  name: block.name || 'unknown',
                  args: block.input || {}
                }
              });
            } else if (block.type === 'tool_result') {
              const funcName = toolIdToName.get(block.tool_use_id) || block.name || block.tool_use_id || 'unknown_tool';
              let responseContent = block.content;
              if (Array.isArray(responseContent)) {
                responseContent = responseContent.map(c => (c && c.text) ? c.text : JSON.stringify(c)).join('\n');
              } else if (typeof responseContent === 'object' && responseContent !== null) {
                responseContent = JSON.stringify(responseContent);
              }
              parts.push({
                functionResponse: {
                  name: funcName,
                  response: { output: responseContent !== undefined ? responseContent : '' }
                }
              });
            }
          }
        }

        if (parts.length > 0) {
          geminiContents.push({ role, parts });
        }
      }
    }

    let geminiTools = undefined;
    if (Array.isArray(tools) && tools.length > 0) {
      const functionDeclarations = tools.map(t => ({
        name: t && t.name ? t.name : 'tool',
        description: t && t.description ? t.description : '',
        parameters: t && t.input_schema ? t.input_schema : { type: 'object', properties: {} }
      }));
      geminiTools = [{ functionDeclarations }];
    }

    const generationConfig = {};
    if (max_tokens !== undefined) generationConfig.maxOutputTokens = max_tokens;
    if (temperature !== undefined) generationConfig.temperature = temperature;
    if (top_p !== undefined) generationConfig.topP = top_p;
    if (top_k !== undefined) generationConfig.topK = top_k;

    const geminiPayload = {
      contents: geminiContents,
      generationConfig
    };

    if (systemInstruction) {
      geminiPayload.systemInstruction = systemInstruction;
    }

    if (geminiTools) {
      geminiPayload.tools = geminiTools;
    }

    return geminiPayload;
  }

  /**
   * Converts Gemini API response to Anthropic Messages API non-streaming response.
   */
  static translateResponse(geminiResponse, modelName = 'hydrogen') {
    if (!geminiResponse || typeof geminiResponse !== 'object') {
      geminiResponse = {};
    }
    const candidate = geminiResponse.candidates && geminiResponse.candidates[0];
    const contentParts = candidate && candidate.content && candidate.content.parts ? candidate.content.parts : [];

    const anthropicContent = [];
    let stopReason = 'end_turn';

    for (const part of contentParts) {
      if (!part) continue;
      if (part.text) {
        anthropicContent.push({
          type: 'text',
          text: part.text
        });
      } else if (part.functionCall) {
        stopReason = 'tool_use';
        anthropicContent.push({
          type: 'tool_use',
          id: `toolu_${Math.random().toString(36).substring(2, 15)}`,
          name: part.functionCall.name || 'unknown',
          input: part.functionCall.args || {}
        });
      }
    }

    if (anthropicContent.length === 0) {
      anthropicContent.push({
        type: 'text',
        text: ''
      });
    }

    const finishReason = candidate ? candidate.finishReason : 'STOP';
    if (finishReason === 'MAX_TOKENS') {
      stopReason = 'max_tokens';
    }

    const usage = geminiResponse.usageMetadata || {
      promptTokenCount: 10,
      candidatesTokenCount: 10
    };

    return {
      id: `msg_${Math.random().toString(36).substring(2, 22)}`,
      type: 'message',
      role: 'assistant',
      content: anthropicContent,
      model: modelName,
      stop_reason: stopReason,
      stop_sequence: null,
      usage: {
        input_tokens: usage.promptTokenCount || usage.prompt_token_count || 10,
        output_tokens: usage.candidatesTokenCount || usage.candidates_token_count || 10
      }
    };
  }
}

export class WebToolTranslator {
  static enrichPromptWithTools(basePrompt, tools = []) {
    if (!tools || tools.length === 0) {
      return basePrompt;
    }

    let toolInstructions = '\n\n[Available Tools]\nYou have access to the following tools. When you need to execute a command or read/write a file, you MUST output a tool call in valid JSON format inside a markdown code block like this:\n```json\n{ "tool_call": { "name": "tool_name", "input": { "argument_name": "value" } } }\n```\n\nTools:\n';

    for (const tool of tools) {
      if (!tool) continue;
      toolInstructions += `- Name: ${tool.name}\n  Description: ${tool.description || ''}\n  Input Schema: ${JSON.stringify(tool.input_schema || {})}\n\n`;
    }

    return (basePrompt || '') + toolInstructions;
  }

  /**
   * Robust multi-strategy JSON extraction for tool calls.
   */
  static parseResponseForTools(rawText, modelName = 'hydrogen') {
    if (!rawText || typeof rawText !== 'string') {
      rawText = '';
    }

    let parsed = null;
    let matchedBlock = null;

    // Strategy 1: Markdown code block (json or generic)
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[1]);
        matchedBlock = jsonMatch[0];
      } catch (e) {}
    }

    // Strategy 2: Raw JSON object search if markdown block failed
    if (!parsed) {
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const potentialJson = rawText.substring(firstBrace, lastBrace + 1);
        try {
          parsed = JSON.parse(potentialJson);
          matchedBlock = potentialJson;
        } catch (e) {}
      }
    }

    if (parsed && parsed.tool_call && parsed.tool_call.name) {
      let textBefore = '';
      if (matchedBlock) {
        const index = rawText.indexOf(matchedBlock);
        if (index !== -1) {
          textBefore = rawText.substring(0, index).trim();
        }
      }

      const content = [];
      if (textBefore) {
        content.push({ type: 'text', text: textBefore });
      }
      content.push({
        type: 'tool_use',
        id: `toolu_${Math.random().toString(36).substring(2, 15)}`,
        name: parsed.tool_call.name,
        input: parsed.tool_call.input || {}
      });

      return {
        id: `msg_${Math.random().toString(36).substring(2, 22)}`,
        type: 'message',
        role: 'assistant',
        content,
        model: modelName,
        stop_reason: 'tool_use',
        stop_sequence: null,
        usage: { input_tokens: 50, output_tokens: 50 }
      };
    }

    return {
      id: `msg_${Math.random().toString(36).substring(2, 22)}`,
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text', text: rawText }],
      model: modelName,
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: { input_tokens: 50, output_tokens: 50 }
    };
  }
}
