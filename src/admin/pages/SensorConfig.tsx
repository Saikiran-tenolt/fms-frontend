import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, Cpu, Sliders, Network } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Loader } from '@/components/common/Loader';
import { Modal } from '@/components/common/Modal';
import { useToastContext } from '@/components/toast';
import adminService from '@/services/adminService';

// ─── Shared table shell ───────────────────────────────────────────────────────
function Table({ heads, children, empty }: {
    heads: string[];
    children: React.ReactNode;
    empty: boolean;
}) {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-50/60">
                    <tr>{heads.map(h => <th key={h} className="px-6 py-4 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {empty
                        ? <tr><td colSpan={heads.length} className="px-6 py-10 text-center text-slate-400 text-sm">No records yet</td></tr>
                        : children}
                </tbody>
            </table>
        </div>
    );
}

// ─── Tab: Sensor Types ────────────────────────────────────────────────────────
function SensorTypesTab() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', description: '' });
    const [saving, setSaving] = useState(false);
    const toast = useToastContext();

    const load = async () => {
        setLoading(true);
        try { setItems((await adminService.getSensorTypes()).data); }
        catch (e: any) { toast.error(e.message ?? 'Load failed'); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const save = async () => {
        if (!form.name.trim()) return toast.error('Name is required');
        setSaving(true);
        try {
            await adminService.createSensorType(form);
            toast.success('Sensor type created');
            setShowModal(false);
            setForm({ name: '', description: '' });
            load();
        } catch (e: any) { toast.error(e.message ?? 'Create failed'); }
        finally { setSaving(false); }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500">{items.length} type(s)</p>
                <div className="flex gap-2">
                    <button onClick={load} disabled={loading} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                        <Plus className="h-4 w-4" /> Add Type
                    </button>
                </div>
            </div>

            {loading ? <div className="flex justify-center py-12"><Loader /></div> : (
                <Table heads={['Name', 'Description', 'Created']} empty={items.length === 0}>
                    {items.map(item => (
                        <tr key={item._id ?? item.id} className="bg-white hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-semibold text-slate-900">{item.name}</td>
                            <td className="px-6 py-4 text-slate-500">{item.description ?? '—'}</td>
                            <td className="px-6 py-4 text-xs text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</td>
                        </tr>
                    ))}
                </Table>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Sensor Type">
                <div className="space-y-4 pt-2">
                    <Field label="Name *">
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. Temperature Sensor" className={inp} />
                    </Field>
                    <Field label="Description">
                        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="What does this sensor monitor?" rows={3} className={`${inp} resize-none`} />
                    </Field>
                    <ModalFooter onCancel={() => setShowModal(false)} onSave={save} saving={saving} />
                </div>
            </Modal>
        </div>
    );
}

// ─── Tab: Sensor Parameters ───────────────────────────────────────────────────
function SensorParametersTab() {
    const [items, setItems] = useState<any[]>([]);
    const [sensorTypes, setSensorTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', unit: '', sensorTypeId: '', minValue: '', maxValue: '', description: '' });
    const [saving, setSaving] = useState(false);
    const toast = useToastContext();

    const load = async () => {
        setLoading(true);
        try {
            const [params, types] = await Promise.all([adminService.getSensorParameters(), adminService.getSensorTypes()]);
            setItems(params.data); setSensorTypes(types.data);
        } catch (e: any) { toast.error(e.message ?? 'Load failed'); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const save = async () => {
        if (!form.name.trim() || !form.unit.trim()) return toast.error('Name and unit are required');
        setSaving(true);
        try {
            await adminService.createSensorParameter({
                name: form.name, unit: form.unit, sensorTypeId: form.sensorTypeId,
                minValue: form.minValue ? Number(form.minValue) : undefined,
                maxValue: form.maxValue ? Number(form.maxValue) : undefined,
                description: form.description || undefined,
            });
            toast.success('Parameter created');
            setShowModal(false);
            setForm({ name: '', unit: '', sensorTypeId: '', minValue: '', maxValue: '', description: '' });
            load();
        } catch (e: any) { toast.error(e.message ?? 'Create failed'); }
        finally { setSaving(false); }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500">{items.length} parameter(s)</p>
                <div className="flex gap-2">
                    <button onClick={load} disabled={loading} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                        <Plus className="h-4 w-4" /> Add Parameter
                    </button>
                </div>
            </div>

            {loading ? <div className="flex justify-center py-12"><Loader /></div> : (
                <Table heads={['Name', 'Unit', 'Sensor Type', 'Range']} empty={items.length === 0}>
                    {items.map(item => (
                        <tr key={item._id ?? item.id} className="bg-white hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-semibold text-slate-900">{item.name}</td>
                            <td className="px-6 py-4">
                                <span className="bg-slate-100 text-slate-600 rounded-full px-2 py-0.5 text-xs font-mono">{item.unit}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-500">{item.sensorType?.name ?? item.sensorTypeId ?? '—'}</td>
                            <td className="px-6 py-4 text-slate-500">
                                {item.minValue != null && item.maxValue != null ? `${item.minValue} – ${item.maxValue}` : '—'}
                            </td>
                        </tr>
                    ))}
                </Table>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Sensor Parameter">
                <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Name *">
                            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Soil Moisture" className={inp} />
                        </Field>
                        <Field label="Unit *">
                            <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="%, °C, ppm" className={inp} />
                        </Field>
                    </div>
                    <Field label="Sensor Type">
                        <select value={form.sensorTypeId} onChange={e => setForm(f => ({ ...f, sensorTypeId: e.target.value }))} className={inp}>
                            <option value="">— Select —</option>
                            {sensorTypes.map(t => <option key={t._id ?? t.id} value={t._id ?? t.id}>{t.name}</option>)}
                        </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Min Value">
                            <input type="number" value={form.minValue} onChange={e => setForm(f => ({ ...f, minValue: e.target.value }))} placeholder="0" className={inp} />
                        </Field>
                        <Field label="Max Value">
                            <input type="number" value={form.maxValue} onChange={e => setForm(f => ({ ...f, maxValue: e.target.value }))} placeholder="100" className={inp} />
                        </Field>
                    </div>
                    <Field label="Description">
                        <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" className={inp} />
                    </Field>
                    <ModalFooter onCancel={() => setShowModal(false)} onSave={save} saving={saving} />
                </div>
            </Modal>
        </div>
    );
}

// ─── Tab: Sensor Mappings ─────────────────────────────────────────────────────
function SensorMappingsTab() {
    const [items, setItems] = useState<any[]>([]);
    const [sensorTypes, setSensorTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ plotId: '', sensorTypeId: '', sensorId: '', installedAt: '' });
    const [saving, setSaving] = useState(false);
    const toast = useToastContext();

    const load = async () => {
        setLoading(true);
        try {
            const [maps, types] = await Promise.all([adminService.getSensorMappings(), adminService.getSensorTypes()]);
            setItems(maps.data); setSensorTypes(types.data);
        } catch (e: any) { toast.error(e.message ?? 'Load failed'); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const save = async () => {
        if (!form.plotId.trim() || !form.sensorTypeId) return toast.error('Plot ID and sensor type are required');
        setSaving(true);
        try {
            await adminService.createSensorMapping({
                plotId: form.plotId, sensorTypeId: form.sensorTypeId,
                sensorId: form.sensorId || undefined,
                installedAt: form.installedAt || undefined,
            });
            toast.success('Mapping created');
            setShowModal(false);
            setForm({ plotId: '', sensorTypeId: '', sensorId: '', installedAt: '' });
            load();
        } catch (e: any) { toast.error(e.message ?? 'Create failed'); }
        finally { setSaving(false); }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500">{items.length} mapping(s)</p>
                <div className="flex gap-2">
                    <button onClick={load} disabled={loading} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                        <Plus className="h-4 w-4" /> Add Mapping
                    </button>
                </div>
            </div>

            {loading ? <div className="flex justify-center py-12"><Loader /></div> : (
                <Table heads={['Plot', 'Sensor Type', 'Sensor ID', 'Installed']} empty={items.length === 0}>
                    {items.map(item => (
                        <tr key={item._id ?? item.id} className="bg-white hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-semibold text-slate-900">{item.plot?.plotName ?? item.plotId ?? '—'}</td>
                            <td className="px-6 py-4 text-slate-500">{item.sensorType?.name ?? item.sensorTypeId ?? '—'}</td>
                            <td className="px-6 py-4 font-mono text-xs text-slate-400">{item.sensorId ?? '—'}</td>
                            <td className="px-6 py-4 text-xs text-slate-400">{item.installedAt ? new Date(item.installedAt).toLocaleDateString() : '—'}</td>
                        </tr>
                    ))}
                </Table>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Sensor Mapping">
                <div className="space-y-4 pt-2">
                    <Field label="Plot ID *">
                        <input value={form.plotId} onChange={e => setForm(f => ({ ...f, plotId: e.target.value }))} placeholder="MongoDB _id of the plot" className={inp} />
                    </Field>
                    <Field label="Sensor Type *">
                        <select value={form.sensorTypeId} onChange={e => setForm(f => ({ ...f, sensorTypeId: e.target.value }))} className={inp}>
                            <option value="">— Select —</option>
                            {sensorTypes.map(t => <option key={t._id ?? t.id} value={t._id ?? t.id}>{t.name}</option>)}
                        </select>
                    </Field>
                    <Field label="Sensor ID (optional)">
                        <input value={form.sensorId} onChange={e => setForm(f => ({ ...f, sensorId: e.target.value }))} placeholder="Physical device ID" className={inp} />
                    </Field>
                    <Field label="Installed At">
                        <input type="date" value={form.installedAt} onChange={e => setForm(f => ({ ...f, installedAt: e.target.value }))} className={inp} />
                    </Field>
                    <ModalFooter onCancel={() => setShowModal(false)} onSave={save} saving={saving} />
                </div>
            </Modal>
        </div>
    );
}

// ─── Shared micro-components ──────────────────────────────────────────────────
const inp = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            {children}
        </div>
    );
}

function ModalFooter({ onCancel, onSave, saving }: { onCancel: () => void; onSave: () => void; saving: boolean }) {
    return (
        <div className="flex gap-3 pt-1">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
            </button>
            <button onClick={onSave} disabled={saving}
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {saving ? 'Creating…' : 'Create'}
            </button>
        </div>
    );
}

// ─── Page shell ───────────────────────────────────────────────────────────────
type Tab = 'types' | 'parameters' | 'mappings';
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'types', label: 'Sensor Types', icon: <Cpu className="h-4 w-4" /> },
    { id: 'parameters', label: 'Parameters', icon: <Sliders className="h-4 w-4" /> },
    { id: 'mappings', label: 'Mappings', icon: <Network className="h-4 w-4" /> },
];

export function SensorConfig() {
    const [tab, setTab] = useState<Tab>('types');
    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sensor Configuration</h2>
                <p className="text-sm text-slate-500 mt-1">Manage sensor types, parameters, and plot mappings.</p>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {t.icon}{t.label}
                    </button>
                ))}
            </div>

            <Card className="shadow-sm border-slate-200">
                {tab === 'types' && <SensorTypesTab />}
                {tab === 'parameters' && <SensorParametersTab />}
                {tab === 'mappings' && <SensorMappingsTab />}
            </Card>
        </div>
    );
}