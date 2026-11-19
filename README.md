# Project Hydrogen Technical Manual

## Purpose
Project Hydrogen is a local Node.js proxy server. It translates Anthropic Messages API requests from the Claude Code CLI into Google GenAI SDK calls or browser automation sessions. It requires no API keys.

## Architecture
```
[Claude Code CLI] ──(POST /v1/messages)──► [Hydrogen Proxy (Node.js)]
                                                    │
                             ┌──────────────────────┴──────────────────────┐
                             ▼                                             ▼
                   [Google GenAI SDK Engine]                     [Puppeteer Browser Bridge]
```

## Core Modules
- **`proxy.js`**: Manages HTTP server, Server-Sent Events (SSE) streaming, and client disconnections.
- **`sdk-bridge.js`**: Interfaces with the Google GenAI SDK with retry logic.
- **`browser-bridge.js`**: Controls headless browser automation worker pools.
- **`anti-bot.js`**: Applies stealth evasions and request jitter.
- **`vault.js`**: Encrypts local credentials using AES-256-GCM.
- **`failover.js`**: Controls circuit breaker state transitions.
- **`mcp-server.js`**: Implements JSON-RPC 2.0 Model Context Protocol.
- **`lsp-bridge.js`**: Provides diagnostics and symbol resolution.
- **`swarm-mesh.js`**: Manages decentralized node discovery and heartbeat timers.
- **`mesh-crypto.js`**: Encrypts swarm packets using AES-256-GCM.
- **`universal-runner.js`**: Resolves project paths across operating systems.
- **`ast-patcher.js`**: Patches source files using AST traversal.
- **`ste-validator.js`**: Validates text against ASD-STE100 Simplified Technical English rules.

## Installation Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/jg01091985/project-hydrogen.git
   cd project-hydrogen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the proxy server:
   ```bash
   npm start
   ```

4. Run the Claude Code CLI in a separate terminal:
   ```bash
   npx @anthropic-ai/claude-code --dangerously-skip-permissions --model hydrogen
   ```

## Test Procedure
Execute the test suite to verify all 54 modules:
```bash
node test-stress.js
```

## License
MIT License.
