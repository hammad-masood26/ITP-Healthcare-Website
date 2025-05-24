import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PieChartComponent({ 
  data, 
  dataKey, 
  nameKey,
  title,
  colors = ['#C69749', '#735F32', '#FFD700']
}: { 
  data: any[]; 
  dataKey: string;
  nameKey: string;
  colors?: string[];
  title?: string;
}) {
  const total = data.reduce((sum, entry) => sum + entry[dataKey], 0);

  // Show percent on the pie slice label
  const renderLabel = (entry: any) => {
    const percent = ((entry[dataKey] / total) * 100).toFixed(1);
    return `${percent}%`;
  };

  // Default Tooltip showing count
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      return (
        <div style={{
          backgroundColor: '#282A3A',
          border: '1px solid #735F32',
          padding: 10,
          borderRadius: '0.5rem',
          color: '#FFFFFF'
        }}>
          <p style={{ color: '#FFD700', marginBottom: 4 }}><strong>{entry.name}</strong></p>
          <p>Count: {entry.value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={120}
          label={renderLabel}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={colors[index % colors.length]} 
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
