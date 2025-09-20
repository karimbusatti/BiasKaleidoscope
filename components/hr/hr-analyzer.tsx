'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AuditCardPreview } from '@/components/report/audit-card-preview';
import type { AuditCard } from '@/lib/report';
import type { Issue } from '@/lib/hr';

export function HrAnalyzer({ example }: { example: { jobDescription: string; cvs: { name: string; summary: string }[] } }) {
  const [jobDescription, setJobDescription] = useState(example.jobDescription);
  const [cvs, setCvs] = useState(example.cvs);
  const [varianceTarget, setVarianceTarget] = useState(0.02);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [improved, setImproved] = useState('');
  const [auditCard, setAuditCard] = useState<AuditCard | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const response = await fetch('/api/hr/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobDescription, sampleCvs: cvs, varianceTarget })
    });
    const data = await response.json();
    setIssues(data.issues ?? []);
    setImproved(data.improvedJobDescription ?? '');
    setAuditCard(data.auditCard ?? null);
    setLoading(false);
  };

  const handleAddCv = () => {
    setCvs((prev) => [...prev, { name: 'New Candidate', summary: 'Add summary...' }]);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <Card className="space-y-0">
        <CardHeader>
          <CardTitle>Job description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <textarea
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            className="h-64 w-full rounded-lg border border-slate-200 bg-white p-3 font-mono text-sm"
          />
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs uppercase text-slate-500">Sample CVs</span>
              <Button variant="outline" size="sm" type="button" onClick={handleAddCv}>
                Add CV
              </Button>
            </div>
            <div className="space-y-2">
              {cvs.map((cv, index) => (
                <div key={`${cv.name}-${index}`} className="rounded-lg border border-slate-200 p-3">
                  <div className="font-medium text-slate-700">{cv.name}</div>
                  <div className="text-xs text-slate-500">{cv.summary}</div>
                </div>
              ))}
            </div>
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
          <Button onClick={handleAnalyze} disabled={loading}>
            {loading ? 'Analyzing…' : 'Analyze JD'}
          </Button>
        </CardFooter>
      </Card>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Detected issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {issues.length === 0 && <p className="text-slate-500">Run an analysis to surface issues.</p>}
            {issues.map((issue) => (
              <div key={issue.id} className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs uppercase text-slate-500">{issue.type}</div>
                <div className="font-medium text-slate-700">{issue.description}</div>
                <div className="text-xs text-slate-500">{issue.suggestion}</div>
              </div>
            ))}
          </CardContent>
        </Card>
        {improved && (
          <Card>
            <CardHeader>
              <CardTitle>Improved JD</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-700">{improved}</pre>
            </CardContent>
          </Card>
        )}
        {auditCard && <AuditCardPreview card={auditCard} />}
      </div>
    </div>
  );
}
