// src/pages/statistiche/Statistiche.tsx

import React, { FC, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Skeleton,
  IconButton,
  Button,
  Alert,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import OpacityIcon from '@mui/icons-material/Opacity';

interface Stats {
  active: number;
  avgAge: number;
  avgGlycemia: number;
}

const Statistiche: FC = () => {
  // 1) Stati base
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 2) useCallback per la fetch
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/dashboard/stats.php');
      if (!res.ok) throw new Error(`Errore HTTP: ${res.status}`);
      const data = await res.json();

      // Verifica dei campi obbligatori
      if (
        typeof data.active !== 'number' ||
        typeof data.avgAge !== 'number' ||
        typeof data.avgGlycemia !== 'number'
      ) {
        throw new Error('Risposta API mancante di campi obbligatori');
      }

      setStats({
        active: data.active,
        avgAge: data.avgAge,
        avgGlycemia: data.avgGlycemia,
      });
      setLastUpdated(new Date());
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Errore sconosciuto');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3) useEffect per la chiamata iniziale
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // 4) useMemo per costruire l'array di card – viene eseguito sempre, ma se stats è null restituisce array vuoto
  const cardsMemo = useMemo(() => {
    if (!stats) return [];

    return [
      {
        label: 'Pazienti attivi',
        value: stats.active,
        icon: (
          <AccessibilityNewIcon
            sx={{ color: 'success.main' }}
            aria-label="icona pazienti attivi"
          />
        ),
      },
      {
        label: 'Età media',
        value: `${stats.avgAge.toFixed(1)} anni`,
        icon: (
          <CalendarTodayIcon
            sx={{ color: 'info.main' }}
            aria-label="icona età media"
          />
        ),
      },
      {
        label: 'Media glicemia',
        value: `${stats.avgGlycemia.toFixed(1)} mg/dL`,
        icon: (
          <OpacityIcon
            sx={{ color: 'secondary.main' }}
            aria-label="icona media glicemia"
          />
        ),
      },
    ];
  }, [stats]);

  // 5) Se siamo in caricamento iniziale (stats === null e loading === true) mostriamo Skeleton + Loader
  if (loading && stats === null) {
    return (
      <Box p={{ xs: 1, sm: 2, md: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Statistiche</Typography>
          <IconButton disabled aria-label="aggiorna">
            <RefreshIcon />
          </IconButton>
        </Box>

        <Grid container spacing={3}>
          {[...Array(3)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={140} animation="wave" />
            </Grid>
          ))}
        </Grid>

        <Box textAlign="center" py={4}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  // 6) Render “definitivo”
  return (
    <Box p={{ xs: 1, sm: 2, md: 4 }}>
      {/* Header con titolo, timestamp e pulsante “Ricarica” */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5">Statistiche</Typography>
          {lastUpdated && (
            <Typography variant="caption" color="textSecondary">
              Ultimo aggiornamento: {lastUpdated.toLocaleString('it-IT')}
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchStats}
          disabled={loading}
        >
          {loading ? 'Caricamento…' : 'Ricarica'}
        </Button>
      </Box>

      {/* Se c’è un errore, mostriamo un Alert */}
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Errore nel caricamento delle statistiche: {errorMsg}
        </Alert>
      )}

      {/* Se abbiamo dati (stats !== null), mostriamo le card; altrimenti, se non stiamo caricando, un messaggio “nessun dato” */}
      {stats ? (
        <Grid container spacing={3}>
          {cardsMemo.map((c) => (
            <Grid item xs={12} sm={6} md={4} key={c.label}>
              <Card
                sx={{
                  minHeight: 140,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  borderRadius: 2,
                  boxShadow: 2,
                }}
                aria-labelledby={`stat-card-${c.label}`}
              >
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: 'grey.100',
                        mr: 2,
                      }}
                      aria-hidden="true"
                    >
                      {c.icon}
                    </Avatar>
                    <Box>
                      <Typography
                        color="textSecondary"
                        variant="subtitle2"
                        id={`stat-card-${c.label}`}
                      >
                        {c.label}
                      </Typography>
                      <Typography variant="h4">{c.value}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        // Se non ci sono dati e non siamo in caricamento
        !loading && (
          <Box textAlign="center" py={4}>
            <Typography color="textSecondary">
              Nessuna statistica disponibile.
            </Typography>
          </Box>
        )
      )}
    </Box>
  );
};

export default Statistiche;
