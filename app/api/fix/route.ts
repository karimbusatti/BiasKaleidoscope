import { NextResponse } from 'next/server';
import { z } from 'zod';
import { neutralizeMetrics } from '@/lib/fix';

const schema = z.object({
  metrics: z.object({
    selectionRateParity: z.record(z.number()),
    rankDisparity: z.record(z.number()),
    sentimentDelta: z.record(z.number()),
    selectionRates: z.record(z.number()),
    variance: z.number(),
    varianceTarget: z.number(),
    statusRibbon: z.enum(['green', 'amber', 'red'])
  }),
  suggestedMitigations: z.array(z.string()).default([
    'Language neutralizer applied',
    'Reweighted dataset toward underrepresented groups'
  ])
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 422 });
  }
  const improved = neutralizeMetrics(parsed.data.metrics);
  return NextResponse.json({ metrics: improved, mitigations: parsed.data.suggestedMitigations });
}
