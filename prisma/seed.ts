import { PrismaClient } from '@prisma/client';
import { ensureDemoWorkspace } from '../lib/demo';
import { runCounterfactual } from '../lib/counterfactual';
import { examplePrompts, exampleJobDescription } from '../data/seeds';

const prisma = new PrismaClient();

async function main() {
  const { project } = await ensureDemoWorkspace();

  for (const prompt of examplePrompts) {
    const run = await prisma.run.create({
      data: {
        projectId: project.id,
        mode: 'sandbox',
        inputsJson: { prompt: prompt.prompt, title: prompt.title },
        status: 'processing'
      }
    });
    const counterfactual = runCounterfactual({
      prompt: prompt.prompt,
      demographicPlaceholders: [],
      varianceTarget: 0.02,
      referenceGroup: 'reference'
    });
    await prisma.run.update({
      where: { id: run.id },
      data: {
        status: 'completed',
        metricsJson: counterfactual.metrics,
        variantsJson: counterfactual.variants
      }
    });
  }

  await prisma.artifact.upsert({
    where: { id: 'demo-jd' },
    update: {},
    create: {
      id: 'demo-jd',
      type: 'JD',
      contentMeta: { title: 'Demo JD', body: exampleJobDescription },
      projectId: project.id
    }
  });

  const firstRun = await prisma.run.findFirst({ orderBy: { createdAt: 'asc' } });
  if (firstRun) {
    await prisma.report.upsert({
      where: { id: 'demo-report' },
      update: {},
      create: {
        id: 'demo-report',
        runId: firstRun.id,
        publicId: 'demo',
        status: 'ready'
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
