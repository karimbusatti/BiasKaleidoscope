import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runCounterfactual } from '@/lib/counterfactual';
import { prisma } from '@/lib/prisma';
import { ensureDemoWorkspace } from '@/lib/demo';

const runSchema = z.object({
  mode: z.enum(['sandbox', 'hr']).default('sandbox'),
  prompt: z.string().min(4),
  dataset: z.string().optional(),
  placeholders: z.array(z.string()).default([]),
  varianceTarget: z.number().default(0.02),
  referenceGroup: z.string().default('reference'),
  controls: z
    .object({
      datasetSkew: z.number().min(0).max(100),
      weighting: z.number().min(0).max(100),
      temperature: z.number().min(0).max(1),
      topP: z.number().min(0).max(1)
    })
    .optional()
});

export async function GET() {
  const runs = await prisma.run.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
  return NextResponse.json(runs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = runSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 422 });
  }

  const data = parsed.data;
  const { project } = await ensureDemoWorkspace();

  const run = await prisma.run.create({
    data: {
      projectId: project.id,
      mode: data.mode,
      inputsJson: data,
      status: 'processing'
    }
  });

  const result = runCounterfactual({
    prompt: data.prompt,
    datasetRows: data.dataset ? data.dataset.split('\n').map((row) => row.split(',')) : undefined,
    demographicPlaceholders: data.placeholders,
    varianceTarget: data.varianceTarget,
    referenceGroup: data.referenceGroup,
    controls: data.controls
  });

  await prisma.run.update({
    where: { id: run.id },
    data: {
      status: 'completed',
      variantsJson: result.variants,
      metricsJson: result.metrics
    }
  });

  return NextResponse.json(
    {
      runId: run.id,
      metrics: result.metrics,
      variants: result.variants,
      outcomes: result.outcomes
    },
    { status: 201 }
  );
}
