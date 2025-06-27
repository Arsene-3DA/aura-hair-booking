
import { Wallet } from 'lucide-react';

interface DashboardWidgetProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  sparklineData: number[];
}

const DashboardWidget = ({ title, value, change, isPositive, sparklineData }: DashboardWidgetProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-luxury-gold-100 rounded-xl flex items-center justify-center">
          <Wallet className="h-6 w-6 text-luxury-gold-600" />
        </div>
        
        {/* Mini Sparkline */}
        <div className="w-20 h-8">
          <svg className="w-full h-full" viewBox="0 0 80 32">
            <polyline
              points={sparklineData.map((value, index) => 
                `${(index / (sparklineData.length - 1)) * 80},${32 - (value / Math.max(...sparklineData)) * 32}`
              ).join(' ')}
              fill="none"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth="2"
              className="drop-shadow-sm"
            />
          </svg>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-luxury-charcoal/70 mb-2">{title}</h3>
      <div className="text-3xl font-black text-luxury-charcoal mb-2">{value}</div>
      
      <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        <span>{isPositive ? '↗' : '↘'}</span>
        <span className="ml-1">{change}</span>
      </div>
    </div>
  );
};

export default DashboardWidget;
