import { Suspense } from 'react';
import { HrAnalyzer } from '@/components/hr/hr-analyzer';
import { exampleJobDescription, exampleCVs } from '@/data/seeds';

export const dynamic = 'force-dynamic';

export default function HrPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">HR Mode</h1>
        <p className="text-sm text-slate-500">
          Upload a job description and sample CVs to detect bias hot-spots and auto-generate an improved JD.
        </p>
      </div>
      <Suspense fallback={<div>Loading HR tools…</div>}>
        <HrAnalyzer example={{ jobDescription: exampleJobDescription, cvs: exampleCVs }} />
      </Suspense>
    </div>
  );
}
