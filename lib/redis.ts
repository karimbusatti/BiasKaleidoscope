import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379');

export function createCounterfactualQueue() {
  return new Queue('counterfactual', { connection });
}

export function createCounterfactualWorker(processor: Parameters<typeof Worker>[1]) {
  return new Worker('counterfactual', processor, { connection });
}
