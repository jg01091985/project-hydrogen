class SelectorResilienceEngine {
  constructor() {
    this.selectorStrategies = {
      inputBox: [
        'textarea[aria-label*="Enter a prompt"]',
        'div[contenteditable="true"]',
        'textarea.ql-editor',
        'input[type="text"]',
        'textarea'
      ],
      submitButton: [
        'button[aria-label*="Send"]',
        'button.send-button',
        'button[type="submit"]',
        'div.send-icon'
      ],
      responseContainer: [
        'div.message-content',
        'div.response-container',
        'article',
        '.markdown'
      ]
    };
  }

  getFallbackSelectors(targetType) {
    return this.selectorStrategies[targetType] || [];
  }
}

export const selectorResilience = new SelectorResilienceEngine();
