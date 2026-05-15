import { useEffect, useState } from 'react';
import { Bell, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import adminService from '@/services/adminService';

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-100/60 text-amber-700 border border-amber-200/50',
  APPROVED: 'bg-indigo-100/60 text-indigo-700 border border-indigo-200/50',
  REJECTED: 'bg-red-100/60 text-red-700 border border-red-200/50',
  INSTALLED: 'bg-blue-100/60 text-blue-700 border border-blue-200/50',
};

const BELL_COLOR: Record<string, string> = {
  PENDING: 'text-amber-500',
  APPROVED: 'text-indigo-500',
  REJECTED: 'text-red-500',
  INSTALLED: 'text-blue-500',
};

export function Alerts() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await adminService.getSensorRequests();
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const pending = requests.filter(r => r.status === 'PENDING');
  const critical = requests.filter(r => r.status === 'REJECTED');

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Alerts</h2>
          <p className="text-sm text-slate-500 mt-1">Monitor sensor installation requests and status anomalies.</p>
        </div>
        <div className="flex items-center gap-3">
          {!loading && (
            critical.length === 0 && pending.length === 0 ? (
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100/50">
                <ShieldCheck className="w-4 h-4" /> All Clear
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-100/50">
                <AlertTriangle className="w-4 h-4" />
                {pending.length} Pending · {critical.length} Rejected
              </div>
            )
          )}
          <button onClick={load} disabled={loading}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader /></div>
      ) : error ? (
        <Card className="shadow-sm border-slate-200">
          <p className="py-12 text-center text-red-500 text-sm">{error}</p>
        </Card>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="h-10 w-10 text-slate-300" />}
          title="No alerts"
          description="No sensor requests to review."
        />
      ) : (
        <Card className="shadow-sm border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <tr>
                  <th className="px-6 py-4 font-semibold">Request</th>
                  <th className="px-6 py-4 font-semibold">Plot</th>
                  <th className="px-6 py-4 font-semibold">Sensor Type</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Requested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => {
                  const id = req._id ?? req.id ?? '';
                  const status = req.status ?? 'PENDING';
                  return (
                    <tr key={id} className="bg-white hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Bell className={`w-4 h-4 ${BELL_COLOR[status] ?? 'text-slate-300'}`} />
                          <span className="font-mono text-xs text-slate-400">
                            {String(id).slice(-8).toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {(() => {
                          if (!req.plotName && !req.plotId) return '—';
                          const p = req.plotName ?? req.plotId;
                          return typeof p === 'object' ? (p.plotName ?? p._id ?? '—') : p;
                        })()}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {(() => {
                          const t = req.sensorType ?? req.type;
                          if (!t) return '—';
                          return typeof t === 'object' ? (t.name ?? t.key ?? '—') : t;
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[status] ?? 'bg-slate-100 text-slate-500'}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}