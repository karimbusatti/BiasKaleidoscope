'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { VarianceChart } from '@/components/charts/variance-chart';
import type { MetricBundle } from '@/lib/metrics';
import { extractPlaceholders } from '@/lib/placeholders';

interface SandboxPlaygroundProps {
  examples: { title: string; prompt: string }[];
}

interface RunResponse {
  runId: string;
  metrics: MetricBundle;
  variants: { id: string; prompt: string }[];
}

export function SandboxPlayground({ examples }: SandboxPlaygroundProps) {
  const [prompt, setPrompt] = useState(examples[0]?.prompt ?? 'Write a prompt with {placeholder}.');
  const [dataset, setDataset] = useState('candidate_id,score\n1,0.8\n2,0.6');
  const [varianceTarget, setVarianceTarget] = useState(0.02);
  const [datasetSkew, setDatasetSkew] = useState(20);
  const [weighting, setWeighting] = useState(50);
  const [temperature, setTemperature] = useState(0.4);
  const [topP, setTopP] = useState(0.9);
  const [selectedPlaceholders, setSelectedPlaceholders] = useState<string[]>([]);
  const [result, setResult] = useState<RunResponse | null>(null);
  const [baselineMetrics, setBaselineMetrics] = useState<MetricBundle | null>(null);
  const [improvedMetrics, setImprovedMetrics] = useState<MetricBundle | null>(null);
  const [mitigations, setMitigations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fixLoading, setFixLoading] = useState(false);

  const detectedPlaceholders = useMemo(() => extractPlaceholders(prompt), [prompt]);

  useEffect(() => {
    setSelectedPlaceholders(detectedPlaceholders);
  }, [prompt]);

  const handleRun = async () => {
    setLoading(true);
    const response = await fetch('/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'sandbox',
        prompt,
        dataset,
        placeholders: selectedPlaceholders,
        varianceTarget,
        referenceGroup: 'reference',
        controls: { datasetSkew, weighting, temperature, topP }
      })
    });
    const data = (await response.json()) as RunResponse;
    setResult(data);
    setBaselineMetrics(data.metrics);
    setImprovedMetrics(null);
    setMitigations([]);
    setLoading(false);
  };

  const handleFix = async () => {
    if (!result) return;
    setFixLoading(true);
    const response = await fetch('/api/fix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics: result.metrics })
    });
    const data = await response.json();
    setImprovedMetrics(data.metrics);
    setMitigations(data.mitigations);
    setResult((prev) => (prev ? { ...prev, metrics: data.metrics } : prev));
    setFixLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Prompt & dataset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <label className="block text-xs uppercase text-slate-500">
              Prompt
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                className="mt-2 h-40 w-full rounded-lg border border-slate-200 bg-white p-3 font-mono text-sm"
              />
            </label>
            <label className="block text-xs uppercase text-slate-500">
              Dataset (CSV snippet)
              <textarea
                value={dataset}
                onChange={(event) => setDataset(event.target.value)}
                className="mt-2 h-32 w-full rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs"
              />
            </label>
            <div>
              <div className="text-xs uppercase text-slate-500">Detected placeholders</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {detectedPlaceholders.length === 0 && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">None</span>
                )}
                {detectedPlaceholders.map((placeholder) => {
                  const active = selectedPlaceholders.includes(placeholder);
                  return (
                    <button
                      key={placeholder}
                      type="button"
                      onClick={() =>
                        setSelectedPlaceholders((prev) =>
                          active ? prev.filter((item) => item !== placeholder) : [...prev, placeholder]
                        )
                      }
                      className={`rounded-full px-3 py-1 text-xs transition ${
                        active ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {placeholder}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-xs uppercase text-slate-500">
                Dataset skew {datasetSkew}%
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={datasetSkew}
                  onChange={(event) => setDatasetSkew(Number(event.target.value))}
                  className="mt-2 w-full"
                />
              </label>
              <label className="block text-xs uppercase text-slate-500">
                Weighting {weighting}%
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weighting}
                  onChange={(event) => setWeighting(Number(event.target.value))}
                  className="mt-2 w-full"
                />
              </label>
              <label className="block text-xs uppercase text-slate-500">
                Temperature {temperature.toFixed(2)}
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={temperature}
                  onChange={(event) => setTemperature(Number(event.target.value))}
                  className="mt-2 w-full"
                />
              </label>
              <label className="block text-xs uppercase text-slate-500">
                top_p {topP.toFixed(2)}
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={topP}
                  onChange={(event) => setTopP(Number(event.target.value))}
                  className="mt-2 w-full"
                />
              </label>
            </div>
            <label className="block text-xs uppercase text-slate-500">
              Variance target ({varianceTarget.toFixed(2)})
              <input
                type="range"
                min={0.01}
                max={0.1}
                step={0.01}
                value={varianceTarget}
                onChange={(event) => setVarianceTarget(Number(event.target.value))}
                className="mt-2 w-full"
              />
            </label>
          </CardContent>
          <CardFooter>
            <Button onClick={handleRun} disabled={loading}>
              {loading ? 'Running…' : 'Run counterfactuals'}
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Sandbox status</CardTitle>
            {result && <StatusBadge status={result.metrics.statusRibbon} />}
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {!result && <p className="text-slate-500">Run the sandbox to populate metrics.</p>}
            {result && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs uppercase text-slate-500">Variants</div>
                  <ul className="mt-2 space-y-2">
                    {result.variants.map((variant) => (
                      <li key={variant.id} className="rounded-lg border border-slate-200 p-3">
                        <div className="text-xs font-medium text-slate-500">{variant.id}</div>
                        <div className="text-xs text-slate-600">{variant.prompt}</div>
                      </li>
                    ))}
                  </ul>
                </div>
                <VarianceChart
                  target={(improvedMetrics ?? result.metrics).varianceTarget}
                  data={[
                    {
                      label: 'Before',
                      variance: baselineMetrics ? baselineMetrics.variance : result.metrics.variance
                    },
                    {
                      label: 'After',
                      variance: improvedMetrics ? improvedMetrics.variance : result.metrics.variance
                    }
                  ]}
                />
                <Button onClick={handleFix} disabled={fixLoading} variant="outline">
                  {fixLoading ? 'Applying fixes…' : 'Fix variance'}
                </Button>
                {improvedMetrics && (
                  <div className="rounded-lg bg-slate-50 p-4">
                    <div className="text-xs uppercase text-slate-500">Improved parity</div>
                    <div className="mt-2 grid gap-2 text-xs">
                      {Object.entries(improvedMetrics.selectionRateParity).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-slate-600">{key}</span>
                          <span className="font-semibold">{value.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    {mitigations.length > 0 && (
                      <div className="mt-3 text-xs text-slate-500">
                        Mitigations: {mitigations.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
