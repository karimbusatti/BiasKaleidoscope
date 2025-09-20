import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderAuditCardPdf } from '@/lib/pdf';
import { generateAuditCard } from '@/lib/report';

export async function GET(_: Request, context: { params: { id: string } }) {
  const report = await prisma.report.findFirst({
    where: { OR: [{ id: context.params.id }, { publicId: context.params.id }] },
    include: { run: true }
  });

  const card = report?.run
    ? (() => {
        const base = generateAuditCard(report.runId, {
          inputs: [report.run.mode],
          outcomes: [],
          varianceTarget: (report.run.metricsJson as { varianceTarget?: number } | null)?.varianceTarget ?? 0.02,
          referenceGroup: 'reference',
          transparencyOk: true,
          mitigations: ['Language neutraliser applied']
        });
        const metrics = (report.run.metricsJson as any) ?? base.metrics;
        return { ...base, metrics, badgeColor: metrics.statusRibbon ?? base.badgeColor };
      })()
    : generateAuditCard(context.params.id, {
        inputs: ['Demo prompt'],
        outcomes: [],
        varianceTarget: 0.02,
        referenceGroup: 'reference',
        transparencyOk: true,
        mitigations: ['Run the sandbox to populate real data']
      });

  const pdfBuffer = await renderAuditCardPdf(card);
  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="audit-card-${context.params.id}.pdf"`
    }
  });
}
