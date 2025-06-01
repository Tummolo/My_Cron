import React, { FC, useEffect, useState } from 'react'
import { List, ListItem, ListItemText, CircularProgress, Box, Typography } from '@mui/material'

interface Entry { id:number; entry_date:string; glicemia_pre?:number; glicemia_post?:number }
interface Props { limit: number }

const RecentDiary: FC<Props> = ({ limit }) => {
  const [items, setItems] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/patients/diario/read.php?last=${limit}`)
      .then(r => r.json())
      .then((data: Entry[]) => setItems(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [limit])

  if (loading) return <Box textAlign="center" py={2}><CircularProgress size={20}/></Box>
  if (items.length===0) return <Typography color="textSecondary">Nessuna voce diary</Typography>

  return (
    <List dense>
      {items.map(e=>(
        <ListItem key={e.id}>
          <ListItemText
            primary={new Date(e.entry_date).toLocaleDateString('it-IT')}
            secondary={`Pre ${e.glicemia_pre} – Post ${e.glicemia_post}`}
          />
        </ListItem>
      ))}
    </List>
  )
}

export default RecentDiary
