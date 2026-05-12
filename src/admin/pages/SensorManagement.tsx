// import { useState, useEffect } from 'react';
// import { Card } from '@/components/common/Card';
// import { Plus, Loader2, Trash2, Settings, List, Map } from 'lucide-react';
// import adminService, { SensorType, SensorParameter, SensorMapping } from '@/services/adminService';
// import { useToastContext } from '@/components/toast';

// export function SensorManagement() {
//   const [activeTab, setActiveTab] = useState<'types' | 'parameters' | 'mappings'>('types');
//   const [types, setTypes] = useState<SensorType[]>([]);
//   const [parameters, setParameters] = useState<SensorParameter[]>([]);
//   const [mappings, setMappings] = useState<SensorMapping[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
  
//   const toast = useToastContext();

//   // Form states
//   const [typeName, setTypeName] = useState('');
//   const [typeDesc, setTypeDesc] = useState('');
//   const [paramName, setParamName] = useState('');
//   const [paramUnit, setParamUnit] = useState('');
//   const [mappingTypeId, setMappingTypeId] = useState('');
//   const [mappingParamId, setMappingParamId] = useState('');

//   const fetchData = async () => {
//     setIsLoading(true);
//     try {
//       const [t, p, m] = await Promise.all([
//         adminService.getSensorTypes(),
//         adminService.getSensorParameters(),
//         adminService.getSensorMappings()
//       ]);
//       setTypes(t);
//       setParameters(p);
//       setMappings(m);
//     } catch (error) {
//       console.error('Failed to fetch sensor data:', error);
//       toast.error('Failed to load sensor management data');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleCreateType = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await adminService.createSensorType({ name: typeName, description: typeDesc });
//       toast.success('Sensor type created');
//       setTypeName(''); setTypeDesc('');
//       fetchData();
//     } catch (err: any) { toast.error(err.message || 'Failed to create type'); }
//   };

//   const handleCreateParameter = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await adminService.createSensorParameter({ name: paramName, unit: paramUnit });
//       toast.success('Sensor parameter created');
//       setParamName(''); setParamUnit('');
//       fetchData();
//     } catch (err: any) { toast.error(err.message || 'Failed to create parameter'); }
//   };

//   const handleCreateMapping = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await adminService.createSensorMapping({ sensorTypeId: mappingTypeId, parameterId: mappingParamId });
//       toast.success('Sensor mapping created');
//       setMappingTypeId(''); setMappingParamId('');
//       fetchData();
//     } catch (err: any) { toast.error(err.message || 'Failed to create mapping'); }
//   };

//   return (
//     <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-inter">
//       <div>
//         <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sensor Configuration</h2>
//         <p className="text-sm text-slate-500 mt-1">Define sensor types, parameters, and their mappings.</p>
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-4 border-b border-slate-200">
//         <button 
//           onClick={() => setActiveTab('types')}
//           className={`pb-3 text-sm font-semibold transition-all px-2 ${activeTab === 'types' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
//         >
//           <div className="flex items-center gap-2"><Settings className="w-4 h-4" /> Sensor Types</div>
//         </button>
//         <button 
//           onClick={() => setActiveTab('parameters')}
//           className={`pb-3 text-sm font-semibold transition-all px-2 ${activeTab === 'parameters' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
//         >
//           <div className="flex items-center gap-2"><List className="w-4 h-4" /> Parameters</div>
//         </button>
//         <button 
//           onClick={() => setActiveTab('mappings')}
//           className={`pb-3 text-sm font-semibold transition-all px-2 ${activeTab === 'mappings' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
//         >
//           <div className="flex items-center gap-2"><Map className="w-4 h-4" /> Mappings</div>
//         </button>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Form Column */}
//         <div className="lg:col-span-1">
//           <Card title={`Create New ${activeTab === 'types' ? 'Type' : activeTab === 'parameters' ? 'Parameter' : 'Mapping'}`}>
//             {activeTab === 'types' && (
//               <form onSubmit={handleCreateType} className="space-y-4">
//                 <div>
//                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Name</label>
//                   <input value={typeName} onChange={e => setTypeName(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Temperature Sensor" required />
//                 </div>
//                 <div>
//                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
//                   <textarea value={typeDesc} onChange={e => setTypeDesc(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Monitors ambient temperature" rows={3} />
//                 </div>
//                 <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
//                   <Plus className="w-4 h-4" /> Add Type
//                 </button>
//               </form>
//             )}

//             {activeTab === 'parameters' && (
//               <form onSubmit={handleCreateParameter} className="space-y-4">
//                 <div>
//                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Name</label>
//                   <input value={paramName} onChange={e => setParamName(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Celsius" required />
//                 </div>
//                 <div>
//                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Unit</label>
//                   <input value={paramUnit} onChange={e => setParamUnit(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. °C" required />
//                 </div>
//                 <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
//                   <Plus className="w-4 h-4" /> Add Parameter
//                 </button>
//               </form>
//             )}

//             {activeTab === 'mappings' && (
//               <form onSubmit={handleCreateMapping} className="space-y-4">
//                 <div>
//                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Sensor Type</label>
//                   <select value={mappingTypeId} onChange={e => setMappingTypeId(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500" required>
//                     <option value="">Select Type</option>
//                     {types.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Parameter</label>
//                   <select value={mappingParamId} onChange={e => setMappingParamId(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500" required>
//                     <option value="">Select Parameter</option>
//                     {parameters.map(p => <option key={p._id} value={p._id}>{p.name} ({p.unit})</option>)}
//                   </select>
//                 </div>
//                 <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
//                   <Plus className="w-4 h-4" /> Add Mapping
//                 </button>
//               </form>
//             )}
//           </Card>
//         </div>

//         {/* List Column */}
//         <div className="lg:col-span-2">
//           <Card title={`Existing ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}>
//             {isLoading ? (
//               <div className="py-20 flex flex-col items-center justify-center text-slate-400">
//                 <Loader2 className="w-8 h-8 animate-spin mb-2" />
//                 <p className="text-sm">Loading config...</p>
//               </div>
//             ) : (
//               <div className="overflow-hidden border border-slate-100 rounded-xl">
//                 <table className="w-full text-sm text-left">
//                   <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
//                     {activeTab === 'types' && (
//                       <tr>
//                         <th className="px-4 py-3">Name</th>
//                         <th className="px-4 py-3">Description</th>
//                         <th className="px-4 py-3 text-right">Actions</th>
//                       </tr>
//                     )}
//                     {activeTab === 'parameters' && (
//                       <tr>
//                         <th className="px-4 py-3">Name</th>
//                         <th className="px-4 py-3">Unit</th>
//                         <th className="px-4 py-3 text-right">Actions</th>
//                       </tr>
//                     )}
//                     {activeTab === 'mappings' && (
//                       <tr>
//                         <th className="px-4 py-3">Sensor Type ID</th>
//                         <th className="px-4 py-3">Parameter ID</th>
//                         <th className="px-4 py-3 text-right">Actions</th>
//                       </tr>
//                     )}
//                   </thead>
//                   <tbody className="divide-y divide-slate-50">
//                     {activeTab === 'types' && types.map(t => (
//                       <tr key={t._id} className="hover:bg-slate-50/50">
//                         <td className="px-4 py-3 font-bold text-slate-900">{t.name}</td>
//                         <td className="px-4 py-3 text-slate-500">{t.description}</td>
//                         <td className="px-4 py-3 text-right"><button className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
//                       </tr>
//                     ))}
//                     {activeTab === 'parameters' && parameters.map(p => (
//                       <tr key={p._id} className="hover:bg-slate-50/50">
//                         <td className="px-4 py-3 font-bold text-slate-900">{p.name}</td>
//                         <td className="px-4 py-3 font-mono text-emerald-600">{p.unit}</td>
//                         <td className="px-4 py-3 text-right"><button className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
//                       </tr>
//                     ))}
//                     {activeTab === 'mappings' && mappings.map(m => (
//                       <tr key={m._id} className="hover:bg-slate-50/50">
//                         <td className="px-4 py-3 font-mono text-xs">{m.sensorTypeId}</td>
//                         <td className="px-4 py-3 font-mono text-xs">{m.parameterId}</td>
//                         <td className="px-4 py-3 text-right"><button className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
//                       </tr>
//                     ))}
//                     {(activeTab === 'types' ? types : activeTab === 'parameters' ? parameters : mappings).length === 0 && (
//                       <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-400">No records found</td></tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }
