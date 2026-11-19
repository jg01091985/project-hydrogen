# 🧪 Project Hydrogen

**Project Hydrogen** is an enterprise-grade, dual-engine AI routing proxy and browser bridge that powers the official **Claude Code CLI** entirely through Google AI / Gemini web mode or direct GenAI SDK routing—**zero API keys required**.

---

## ✨ Features

- **Web-Only & SDK Dual-Engine Routing**: Seamlessly bridge Claude Code requests to Google AI web interfaces via stealth browser automation or direct SDK connections.
- **Stealth Anti-Bot Evasion**: Advanced fingerprint masking, WebGL/renderer spoofing, Canvas noise injection, and proxy rotation.
- **Full Streaming & Tool Use Support**: Real-time Server-Sent Events (SSE) token streaming matching the Anthropic Messages API specification.
- **Zero Configuration Setup**: Cross-platform setup scripts for Linux, macOS, and Windows PowerShell.

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/project-hydrogen.git
cd project-hydrogen
```
*(Replace `your-username` with your public GitHub username)*

---

### 💻 Installation & Deployment

Choose your platform below:

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

Once setup is complete, you can launch the Claude Code CLI front end connected to Project Hydrogen:

```bash
npx @anthropic-ai/claude-code --dangerously-skip-permissions --model hydrogen
```

Or start the proxy standalone:
```bash
npm start
```

*(Note: On first run, if browser authentication is required for Gemini web mode, set `HEADLESS=false` in your `.env` file to log in manually once. Session cookies persist automatically in `.browser-profile`).*

---

## 📁 Project Structure

- `src/` — Core engine modules (proxy, anti-bot, browser bridge, translator, consensus, orchestration, self-heal, self-learn).
- `test/` — Comprehensive unit and integration test suites.
- `setup.sh` / `setup.ps1` — Automated cross-platform setup scripts.

---

## 📜 License

MIT License. Built with precision and robustness.
