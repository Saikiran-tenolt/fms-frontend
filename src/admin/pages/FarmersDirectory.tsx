import { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, PhoneCall, Calendar, CheckCircle, Sprout, RefreshCw, Users } from 'lucide-react';
import api from '@/services/api';

export function FarmersDirectory() {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get('/admin/farmers');
      const d = res.data;
      setFarmers(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load farmers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = farmers.filter(f => {
    const q = search.toLowerCase();
    return (
      f.name?.toLowerCase().includes(q) ||
      f.phone?.toLowerCase().includes(q) ||
      f.village?.toLowerCase().includes(q) ||
      f.permanentLocation?.village?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-inter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Farmer Directory</h2>
          <p className="text-sm text-slate-500 mt-1">
            All registered farmers.{' '}
            {!loading && <span className="font-semibold text-slate-700">{farmers.length} total</span>}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search farmers..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
          <button onClick={load} disabled={loading}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors">
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
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10 text-slate-300" />}
          title="No farmers found"
          description={search ? 'Try a different search term.' : 'No farmers registered yet.'}
        />
      ) : (
        <Card className="shadow-sm border-slate-200">
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm text-left font-medium text-slate-500">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/50 tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Farmer</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Phone</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Village</th>
                  <th scope="col" className="px-6 py-4 font-semibold">District</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Joined</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((farmer) => {
                  const id = farmer._id ?? farmer.id ?? '';
                  const loc = farmer.permanentLocation ?? {};
                  return (
                    <tr key={id} className="bg-white hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100/50 flex items-center justify-center shrink-0">
                            <span className="text-emerald-700 font-bold text-xs">
                              {(farmer.name ?? '?').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {farmer.name ?? '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{farmer.phone ?? '—'}</td>
                      <td className="px-6 py-4">{loc.village ?? farmer.village ?? '—'}</td>
                      <td className="px-6 py-4">{loc.district ?? farmer.district ?? '—'}</td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {farmer.createdAt ? new Date(farmer.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedFarmer(farmer)}
                          className="text-emerald-600 hover:text-emerald-700 font-semibold text-xs uppercase tracking-wider transition-colors">
                          View Profile
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

      {/* Farmer Details Modal */}
      <Modal
        isOpen={!!selectedFarmer}
        onClose={() => setSelectedFarmer(null)}
        title="Farmer Profile"
        size="xl"
      >
        {selectedFarmer && (
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <PhoneCall className="w-3 h-3" /> Phone
                </div>
                <div className="text-sm font-bold text-slate-900">{selectedFarmer.phone ?? '—'}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <Calendar className="w-3 h-3" /> Joined
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {selectedFarmer.createdAt ? new Date(selectedFarmer.createdAt).toLocaleDateString() : '—'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <CheckCircle className="w-3 h-3 text-emerald-500" /> Role
                </div>
                <div className="text-sm font-bold text-emerald-600">{selectedFarmer.role ?? 'FARMER'}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <Sprout className="w-3 h-3 text-amber-500" /> Village
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {selectedFarmer.permanentLocation?.village ?? '—'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">District</div>
                <div className="text-sm font-bold text-slate-900">
                  {selectedFarmer.permanentLocation?.district ?? '—'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">State</div>
                <div className="text-sm font-bold text-slate-900">
                  {selectedFarmer.permanentLocation?.state ?? '—'}
                </div>
              </div>
            </div>

            {selectedFarmer.email && (
              <div className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">Email: </span>{selectedFarmer.email}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}