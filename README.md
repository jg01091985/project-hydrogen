# Project Hydrogen

Technical specification and operational guide for Project Hydrogen.

## Overview

Project Hydrogen is a local Node.js routing proxy that intercepts Anthropic Messages API requests (`POST /v1/messages`) issued by the Claude Code CLI and translates them to Google GenAI SDK calls or headless browser automation sessions. It operates locally without requiring Anthropic API keys.

---

## Technical Architecture

```
[Claude Code CLI] ──(POST /v1/messages)──► [Hydrogen Proxy (Node.js)]
                                                    │
                             ┌──────────────────────┴──────────────────────┐
                             ▼                                             ▼
                   [Google GenAI SDK Engine]                     [Puppeteer Browser Bridge]
```

---

## Core Modules (`src/`)

- **`proxy.js`**: Express HTTP server handling Server-Sent Events (SSE) streaming, client disconnection (`req.on('close')`), and protocol translation.
- **`sdk-bridge.js`**: Interface to Google's GenAI SDK with exponential backoff and error classification.
- **`browser-bridge.js`**: Headless browser automation worker pool for web-based inference.
- **`anti-bot.js`**: Evasions via `puppeteer-extra-plugin-stealth`, User-Agent rotation, and request jitter.
- **`vault.js`**: AES-256-GCM authenticated encryption for local session storage.
- **`failover.js`**: Circuit breaker state machine (`CLOSED` ➔ `OPEN` ➔ `HALF_OPEN`).
- **`mcp-server.js`**: Model Context Protocol server complying with JSON-RPC 2.0 specifications.
- **`lsp-bridge.js`**: Language Server Protocol integration providing diagnostics and symbol resolution.
- **`swarm-mesh.js`**: Decentralized inter-instance node registry with heartbeat timeout pruning.
- **`mesh-crypto.js`**: End-to-end AES-256-GCM payload encryption for swarm communications.
- **`universal-runner.js`**: Path resolution and cross-platform command generation for arbitrary project roots.
- **`ast-patcher.js`**: AST-based code injection utility for programmatic file patching without regex fragility.

---

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- Git

### Commands

1. Clone repository:
   ```bash
   git clone https://github.com/jg01091985/project-hydrogen.git
   cd project-hydrogen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start proxy server:
   ```bash
   npm start
   ```

4. Launch Claude Code CLI in a separate terminal:
   ```bash
   npx @anthropic-ai/claude-code --dangerously-skip-permissions --model hydrogen
   ```

---

## Verification & Test Suite

The test suite executes 53 validation checks covering cryptographic vaults, circuit breakers, LSP bridges, and universal path runners:

```bash
node test-stress.js
```

---

## License

MIT License.
