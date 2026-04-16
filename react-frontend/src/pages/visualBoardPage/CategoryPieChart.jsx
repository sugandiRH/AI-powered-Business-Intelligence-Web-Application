import {
  PieChart, Pie, Tooltip, ResponsiveContainer
} from 'recharts';

const PALETTE = [
  // '#185FA5',  // blue
  // '#1D9E75',  // teal
  // '#EF9F27',  // amber
  // '#D85A30',  // coral
  // '#7F77DD',  // purple
  // '#D4537E',  // pink
  // '#639922',  // green
  // '#E24B4A',  // red
  // '#888780',  // gray
  // '#BA7517',  // dark amber

  '#2A75C4',  // brighter blue (from #185FA5)
  '#2DBE91',  // brighter teal
  '#F5B13A',  // brighter amber
  '#E76E45',  // brighter coral
  '#9A92F0',  // brighter purple
  '#E06A97',  // brighter pink
  '#7DBA2E',  // brighter green
  '#F05F5E',  // brighter red
  '#A3A29C',  // brighter gray
  '#D48A2A'   // brighter dark amber
];

const getColor = (index) => PALETTE[index % PALETTE.length];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
      <p className="font-medium text-gray-900">{d.category}</p>
      <p className="text-gray-500">Rs {d.revenue.toLocaleString()}</p>
      <p className="text-blue-600 font-medium">{d.percentage.toFixed(1)}%</p>
    </div>
  );
};


const CustomLegend = ({ data }) => (
  <div className="flex flex-col gap-1.5 justify-center">
    {data.map((d, index) => (
      <div key={d.category} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: getColor(index) }}
          />
          <span className="text-xs text-gray-500">{d.category}</span>
        </div>
        <span className="text-xs font-medium text-gray-600">
          {d.percentage.toFixed(1)}%
        </span>
      </div>
    ))}
  </div>
);

const buildSummary = (data) => {
  if (!data?.length) return '';
  const top = data[0];
  const topTwo = data.slice(0, 2);
  const topTwoPct = topTwo.reduce((s, d) => s + d.percentage, 0).toFixed(1);
  const bottom = data[data.length - 1];
  return `${top.category} leads with ${top.percentage.toFixed(1)}% of revenue. ` +
         `${topTwo.map(d => d.category).join(' and ')} together account for ${topTwoPct}%. ` +
         `${bottom.category} is the smallest contributor at ${bottom.percentage.toFixed(1)}%.`;
};

export default function CategoryPieChart({ data }) {
  if (!data?.length) return null;

  const coloredData = data.map((d, index) => ({
    ...d,
    fill: getColor(index),
  }));

  return (
    <div className="border-gray-700 bg-gray-800/60 rounded-xl p-4">

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-900">Category sales share</p>
          <p className="text-xs text-gray-400">% of total revenue per category</p>
        </div>
        <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-1 rounded">
          PieChart
        </span>
      </div>

      <div className="flex items-center gap-4">
        <ResponsiveContainer width="55%" height={220}>
          <PieChart>
            <Pie
              data={coloredData}
              dataKey="revenue"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              stroke="none"
            />
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex-1">
          <CustomLegend data={coloredData} />  
        </div>
      </div>

      {/* Summary */}
      <div className="border-l-4 rounded-xl border-blue-500 bg-gray-800/70 px-3 py-2 mt-7">
        <p className="text-xs text-gray-300 leading-relaxed">
          {buildSummary(data)}
        </p>
      </div>

    </div>
  );
}