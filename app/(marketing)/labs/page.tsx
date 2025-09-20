import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LabsPage() {
  const steps = [
    {
      title: 'Surface bias',
      description: 'Upload prompts or datasets and inspect selection rate parity across demographic placeholders.'
    },
    {
      title: 'Mitigate',
      description: 'Apply guided fixes like language neutralisers, weighting adjustments, and temperature tuning.'
    },
    {
      title: 'Activate',
      description: 'Generate audit cards and share transparency badges to move bias insights into action.'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Bias to Action Labs</h1>
        <p className="text-sm text-slate-500">A guided wizard for teams to operationalise bias monitoring.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <Card key={step.title} className="h-full">
            <CardHeader>
              <CardTitle>{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">{step.description}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
