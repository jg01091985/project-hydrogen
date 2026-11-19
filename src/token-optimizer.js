class SelfImprovingTokenOptimizer {
  constructor() {
    this.optimizationGenerations = 0;
    this.bestScore = 0.0;
    this.practicalityCounter = 0;
  }

  evaluateQualityAndPracticality(promptText, responseText) {
    let qualityScore = 0;
    let practicalityScore = 0;

    const hasContent = responseText && responseText.length > 0;
    if (hasContent) qualityScore += 4;

    const hasNoPhantomPaths = !responseText.includes('absent on disk');
    if (hasNoPhantomPaths) qualityScore += 3;

    const tokenRatio = promptText.length / Math.max(1, responseText.length);
    if (tokenRatio >= 0.5 && tokenRatio <= 5.0) {
      qualityScore += 3;
      practicalityScore += 10;
    } else {
      practicalityScore += 5;
    }

    this.practicalityCounter += practicalityScore;
    return {
      qualityScore,
      practicalityScore: this.practicalityCounter,
      approved: qualityScore >= 8
    };
  }

  optimizeIteratively(prompt, response) {
    this.optimizationGenerations++;
    const evaluation = this.evaluateQualityAndPracticality(prompt, response);

    if (evaluation.qualityScore > this.bestScore) {
      this.bestScore = evaluation.qualityScore;
      return {
        improved: true,
        generation: this.optimizationGenerations,
        score: this.bestScore,
        practicality: evaluation.practicalityScore,
        action: 'Optimized and retained'
      };
    }
    return {
      improved: false,
      generation: this.optimizationGenerations,
      score: this.bestScore,
      practicality: evaluation.practicalityScore,
      action: 'Plateaued - keeping baseline'
    };
  }
}

export const tokenOptimizer = new SelfImprovingTokenOptimizer();
