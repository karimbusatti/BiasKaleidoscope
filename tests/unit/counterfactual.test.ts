import { describe, expect, it } from 'vitest';
import { runCounterfactual } from '@/lib/counterfactual';

describe('counterfactual engine', () => {
  it('produces deterministic outcomes for identical requests', () => {
    const request = {
      prompt: 'Evaluate {gender} engineer profile named {name} from {ethnicity} background.',
      datasetRows: [
        ['candidate_id', 'score'],
        ['1', '0.82'],
        ['2', '0.64'],
        ['3', '0.58'],
        ['4', '0.47']
      ],
      demographicPlaceholders: ['gender', 'ethnicity'],
      varianceTarget: 0.04,
      referenceGroup: 'reference',
      controls: { datasetSkew: 65, weighting: 35, temperature: 0.6, topP: 0.85 }
    } as const;

    const first = runCounterfactual(request);
    const second = runCounterfactual(request);

    expect(first.metrics.selectionRateParity).toEqual(second.metrics.selectionRateParity);
    expect(first.metrics.variance).toBeCloseTo(second.metrics.variance, 6);
    expect(first.outcomes).toHaveLength(second.outcomes.length);
    expect(Object.keys(first.metrics.selectionRateParity)).not.toHaveLength(0);
  });

  it('detects placeholders when none are provided', () => {
    const result = runCounterfactual({
      prompt: 'Assess {gender} developer using {pronoun} preferred style.',
      demographicPlaceholders: [],
      datasetRows: undefined,
      varianceTarget: 0.03,
      referenceGroup: 'reference',
      controls: { datasetSkew: 40, weighting: 60, temperature: 0.4, topP: 0.7 }
    });

    expect(result.variants.length).toBeGreaterThan(1);
    expect(
      Object.keys(result.metrics.selectionRateParity).some((key) => key.includes('gender'))
    ).toBe(true);
    expect(result.metrics.variance).toBeGreaterThan(0);
  });
});

