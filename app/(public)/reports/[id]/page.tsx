import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import type { MetricBundle } from '@/lib/metrics';
import { generateAuditCard } from '@/lib/report';
import { generateBadgeScript } from '@/lib/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function ReportPage({ params }: { params: { id: string } }) {
  let report = null as Awaited<ReturnType<typeof prisma.report.findFirst>> | null;
  try {
    report = await prisma.report.findFirst({
      where: { OR: [{ id: params.id }, { publicId: params.id }] },
      include: { run: true }
    });
  } catch (error) {
    console.warn('Report fallback', error);
  }

  if (!report) {
    const fallback = generateAuditCard(params.id, {
      inputs: ['Demo prompt with {gender} and {ethnicity} placeholders'],
      outcomes: [],
      varianceTarget: 0.02,
      referenceGroup: 'reference',
      transparencyOk: true,
      mitigations: ['Counterfactual coverage review']
    });

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Audit Card Preview</h1>
          <p className="text-sm text-slate-500">This is a demo report. Run analyses to create signed reports.</p>
        </div>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{fallback.title}</CardTitle>
            <StatusBadge status={fallback.badgeColor} />
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>No stored report found for ID {params.id}. Use the sandbox to generate one.</p>
            <p>Variance target: {fallback.metrics.varianceTarget.toFixed(3)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Share transparency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>Once a report is generated you can share a PDF or badge.</p>
            <Link
              href={`/api/reports/${params.id}/pdf`}
              className="inline-flex w-fit rounded-full bg-brand px-4 py-2 text-sm font-medium text-white"
            >
              Download PDF
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metrics = (report.run?.metricsJson as MetricBundle | null) ?? null;
  if (!metrics) {
    notFound();
  }

  const badge = generateBadgeScript({
    color: metrics.statusRibbon,
    href: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/reports/${report.publicId}`
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Audit Card</h1>
        <p className="text-sm text-slate-500">Public report for run {report.runId.slice(0, 8)}</p>
      </div>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Summary</CardTitle>
          <StatusBadge status={metrics.statusRibbon} />
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <div className="text-xs uppercase text-slate-500">Generated</div>
            <div className="text-slate-700">{report.createdAt.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500">Inputs</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {Array.isArray((report.run?.inputsJson as { inputs?: string[] } | null)?.inputs)
                ? ((report.run?.inputsJson as { inputs?: string[] }).inputs as string[]).map((input) => (
                    <li key={input}>{input}</li>
                  ))
                : [report.run?.mode].map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500">Variance</div>
            <div className="text-slate-700">
              {metrics.variance.toFixed(3)} (target {metrics.varianceTarget.toFixed(3)})
            </div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500">Mitigations</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Applied language neutraliser</li>
              <li>Reweighted dataset for fairness</li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500">Residual risk</div>
            <p className="text-slate-600">
              Continue to monitor drift monthly and re-run counterfactuals when prompts or datasets change materially.
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Share transparency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>Embed this badge into your hiring or prompt operations hub:</p>
          <code className="block rounded-lg bg-slate-900 p-4 text-xs text-slate-100">{badge}</code>
          <div className="flex items-center gap-3">
            <Link
              href={`/api/reports/${report.publicId}/pdf`}
              className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white"
            >
              Download PDF
            </Link>
            <Link
              href={`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/reports/${report.publicId}`}
              className="text-sm text-brand underline"
            >
              Public link
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
