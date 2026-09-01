export const InsightEngine = {
  generateCaregiverReport(elderlyName = 'the user', t = (key) => key) {
    return {
      keyTrends: [
        {
          metric: t('insightMetricMemoryRecall'),
          status: t('statusStable'),
          changePercent: '+3%',
          badgeColor: 'green',
          explainableReason: t('insightReason1').replace('{name}', elderlyName),
          recommendation: t('insightRecommendation1')
        },
        {
          metric: t('insightMetricAttentionSpeed'),
          status: t('statusWatch'),
          changePercent: '-18%',
          badgeColor: 'amber',
          explainableReason: t('insightReason2'),
          recommendation: t('insightRecommendation2')
        },
        {
          metric: t('insightMetricRoutineConfidence'),
          status: t('statusGood'),
          changePercent: '+9%',
          badgeColor: 'green',
          explainableReason: t('insightReason3'),
          recommendation: t('insightRecommendation3')
        }
      ]
    };
  }
};
