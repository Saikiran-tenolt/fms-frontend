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

// ── Plot List: Card skeleton ───────────────────────────────────────────────────
export const SkeletonPlotRow: React.FC = () => (
  <div className="bg-white border border-[#e8eae5] rounded-xl flex flex-col shrink-0 animate-pulse" style={{ width: 340 }}>
    <div className="p-[14px] px-4 flex items-start gap-[10px]">
      <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5 pt-0.5">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
    </div>
    <div className="px-4 pb-4 space-y-2">
      <Skeleton className="h-2 w-full rounded" />
      <div className="grid grid-cols-2 gap-2 mt-2">
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

// ── Plot Details: full-page skeleton ─────────────────────────────────────────
export const SkeletonPlotDetails: React.FC = () => (
  <div className="min-h-screen bg-[#f5f6f4] animate-pulse">
    {/* Topbar Skeleton */}
    <div className="bg-white border-b border-[#e8eae5] flex items-center px-6 gap-4" style={{ height: 56 }}>
      <Skeleton className="h-8 w-20 rounded-full" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12 rounded" />
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
      </div>
    </div>

    <div className="p-5 flex flex-col gap-4">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-5">
          {/* Metrics Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-[#e8eae5] rounded-xl p-3 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-4 w-10 rounded-full" />
                </div>
                <Skeleton className="h-7 w-12 rounded" />
                <Skeleton className="h-2.5 w-full rounded" />
              </div>
            ))}
          </div>

          {/* Large Card (Chart) Skeleton */}
          <div className="bg-white border border-[#e8eae5] rounded-xl p-5 space-y-4">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white border border-[#e8eae5] rounded-xl p-5 space-y-4">
            <Skeleton className="h-5 w-32 rounded" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-3/4 rounded" />
                  <Skeleton className="h-2.5 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
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
