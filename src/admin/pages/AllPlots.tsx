import { useEffect, useState } from 'react';
import { Search, MapPin, RefreshCw, Layers } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import adminService from '@/services/adminService';

const STAGE_BADGE: Record<string, string> = {
    SOWED: 'bg-amber-100 text-amber-700',
    GROWING: 'bg-emerald-100 text-emerald-700',
    HARVEST_READY: 'bg-blue-100 text-blue-700',
    HARVESTED: 'bg-slate-100 text-slate-500',
};

export function AllPlots() {
    const [plots, setPlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const load = async () => {
        setLoading(true); setError(null);
        try {
            const res = await adminService.getAllPlots();
            setPlots(res.data);
        } catch (err: any) {
            setError(err.message ?? 'Failed to load plots');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const filtered = plots.filter(p => {
        const q = search.toLowerCase();
        return (
            p.plotName?.toLowerCase().includes(q) ||
            p.soilType?.toLowerCase().includes(q) ||
            p.cropStage?.toLowerCase().includes(q) ||
            p.location?.address?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">All Plots</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        All farm plots across all users.{' '}
                        {!loading && <span className="font-semibold text-slate-700">{plots.length} total</span>}
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search plots…"
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
                    icon={<Layers className="h-10 w-10 text-slate-300" />}
                    title="No plots found"
                    description={search ? 'Try a different search term.' : 'No plots registered yet.'}
                />
            ) : (
                <Card className="shadow-sm border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-50/60">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Plot Name</th>
                                    <th className="px-6 py-4 font-semibold">Farm Size</th>
                                    <th className="px-6 py-4 font-semibold">Soil Type</th>
                                    <th className="px-6 py-4 font-semibold">Crop Stage</th>
                                    <th className="px-6 py-4 font-semibold">Location</th>
                                    <th className="px-6 py-4 font-semibold">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map(plot => (
                                    <tr key={plot._id} className="bg-white hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                                            {plot.plotName ?? '—'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {plot.farmSize != null ? `${plot.farmSize} acres` : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                                                {plot.soilType ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STAGE_BADGE[plot.cropStage] ?? 'bg-slate-100 text-slate-500'}`}>
                                                {plot.cropStage ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                                                {plot.location?.address ?? '—'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400">
                                            {plot.createdAt ? new Date(plot.createdAt).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}