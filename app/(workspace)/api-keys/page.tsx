import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">API Keys</h1>
        <p className="text-sm text-slate-500">Generate scoped keys for integrating Bias Kaleidoscope into your tooling.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>No keys yet. Create one to stream metrics into your CI/CD pipeline.</p>
          <Button>Create key</Button>
        </CardContent>
      </Card>
    </div>
  );
}
