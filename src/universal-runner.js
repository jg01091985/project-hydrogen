import fs from 'fs';
import path from 'path';
import os from 'os';

class UniversalRunnerManager {
  resolveTargetProjectRoot(targetPath = process.cwd()) {
    const resolved = path.resolve(targetPath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Target project root does not exist: ${resolved}`);
    }
    return {
      success: true,
      projectRoot: resolved,
      hasPackageJson: fs.existsSync(path.join(resolved, 'package.json')),
      hasGit: fs.existsSync(path.join(resolved, '.git'))
    };
  }

  generateCrossPlatformRunCommand(targetProjectRoot) {
    return {
      linux: `cd "${targetProjectRoot}" && npm start`,
      windowsPowerShell: `Set-Location "${targetProjectRoot}"; npm start`,
      claudeCodeCli: `npx @anthropic-ai/claude-code --dangerously-skip-permissions --model hydrogen`
    };
  }
}

export const universalRunner = new UniversalRunnerManager();

// test patch snippet
