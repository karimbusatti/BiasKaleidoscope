import { calculateMetrics, type MetricBundle, type VariantOutcome } from './metrics';

export type AuditCard = {
  id: string;
  runId: string;
  title: string;
  createdAt: string;
  inputs: string[];
  metrics: MetricBundle;
  mitigations: string[];
  residualRisks: string[];
  badgeColor: 'green' | 'amber' | 'red';
};

export function generateAuditCard(
  runId: string,
  options: {
    inputs: string[];
    outcomes: VariantOutcome[];
    varianceTarget: number;
    referenceGroup: string;
    transparencyOk: boolean;
    mitigations: string[];
  }
): AuditCard {
  const metrics = calculateMetrics(
    options.outcomes,
    options.referenceGroup,
    options.varianceTarget,
    options.transparencyOk
  );

  return {
    id: `${runId}-audit`,
    runId,
    title: 'Bias Kaleidoscope Audit Card',
    createdAt: new Date().toISOString(),
    inputs: options.inputs,
    metrics,
    mitigations: options.mitigations,
    residualRisks:
      metrics.statusRibbon === 'green'
        ? ['Residual risk: monitor drift quarterly.']
        : ['Residual risk: follow up with human review on edge cases.'],
    badgeColor: metrics.statusRibbon
  };
}
