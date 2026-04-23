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

// ── Dashboard hero + full page skeleton ──────────────────────────────────────
export const SkeletonDashboard: React.FC = () => (
  <div className="px-4 sm:px-8 max-w-7xl mx-auto space-y-12 mt-8 pb-20 animate-pulse">
    {/* Hero */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-5">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-14 w-80 rounded" />
        <Skeleton className="h-4 w-56 rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-16 w-40 rounded-2xl" />
          <Skeleton className="h-16 w-48 rounded-2xl" />
        </div>
      </div>
      <div className="lg:col-span-4">
        <Skeleton className="h-36 w-full rounded-3xl" />
      </div>
    </div>
    {/* Map */}
    <Skeleton className="h-96 w-full rounded-[2.5rem]" />
    {/* Metric cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
    {/* Quick actions */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-36 w-full rounded-2xl" />
      ))}
    </div>
    {/* Chart */}
    <SkeletonChart />
  </div>
);
