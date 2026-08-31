export const InsightEngine = {
  generateCaregiverReport(elderlyName = 'the user') {
    return {
      keyTrends: [
        {
          metric: 'Memory recall',
          status: 'Stable',
          changePercent: '+3%',
          badgeColor: 'green',
          explainableReason: `Recall accuracy remained within ${elderlyName}'s personal 30-day band across three sessions.`,
          recommendation: 'Keep Bihu pair game at medium difficulty for two more days.'
        },
        {
          metric: 'Attention speed',
          status: 'Watch',
          changePercent: '-18%',
          badgeColor: 'amber',
          explainableReason: 'Attention response time slowed after a late bedtime note. The model avoids medical judgement and flags context.',
          recommendation: 'Try a shorter session after breakfast and add a sleep note tonight.'
        },
        {
          metric: 'Routine confidence',
          status: 'Good',
          changePercent: '+9%',
          badgeColor: 'green',
          explainableReason: 'Voice reminders were acknowledged without caregiver intervention for four consecutive tasks.',
          recommendation: 'Continue current reminder wording and keep Priya call visible on dashboard.'
        }
      ]
    };
  }
};
