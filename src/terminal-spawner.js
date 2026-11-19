import { exec } from 'child_process';
import os from 'os';

class TerminalSpawner {
  spawnVisibleTerminal(command = 'npm start') {
    const platform = os.platform();
    let spawnCmd = '';

    if (platform === 'darwin') {
      spawnCmd = `osascript -e 'tell application "Terminal" to do script "${command}"'`;
    } else if (platform === 'win32') {
      spawnCmd = `start powershell -NoExit -Command "${command}"`;
    } else {
      if (process.env.DISPLAY) {
        spawnCmd = `gnome-terminal -- bash -c "${command}; exec bash" || xterm -e "${command}" &`;
      } else {
        return { success: false, error: 'No graphical display (DISPLAY environment variable missing)' };
      }
    }

    try {
      exec(spawnCmd, (err) => {
        if (err) {
          console.error('[Terminal Spawner] Failed to spawn window:', err.message);
        }
      });
      return { success: true, platform, command };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

export const terminalSpawner = new TerminalSpawner();
