// src/components/StatusNestedPie.tsx

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

interface StatusDatum {
  status: string;   // "active", "pending", "inactive"
  count:  number;   // numero di pazienti con quello status
}

interface DiseaseDatum {
  disease: string;  // "Diabete", "Scompenso Cardiaco", ecc.
  count:   number;  // numero di pazienti con quella malattia
}

// --------------------
// 1) Definiamo i colori
// --------------------

// Colori per lo “status” dei pazienti
const STATUS_COLORS: Record<string,string> = {
  active:   '#4caf50',  // verde
  pending:  '#ff9800',  // arancio
  inactive: '#f44336',  // rosso
};

// Colori per le varie “malattie”
// Se aggiungerai nuovi tipi di malattia, basta inserirli qui (chiave = nome malattia).
const DISEASE_COLORS: Record<string,string> = {
  Diabete:             '#3f51b5',  // indaco
  'Scompenso Cardiaco': '#009688', // teal
};

const StatusNestedPie: React.FC = () => {
  // ---------------------------
  // 2) Stati locali del componente
  // ---------------------------
  const [statusData,  setStatusData]  = useState<StatusDatum[] | null>(null);
  const [diseaseData, setDiseaseData] = useState<DiseaseDatum[] | null>(null);
  const [loading,     setLoading]     = useState<boolean>(true);
  const [error,       setError]       = useState<string | null>(null);

  // ----------------------------------------
  // 3) Al montaggio, facciamo due fetch paralleli:
  //    - /status-distribution.php
  //    - /disease-distribution.php
  // ----------------------------------------
  useEffect(() => {
    const fetchStatus = fetch('/api/dashboard/status-distribution.php', {
      credentials: 'include'
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Status API HTTP ${res.status}`);
        return res.json() as Promise<StatusDatum[]>;
      });

    const fetchDisease = fetch('/api/dashboard/disease-distribution.php', {
      credentials: 'include'
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Disease API HTTP ${res.status}`);
        return res.json() as Promise<DiseaseDatum[]>;
      });

    Promise.all([fetchStatus, fetchDisease])
      .then(([stData, dsData]) => {
        setStatusData(stData);
        setDiseaseData(dsData);
      })
      .catch((err) => {
        console.error('StatusNestedPie fetch error:', err);
        setError('Errore nel caricamento dei dati');
        setStatusData(null);
        setDiseaseData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ----------------------------------------
  // 4) Rendering: gestiamo loading / error / nessun dato
  // ----------------------------------------

  // — In fase di caricamento, mostro uno spinner al centro
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={240}>
        <CircularProgress />
      </Box>
    );
  }

  // — Se c’è stato un errore nella fetch, mostro messaggio
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={240} p={2}>
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      </Box>
    );
  }

  // — Se i dati sono null o empty, mostro “Nessun dato disponibile”
  if (
    !statusData    || statusData.length === 0 ||
    !diseaseData   || diseaseData.length === 0
  ) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={240} p={2}>
        <Typography color="textSecondary" variant="body2">
          Nessun dato disponibile
        </Typography>
      </Box>
    );
  }

  // ----------------------------------------
  // 5) Filtriamo eventuali voci con count <= 0
  // ----------------------------------------
  const stPie = statusData.filter((d) => d.count > 0);
  const dsPie = diseaseData.filter((d) => d.count > 0);

  // — Se non c’è alcun paziente con status valido, “Nessun paziente”
  if (stPie.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={240} p={2}>
        <Typography color="textSecondary" variant="body2">
          Nessun paziente presente
        </Typography>
      </Box>
    );
  }

  // — Se c’è solo 1 (o 0) malattie, disegniamo un singolo donut (anello interno)
  //   altrimenti facciamo “nested” con due anelli.
  const drawNested = dsPie.length > 1;

  // ----------------------------------------
  // 6) Disegno effettivo del PieChart (donut)
  // ----------------------------------------
  return (
    <Box sx={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <PieChart>
          {/* ————— Anello interno (“Status” dei pazienti) ————— */}
          <Pie
            data={stPie}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={drawNested ? 0 : 40}   // se NON nested, creiamo un donut unico facendo innerRadius=40
            outerRadius={drawNested ? 60 : 95} // se NON nested, outerRadius=95 per occupare quasi tutto
            paddingAngle={2}
            label={({ status, percent }) =>
              `${status} ${(percent! * 100).toFixed(0)}%`
            }
          >
            {stPie.map((d, i) => (
              <Cell
                key={`cell-status-${i}`}
                fill={STATUS_COLORS[d.status] || '#999'}
              />
            ))}
          </Pie>

          {
            // ————— Se vogliamo il “nested” (almeno 2 malattie), disegniamo l’anello esterno —————
            drawNested && (
              <Pie
                data={dsPie}
                dataKey="count"
                nameKey="disease"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={1}
              >
                {dsPie.map((d, i) => (
                  <Cell
                    key={`cell-disease-${i}`}
                    fill={DISEASE_COLORS[d.disease] || '#ccc'}
                  />
                ))}
              </Pie>
            )
          }

          {/* Tooltip e legenda posizionata in basso */}
          <ReTooltip formatter={(value: number, name: string) => [value, name]} />
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

export default StatusNestedPie;
