# Project Hydrogen Technical Manual

## Overview
Project Hydrogen is an experimental sovereign AI proxy. It provides zero-cost LLM inference without paid API keys. It translates client requests into Google GenAI SDK calls and stealth browser sessions.

---

## Core Modules
- **`proxy.js`**: Manages HTTP server and Server-Sent Events.
- **`sdk-bridge.js`**: Interfaces with Google GenAI SDK with fallback rotation.
- **`browser-bridge.js`**: Controls browser worker pools with stealth evasion and Singleton lock cleanup.
- **`computer-use.js`**: Handles cross-platform browser automation across Linux, WSL2, and Windows.
- **`anti-bot.js`**: Applies fingerprint noise and request jitter.
- **`vault.js`**: Encrypts local credentials using AES-256-GCM.
- **`failover.js`**: Controls circuit breaker state transitions.
- **`mcp-server.js`**: Implements JSON-RPC Model Context Protocol.
- **`ste-validator.js`**: Validates text against ASD-STE100 rules.

---

## Deployment Guide (Windows, WSL2 & Linux)

### Option A: Native Windows (PowerShell)
1. Clone the repository:
   ```powershell
   git clone https://github.com/jg01091985/project-hydrogen.git
   cd project-hydrogen
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start proxy server:
   ```powershell
   $env:HEADLESS="true"
   npm start
   ```

### Option B: WSL2 & Linux Headless
1. Clone the repository:
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
   export HEADLESS=true
   npm start
   ```

---

## Verification
Execute the test suite to verify all modules:
```bash
node test-stress.js
```

## License
MIT License.
