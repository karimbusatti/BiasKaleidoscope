import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Billing</h1>
        <p className="text-sm text-slate-500">Upgrade to unlock private reports, HR mode, and larger CSV uploads.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="text-lg font-semibold text-slate-800">Pro</div>
            <div className="text-xs text-slate-500">€29 / month</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600">
              <li>Private reports</li>
              <li>HR mode & batch counterfactuals</li>
              <li>CSV uploads up to 2 MB</li>
            </ul>
            <Button className="mt-3">Upgrade</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
