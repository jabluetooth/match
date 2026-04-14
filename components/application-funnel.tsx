"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ApplicationFunnelProps {
  data: Array<{
    status: string;
    _count: number;
  }>;
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: '#9CA3AF' },
  submitted: { label: 'Submitted', color: '#3B82F6' },
  screening: { label: 'Screening', color: '#8B5CF6' },
  interview: { label: 'Interview', color: '#06B6D4' },
  offer: { label: 'Offer', color: '#10B981' },
  rejected: { label: 'Rejected', color: '#EF4444' },
  accepted: { label: 'Accepted', color: '#059669' },
};

export function ApplicationFunnel({ data }: ApplicationFunnelProps) {
  const chartData = data.map(item => ({
    status: STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG]?.label || item.status,
    count: item._count,
    color: STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG]?.color || '#9CA3AF',
  }));

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Application Funnel</h2>
        <p className="text-sm text-gray-600">Track your application progress</p>
      </div>

      <div className="p-6">
        {chartData.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No applications yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="status" 
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          {chartData.map((item) => (
            <div key={item.status} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600">
                {item.status}: <span className="font-semibold">{item.count}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
