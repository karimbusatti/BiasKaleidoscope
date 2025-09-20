import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAuditCard } from '@/lib/report';

export async function GET(_: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  const report = await prisma.report.findFirst({
    where: { OR: [{ id }, { publicId: id }] },
    include: { run: true }
  });

  if (!report || !report.run) {
    const fallback = generateAuditCard(id, {
      inputs: ['Demo prompt with {gender} placeholder'],
      outcomes: [],
      varianceTarget: 0.02,
      referenceGroup: 'reference',
      transparencyOk: true,
      mitigations: ['Review by human-in-the-loop']
    });
    return NextResponse.json({ report: fallback });
  }

  return NextResponse.json({
    report: {
      ...report,
      metrics: report.run.metricsJson,
      statusRibbon: (report.run.metricsJson as { statusRibbon?: string } | null)?.statusRibbon ?? 'amber'
    }
  });
}
