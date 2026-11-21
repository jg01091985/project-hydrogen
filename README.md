# Project Hydrogen Technical Manual & Agent Deployment Guide

## Overview
**Project Hydrogen** is a sovereign, API-less, zero-cost AI inference and orchestration gateway. Designed to replace per-token commercial cloud billing APIs, Hydrogen translates Anthropic Messages API requests into Google GenAI SDK inferences and stealth browser automation sessions (`gemini-4-hydrogen`). It requires no paid API keys.

---

## Architecture & Request Routing

```
[Claude Code CLI / Client] ──(POST /v1/messages)──► [Hydrogen Proxy Server (Node.js)]
                                                            │
                                  ┌─────────────────────────┴─────────────────────────┐
                                  ▼                                                   ▼
                       [Google GenAI SDK Bridge]                            [Stealth Browser Automation Pool]
                     (Direct API fallback rotation)                         (Headless Chrome over Google Free Web AI)
```

---

## Core Modules

- **`proxy.js`**: HTTP server, Server-Sent Events (SSE) streaming, client disconnections.
- **`sdk-bridge.js`**: Primary inference execution via Google GenAI SDK (`gemini-4-hydrogen`) with automated fallback (`gemini-2.5-pro`).
- **`browser-bridge.js`**: Stealth browser worker pool with anti-bot evasion, jitter injection, and `--disable-dev-shm-usage` / `--no-sandbox` flags for WSL2/Linux hardening.
- **`computer-use.js`**: Cross-platform browser automation controller respecting headless environment detection (`WSL2`, `CI`, missing `DISPLAY`).
- **`anti-bot.js`**: Fingerprint spoofing, canvas/WebGL noise injection, and behavioral pacing.
- **`vault.js`**: AES-256-GCM cryptographic credential storage.
- **`failover.js`**: Circuit breaker state transition matrix.
- **`mcp-server.js`**: JSON-RPC 2.0 Model Context Protocol server.
- **`lsp-bridge.js`**: Diagnostic symbol resolution and AST patching.
- **`swarm-mesh.js`**: Decentralized node discovery and cryptographic heartbeat.
- **`ste-validator.js`**: ASD-STE100 Simplified Technical English compliance validator.

---

## Agent Deployment Protocol (For Autonomous Agents)

When an autonomous agent or deployment bot initializes Project Hydrogen on a target machine (including WSL2 or headless Linux servers), execute the following initialization sequence:

### Step 1: Environment Preparation & Repository Clone
```bash
git clone https://github.com/jg01091985/project-hydrogen.git
cd project-hydrogen
```

### Step 2: Dependency Installation
```bash
npm install
```

### Step 3: Hardened Execution (WSL2 / Linux Headless)
To prevent GUI display errors and shared memory crashes in WSL2 or headless environments, ensure headless mode and sandbox restrictions are active:
```bash
export HEADLESS=true
export HYDROGEN_DEBUG=true
npm start
```

### Step 4: Verification & Stress Testing
```bash
node test-stress.js
```

---

## Service Specification (`POST /v1/messages`)

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "model": "gemini-4-hydrogen",
  "messages": [
    { "role": "user", "content": "System operational check." }
  ]
}
```

---

## License
MIT License.
