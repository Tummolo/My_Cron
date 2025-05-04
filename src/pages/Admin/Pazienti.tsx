import { FC } from 'react'
import { Typography, List, ListItem, ListItemText, Divider, Box } from '@mui/material'

const Pazienti: FC = () => (
  <Box>
    <Typography variant="h5" gutterBottom>Pazienti</Typography>
    <List>
      {['Rossi Mario','Bianchi Anna','Verdi Luca'].map(name => (
        <Box key={name}>
          <ListItem>
            <ListItemText primary={name} secondary="Es. 65 anni – Diabete" />
          </ListItem>
          <Divider component="li"/>
        </Box>
      ))}
    </List>
  </Box>
)
export default Pazienti
