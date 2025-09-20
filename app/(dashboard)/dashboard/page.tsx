import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let runs = [] as Awaited<ReturnType<typeof prisma.run.findMany>>;
  try {
    runs = await prisma.run.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
  } catch (error) {
    console.warn('Dashboard fallback', error);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Last runs</h1>
          <p className="text-sm text-slate-500">
            Track bias metrics across sandbox experiments and HR reviews.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/sandbox"
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm"
          >
            New sandbox run
          </Link>
          <Link
            href="/hr"
            className="rounded-full border border-brand px-4 py-2 text-sm font-medium text-brand"
          >
            Analyze JD
          </Link>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Parity warnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {runs.length === 0 && <p className="text-slate-500">No runs yet. Launch a sandbox test.</p>}
            {runs.map((run) => {
              const ribbon = (run.metricsJson as { statusRibbon?: 'green' | 'amber' | 'red' } | null)?.statusRibbon ?? 'amber';
              return (
                <div key={run.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <div>
                    <div className="font-medium text-slate-800">Run {run.id.slice(0, 8)}</div>
                    <div className="text-xs text-slate-500">{formatDate(run.createdAt)}</div>
                  </div>
                  <StatusBadge status={ribbon} />
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transparency checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Bias Kaleidoscope highlights parity and transparency gaps. Complete a run, fix issues in
              Fix Mode, then export a signed audit card.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-slate-600">
              <li>Run counterfactual sandbox with demographic placeholders</li>
              <li>Apply recommended neutral language and weighting tweaks</li>
              <li>Generate report and share transparency badge</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
