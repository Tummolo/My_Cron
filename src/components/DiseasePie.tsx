import React, { FC, useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts'

interface Datum { disease: string; count: number }

// Mappatura colori (aggiungi altri se hai più malattie)
const COLORS: Record<string,string> = {
  Diabete:            '#42a5f5',
  'Scompenso Cardiaco':'#ef5350',
  // default
  default:            '#9e9e9e'
}

const DiseasePie: FC = () => {
  const [data, setData] = useState<Datum[]>([])

  useEffect(() => {
    fetch('/api/dashboard/disease-distribution.php')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
  }, [])

  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="disease"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          label
        >
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={COLORS[d.disease] || COLORS.default}
            />
          ))}
        </Pie>
        <Tooltip/>
      </PieChart>
    </ResponsiveContainer>
  )
}

export default DiseasePie
