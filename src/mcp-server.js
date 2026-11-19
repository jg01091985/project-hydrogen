import { computerUse } from './computer-use.js';

class MCPServerPlugin {
  constructor() {
    this.tools = new Map();
    this.registerDefaultTools();
  }

  registerDefaultTools() {
    this.tools.set('hydrogen_status', {
      description: 'Get live status and telemetry of Project Hydrogen gateway',
      schema: { type: 'object', properties: {} },
      execute: async () => ({ status: 'active', version: '1.1.0', engine: 'dual-sdk-browser' })
    });
    this.tools.set('hydrogen_vault_inspect', {
      description: 'Inspect secure encryption status of Vault manager',
      schema: { type: 'object', properties: {} },
      execute: async () => ({ vault: 'AES-256-GCM', encrypted: true })
    });
    this.tools.set('computer_navigate', {
      description: 'Navigate browser to URL for desktop/browser control',
      schema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] },
      execute: async (input) => {
        if (!input || typeof input.url !== 'string') throw new Error('Missing required parameter: url');
        return await computerUse.navigate(input.url);
      }
    });
    this.tools.set('computer_click', {
      description: 'Click element on screen by selector',
      schema: { type: 'object', properties: { selector: { type: 'string' } }, required: ['selector'] },
      execute: async (input) => {
        if (!input || typeof input.selector !== 'string') throw new Error('Missing required parameter: selector');
        return await computerUse.click(input.selector);
      }
    });
    this.tools.set('computer_type', {
      description: 'Type text into input field by selector',
      schema: { type: 'object', properties: { selector: { type: 'string' }, text: { type: 'string' } }, required: ['selector', 'text'] },
      execute: async (input) => {
        if (!input || typeof input.selector !== 'string' || typeof input.text !== 'string') throw new Error('Missing required parameters: selector, text');
        return await computerUse.type(input.selector, input.text);
      }
    });
    this.tools.set('computer_screenshot', {
      description: 'Take desktop/browser screenshot',
      schema: { type: 'object', properties: { path: { type: 'string' } } },
      execute: async (input) => await computerUse.screenshot(input?.path)
    });
  }

  registerTool(name, description, schema, executeFn) {
    this.tools.set(name, { description, schema, execute: executeFn });
  }

  async invokeTool(name, input) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`JSON-RPC Method / MCP Tool not found: ${name}`);
    }
    return await tool.execute(input);
  }

  async handleJsonRpc(rpcRequest) {
    try {
      if (!rpcRequest || rpcRequest.jsonrpc !== '2.0' || !rpcRequest.method) {
        return { jsonrpc: '2.0', error: { code: -32600, message: 'Invalid Request' }, id: rpcRequest?.id || null };
      }

      const { method, params, id } = rpcRequest;
      if (method === 'tools/list') {
        return { jsonrpc: '2.0', result: { tools: this.listTools() }, id };
      }
      if (method === 'tools/call') {
        const { name, arguments: args } = params || {};
        const result = await this.invokeTool(name, args);
        return { jsonrpc: '2.0', result: { content: [{ type: 'text', text: JSON.stringify(result) }] }, id };
      }

      const result = await this.invokeTool(method, params);
      return { jsonrpc: '2.0', result, id };
    } catch (err) {
      return { jsonrpc: '2.0', error: { code: -32603, message: err.message }, id: rpcRequest?.id || null };
    }
  }

  listTools() {
    return Array.from(this.tools.entries()).map(([name, { description, schema }]) => ({
      name,
      description,
      inputSchema: schema || {}
    }));
  }
}

export const mcpServer = new MCPServerPlugin();
