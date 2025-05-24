import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

export default function LineChartComponent({
  data,
  dataKey,
  xLabel = 'Date',
  yLabel = 'Value',
  title = 'Activity'
  
}: {
  data: any[];
  dataKey: string;
  xLabel?: string;
  yLabel?: string;
  title?: string;
}) {
  return (
    <div className="w-full h-[300px]">
      <h3 className="text-xl font-semibold text-center mb-2 text-[#C69749]">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="2 2" stroke="#9999"/>
          <XAxis
            dataKey="date"
            stroke="#C69749"
            label={{
              value: xLabel,
              position: 'insideBottom',
              offset: -5,
              fill: '#C69749',
              fontSize: 18
            }}
          />
          <YAxis
            stroke="#C69749"
            label={{
              value: yLabel,
              angle: -90,
              position: 'insideLeft',
              fill: '#C69749',
              fontSize: 18
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#282A3A',
              borderColor: '#735F32',
              borderRadius: '0.5rem'
            }}
          />
          <Legend />
          <Line
            type="linear"
            dataKey={dataKey}
            stroke="#C69749"
            strokeWidth={2}
            dot={{ r: 4, fill: '#735F32' }}
            activeDot={{ r: 6, fill: '#FFD700' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
