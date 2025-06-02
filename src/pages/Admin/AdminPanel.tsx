// src/pages/Admin/AdminPanel.tsx

import React, { FC, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Skeleton
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import PendingIcon from '@mui/icons-material/Pending';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import OpacityIcon from '@mui/icons-material/Opacity';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

import SignupLine from '../../components/SignupLine';

interface Stats {
  totalPatients: number;
  active:       number;
  inactive:     number;
  pending:      number;
  avgAge:       number;
  avgGlycemia:  number;
  diaryCount:   number;
  therapyCount: number;
}

const AdminPanel: FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/stats.php', {
      credentials: 'include'
    })
      .then((r) => r.json())
      .then((json: any) => {
        // Assicuriamoci che i campi diaryCount e therapyCount siano castati correttamente
        setStats({
          totalPatients: json.totalPatients,
          active:        json.active,
          inactive:      json.inactive,
          pending:       json.pending,
          avgAge:        json.avgAge,
          avgGlycemia:   json.avgGlycemia,
          diaryCount:    json.diaryCount,
          therapyCount:  json.therapyCount
        });
      })
      .catch(console.error);
  }, []);

  // Mentre i dati non arrivano, mostro uno scheletro
  if (!stats) {
    return (
      <Box p={{ xs: 1, sm: 2, md: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard Amministratore
        </Typography>
        <Grid container spacing={3} mb={4}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={i}>
              <Skeleton variant="rounded" height={120} animation="wave" />
            </Grid>
          ))}
        </Grid>
        <Box textAlign="center" py={4}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  // Array di riepilogo con icona, label e valore
  const summary = [
    {
      label: 'Totale pazienti',
      value: stats.totalPatients,
      icon:  <PeopleIcon sx={{ color: 'primary.main' }} />,
    },
    {
      label: 'Attivi',
      value: stats.active,
      icon:  <AccessibilityNewIcon sx={{ color: 'success.main' }} />,
    },
    {
      label: 'Inattivi',
      value: stats.inactive,
      icon:  <AccessibilityNewIcon sx={{ color: 'error.main' }} />,
    },
    {
      label: 'In attesa',
      value: stats.pending,
      icon:  <PendingIcon sx={{ color: 'warning.main' }} />,
    },
    {
      label: 'Età media',
      value: `${stats.avgAge.toFixed(1)} anni`,
      icon:  <CalendarTodayIcon sx={{ color: 'info.main' }} />,
    },
    {
      label: 'Glicemia media',
      value: `${stats.avgGlycemia.toFixed(1)} mg/dL`,
      icon:  <OpacityIcon sx={{ color: 'secondary.main' }} />,
    },
  ];

  // Card di riepilogo “Voci di diario” e “Voci di terapia”
  const extraCards = [
    {
      label: 'Voci di diario',
      value: stats.diaryCount,
      icon:  <MenuBookIcon sx={{ color: 'secondary.dark' }} />,
    },
    {
      label: 'Voci di terapia',
      value: stats.therapyCount,
      icon:  <LocalHospitalIcon sx={{ color: 'secondary.main' }} />,
    },
  ];

  return (
    <Box p={{ xs: 1, sm: 2, md: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Amministratore
      </Typography>

      {/* ─── RIEPILOGO NUMERICI ───────────────────────────────────────────── */}
      <Grid container spacing={3} mb={4}>
        {summary.map((s) => (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={s.label}>
            <Card
              sx={{
                minHeight: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: 'grey.100',
                      mr: 2,
                    }}
                  >
                    {s.icon}
                  </Avatar>
                  <Box>
                    <Typography color="textSecondary" variant="subtitle2">
                      {s.label}
                    </Typography>
                    <Typography variant="h5">{s.value}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* ─── RIASSUNTO “DIARIO” e “TERAPIA” ─────────────────────────── */}
        {extraCards.map((ec) => (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={ec.label}>
            <Card
              sx={{
                minHeight: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: 'grey.100',
                      mr: 2,
                    }}
                  >
                    {ec.icon}
                  </Avatar>
                  <Box>
                    <Typography color="textSecondary" variant="subtitle2">
                      {ec.label}
                    </Typography>
                    <Typography variant="h5">{ec.value}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ─── GRAFICO “Nuove iscrizioni (30 giorni)” ──────────────────────────────────── */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Nuove iscrizioni (30 giorni)
              </Typography>
              <Box sx={{ width: '100%', height: 240 }}>
                <SignupLine days={30} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Se in futuro vorrai aggiungere un secondo grafico (es. glicemia over time),
            qui potresti inserire un secondo <Grid item> */}
      </Grid>
    </Box>
  );
};

export default AdminPanel;
