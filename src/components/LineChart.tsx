import React, { FC, useEffect, useState } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import { Line } from 'react-chartjs-2' // se usi chart.js; altrimenti togli

interface Props { endpoint: string }

const LineChart: FC<Props> = ({ endpoint }) => {
  const [data, setData] = useState<any|null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(endpoint)
      .then(r => r.json())
      .then(json => {
        // trasforma json in chart-data se vuoi
        setData(json)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [endpoint])

  if (loading) return <Box textAlign="center" py={4}><CircularProgress/></Box>

  if (!data) {
    return (
      <Box sx={{ height:240, bgcolor:'#fafafa', p:2 }}>
        <Typography color="textSecondary">Nessun dato</Typography>
      </Box>
    )
  }

  // Se non usi chart.js, sostituisci con un semplice <pre>{JSON.stringify(data,…)}</pre>
  return (
    <Box sx={{ height:240 }}>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Dati da: {endpoint}
      </Typography>
      <pre style={{ fontSize:12, overflow:'auto', height:200 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </Box>
  )
}

export default LineChart
