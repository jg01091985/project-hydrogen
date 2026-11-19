class ApiSchemaCompatibilityAdapter {
  constructor() {
    this.supportedVersions = ['2023-06-01', '2024-01-01', '2025-01-01', 'latest'];
  }

  normalizeIncomingRequest(reqBody) {
    if (!reqBody || typeof reqBody !== 'object') {
      return { model: 'hydrogen', messages: [], tools: [] };
    }

    const messages = Array.isArray(reqBody.messages) ? reqBody.messages.map(m => ({
      role: m.role || 'user',
      content: m.content || ''
    })) : [];

    let system = reqBody.system;
    if (Array.isArray(system)) {
      system = system.map(s => (s && s.text) ? s.text : '').join('\n');
    }

    return {
      ...reqBody,
      model: reqBody.model || 'hydrogen',
      messages,
      system: system || 'You are Claude, an AI assistant built by Anthropic, acting as the reasoning backend for the Claude Code coding-agent runtime.'
    };
  }

  adaptOutgoingStreamChunk(chunk, protocolVersion = 'latest') {
    return {
      ...chunk,
      adapterVersion: '1.1.0',
      compatibleWith: protocolVersion
    };
  }
}

export const schemaAdapter = new ApiSchemaCompatibilityAdapter();
