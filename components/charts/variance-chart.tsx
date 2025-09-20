'use client';

import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';

export function VarianceChart({
  data,
  target
}: {
  data: { label: string; variance: number }[];
  target: number;
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#CBD5F5" />
          <XAxis dataKey="label" stroke="#475569" fontSize={12} />
          <YAxis stroke="#475569" fontSize={12} domain={[0, 'auto']} />
          <Tooltip formatter={(value: number) => value.toFixed(3)} />
          <Line type="monotone" dataKey="variance" stroke="#2F3C7E" strokeWidth={3} dot={{ r: 4 }} />
          <ReferenceLine y={target} stroke="#F6AD55" strokeDasharray="4 4" label="Target" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
