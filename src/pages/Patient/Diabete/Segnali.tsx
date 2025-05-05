// src/pages/Patient/Diabete/Segnali.tsx
import React, { FC } from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

const Segnali: FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Wrapper padding responsive
  const wrapperSx = {
    px: { xs: 1, sm: 3 },
    py: { xs: 2, sm: 3 }
  }

  // CardContent padding responsive
  const cardContentSx = {
    px: isMobile ? 2 : 3,
    py: isMobile ? 1.5 : 2
  }

  // Typography variants
  const titleVariant = isMobile ? 'h5' : 'h4'
  const sectionVariant = isMobile ? 'subtitle1' : 'h6'
  const textVariant = isMobile ? 'body2' : 'body1'

  // List item spacing
  const listItemSx = { py: isMobile ? 0.5 : 1 }

  return (
    <Box sx={wrapperSx}>
      <Box display="flex" alignItems="center" mb={2}>
        <WarningAmberIcon color="error" sx={{ mr: 1, fontSize: isMobile ? '2rem' : '2.5rem' }} />
        <Typography variant={titleVariant}>Segnali di Allarme</Typography>
      </Box>

      {/* Iperglicemia */}
      <Card elevation={1} sx={{ mb: 2 }}>
        <CardContent sx={cardContentSx}>
          <Typography variant={sectionVariant} gutterBottom>
            Sintomi di iperglicemia
          </Typography>
          <List disablePadding>
            {[
              'Sete intensa e persistente',
              'Minzioni frequenti',
              'Visione offuscata',
              'Stanchezza marcata'
            ].map((item, idx) => (
              <ListItem key={idx} sx={listItemSx}>
                <ListItemText
                  primary={item}
                  primaryTypographyProps={{ variant: textVariant }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Ipopiglicemia */}
      <Card elevation={1} sx={{ mb: 2 }}>
        <CardContent sx={cardContentSx}>
          <Typography variant={sectionVariant} gutterBottom>
            Sintomi di ipoglicemia
          </Typography>
          <List disablePadding>
            {[
              'Sudorazione fredda e profusa',
              'Tremori e irrequietezza',
              'Confusione mentale o difficoltà di concentrazione',
              'Tachicardia e palpitazioni',
              'Fame improvvisa',
              'In casi gravi: convulsioni o perdita di coscienza'
            ].map((item, idx) => (
              <ListItem key={idx} sx={listItemSx}>
                <ListItemText
                  primary={item}
                  primaryTypographyProps={{ variant: textVariant }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Contatto medico */}
      <Card elevation={1}>
        <CardContent sx={cardContentSx}>
          <Typography variant={sectionVariant} gutterBottom>
            Quando chiamare l’infermiere o il medico
          </Typography>
          <List disablePadding>
            {[
              'Glicemia persistentemente > 250 mg/dl',
              'Stato confusionale o perdita di coscienza',
              'Nausea, vomito, difficoltà respiratorie'
            ].map((item, idx) => (
              <ListItem key={idx} sx={listItemSx}>
                <ListItemText
                  primary={item}
                  primaryTypographyProps={{ variant: textVariant }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Segnali
