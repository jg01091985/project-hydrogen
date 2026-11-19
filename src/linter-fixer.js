class LinterFixerEngine {
  constructor() {
    this.rulesFixed = 0;
  }

  lintAndFix(codeString) {
    if (!codeString || typeof codeString !== 'string') return codeString;

    let fixed = codeString;
    fixed = fixed.replace(/;;+/g, ';');

    this.rulesFixed++;
    return fixed;
  }
}

export const linterFixer = new LinterFixerEngine();
