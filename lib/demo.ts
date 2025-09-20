import { prisma } from '@/lib/prisma';

export async function ensureDemoWorkspace() {
  const organization = await prisma.organization.upsert({
    where: { id: 'demo-org' },
    create: {
      id: 'demo-org',
      name: 'Demo Org'
    },
    update: {}
  });

  const project = await prisma.project.upsert({
    where: { id: 'demo-project' },
    create: {
      id: 'demo-project',
      name: 'Bias Sandbox',
      organizationId: organization.id
    },
    update: {}
  });

  return { organization, project };
}
