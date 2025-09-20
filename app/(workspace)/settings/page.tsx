import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-sm text-slate-500">Configure privacy defaults and workspace preferences.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>Data is processed in-memory by default. Toggle opt-in storage at the project level.</p>
          <p className="text-slate-500">Self-hosting? Point the worker at your local model stubs.</p>
        </CardContent>
      </Card>
    </div>
  );
}
