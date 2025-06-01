import React, { FC, useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material'

interface Stats {
  active: number
  avgAge: number
  avgGlycemia: number
}

const Statistiche: FC = () => {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/stats.php')
      .then(r => r.json())
      .then(data => {
        // prendiamo solo le tre che ci servono qui
        setStats({
          active: data.active,
          avgAge: data.avgAge,
          avgGlycemia: data.avgGlycemia
        })
      })
      .catch(console.error)
  }, [])

  if (!stats) {
    return (
      <Box textAlign="center" py={4}>
        <CircularProgress />
      </Box>
    )
  }

  const cards = [
    { label: 'Pazienti attivi',   value: stats.active },
    { label: 'Età media',         value: `${stats.avgAge} anni` },
    { label: 'Media glicemia',    value: `${stats.avgGlycemia} mg/dL` }
  ]

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Statistiche
      </Typography>

      <Grid container spacing={2}>
        {cards.map(c => (
          <Grid item xs={12} sm={6} md={4} key={c.label}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {c.label}
                </Typography>
                <Typography variant="h4">
                  {c.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default Statistiche
