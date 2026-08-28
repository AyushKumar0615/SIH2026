export const CognitiveEngine = {
  calculateSessionScore(accuracy, responseTimeSec, mistakes) {
    const accuracyScore = accuracy * 0.72;
    const speedScore = Math.max(0, 22 - responseTimeSec * 1.6);
    const mistakePenalty = mistakes * 3;
    return Math.max(0, Math.round(accuracyScore + speedScore - mistakePenalty));
  },

  getAdaptiveRecommendation(domain, accuracy, responseTimeSec, difficulty) {
    if (accuracy >= 88 && responseTimeSec <= 5.5) {
      return {
        newLevel: difficulty === 'Hard' ? 'Hard' : 'Slightly Higher',
        reason: `${domain} accuracy is above personal baseline and response time is comfortable. Increase challenge gently.`
      };
    }
    if (accuracy < 70 || responseTimeSec > 8) {
      return {
        newLevel: 'Supportive Easy',
        reason: `${domain} task load appears high today. Reduce distractions and keep the task familiar.`
      };
    }
    return {
      newLevel: difficulty,
      reason: `${domain} result is near personal baseline. Keep level stable and monitor the next two sessions.`
    };
  }
};
