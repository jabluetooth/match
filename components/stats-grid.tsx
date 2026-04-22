"use client";

import { TrendingUp, FileText, Gift, Calendar, RotateCcw } from "lucide-react";

interface StatsGridProps {
  stats: {
    totalMatches: number;
    activeApplications: number;
    interviews: number;
    offers: number;
  };
  userName?: string | null;
}

function getInitials(name: string | null | undefined) {
  if (!name) return null;
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');
}

export function StatsGrid({ stats, userName }: StatsGridProps) {
  const initials = getInitials(userName);

  const activeRate =
    stats.totalMatches > 0
      ? Math.round((stats.activeApplications / stats.totalMatches) * 100)
      : 0;

  const interviewRate =
    stats.activeApplications > 0
      ? Math.round((stats.interviews / stats.activeApplications) * 100)
      : 0;

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Overview / profile card */}
      <div
        className="rounded-2xl bg-white border p-5 flex flex-col shadow-sm"
        style={{ borderColor: '#e2e3e4', minHeight: 200 }}
      >
        <div className="flex items-center justify-between mb-4">
          <p
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: '#473e3b' }}
          >
            Profile
          </p>
          <RotateCcw className="h-3.5 w-3.5" style={{ color: '#e2e3e4' }} />
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div
            className="h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0"
            style={{ background: '#1877f2' }}
          >
            {initials ?? <FileText className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight" style={{ color: '#080101' }}>
              {userName ?? 'Job Seeker'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#473e3b' }}>
              Active Search
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: '1px solid #e2e3e4' }}>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" style={{ color: '#1877f2' }} />
              <span className="text-sm font-bold" style={{ color: '#080101' }}>
                {stats.totalMatches}
              </span>
            </div>
            <p className="text-[10px]" style={{ color: '#473e3b' }}>Matches</p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" style={{ color: '#fdc901' }} />
              <span className="text-sm font-bold" style={{ color: '#080101' }}>
                {stats.activeApplications}
              </span>
            </div>
            <p className="text-[10px]" style={{ color: '#473e3b' }}>Active</p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <Gift className="h-3 w-3" style={{ color: '#22c55e' }} />
              <span className="text-sm font-bold" style={{ color: '#080101' }}>
                {stats.offers}
              </span>
            </div>
            <p className="text-[10px]" style={{ color: '#473e3b' }}>Offers</p>
          </div>
        </div>
      </div>

      {/* Gradient card 1 — Active Applications */}
      <div
        className="rounded-2xl p-5 flex flex-col shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #fdc901 0%, #f97316 60%, #ef4444 100%)',
          minHeight: 200,
        }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-white/90">Active Applications</p>
          <div className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center">
            <Calendar className="h-3.5 w-3.5 text-white" />
          </div>
        </div>
        <div className="mt-auto">
          <p className="text-6xl font-black text-white leading-none tracking-tight">
            {activeRate}%
          </p>
          <p className="text-xs text-white/70 mt-2">Avg. Active Rate</p>
        </div>
      </div>

      {/* Gradient card 2 — Interview Rate */}
      <div
        className="rounded-2xl p-5 flex flex-col shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #06b6d4 0%, #1877f2 55%, #7c3aed 100%)',
          minHeight: 200,
        }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-white/90">Interview Rate</p>
          <div className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center">
            <TrendingUp className="h-3.5 w-3.5 text-white" />
          </div>
        </div>
        <div className="mt-auto">
          <p className="text-6xl font-black text-white leading-none tracking-tight">
            {interviewRate}%
          </p>
          <p className="text-xs text-white/70 mt-2">Avg. Secured</p>
        </div>
      </div>
    </div>
  );
}
