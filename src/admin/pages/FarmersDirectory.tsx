import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Search, Filter, PhoneCall, Calendar, CheckCircle, Sprout } from 'lucide-react';
import { recentFarmersData } from '../data/mockData';

export function FarmersDirectory() {
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-inter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Farmer Directory</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and view all registered farmers in your assigned block.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search farmers..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200">
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-sm text-left font-medium text-slate-500">
            <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/50 tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Farmer ID</th>
                <th scope="col" className="px-6 py-4 font-semibold">Farmer Name</th>
                <th scope="col" className="px-6 py-4 font-semibold">Village</th>
                <th scope="col" className="px-6 py-4 font-semibold">Farm Size</th>
                <th scope="col" className="px-6 py-4 font-semibold">Crop Type</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentFarmersData.map((farmer) => (
                <tr key={farmer.id} className="bg-white hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">FMR-{farmer.id.padStart(4, '0')}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100/50 flex items-center justify-center shrink-0">
                         <span className="text-emerald-700 font-bold text-xs">{farmer.name.charAt(0)}</span>
                      </div>
                      {farmer.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">{farmer.village}</td>
                  <td className="px-6 py-4">{farmer.farmSize}</td>
                  <td className="px-6 py-4 text-slate-700">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                      {farmer.cropType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedFarmer(farmer)}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold text-xs uppercase tracking-wider transition-colors"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Farmer Details Modal */}
      <Modal 
        isOpen={!!selectedFarmer} 
        onClose={() => setSelectedFarmer(null)} 
        title="Beneficiary Profile Insights" 
        size="xl"
      >
        {selectedFarmer && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <PhoneCall className="w-3 h-3 text-slate-400" /> Phone Number
                </div>
                <div className="text-sm font-bold text-slate-900">{selectedFarmer.phone}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <Calendar className="w-3 h-3 text-slate-400" /> Joined Platform
                </div>
                <div className="text-sm font-bold text-slate-900">{selectedFarmer.joinDate}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <CheckCircle className="w-3 h-3 text-emerald-500" /> Account Status
                </div>
                <div className="text-sm font-bold text-emerald-600">{selectedFarmer.status}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <Sprout className="w-3 h-3 text-amber-500" /> Historical Yield Avg
                </div>
                <div className="text-sm font-bold text-slate-900">{selectedFarmer.yieldAverage}</div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-900">Registered Crop Harvesting History</h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md">{selectedFarmer.cropHistory?.length || 0} Seasons Logged</span>
              </div>
              
              <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Season</th>
                      <th className="px-4 py-3">Crop Planted</th>
                      <th className="px-4 py-3 text-right">Harvest Yield</th>
                      <th className="px-4 py-3 text-right">Estimated Revenue</th>
                      <th className="px-4 py-3 text-center">Outcome Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {selectedFarmer.cropHistory?.map((history: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800">{history.season}</td>
                        <td className="px-4 py-3 text-slate-600">{history.crop}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">{history.yield}</td>
                        <td className="px-4 py-3 text-right font-medium text-emerald-600">{history.revenue}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            history.rating === 'Outstanding' ? 'bg-indigo-50 text-indigo-700' :
                            history.rating === 'Excellent' ? 'bg-emerald-50 text-emerald-700' :
                            history.rating === 'Good' ? 'bg-blue-50 text-blue-700' :
                            history.rating === 'Average' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {history.rating}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
