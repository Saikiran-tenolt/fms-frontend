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
  <div className="flex flex-col flex-1 h-full bg-[#fafafa]">
    {/* Header */}
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-48 rounded" />
        <Skeleton className="h-4 w-32 rounded" />
      </div>
      <div className="hidden sm:flex items-center gap-4">
        <div className="flex flex-col items-end gap-1.5">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </header>

    {/* Main Content Area */}
    <div className="p-6 md:p-8 max-w-[1400px] w-full mx-auto pb-24 space-y-8 animate-pulse">
      {/* Farm Header */}
      <Skeleton className="h-5 w-80 rounded" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 h-[132px] flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-5 w-12 rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-9 w-20 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Weather Forecast (7-day grid) */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="mb-4 space-y-2">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-3 w-32 rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="bg-slate-50 rounded-lg border border-slate-100 p-3 flex flex-col items-center gap-2 h-[120px]">
              <Skeleton className="h-3 w-10 rounded mt-1" />
              <Skeleton className="h-7 w-7 rounded-full mt-1" />
              <Skeleton className="h-5 w-12 rounded mt-1" />
              <Skeleton className="h-2.5 w-16 rounded mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Alert & Advisory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between h-40">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-5 w-1/3 rounded" />
                <Skeleton className="h-3 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
              <Skeleton className="h-8 w-32 rounded" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Trend Chart */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 h-[270px] space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-3 w-64 rounded" />
        </div>
        <div className="flex items-end gap-6 h-[140px] border-b border-slate-50 pb-1">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="flex-1 rounded-t-[4px]" style={{ height: `${Math.random() * 60 + 20}%` }} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 h-[116px] flex flex-col items-start gap-2.5">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-3 w-32 rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
