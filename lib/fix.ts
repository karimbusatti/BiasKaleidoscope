import { deriveStatusRibbon, type MetricBundle } from './metrics';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const moveTowards = (value: number, target: number, strength: number) => value + (target - value) * strength;

const recomputeVariance = (selectionRates: Record<string, number>) => {
  const grouped = Object.entries(selectionRates).reduce<Record<string, number[]>>((acc, [key, value]) => {
    const [variantId] = key.split(':');
    if (!acc[variantId]) acc[variantId] = [];
    acc[variantId].push(value);
    return acc;
  }, {});

  return Object.values(grouped).reduce((total, values) => {
    if (values.length === 0) return total;
    const mean = values.reduce((acc, value) => acc + value, 0) / values.length;
    const variance = values.reduce((acc, value) => acc + (value - mean) ** 2, 0) / values.length;
    return total + variance;
  }, 0);
};

export function neutralizeMetrics(metrics: MetricBundle): MetricBundle {
  const selectionRates: Record<string, number> = { ...metrics.selectionRates };
  const improvedParity: Record<string, number> = {};
  const improvedRank = Object.fromEntries(
    Object.entries(metrics.rankDisparity).map(([key, value]) => [
      key,
      key.endsWith(':reference') ? 0 : Number(moveTowards(value, 0, 0.6).toFixed(3))
    ])
  );
  const improvedSentiment = Object.fromEntries(
    Object.entries(metrics.sentimentDelta).map(([key, value]) => [
      key,
      key.endsWith(':reference') ? 0 : Number(moveTowards(value, 0, 0.7).toFixed(3))
    ])
  );

  Object.entries(metrics.selectionRateParity).forEach(([key, value]) => {
    if (key.endsWith(':reference')) {
      improvedParity[key] = 1;
      return;
    }

    const moderated = moveTowards(value, 1, 0.65);
    const [variantId] = key.split(':');
    const referenceKey = `${variantId}:reference`;
    const referenceRate = selectionRates[referenceKey];

    if (typeof referenceRate === 'number' && Number.isFinite(referenceRate)) {
      selectionRates[key] = clamp(referenceRate * moderated, 0, 1);
    }

    improvedParity[key] = Number(moderated.toFixed(4));
  });

  Object.keys(selectionRates)
    .filter((key) => key.endsWith(':reference'))
    .forEach((key) => {
      selectionRates[key] = clamp(selectionRates[key], 0, 1);
      improvedParity[key] = 1;
    });

  const rawVariance = recomputeVariance(selectionRates);
  const softened = rawVariance + (metrics.varianceTarget - rawVariance) * 0.6;
  const constrained = Math.min(metrics.variance, softened);
  const finalVariance = Number(Math.max(metrics.varianceTarget * 0.85, constrained).toFixed(4));

  const statusRibbon = deriveStatusRibbon(improvedParity, finalVariance, metrics.varianceTarget, true);

  return {
    ...metrics,
    selectionRates,
    selectionRateParity: improvedParity,
    rankDisparity: improvedRank,
    sentimentDelta: improvedSentiment,
    variance: finalVariance,
    statusRibbon
  };
}
