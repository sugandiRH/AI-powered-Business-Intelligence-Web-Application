import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import SummaryBox from '../ui/SummaryBox';

export default function CategoryBarChart({ data }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-900">Revenue by category</p>
          <p className="text-xs text-gray-400">SUM(total) per category</p>
        </div>
        <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-1 rounded">
          BarChart
        </span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <YAxis tickFormatter={(v) => `Rs ${(v/1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <Tooltip formatter={(v) => [`Rs ${v.toLocaleString()}`, 'Revenue']} />
          <Bar dataKey="revenue" fill="#185FA5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      {/* <SummaryBox text="Beverages leads all categories. Top 3 categories account for 74% of total revenue." /> */}
    </div>
  );
}