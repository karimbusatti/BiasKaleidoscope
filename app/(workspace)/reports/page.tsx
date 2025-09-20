import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  let reports = [] as Awaited<ReturnType<typeof prisma.report.findMany>>;
  try {
    reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
  } catch (error) {
    console.warn('Reports fallback', error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Reports</h1>
        <p className="text-sm text-slate-500">Share transparency artifacts with public links and PDF exports.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Audit cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {reports.length === 0 && <p className="text-slate-500">No reports yet. Generate one from Fix mode.</p>}
          {reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
              <div>
                <div className="font-medium text-slate-800">Report {report.publicId}</div>
                <div className="text-xs text-slate-500">{formatDate(report.createdAt)}</div>
              </div>
              <Link href={`/reports/${report.publicId}`} className="text-sm text-brand underline">
                View
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
