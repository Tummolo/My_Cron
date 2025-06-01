import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';

interface Datum { status: string; count: number; }
const COLORS: Record<string,string> = {
  active:   '#4caf50',
  pending:  '#ff9800',
  inactive: '#f44336'
};

const StatusPie: React.FC = () => {
  const [data, setData] = useState<Datum[]>([]);
  useEffect(() => {
    fetch('/api/dashboard/status-distribution.php')
      .then(r => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {data.map((d,i) =>
            <Cell key={i} fill={COLORS[d.status]||'#999'} />
          )}
        </Pie>
        <Tooltip/>
      </PieChart>
    </ResponsiveContainer>
  );
}

export default StatusPie;
