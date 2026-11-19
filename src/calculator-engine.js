class ScientificCalculatorEngine {
  calculate(expression) {
    try {
      const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '');
      if (!sanitized) throw new Error('Invalid expression');

      const result = Function(`'use strict'; return (${sanitized})`)();
      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        throw new Error('Mathematical computation error');
      }
      return Math.round(result * 1e12) / 1e12;
    } catch (err) {
      throw new Error(`Calculator computation failed: ${err.message}`);
    }
  }
}

export const calcEngine = new ScientificCalculatorEngine();
