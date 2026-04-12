// components/charts/TopProductsChart.jsx
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, LabelList
} from 'recharts';

// Custom tooltip
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
      <p className="font-medium text-gray-900">{d.product}</p>
      <p className="text-blue-600 font-medium">Rs {d.revenue.toLocaleString()}</p>
    </div>
  );
};

// Auto-generate summary from data
const buildSummary = (data) => {
  if (!data?.length) return '';
  const top = data[0];
  const top3 = data.slice(0, 3);
  const top3Rev = top3.reduce((s, d) => s + d.revenue, 0);
  const totalRev = data.reduce((s, d) => s + d.revenue, 0);
  const pct = ((top3Rev / totalRev) * 100).toFixed(0);
  return `${top.product} is the top product at Rs ${top.revenue.toLocaleString()}. ` +
         `Top 3 products — ${top3.map(d => d.product).join(', ')} — contribute ${pct}% of top-10 revenue.`;
};

export default function TopProductsChart({ data }) {
  if (!data?.length) return null;

  // Sort highest first — your Python already does this,
  // but sort here too as a safety net
  const sorted = [...data].sort((a, b) => b.revenue - a.revenue);

  // Height scales with number of bars — 40px per bar + 60px padding
  const chartHeight = sorted.length * 40 + 60;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-900">Top 10 products by revenue</p>
          <p className="text-xs text-gray-400">SUM(total) per product — highest first</p>
        </div>
        <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-1 rounded">
          Horizontal Bar
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={sorted}
          layout="vertical"          
          margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f3f4f6"
            horizontal={false}       
          />

          {/* Y axis shows product names */}
          <YAxis
            dataKey="product"
            type="category"          
            width={130}             
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
          />

          {/* X axis shows revenue numbers */}
          <XAxis
            type="number"         
            tickFormatter={(v) => `Rs ${(v / 1000).toFixed(0)}K`}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />

          <Bar
            dataKey="revenue"
            fill="#185FA5"
            radius={[0, 4, 4, 0]}  
            maxBarSize={24}
          >
            {/* Revenue label shown at end of each bar */}
            <LabelList
              dataKey="revenue"
              position="right"
              formatter={(v) => `Rs ${(v / 1000).toFixed(0)}K`}
              style={{ fontSize: 11, fill: '#6b7280' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary */}
      <div className="border-l-4 border-blue-500 bg-blue-50 px-3 py-2 mt-3">
        <p className="text-xs text-gray-500 leading-relaxed">
          {buildSummary(sorted)} 
        </p>
      </div>

    </div>
  );
}