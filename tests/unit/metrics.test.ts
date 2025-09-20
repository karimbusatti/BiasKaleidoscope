import { describe, expect, it } from 'vitest';
import { calculateMetrics, deriveStatusRibbon, type VariantOutcome } from '@/lib/metrics';
import { neutralizeMetrics } from '@/lib/fix';

describe('metrics', () => {
  it('calculates selection rate parity and variance', () => {
    const outcomes: VariantOutcome[] = [
      { variantId: 'baseline', group: 'reference', selected: true, rank: 1, sentiment: 0.7 },
      { variantId: 'baseline', group: 'groupA', selected: false, rank: 3, sentiment: 0.5 },
      { variantId: 'baseline', group: 'groupB', selected: true, rank: 2, sentiment: 0.6 }
    ];

    const metrics = calculateMetrics(outcomes, 'reference', 0.05, true);
    expect(metrics.selectionRateParity['baseline:groupA']).toBeLessThan(1);
    expect(metrics.selectionRateParity['baseline:groupB']).toBeGreaterThan(0);
    expect(metrics.variance).toBeGreaterThanOrEqual(0);
  });

  it('derives status ribbon based on parity and variance', () => {
    const ribbon = deriveStatusRibbon({ a: 0.9, b: 1.1 }, 0.01, 0.02, true);
    expect(ribbon).toBe('green');

    const amber = deriveStatusRibbon({ a: 0.7 }, 0.05, 0.02, true);
    expect(amber).toBe('amber');

    const red = deriveStatusRibbon({ a: 0.6 }, 0.2, 0.02, false);
    expect(red).toBe('red');
  });

  it('neutralizeMetrics reduces variance and parity drift', () => {
    const outcomes: VariantOutcome[] = [];
    for (let index = 0; index < 6; index++) {
      outcomes.push({ variantId: 'baseline', group: 'reference', selected: true, rank: 1, sentiment: 0.7 });
      outcomes.push({ variantId: 'baseline', group: 'focal', selected: index % 2 === 0, rank: 3, sentiment: 0.45 });
    }

    const metrics = calculateMetrics(outcomes, 'reference', 0.02, true);
    const improved = neutralizeMetrics(metrics);

    const originalDiff = Object.entries(metrics.selectionRateParity)
      .filter(([key]) => !key.endsWith(':reference'))
      .reduce((acc, [, value]) => acc + Math.abs(1 - value), 0);
    const improvedDiff = Object.entries(improved.selectionRateParity)
      .filter(([key]) => !key.endsWith(':reference'))
      .reduce((acc, [, value]) => acc + Math.abs(1 - value), 0);

    expect(improvedDiff).toBeLessThan(originalDiff);
    expect(improved.variance).toBeLessThanOrEqual(metrics.variance);
    expect(['green', 'amber']).toContain(improved.statusRibbon);
  });
});
