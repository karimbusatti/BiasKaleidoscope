import { Suspense } from 'react';
import { SandboxPlayground } from '@/components/sandbox/playground';
import { examplePrompts } from '@/data/seeds';

export const dynamic = 'force-dynamic';

export default function SandboxPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Sandbox</h1>
        <p className="text-sm text-slate-500">
          Upload a dataset or craft a prompt to explore counterfactual outcomes and parity metrics.
        </p>
      </div>
      <Suspense fallback={<div>Loading sandbox…</div>}>
        <SandboxPlayground examples={examplePrompts} />
      </Suspense>
    </div>
  );
}
