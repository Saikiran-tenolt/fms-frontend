import { useEffect, useState } from 'react';
import { Search, RefreshCw, Radio, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { Modal } from '@/components/common/Modal';
import { useToastContext } from '@/components/toast';
import adminService from '@/services/adminService';

const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'INSTALLED'] as const;
type Status = typeof STATUSES[number];

const STATUS_STYLE: Record<Status, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-600',
  INSTALLED: 'bg-blue-100 text-blue-700',
};
const STATUS_ICON: Record<Status, React.ReactNode> = {
  PENDING: <Clock className="h-3.5 w-3.5" />,
  APPROVED: <CheckCircle className="h-3.5 w-3.5" />,
  REJECTED: <XCircle className="h-3.5 w-3.5" />,
  INSTALLED: <Radio className="h-3.5 w-3.5" />,
};

export function SensorRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<Status>('PENDING');
  const [updating, setUpdating] = useState(false);
  const toast = useToastContext();

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await adminService.getSensorRequests();
      setRequests(res.data);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load sensor requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = (req: any) => { setSelected(req); setNewStatus(req.status ?? 'PENDING'); };

  const handleUpdate = async () => {
    if (!selected) return;
    const id = selected._id ?? selected.id;
    setUpdating(true);
    try {
      const res = await adminService.updateSensorRequest(id, newStatus);
      if (res.success) {
        toast.success('Status updated');
        setRequests(prev => prev.map(r => (r._id === id || r.id === id) ? { ...r, status: newStatus } : r));
        setSelected(null);
      } else {
        toast.error(res.message ?? 'Update failed');
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    return (
      r.plotName?.toLowerCase().includes(q) ||
      r.status?.toLowerCase().includes(q) ||
      r.userId?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sensor Requests</h2>
          <p className="text-sm text-slate-500 mt-1">
            Sensor installation requests from farmers.{' '}
            {!loading && <span className="font-semibold text-slate-700">{requests.length} total</span>}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search requests…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button onClick={load} disabled={loading}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader /></div>
      ) : error ? (
        <Card className="shadow-sm border-slate-200">
          <p className="py-12 text-center text-red-500 text-sm">{error}</p>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Radio className="h-10 w-10 text-slate-300" />}
          title="No sensor requests"
          description={search ? 'Try a different search term.' : 'No requests yet.'}
        />
      ) : (
        <Card className="shadow-sm border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Plot</th>
                  <th className="px-6 py-4 font-semibold">Sensor Type</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Requested</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(req => {
                  const id = req._id ?? req.id ?? '';
                  const status = (req.status ?? 'PENDING') as Status;
                  return (
                    <tr key={id} className="bg-white hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        {String(id).slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                        {req.plotName ?? req.plotId ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {req.sensorType ?? req.type ?? '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[status] ?? 'bg-slate-100 text-slate-500'}`}>
                          {STATUS_ICON[status]}
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openModal(req)}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors">
                          Update
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Update Modal */}
      {selected && (
        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Update Sensor Request">
          <div className="space-y-5 pt-2">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Plot</p>
              <p className="font-semibold text-slate-900">
                {selected.plotName ?? selected.plotId ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-700 mb-2">Select new status</p>
              <div className="grid grid-cols-2 gap-2">
                {STATUSES.map(s => (
                  <button key={s} onClick={() => setNewStatus(s)}
                    className={`py-2.5 px-3 rounded-lg border text-sm font-semibold transition-all ${newStatus === s
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setSelected(null)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleUpdate} disabled={updating || newStatus === selected.status}
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {updating ? 'Updating…' : 'Confirm'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}