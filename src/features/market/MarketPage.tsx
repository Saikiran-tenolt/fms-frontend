import React, { useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Search } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { setPrices } from './marketSlice';
import { Card, Badge, EmptyState } from '../../components/ui';
import { mockMarketPrices } from '../../services/mockData';

export const MarketPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { prices } = useAppSelector((state) => state.market);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  useEffect(() => {
    // Load market prices
    dispatch(setPrices(mockMarketPrices));
  }, [dispatch]);
  
  const filteredPrices = prices.filter((price) =>
    price.cropName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Market Prices</h1>
        <p className="text-sm text-gray-600 mt-1">
          Latest crop prices from nearest mandi
        </p>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search crops..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
      </div>
      
      {/* Prices Grid */}
      {filteredPrices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrices.map((price) => (
            <Card key={price.id}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {price.cropName}
                  </h3>
                  <p className="text-xs text-gray-600">{price.mandiName}</p>
                </div>
                {price.trend === 'up' ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : price.trend === 'down' ? (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                ) : (
                  <Minus className="h-5 w-5 text-gray-600" />
                )}
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-3xl font-bold text-gray-900">
                  ₹{price.price}
                </p>
                <p className="text-sm text-gray-600">{price.unit}</p>
              </div>
              <Badge
                variant={
                  price.trend === 'up'
                    ? 'success'
                    : price.trend === 'down'
                    ? 'error'
                    : 'default'
                }
                size="sm"
              >
                {price.change > 0 ? '+' : ''}
                {price.change}%
              </Badge>
            </Card>
          ))}
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
