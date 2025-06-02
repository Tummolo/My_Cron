// src/components/SignupLine.tsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from 'recharts';

interface SignupDatum {
  date:  string; // es. "2025-05-06"
  count: number; // es. numero di iscrizioni in quel giorno
}

interface Props {
  days: number; // ad esempio 30
}

const SignupLine: React.FC<Props> = ({ days }) => {
  const [data, setData]     = useState<SignupDatum[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/dashboard/signup-trend.php?days=${days}`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<SignupDatum[]>;
      })
      .then((json) => {
        // json è array come [ { "date": "2025-05-06", "count": 6 }, { "date": "2025-06-01", "count": 1 } ]
        setData(json);
      })
      .catch((err) => {
        console.error('SignupLine fetch error:', err);
        setError('Errore nel caricamento dei dati');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [days]);

  // In caricamento, mostro spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={240}>
        <CircularProgress />
      </Box>
    );
  }

  // Se errore, lo mostro
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={240} p={2}>
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      </Box>
    );
  }

  // Se data è null o vuoto, “nessun dato”
  if (!data || data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={240} p={2}>
        <Typography color="textSecondary" variant="body2">
          Nessun dato disponibile
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#1976d2"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <ReTooltip />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default SignupLine;
