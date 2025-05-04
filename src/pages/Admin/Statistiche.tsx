import { FC } from 'react'
import { Typography, Grid, Card, CardContent, Box } from '@mui/material'

const stats = [
  { label: 'Media glicemia', value: '110 mg/dL' },
  { label: 'Pazienti attivi', value: 124 },
  { label: 'Età media', value: '66 anni' }
]

const Statistiche: FC = () => (
  <Box>
    <Typography variant="h5" gutterBottom>Statistiche</Typography>
    <Grid container spacing={2}>
      {stats.map(s => (
        <Grid item xs={12} sm={6} md={4} key={s.label}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {s.label}
              </Typography>
              <Typography variant="h4">{s.value}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
)
export default Statistiche
