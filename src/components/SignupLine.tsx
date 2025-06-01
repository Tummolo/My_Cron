import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface Datum { date: string; count: number; }

interface Props { days?: number; }

const SignupLine: React.FC<Props> = ({ days = 30 }) => {
  const [data, setData] = useState<Datum[]>([]);
  useEffect(() => {
    fetch(`/api/dashboard/signup-trend.php?days=${days}`)
      .then(r => r.json())
      .then(setData)
      .catch(console.error);
  }, [days]);

  return (
    <ResponsiveContainer>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip/>
        <Line type="monotone" dataKey="count" stroke="#1976d2" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default SignupLine;
