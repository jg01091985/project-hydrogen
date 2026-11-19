class FailoverMatrix {
  constructor() {
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.threshold = 3;
    this.cooldownMs = 45000;
    this.lastFailureTime = 0;
  }

  recordSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      console.warn('[Hydrogen Failover] Circuit breaker tripped to OPEN due to consecutive failures. Activating SDK fallback matrix.');
    }
  }

  canAttempt() {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.cooldownMs) {
        this.state = 'HALF_OPEN';
        console.log('[Hydrogen Failover] Circuit breaker entering HALF_OPEN trial state.');
        return true;
      }
      return false;
    }
    return true;
  }

  getStatus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      cooldownRemaining: this.state === 'OPEN' ? Math.max(0, this.cooldownMs - (Date.now() - this.lastFailureTime)) : 0
    };
  }
}

export const failoverMatrix = new FailoverMatrix();
