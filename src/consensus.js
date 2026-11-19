export class QuantumConsensusEngine {
  constructor() {
    this.consensusScore = 1.0;
  }

  evaluateConsensus(votes = []) {
    if (!Array.isArray(votes) || votes.length === 0) {
      return {
        approved: false,
        score: 0.0,
        rating: "0/10 Unverified (Empty Votes)"
      };
    }
    const positive = votes.filter(v => v === true).length;
    const ratio = positive / votes.length;
    this.consensusScore = Math.round(ratio * 10 * 10) / 10;
    const approved = ratio >= 0.5;
    return {
      approved,
      score: this.consensusScore,
      rating: `${this.consensusScore}/10 Quantum Verified`
    };
  }

  ensembleEvaluate(responses = []) {
    if (!responses.length) return { consensus: null, confidence: 0 };
    const counts = {};
    for (const r of responses) {
      counts[r] = (counts[r] || 0) + 1;
    }
    let best = responses[0];
    let maxCount = 0;
    for (const [res, cnt] of Object.entries(counts)) {
      if (cnt > maxCount) {
        maxCount = cnt;
        best = res;
      }
    }
    const confidence = Math.round((maxCount / responses.length) * 100);
    return { consensus: best, confidence, totalModels: responses.length };
  }
}

export const consensusEngine = new QuantumConsensusEngine();
