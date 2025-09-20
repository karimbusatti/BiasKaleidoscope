import { prisma } from '@/lib/prisma';
import { emptyMetrics, type MetricBundle } from '@/lib/metrics';
import { FixMode } from '@/components/fix/fix-mode';

export const dynamic = 'force-dynamic';

export default async function FixPage() {
  let latestRun: Awaited<ReturnType<typeof prisma.run.findFirst>> | null = null;
  try {
    latestRun = await prisma.run.findFirst({ orderBy: { createdAt: 'desc' } });
  } catch (error) {
    console.warn('Fix mode fallback', error);
  }
  const metrics = (latestRun?.metricsJson as MetricBundle | null) ?? {
    ...emptyMetrics,
    selectionRateParity: { 'baseline:reference': 1, 'baseline:groupA': 0.68, 'baseline:groupB': 0.72 },
    sentimentDelta: { 'baseline:reference': 0, 'baseline:groupA': -0.12, 'baseline:groupB': -0.08 },
    variance: 0.08,
    varianceTarget: 0.02,
    statusRibbon: 'red'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Fix mode</h1>
        <p className="text-sm text-slate-500">
          Apply recommended mitigations and preview parity improvements before exporting a report.
        </p>
      </div>
      <FixMode initialMetrics={metrics} />
    </div>
  );
}
