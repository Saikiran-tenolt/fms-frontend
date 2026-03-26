import React, { useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { setPrices } from './marketSlice';
import { Badge, EmptyState } from '../../components/ui';
import { mockMarketPrices } from '../../services/mockData';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export const MarketPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { prices } = useAppSelector((state) => state.market);
  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    dispatch(setPrices(mockMarketPrices));
  }, [dispatch]);

  const filteredPrices = prices.filter((price) =>
    price.cropName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to generate a realistic-looking sparkline trend array
  const generateTrendData = (price: number, trend: 'up' | 'down' | 'stable', changePct: number) => {
    const data = [];
    let current = trend === 'up' ? price * (1 - changePct / 100) : 
                  trend === 'down' ? price * (1 + changePct / 100) : price;
    
    for (let i = 0; i < 6; i++) {
        data.push({ value: current });
        const volatility = (Math.random() - 0.5) * (price * 0.05);
        current = current + volatility;
    }
    data.push({ value: price });
    return data;
  };

  // Pre-compute trend data for all prices (hooks cannot be inside .map())
  const trendDataMap = useMemo(() => {
    const map: Record<string, { value: number }[]> = {};
    prices.forEach((price) => {
      map[price.id] = generateTrendData(price.price, price.trend, price.change);
    });
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prices]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Market Prices</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Real-time crop valuations from the nearest Mandi
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crops..."
            className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-md border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none shadow-sm transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Prices Grid */}
      {filteredPrices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrices.map((price) => {
            const isUp = price.trend === 'up';
            const isDown = price.trend === 'down';
            const strokeColor = isUp ? '#10B981' : isDown ? '#F43F5E' : '#94A3B8';
            const trendData = trendDataMap[price.id] ?? [];

            return (
              <div 
                key={price.id}
                className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm hover:shadow-lg rounded-3xl p-6 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-1">
                      {price.cropName}
                    </h3>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {price.mandiName}
                    </p>
                  </div>
                  <Badge
                    variant="default"
                    size="sm"
                    className={`font-bold ${isUp ? 'bg-emerald-50 text-emerald-700 border-none' : isDown ? 'bg-rose-50 text-rose-700 border-none' : 'bg-slate-50 text-slate-700 border-none'}`}
                  >
                    {price.change > 0 ? '+' : ''}{price.change}%
                  </Badge>
                </div>

                <div className="flex items-baseline gap-1 mb-8 relative z-10">
                  <span className="text-sm font-bold text-slate-500">₹</span>
                  <p className="text-4xl font-black tracking-tight text-slate-900">
                    {price.price.toLocaleString()}
                  </p>
                  <p className="text-sm font-medium text-slate-500 ml-1">/{price.unit}</p>
                </div>

                {/* Background Sparkline Chart */}
                <div className="absolute bottom-0 left-0 right-0 h-24 w-full opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id={`colorTrend-${price.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
                          <stop offset="100%" stopColor={strokeColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={strokeColor} 
                        strokeWidth={2.5} 
                        fillOpacity={1} 
                        fill={`url(#colorTrend-${price.id})`} 
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No crops found"
          description="Try a different search term."
        />
      )}
    </div>
  );
};
