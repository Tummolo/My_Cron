import React, { FC, useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material'

import ChartCard   from '../../components/ChartCard'
import StatusPie   from '../../components/StatusPie'
import DiseasePie  from '../../components/DiseasePie'
import SignupLine  from '../../components/SignupLine'

interface Stats {
  totalPatients: number
  active:       number
  inactive:     number
  pending:      number
  avgAge:       number
  avgGlycemia:  number
}

const AdminPanel: FC = () => {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/stats.php')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
  }, [])

  if (!stats) {
    return (
      <Box textAlign="center" py={4}>
        <CircularProgress />
      </Box>
    )
  }

  const summary = [
    { label: 'Totale pazienti',    value: stats.totalPatients },
    { label: 'Attivi',             value: stats.active },
    { label: 'Inattivi',           value: stats.inactive },
    { label: 'In attesa',          value: stats.pending },
    { label: 'Età media',          value: `${stats.avgAge.toFixed(1)} anni` },
    { label: 'Glicemia media',     value: `${stats.avgGlycemia.toFixed(1)} mg/dL` },
  ]

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Amministratore
      </Typography>

      <Grid container spacing={2} mb={4}>
        {summary.map(s => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={s.label}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {s.label}
                </Typography>
                <Typography variant="h5">{s.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <ChartCard title="Status Pazienti">
            <StatusPie />
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <ChartCard title="Distribuzione Malattie">
            <DiseasePie />
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <ChartCard title="Nuove iscrizioni (30 giorni)">
            <SignupLine days={30} />
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AdminPanel
