import React, { useEffect, useMemo, useState } from 'react';
import { Search, TrendingUp, TrendingDown, Activity, IndianRupee, RefreshCw, BarChart2, MapPin, ChevronDown } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { setPrices } from './marketSlice';
import { Badge, EmptyState } from '../../components/ui';
import { mockMarketPrices } from '../../services/mockData';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip, XAxis, CartesianGrid } from 'recharts';

export const MarketPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { prices } = useAppSelector((state) => state.market);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [selectedMandi, setSelectedMandi] = useState('All Markets');
  const [isMandiDropdownOpen, setIsMandiDropdownOpen] = useState(false);

  const mandis = useMemo(() => {
    const list = Array.from(new Set(prices.map((p) => p.mandiName)));
    return ['All Markets', ...list];
  }, [prices]);

  useEffect(() => {
    dispatch(setPrices(mockMarketPrices));
    if (mockMarketPrices.length > 0 && !selectedCropId) {
      setSelectedCropId(mockMarketPrices[0].id);
    }
  }, [dispatch, selectedCropId]);

  const filteredPrices = prices.filter((price) => {
    const matchesSearch = price.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      price.mandiName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMandi = selectedMandi === 'All Markets' || price.mandiName === selectedMandi;
    return matchesSearch && matchesMandi;
  });

  const selectedCrop = prices.find((p) => p.id === selectedCropId);

  // Helper to generate a realistic-looking sparkline trend array
  const generateTrendData = (price: number, trend: 'up' | 'down' | 'stable', changePct: number, points: number = 10) => {
    const data = [];
    let current = trend === 'up' ? price * (1 - changePct / 100) :
      trend === 'down' ? price * (1 + changePct / 100) : price;

    for (let i = 0; i < points - 1; i++) {
      data.push({ time: `T-${points - i}`, value: current });
      const volatility = (Math.random() - 0.5) * (price * 0.03);
      current = current + volatility;
    }
    data.push({ time: 'Now', value: price });
    return data;
  };

  // Pre-compute mini trend data for table
  const tableTrendMap = useMemo(() => {
    const map: Record<string, { value: number }[]> = {};
    prices.forEach((price) => {
      map[price.id] = generateTrendData(price.price, price.trend, price.change, 15);
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prices]);

  // Pre-compute detailed trend data for the active side-panel chart
  const activeDetailData = useMemo(() => {
    if (!selectedCrop) return [];
    return generateTrendData(selectedCrop.price, selectedCrop.trend, selectedCrop.change, 30);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCrop]);

  // Identify best prices for each crop type (Highest is best for seller)
  const bestPriceMap = useMemo(() => {
    const map: Record<string, number> = {};
    prices.forEach((p) => {
      if (!map[p.cropName] || p.price > map[p.cropName]) {
        map[p.cropName] = p.price;
      }
    });
    return map;
  }, [prices]);

  return (
    <div className="space-y-6 animate-fadeIn max-w-[1400px] mx-auto min-h-[calc(100vh-6rem)] flex flex-col font-inter">

      {/* Market Intelligence Dashboard */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Regional Outlook */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-50 rounded-xl"><TrendingUp size={18} className="text-blue-600" /></div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Regional Outlook</h3>
          </div>
          <p className="text-2xl font-black text-slate-900 mb-1">
            +{(prices.reduce((acc, p) => acc + p.change, 0) / prices.length).toFixed(1)}%
          </p>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 inline-block px-2 py-0.5 rounded">Bullish Week</p>
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Market Volume</span>
            <span className="text-slate-900">High</span>
          </div>
        </div>

        {/* Card 2: Top Performer in selected Mandi */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-50 rounded-xl"><Activity size={18} className="text-emerald-600" /></div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Top Performer</h3>
          </div>
          <p className="text-2xl font-black text-slate-900 mb-1">
            {filteredPrices.sort((a, b) => b.price - a.price)[0]?.cropName || 'N/A'}
          </p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            ₹{filteredPrices.sort((a, b) => b.price - a.price)[0]?.price || '0'} / qtl
          </p>
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Current Mandi</span>
            <span className="text-emerald-600">{selectedMandi}</span>
          </div>
        </div>

        {/* Card 3: AI Intelligence / Opportunity */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <div className="p-2 bg-white/5 rounded-xl border border-white/10"><IndianRupee size={18} className="text-emerald-400" /></div>
            <h3 className="text-sm font-bold text-white tracking-tight">Arbitrage Insight</h3>
          </div>
          <p className="text-sm font-medium text-slate-300 leading-relaxed mb-4 relative z-10">
            Wheat prices are <span className="text-emerald-400 font-black">7.2% higher</span> in <span className="text-white">Azadpur</span> than your current local average.
          </p>
          <button className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2 hover:translate-x-1 transition-transform">
            Analyze Logistics Cost <TrendingUp size={10} />
          </button>
        </div>
      </section>


      {/* Market Navigator Bar */}
      <section className="bg-white rounded-3xl border border-slate-200/60 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="p-2 bg-emerald-50 rounded-xl">
            <MapPin size={20} className="text-emerald-600" />
          </div>
          <div className="relative flex-1 md:flex-initial">
            <button
              onClick={() => setIsMandiDropdownOpen(!isMandiDropdownOpen)}
              className="w-full md:w-64 flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-emerald-500 hover:bg-white transition-all group"
            >
              <span className="truncate">{selectedMandi}</span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isMandiDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMandiDropdownOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsMandiDropdownOpen(false)} />
                <div className="absolute top-full left-0 mt-2 w-full md:w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-30 animate-in fade-in zoom-in duration-200 origin-top">
                  {mandis.map((mandi) => (
                    <button
                      key={mandi}
                      onClick={() => {
                        setSelectedMandi(mandi);
                        setIsMandiDropdownOpen(false);
                      }}
                      className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors flex items-center justify-between ${selectedMandi === mandi
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'
                        }`}
                    >
                      {mandi}
                      {selectedMandi === mandi && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crops, mandis, or assets..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none shadow-sm transition-all text-sm font-medium text-slate-700"
          />
        </div>
      </section>

      <div className="flex flex-col gap-6">

        {/* Full Width Progress Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-emerald-600" />
                Asset Listings
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">Real-time valuation across regional mandis</p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing:</span>
              <Badge variant="default" size="sm" className="bg-emerald-100 text-emerald-700 border-none">Live</Badge>
            </div>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-x-auto">
            {filteredPrices.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-500 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 border-b border-slate-200">Asset</th>
                    <th className="px-6 py-4 border-b border-slate-200">Mandi</th>
                    <th className="px-6 py-4 border-b border-slate-200 text-right">Last Price</th>
                    <th className="px-6 py-4 border-b border-slate-200 text-right">24h Change</th>
                    <th className="px-6 py-4 border-b border-slate-200 hidden sm:table-cell">7d Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {filteredPrices.map((price) => {
                    const isSelected = selectedCropId === price.id;
                    const isUp = price.trend === 'up';
                    const isDown = price.trend === 'down';
                    const trendColor = isUp ? '#10B981' : isDown ? '#F43F5E' : '#94A3B8';
                    const trendData = tableTrendMap[price.id] || [];

                    return (
                      <tr
                        key={price.id}
                        onClick={() => setSelectedCropId(price.id)}
                        className={`group cursor-pointer transition-colors ${isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50/80'}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-500'} transition-colors`}>
                              <IndianRupee className="w-4 h-4" />
                            </div>
                            <div>
                              <p className={`font-bold text-sm ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>{price.cropName}</p>
                              <p className="text-[10px] text-slate-400 font-medium">Vol: {Math.floor(Math.random() >> 0 * 500) + 120} lots</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-xs font-semibold text-slate-600 tracking-tight">{price.mandiName}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-mono text-sm font-bold text-slate-900">₹{price.price.toLocaleString()}</span>
                            {price.price === bestPriceMap[price.cropName] && (
                              <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-tighter mt-0.5 animate-pulse">Best Sell Rate</span>
                            )}
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">per quintal</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Badge
                            variant="default"
                            size="sm"
                            className={`font-mono font-bold tracking-tight rounded-[6px] ${isUp ? 'bg-emerald-100/80 text-emerald-700' : isDown ? 'bg-rose-100/80 text-rose-700' : 'bg-slate-100 text-slate-700'} border-none px-2.5 py-1`}
                          >
                            {isUp ? '▲' : isDown ? '▼' : ''} {Math.abs(price.change)}%
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell w-32">
                          <div className="h-10 w-24 ml-auto opacity-70 group-hover:opacity-100 transition-opacity">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={trendData}>
                                <Area
                                  type="monotone"
                                  dataKey="value"
                                  stroke={trendColor}
                                  strokeWidth={2}
                                  fill="none"
                                  isAnimationActive={false}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8">
                <EmptyState
                  title="No crops found"
                  description="Try adjusting your search criteria."
                />
              </div>
            )}
          </div>
        </div>

        {/* Large Featured Chart Section */}
        <section className="bg-[#0b1120] rounded-[32px] border border-slate-800 shadow-2xl overflow-hidden min-h-[400px] flex flex-col group">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/40 backdrop-blur-xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Market Pulse Analytics</h3>
              </div>
              <p className="text-2xl font-black text-white tracking-tight">
                {selectedCrop?.cropName} <span className="text-slate-500 text-lg font-normal">in {selectedMandi}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-slate-400">30D History</div>
              <div className="px-4 py-2 bg-emerald-500 text-slate-900 rounded-xl text-xs font-black">Live Data Feed</div>
            </div>
          </div>

          <div className="flex-1 p-8 pb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none"></div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={activeDetailData}>
                <defs>
                  <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis
                  domain={['auto', 'auto']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}
                  width={50}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={4}
                  fill="url(#colorPulse)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
};
