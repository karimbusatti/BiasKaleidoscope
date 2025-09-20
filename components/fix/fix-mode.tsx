'use client';

import { useState } from 'react';
import { VarianceChart } from '@/components/charts/variance-chart';
import type { MetricBundle } from '@/lib/metrics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';

const placeholderMitigations = [
  'Adjust weighting for underrepresented profiles',
  'Neutralise gender-coded language',
  'Tighten temperature + top_p controls'
];

export function FixMode({ initialMetrics }: { initialMetrics: MetricBundle }) {
  const [currentMetrics, setCurrentMetrics] = useState<MetricBundle | null>(initialMetrics);
  const [mitigations, setMitigations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleApplyFix = async () => {
    if (!currentMetrics) return;
    setLoading(true);
    const response = await fetch('/api/fix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics: currentMetrics, suggestedMitigations: placeholderMitigations })
    });
    const data = await response.json();
    setCurrentMetrics(data.metrics);
    setMitigations(data.mitigations);
    setLoading(false);
  };

  if (!currentMetrics) {
    return <div className="text-sm text-slate-500">Run a sandbox experiment to unlock Fix Mode.</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Variance preview</CardTitle>
          <StatusBadge status={currentMetrics.statusRibbon} />
        </CardHeader>
        <CardContent className="space-y-4">
          <VarianceChart
            target={currentMetrics.varianceTarget}
            data={[
              { label: 'Before', variance: initialMetrics.variance },
              { label: 'After', variance: currentMetrics.variance }
            ]}
          />
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="text-xs uppercase text-slate-500">Selection rate parity</div>
              <ul className="mt-2 space-y-1">
                {Object.entries(currentMetrics.selectionRateParity).map(([key, value]) => (
                  <li key={key} className="flex justify-between">
                    <span className="text-slate-600">{key}</span>
                    <span className="font-medium">{value.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="text-xs uppercase text-slate-500">Sentiment delta</div>
              <ul className="mt-2 space-y-1">
                {Object.entries(currentMetrics.sentimentDelta).map(([key, value]) => (
                  <li key={key} className="flex justify-between">
                    <span className="text-slate-600">{key}</span>
                    <span className="font-medium">{value.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Button onClick={handleApplyFix} disabled={loading}>
            {loading ? 'Applying...' : 'Apply recommended fixes'}
          </Button>
        </CardContent>
      </Card>
      {mitigations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mitigation note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>The following mitigations were applied:</p>
            <ul className="list-disc space-y-1 pl-5">
              {mitigations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-slate-500">
              Export this note together with the Audit Card to maintain an audit-grade record of bias remediation.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
