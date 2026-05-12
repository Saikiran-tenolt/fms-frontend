import { useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Bell, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/hooks';
import {
  fetchAllPendingRequests,
  approveSensorRequest,
  rejectSensorRequest,
} from '@/admin/features/sensorRequests/sensorRequestSlice';
import { toast } from 'sonner';

export function Alerts() {
  const dispatch = useAppDispatch();
  const pending = useAppSelector((s: any) => s.sensorRequests.allPending);
  const loading = useAppSelector((s: any) => s.sensorRequests.loading);
  const actionLoading = useAppSelector((s: any) => s.sensorRequests.actionLoading);
  const error = useAppSelector((s: any) => s.sensorRequests.error);

  useEffect(() => {
    dispatch(fetchAllPendingRequests() as any);
  }, [dispatch]);

  const handleApprove = async (requestId: string, sensorType: string) => {
    try {
      await dispatch(approveSensorRequest(requestId) as any).unwrap();
      toast.success(`${sensorType} approved — sensor is now active`);
    } catch (err: any) {
      toast.error(err || 'Failed to approve');
    }
  };

  const handleReject = async (requestId: string, sensorType: string) => {
    try {
      await dispatch(rejectSensorRequest(requestId) as any).unwrap();
      toast.info(`${sensorType} request rejected`);
    } catch (err: any) {
      toast.error(err || 'Failed to reject');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-inter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sensor Requests</h2>
          <p className="text-sm text-slate-500 mt-1">
            Review and approve sensor requests submitted by farmers.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </div>
        ) : pending.length === 0 ? (
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100/50 shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            No Pending Requests
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-100/50 shadow-sm">
            <AlertTriangle className="w-4 h-4" />
            {pending.length} Pending Approval
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <Card className="shadow-sm border-slate-200">
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-sm text-left font-medium text-slate-500">
            <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/50 tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Farmer</th>
                <th scope="col" className="px-6 py-4 font-semibold">Plot</th>
                <th scope="col" className="px-6 py-4 font-semibold">Sensor Type</th>
                <th scope="col" className="px-6 py-4 font-semibold">Requested On</th>
                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && pending.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Fetching requests...
                  </td>
                </tr>
              ) : pending.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                    No pending sensor requests at this time.
                  </td>
                </tr>
              ) : (
                pending.map((req: any) => {
                  const isActioning = actionLoading === req._id;
                  return (
                    <tr key={req._id} className="bg-white hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100/50 flex items-center justify-center shrink-0">
                            <span className="text-emerald-700 font-bold text-xs">
                              {(req.farmerName ?? 'F').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {req.farmerName ?? '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{req.plotName ?? req.plotId}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-slate-400" />
                          <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {req.sensorType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(req.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100/50 text-amber-700 border border-amber-200/50">
                          Pending
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={isActioning}
                            onClick={() => handleApprove(req._id, req.sensorType)}
                            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                          >
                            {isActioning ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                            Approve
                          </button>
                          <button
                            disabled={isActioning}
                            onClick={() => handleReject(req._id, req.sensorType)}
                            className="text-[10px] font-bold uppercase tracking-wider border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}