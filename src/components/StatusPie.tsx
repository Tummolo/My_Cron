// src/components/StatusPie.tsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Datum {
  status: string;
  count: number;
}

// Qui definiamo i colori per ciascun valore di “status”
// Se arrivasse uno status non presente nell’oggetto, verrà usato il colore di fallback (‘#999’)
const COLORS: Record<string, string> = {
  active:   '#4caf50',
  pending:  '#ff9800',
  inactive: '#f44336',
};

const StatusPie: React.FC = () => {
  const [data, setData] = useState<Datum[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1) Carichiamo i dati dallo script PHP
    fetch('/api/dashboard/status-distribution.php', {
      credentials: 'include', // se serve inviare cookie/credenziali
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json: Datum[]) => {
        // json è un array tipo [ { status: "active", count: 42 }, ... ]
        setData(json);
      })
      .catch((err) => {
        console.error('StatusPie fetch error:', err);
        setError('Errore nel caricamento dei dati');
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 2) Se è in caricamento, mostro uno spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={240}>
        <CircularProgress />
      </Box>
    );
  }

  // 3) Se c'è un errore di fetch o i dati non sono validi, mostro un messaggio di errore
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={240} p={2}>
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      </Box>
    );
  }

  // 4) Se data è null oppure è un array vuoto, mostro un messaggio “nessun dato”
  if (!data || data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={240} p={2}>
        <Typography color="textSecondary" variant="body2">
          Nessun paziente presente
        </Typography>
      </Box>
    );
  }

  // 5) Filtriamo eventuali voci con count <= 0
  const pieData = data.filter((d) => d.count > 0);

  // Se dopo il filtro non rimane nulla (tutti count=0), mostro comunque il messaggio “nessun paziente”
  if (pieData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={240} p={2}>
        <Typography color="textSecondary" variant="body2">
          Nessun paziente presente
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}     // se vuoi un effetto “ciambella”, altrimenti metti 0
            paddingAngle={4}     // piccolo spazio tra gli spicchi
            label={({ status, percent }) =>
              `${status} ${(percent! * 100).toFixed(0)}%`
            }
          >
            {pieData.map((d, i) => (
              <Cell key={`cell-${i}`} fill={COLORS[d.status] || '#999'} />
            ))}
          </Pie>
          {/* Tooltip al passaggio del mouse */}
          <ReTooltip
            formatter={(value: number, name: string) => [value, name]}
          />
          {/* Legenda in basso */}
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default StatusPie;
