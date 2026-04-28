import React from 'react';

// ── Base pulse block ──────────────────────────────────────────────────────────
interface SkeletonProps { className?: string; style?: React.CSSProperties; }
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} style={style} />
);

// ── Dashboard: sensor metric card ────────────────────────────────────────────
export const SkeletonCard: React.FC = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 animate-pulse">
    <div className="flex items-start justify-between">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-5 w-16 rounded" />
    </div>
    <div className="space-y-1.5">
      <Skeleton className="h-3 w-24 rounded" />
      <Skeleton className="h-9 w-20 rounded" />
    </div>
    <Skeleton className="h-1.5 w-full rounded-full" />
  </div>
);

// ── Dashboard: area chart block ───────────────────────────────────────────────
export const SkeletonChart: React.FC = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 animate-pulse">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-48 rounded" />
      <Skeleton className="h-7 w-24 rounded-lg" />
    </div>
    <Skeleton className="h-48 w-full rounded-xl" />
  </div>
);

// ── Plot List: row skeleton ───────────────────────────────────────────────────
export const SkeletonPlotRow: React.FC = () => (
  <div className="bg-white border border-slate-200 rounded-2xl px-6 py-5 flex items-center gap-6 animate-pulse">
    <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-48 rounded" />
      <Skeleton className="h-3 w-32 rounded" />
    </div>
    <div className="hidden sm:flex gap-8">
      <div className="space-y-1.5">
        <Skeleton className="h-2.5 w-16 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-2.5 w-16 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
    </div>
    <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
  </div>
);

// ── Plot Details: full-page skeleton ─────────────────────────────────────────
export const SkeletonPlotDetails: React.FC = () => (
  <div className="w-full pb-12 px-4 md:px-0 animate-pulse space-y-10">
    {/* Header */}
    <div className="flex items-center justify-between border-b border-slate-100 pb-10">
      <div className="flex items-center gap-6">
        <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded" />
          <Skeleton className="h-5 w-40 rounded" />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <Skeleton className="h-12 w-32 rounded-2xl" />
        <Skeleton className="h-12 w-32 rounded-2xl" />
      </div>
    </div>

    {/* Body grid */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-8 space-y-8">
        {/* Summary card */}
        <div className="bg-white border border-slate-200 rounded-[3rem] p-10 grid grid-cols-12 gap-10">
          <Skeleton className="col-span-4 aspect-square rounded-[2.5rem]" />
          <div className="col-span-8 grid grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-6 w-32 rounded" />
              </div>
            ))}
            <div className="col-span-2 pt-6 border-t border-slate-50">
              <Skeleton className="h-16 w-full rounded-3xl" />
            </div>
          </div>
        </div>
        {/* Chart */}
        <div className="bg-white border border-slate-200 rounded-[3rem] p-10 space-y-6">
          <Skeleton className="h-6 w-56 rounded" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        {/* Log */}
        <div className="bg-white border border-slate-200 rounded-[3rem] p-10 space-y-6">
          <Skeleton className="h-6 w-48 rounded" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-11 w-11 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-40 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-4 space-y-8">
        <Skeleton className="h-72 w-full rounded-[3rem]" />
        <Skeleton className="h-52 w-full rounded-[3rem]" />
      </div>
    </div>
  </div>
);

// ── Dashboard full page skeleton ──────────────────────────────────────
export const SkeletonDashboard: React.FC = () => (
  <div className="flex flex-col flex-1 h-full bg-[#f5f5f3] animate-pulse">
    {/* Header Skeleton Block */}
    <div className="px-6 pt-5">
      <div className="flex items-center h-20 bg-white border border-zinc-200 rounded-xl px-5 gap-6">
        <div className="flex items-center gap-3 pr-5 border-r border-zinc-100">
          <Skeleton className="h-[30px] w-[30px] rounded-[7px]" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        </div>
        <div className="flex gap-2 flex-1">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="flex items-center gap-2 pl-5 border-l border-zinc-100">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-3 w-8 rounded" />
        </div>
      </div>
    </div>

    {/* Main Content Area */}
    <div className="p-6 md:p-8 max-w-[1400px] w-full mx-auto pb-24 space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-6 h-[140px] flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-5 w-12 rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-9 w-24 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Weather Forecast (7-day grid) */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-3 w-32 rounded" />
        </div>
        <div className="flex w-full divide-x divide-zinc-100 border border-zinc-100 rounded-xl bg-white overflow-hidden">
          {[...Array(7)].map((_, i) => (
            <div key={i} className={`flex-1 min-w-[100px] p-4 flex flex-col items-center gap-3 ${i === 0 ? 'bg-[#f5f5f3]/50' : ''}`}>
              <Skeleton className="h-2.5 w-10 rounded" />
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-5 w-12 rounded" />
              <Skeleton className="h-2 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Alert & Advisory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between h-[180px]">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="space-y-2.5 w-full">
                <Skeleton className="h-5 w-1/3 rounded" />
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-2/3 rounded" />
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-zinc-100 flex justify-between items-center">
              <div className="space-y-1.5">
                <Skeleton className="h-2.5 w-16 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Trend Chart */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 h-[280px] space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-3 w-64 rounded" />
          </div>
          <div className="flex gap-3">
             <Skeleton className="h-3 w-20 rounded-full" />
             <Skeleton className="h-3 w-20 rounded-full" />
          </div>
        </div>
        <div className="flex items-end gap-6 h-[140px] border-b border-zinc-100 pb-1 px-2">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${20 + (i * 10) % 60}%` }} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-zinc-200 rounded-xl p-5 flex items-center gap-4 h-[90px]">
            <Skeleton className="w-10 h-10 rounded-[10px] shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-3 w-full rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
