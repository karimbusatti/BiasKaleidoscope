import { NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeJobDescription, applyFixes } from '@/lib/hr';
import { generateAuditCard } from '@/lib/report';
import { runCounterfactual } from '@/lib/counterfactual';

const schema = z.object({
  jobDescription: z.string().min(20),
  sampleCvs: z.array(z.object({ name: z.string(), summary: z.string() })).default([]),
  varianceTarget: z.number().default(0.02)
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 422 });
  }

  const issues = analyzeJobDescription(parsed.data.jobDescription);
  const improved = applyFixes(parsed.data.jobDescription, issues);

  const counterfactual = runCounterfactual({
    prompt: parsed.data.jobDescription,
    demographicPlaceholders: ['gender'],
    varianceTarget: parsed.data.varianceTarget,
    referenceGroup: 'reference'
  });

  const report = generateAuditCard('hr-demo-run', {
    inputs: ['Job Description upload', ...parsed.data.sampleCvs.map((cv) => cv.name)],
    outcomes: counterfactual.outcomes,
    varianceTarget: parsed.data.varianceTarget,
    referenceGroup: 'reference',
    transparencyOk: true,
    mitigations: issues.map((issue) => issue.suggestion)
  });

  return NextResponse.json({
    issues,
    improvedJobDescription: improved,
    auditCard: report
  });
}
