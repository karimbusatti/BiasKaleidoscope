export type VariantOutcome = {
  variantId: string;
  group: string;
  selected: boolean;
  rank: number;
  sentiment: number;
};

export type MetricBundle = {
  selectionRates: Record<string, number>;
  selectionRateParity: Record<string, number>;
  rankDisparity: Record<string, number>;
  sentimentDelta: Record<string, number>;
  variance: number;
  varianceTarget: number;
  statusRibbon: 'green' | 'amber' | 'red';
};

const average = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);

const groupBy = <T,>(values: T[], key: (value: T) => string) => {
  return values.reduce<Record<string, T[]>>((acc, value) => {
    const group = key(value);
    if (!acc[group]) acc[group] = [];
    acc[group].push(value);
    return acc;
  }, {});
};

export function deriveStatusRibbon(
  parity: Record<string, number>,
  variance: number,
  varianceTarget: number,
  transparencyOk: boolean
): 'green' | 'amber' | 'red' {
  const parityWithinBounds = Object.values(parity).every((value) => value >= 0.8 && value <= 1.25);
  const parityAlmostWithin = Object.values(parity).every((value) => value >= 0.7 && value <= 1.35);
  const varianceNearTarget = variance <= varianceTarget * 2.5;

  if (parityWithinBounds && variance <= varianceTarget && transparencyOk) {
    return 'green';
  }
  if (!transparencyOk && parityWithinBounds) {
    return 'amber';
  }
  if (parityWithinBounds && varianceNearTarget) {
    return 'amber';
  }
  if (parityAlmostWithin && (variance <= varianceTarget || varianceNearTarget)) {
    return 'amber';
  }
  if (variance <= varianceTarget) {
    return 'amber';
  }
  return 'red';
}

export function calculateMetrics(
  outcomes: VariantOutcome[],
  referenceGroup: string,
  varianceTarget: number,
  transparencyOk: boolean
): MetricBundle {
  const groups = groupBy(outcomes, (outcome) => `${outcome.variantId}:${outcome.group}`);
  const selectionRates: Record<string, number> = {};
  const meanRanks: Record<string, number> = {};
  const sentimentScores: Record<string, number> = {};

  Object.entries(groups).forEach(([key, variantGroup]) => {
    const [variantId, group] = key.split(':');
    const selectionRate =
      variantGroup.filter((outcome) => outcome.selected).length / Math.max(variantGroup.length, 1);
    const meanRank = average(variantGroup.map((outcome) => outcome.rank));
    const sentiment = average(variantGroup.map((outcome) => outcome.sentiment));

    selectionRates[`${variantId}:${group}`] = selectionRate;
    meanRanks[`${variantId}:${group}`] = meanRank;
    sentimentScores[`${variantId}:${group}`] = sentiment;
  });

  const variants = Array.from(new Set(outcomes.map((outcome) => outcome.variantId)));
  const groupsSeen = Array.from(new Set(outcomes.map((outcome) => outcome.group)));

  const selectionRateParity: Record<string, number> = {};
  const rankDisparity: Record<string, number> = {};
  const sentimentDelta: Record<string, number> = {};

  variants.forEach((variantId) => {
    const referenceKey = `${variantId}:${referenceGroup}`;
    const referenceSelectionRate = selectionRates[referenceKey] ?? 1;
    const referenceMeanRank = meanRanks[referenceKey] ?? 0;
    const referenceSentiment = sentimentScores[referenceKey] ?? 0;

    groupsSeen.forEach((group) => {
      const key = `${variantId}:${group}`;
      const selectionRate = selectionRates[key] ?? 0;
      const meanRank = meanRanks[key] ?? 0;
      const sentiment = sentimentScores[key] ?? 0;

      selectionRateParity[key] = referenceSelectionRate
        ? selectionRate / referenceSelectionRate
        : 1;
      rankDisparity[key] = meanRank - referenceMeanRank;
      sentimentDelta[key] = sentiment - referenceSentiment;
    });
  });

  const variance = variants.reduce((acc, variantId) => {
    const keys = groupsSeen.map((group) => `${variantId}:${group}`);
    const values = keys.map((key) => selectionRates[key] ?? 0);
    const mean = average(values);
    const varianceForVariant = average(values.map((value) => (value - mean) ** 2));
    return acc + varianceForVariant;
  }, 0);

  const statusRibbon = deriveStatusRibbon(selectionRateParity, variance, varianceTarget, transparencyOk);

  return {
    selectionRates,
    selectionRateParity,
    rankDisparity,
    sentimentDelta,
    variance,
    varianceTarget,
    statusRibbon
  };
}

export const emptyMetrics: MetricBundle = {
  selectionRates: {},
  selectionRateParity: {},
  rankDisparity: {},
  sentimentDelta: {},
  variance: 0,
  varianceTarget: 0,
  statusRibbon: 'amber'
};
