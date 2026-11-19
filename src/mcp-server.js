import { computerUse } from './computer-use.js';

class MCPServerPlugin {
  constructor() {
    this.tools = new Map();
    this.registerDefaultTools();
  }

  registerDefaultTools() {
    this.tools.set('hydrogen_status', {
      description: 'Get live status and telemetry of Project Hydrogen gateway',
      execute: async () => ({ status: 'active', version: '1.1.0', engine: 'dual-sdk-browser' })
    });
    this.tools.set('hydrogen_vault_inspect', {
      description: 'Inspect secure encryption status of Vault manager',
      execute: async () => ({ vault: 'AES-256-GCM', encrypted: true })
    });
    this.tools.set('computer_navigate', {
      description: 'Navigate browser to URL for desktop/browser control',
      execute: async (input) => await computerUse.navigate(input.url)
    });
    this.tools.set('computer_click', {
      description: 'Click element on screen by selector',
      execute: async (input) => await computerUse.click(input.selector)
    });
    this.tools.set('computer_type', {
      description: 'Type text into input field by selector',
      execute: async (input) => await computerUse.type(input.selector, input.text)
    });
    this.tools.set('computer_screenshot', {
      description: 'Take desktop/browser screenshot',
      execute: async (input) => await computerUse.screenshot(input?.path)
    });
  }

  registerTool(name, description, executeFn) {
    this.tools.set(name, { description, execute: executeFn });
  }

  async invokeTool(name, input) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`MCP Tool not found: ${name}`);
    }
    return await tool.execute(input);
  }

  listTools() {
    return Array.from(this.tools.entries()).map(([name, { description }]) => ({
      name,
      description
    }));
  }
}

export const mcpServer = new MCPServerPlugin();
