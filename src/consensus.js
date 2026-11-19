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
    this.consensusScore = Math.round(ratio * 10 * 10) / 10; // scaled out of 10
    const approved = ratio >= 0.5;
    return {
      approved,
      score: this.consensusScore,
      rating: `${this.consensusScore}/10 Quantum Verified`
    };
  }
}

export const consensusEngine = new QuantumConsensusEngine();
