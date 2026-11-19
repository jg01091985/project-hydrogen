import fs from 'fs';
import path from 'path';

class GroundingGatekeeper {
  constructor() {
    this.hallucinationCount = 0;
  }

  verifyGroundedResponse(responseText) {
    if (!responseText || typeof responseText !== 'string') {
      return { grounded: true, correctedText: responseText };
    }

    const pathMatches = responseText.matchAll(/(?:src|test)\/[a-zA-Z0-9_\-\.]+\.js/g);
    let corrected = responseText;
    let hallucinationDetected = false;

    for (const match of pathMatches) {
      const filePath = match[0];
      const fullPath = path.resolve(process.cwd(), filePath);
      if (!fs.existsSync(fullPath)) {
        hallucinationDetected = true;
        this.hallucinationCount++;
        corrected = corrected.replace(filePath, `${filePath} (⚠️ [Hydrogen Grounding Notice]: File verified absent on disk)`);
      }
    }

    return {
      grounded: !hallucinationDetected,
      correctedText: corrected,
      hallucinationCount: this.hallucinationCount
    };
  }
}

export const grounding = new GroundingGatekeeper();
