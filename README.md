# 🧪 Project Hydrogen

[![CI](https://github.com/jg01091985/project-hydrogen/actions/workflows/ci.yml/badge.svg)](https://github.com/jg01091985/project-hydrogen/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Quantum Verified](https://img.shields.io/badge/Quantum-11%2F10-emerald.svg)](https://github.com/jg01091985/project-hydrogen)

**Project Hydrogen** is an enterprise-grade, dual-engine AI routing proxy and browser automation bridge designed to power the official **Claude Code CLI** entirely through Google AI / Gemini web interfaces or direct GenAI SDK routing—**zero API keys required**.

---

## 🏗️ Architecture & Core Modules

Project Hydrogen bridges Anthropic Messages API specifications (`/v1/messages`) directly to Google's GenAI ecosystem with high-performance routing:

```
┌────────────────────────┐      POST /v1/messages      ┌─────────────────────────┐
│  Claude Code CLI       │ ──────────────────────────► │  Project Hydrogen Proxy │
│  (Frontend via npx)    │                             │  (Local Node.js Engine) │
└────────────────────────┘                             └───────────┬─────────────┘
                                                                   │
                                           ┌───────────────────────┴───────────────────────┐
                                           ▼                                               ▼
                                 ┌───────────────────┐                           ┌───────────────────┐
                                 │   Google GenAI    │                           │  Stealth Browser  │
                                 │    SDK Engine     │                           │   Bridge (Puppeteer)│
                                 └───────────────────┘                           └───────────────────┘
```

### Module Breakdown (`src/`)
- **`proxy.js`**: Express server handling SSE (Server-Sent Events) streaming, client disconnection listeners (`req.on('close')`), and Anthropic-to-Gemini message translation.
- **`sdk-bridge.js`**: Direct Google GenAI SDK interface with exponential backoff jitter and error classification.
- **`browser-bridge.js`**: Headless browser automation worker pool with resilient lifecycle tracking and session persistence.
- **`anti-bot.js`**: God-tier stealth evasion (`puppeteer-extra-plugin-stealth`), User-Agent rotation, proxy pooling, and human-like request jitter.
- **`orchestration.js`**: Subagent parallel task distribution and state map cleanup.
- **`consensus.js`**: Quantum multi-vote verification quorum.
- **`self-heal.js`**: Automated port reclamation and preflight system checks.
- **`self-learn.js`**: Asynchronous execution metrics and feedback persistence.
- **`translator.js`**: Robust multi-strategy JSON extraction for tool calls.

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/jg01091985/project-hydrogen.git
cd project-hydrogen
```

---

### 💻 Automated Cross-Platform Setup

Choose your terminal environment below:

#### Option A: Linux / macOS (Bash Terminal)
```bash
chmod +x setup.sh
./setup.sh
```

#### Option B: Windows (PowerShell)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
.\setup.ps1
```

---

## 🎮 Running Project Hydrogen & Claude Code CLI

### 1. Start the Proxy Server (Optional Standalone)
```bash
npm start
```

### 2. Launch Claude Code CLI Frontend
Open a new terminal window and run:
```bash
npx @anthropic-ai/claude-code --dangerously-skip-permissions --model hydrogen
```

---

## ⚙️ Configuration (`.env`)

Copy `.env.example` to `.env` to customize your deployment:

```env
HYDROGEN_PORT=31337
HYDROGEN_DEBUG=false
GOOGLE_AI_URL=https://gemini.google.com
HEADLESS=true
```

*(Note: On first run, if browser authentication is required for Gemini web mode, set `HEADLESS=false` in your `.env` file to log in manually once. Session cookies persist automatically in `.browser-profile`).*

---

## 🧪 Testing & Quality Assurance

Run the comprehensive unit test suite and orchestration stress tests:
```bash
npm test
node test-stress.js
```

---

## 📜 License

MIT License. Built with extreme precision, robustness, and zero drift.
