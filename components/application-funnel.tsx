"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ApplicationFunnelProps {
  data: Array<{
    status: string;
    _count: number;
  }>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: '#9ca3af' },
  applied: { label: 'Applied', color: '#1877f2' },
  phone_screen: { label: 'Phone Screen', color: '#fdc901' },
  interview: { label: 'Interview', color: '#06b6d4' },
  offer: { label: 'Offer', color: '#22c55e' },
  rejected: { label: 'Rejected', color: '#ef4444' },
  accepted: { label: 'Accepted', color: '#16a34a' },
};

export function ApplicationFunnel({ data }: ApplicationFunnelProps) {
  const chartData = data.map(item => ({
    status: STATUS_CONFIG[item.status]?.label ?? item.status,
    count: item._count,
    color: STATUS_CONFIG[item.status]?.color ?? '#9ca3af',
  }));

  return (
    <div
      className="rounded-2xl bg-white border shadow-sm overflow-hidden"
      style={{ borderColor: '#e2e3e4' }}
    >
      <div
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ borderColor: '#e2e3e4' }}
      >
        <div>
          <h2 className="text-sm font-bold" style={{ color: '#080101' }}>
            Application Funnel
          </h2>
          <p className="text-xs mt-0.5" style={{ color: '#473e3b' }}>
            Track your application progress
          </p>
        </div>
        {chartData.length > 0 && (
          <p className="text-2xl font-black tabular-nums" style={{ color: '#080101' }}>
            {data.reduce((s, i) => s + i._count, 0)}
            <span className="text-xs font-normal ml-1" style={{ color: '#473e3b' }}>total</span>
          </p>
        )}
      </div>

      <div className="p-6">
        {chartData.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: '#473e3b' }}>No applications yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e3e4" vertical={false} />
              <XAxis
                dataKey="status"
                tick={{ fontSize: 11, fill: '#473e3b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#473e3b' }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip
                cursor={{ fill: '#fcfcff' }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e3e4',
                  borderRadius: '0.75rem',
                  fontSize: 12,
                  color: '#080101',
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartData.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {chartData.map((item) => (
              <div key={item.status} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs" style={{ color: '#473e3b' }}>
                  {item.status}:{' '}
                  <span className="font-semibold" style={{ color: '#080101' }}>
                    {item.count}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
