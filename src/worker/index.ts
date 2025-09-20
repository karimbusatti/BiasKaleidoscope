import 'dotenv/config';
import { createCounterfactualWorker } from '@/lib/redis';
import { runCounterfactual } from '@/lib/counterfactual';
import { prisma } from '@/lib/prisma';

async function main() {
  createCounterfactualWorker(async (job) => {
    const result = runCounterfactual(job.data);
    await prisma.run.update({
      where: { id: job.data.runId },
      data: {
        variantsJson: result.variants,
        metricsJson: result.metrics,
        status: 'completed'
      }
    });
    return result;
  });
  // eslint-disable-next-line no-console
  console.log('Counterfactual worker ready');
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
