import type { AuditCard } from '@/lib/report';
import { StatusBadge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AuditCardPreview({ card }: { card: AuditCard }) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{card.title}</CardTitle>
        <StatusBadge status={card.badgeColor} />
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <div className="text-xs uppercase text-slate-500">Inputs</div>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {card.inputs.map((input) => (
              <li key={input}>{input}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase text-slate-500">Metrics</div>
          <p className="mt-1 text-slate-600">
            Selection variance {card.metrics.variance.toFixed(3)} vs target {card.metrics.varianceTarget.toFixed(3)}.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase text-slate-500">Mitigations</div>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {card.mitigations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
          Public badge: <span className="font-semibold text-slate-700">{card.badgeColor.toUpperCase()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
