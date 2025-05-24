// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// export default function BarChartComponent({ 
//   data, 
//   dataKey,
//   xAxisKey,
//   yAxisKey,
//   barColors ,
//   title
// }: { 
//   data: any[]; 
//   dataKey: string;
//   xAxisKey: string;
//   yAxisKey: string;
//   barColors?: string[];  // Optional colors prop
//   title?: string;  // Optional colors prop
// }) {
//   return (
//     <ResponsiveContainer width="100%" height={250}>
//       <BarChart data={data}>
//         <XAxis dataKey={xAxisKey} stroke="#C69749" />
//         <YAxis dataKey={yAxisKey} stroke="#C69749" />
//         {/* <YAxis stroke="#C69749" /> */}
//         <Tooltip 
//           contentStyle={{ 
//             backgroundColor: '#282A3A',
//             borderColor: '#735F32',
//             borderRadius: '0.5rem'
//           }}
//         />
//         <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
//           {data.map((_, index) => (
//             <Cell 
//               key={`cell-${index}`} 
//               fill={
//                 barColors && barColors[index] 
//                   ? barColors[index] 
//                   : '#C69749' // fallback color
//               } 
//             />
//           ))}
//         </Bar>
//       </BarChart>
//     </ResponsiveContainer>
//   );
// }
'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface BarChartComponentProps {
  data: Array<{ name: string; count: number }>;
  dataKey: string;
  yAxisKey: string;
  xAxisKey: string;
  barColors: string[];
  title: string;
}

export default function BarChartComponent({ data, dataKey, yAxisKey, xAxisKey, barColors, title }: BarChartComponentProps) {
  // Fallback for empty or invalid data
  if (!data || data.length === 0) {
    return <div className="text-center text-[#C69749]">No data available</div>;
  }

  // Custom tick formatter for XAxis to match tick color with bar color
  const CustomTick = ({ x, y, payload, index }: any) => {
    const color = barColors[index % barColors.length];
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill={color}
          fontSize={data.length > 10 ? 12 : 14}
          transform="rotate(-45)"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div>
      <h4 className="text-md font-medium mb-2 text-[#C69749] text-center">{title}</h4>
      <ResponsiveContainer width="100%" height={310}>
        <BarChart data={data} margin={{  bottom: 20 }}>
          <CartesianGrid strokeDasharray="5 5" stroke="#555" />
          <XAxis
            dataKey={xAxisKey}
            tick={<CustomTick />}
            interval={0}
            tickMargin={10}
            height={60}
          />
          <YAxis
            dataKey={yAxisKey}
            tick={{ fill: '#C69749' }}
            stroke="#C69749"
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#282A3A', borderColor: '#735F32', color: '#C69749' }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
          />
          <Legend wrapperStyle={{ color: '#C69749' }} />
          <Bar dataKey={dataKey}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}