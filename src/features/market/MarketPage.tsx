import React, { useEffect, useMemo, useState } from 'react';
import { Search, TrendingUp, TrendingDown, Activity, DollarSign, RefreshCw, BarChart2, MapPin } from 'lucide-react';
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

  useEffect(() => {
    dispatch(setPrices(mockMarketPrices));
    if (mockMarketPrices.length > 0 && !selectedCropId) {
      setSelectedCropId(mockMarketPrices[0].id);
    }
  }, [dispatch, selectedCropId]);

  const filteredPrices = prices.filter((price) =>
    price.cropName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="space-y-6 animate-fadeIn max-w-[1400px] mx-auto min-h-[calc(100vh-6rem)] flex flex-col font-inter">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      {/* Header & Marquee Ticker */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden flex items-center shadow-lg border border-slate-800">
        <div className="bg-emerald-500 text-slate-900 font-bold px-6 py-3 flex items-center gap-2 z-10 shadow-[4px_0_15px_rgba(0,0,0,0.5)]">
          <Activity className="w-5 h-5" />
          <span className="tracking-tight whitespace-nowrap">LIVE TICKER</span>
        </div>
        <div className="flex-1 overflow-hidden relative flex items-center">
          <div className="flex w-max animate-marquee whitespace-nowrap">
            {/* Double the array for seamless infinite scrolling */}
            {[...prices, ...prices].map((price, i) => (
              <div key={`${price.id}-${i}`} className="flex items-center gap-3 px-8 border-r border-slate-700/50">
                <span className="font-semibold text-slate-200">{price.cropName}</span>
                <span className="font-mono text-slate-400">₹{price.price}</span>
                <span className={`text-xs font-bold font-mono flex items-center ${price.trend === 'up' ? 'text-emerald-400' : price.trend === 'down' ? 'text-rose-400' : 'text-slate-400'}`}>
                   {price.trend === 'up' ? '▲' : price.trend === 'down' ? '▼' : '▬'} {Math.abs(price.change)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-[600px]">
        
        {/* Left/Main Column: Dense Table */}
        <div className="xl:col-span-2 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-emerald-600" />
                Commodities Exchange
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">Real-time valuation from regional mandis</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search crops or mandis..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none shadow-sm transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
              />
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
                              <DollarSign className="w-4 h-4" />
                            </div>
                            <div>
                              <p className={`font-bold text-sm ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>{price.cropName}</p>
                              <p className="text-[10px] text-slate-400 font-medium">Vol: {Math.floor(Math.random()>>0 * 500) + 120} lots</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-xs font-semibold text-slate-600 tracking-tight">{price.mandiName}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="font-mono text-sm font-bold text-slate-900">₹{price.price.toLocaleString()}</span>
                          <p className="text-[10px] text-slate-400 font-medium">per quintal</p>
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

        {/* Right Column: Pro Analytics Panel */}
        <div className="xl:col-span-1 bg-[#0b1120] rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-300 relative">
          {selectedCrop ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md relative z-10 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">{selectedCrop.cropName}</h3>
                    <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {selectedCrop.mandiName}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${selectedCrop.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : selectedCrop.trend === 'down' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                    {selectedCrop.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : selectedCrop.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                    {selectedCrop.trend.toUpperCase()}
                  </div>
                </div>

                <div className="flex items-end gap-3 mt-2">
                  <span className="text-5xl font-black text-white font-mono tracking-tighter">₹{selectedCrop.price}</span>
                  <div className="mb-2">
                    <span className={`text-sm font-bold font-mono ${selectedCrop.trend === 'up' ? 'text-emerald-400' : selectedCrop.trend === 'down' ? 'text-rose-400' : 'text-slate-400'}`}>
                      {selectedCrop.change > 0 ? '+' : ''}{selectedCrop.change}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="flex-1 p-6 flex flex-col relative z-0">
                <div className="flex justify-between items-center mb-6 z-10">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">30-Day Historical Trend</h4>
                  <div className="flex gap-2">
                    <button className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 text-white hover:bg-slate-700 transition">1W</button>
                    <button className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">1M</button>
                    <button className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 text-slate-400 hover:bg-slate-700 transition">3M</button>
                  </div>
                </div>
                
                <div className="flex-1 min-h-[250px] -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeDetailData}>
                      <defs>
                        <linearGradient id="colorPro" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={selectedCrop.trend === 'up' ? '#34d399' : selectedCrop.trend === 'down' ? '#fb7185' : '#94a3b8'} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={selectedCrop.trend === 'up' ? '#34d399' : selectedCrop.trend === 'down' ? '#fb7185' : '#94a3b8'} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis 
                        domain={['auto', 'auto']} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} 
                        width={40}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }} 
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                        labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        name="Valuation (₹)"
                        stroke={selectedCrop.trend === 'up' ? '#34d399' : selectedCrop.trend === 'down' ? '#fb7185' : '#94a3b8'}
                        strokeWidth={3}
                        fill="url(#colorPro)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Sub Metadata under chart */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Volume (24h)</p>
                    <p className="text-lg font-mono font-semibold text-slate-200">1,245 <span className="text-xs text-slate-500">qtl</span></p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Projected Peak</p>
                    <p className="text-lg font-mono font-semibold text-emerald-400">₹{selectedCrop.price + Math.floor(Math.random() * 200) + 10}</p>
                  </div>
                </div>

                <button className="mt-6 w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black tracking-wide transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                  ANALYZE OPTIMAL SELL DATE
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <RefreshCw className="w-12 h-12 text-slate-700 animate-spin-slow mb-4" />
              <p className="text-slate-400 font-medium">Loading market data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
