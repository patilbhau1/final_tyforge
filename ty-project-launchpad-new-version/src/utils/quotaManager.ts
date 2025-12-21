// API Quota Management System
class QuotaManager {
  private quotaExceeded = false;
  private lastQuotaReset = Date.now();
  private requestCount = 0;
  private maxRequestsPerMinute = 10; // Conservative limit
  private quotaResetTime = 60 * 1000; // 1 minute in milliseconds

  // Check if we should use fallback instead of API
  shouldUseFallback(): boolean {
    // Reset quota status after cooldown period
    if (Date.now() - this.lastQuotaReset > this.quotaResetTime) {
      this.quotaExceeded = false;
      this.requestCount = 0;
    }

    return this.quotaExceeded || this.requestCount >= this.maxRequestsPerMinute;
  }

  // Mark quota as exceeded
  markQuotaExceeded(): void {
    this.quotaExceeded = true;
    this.lastQuotaReset = Date.now();
  }

  // Increment request count
  incrementRequestCount(): void {
    this.requestCount++;
  }

  // Check if error is quota-related
  isQuotaError(error: any): boolean {
    if (error.response?.status === 429) {
      const errorData = error.response?.data;
      const errorMessage = JSON.stringify(errorData);
      return (
        errorMessage.includes('quota') || 
        errorMessage.includes('rate limit') || 
        errorMessage.includes('exceeded')
      );
    }
    return false;
  }

  // Get remaining time until quota reset
  getTimeUntilReset(): number {
    const timePassed = Date.now() - this.lastQuotaReset;
    const timeRemaining = Math.max(0, this.quotaResetTime - timePassed);
    return Math.ceil(timeRemaining / 1000); // Return seconds
  }

  // Reset quota manually
  resetQuota(): void {
    this.quotaExceeded = false;
    this.requestCount = 0;
    this.lastQuotaReset = Date.now();
  }

  // Get current quota status
  getQuotaStatus(): { exceeded: boolean; requestsThisMinute: number; timeUntilReset: number } {
    return {
      exceeded: this.quotaExceeded,
      requestsThisMinute: this.requestCount,
      timeUntilReset: this.getTimeUntilReset()
    };
  }
}

export const quotaManager = new QuotaManager();