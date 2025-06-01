import React, { FC, useEffect, useState } from 'react'
import { List, ListItem, ListItemText, CircularProgress, Box, Typography } from '@mui/material'

interface Entry { id:number; created_at:string; drug_name:string; dosage:string }
interface Props { limit: number }

const RecentTherapy: FC<Props> = ({ limit }) => {
  const [items, setItems] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/patients/terapia/read.php?last=${limit}`)
      .then(r => r.json())
      .then((data:{success:boolean,data:Entry[]})=>{
        if(data.success) setItems(data.data)
      })
      .catch(console.error)
      .finally(()=>setLoading(false))
  }, [limit])

  if (loading) return <Box textAlign="center" py={2}><CircularProgress size={20}/></Box>
  if (items.length===0) return <Typography color="textSecondary">Nessuna voce therapy</Typography>

  return (
    <List dense>
      {items.map(t=>(
        <ListItem key={t.id}>
          <ListItemText
            primary={new Date(t.created_at).toLocaleDateString('it-IT')}
            secondary={`${t.drug_name} – ${t.dosage}`}
          />
        </ListItem>
      ))}
    </List>
  )
}

export default RecentTherapy
