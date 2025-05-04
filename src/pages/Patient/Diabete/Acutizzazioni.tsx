// src/pages/Patient/Diabete/Acutizzazioni.tsx
import React, { FC } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

interface SectionProps {
  title: string
  children: React.ReactNode
}

const Section: FC<SectionProps> = ({ title, children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (isMobile) {
    return (
      <Accordion disableGutters elevation={1}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {children}
        </AccordionDetails>
      </Accordion>
    )
  }

  return (
    <Card elevation={1}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  )
}

const DiabeteAcutizzazioni: FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Spacing responsive per il wrapper
  const wrapperSx = {
    px: { xs: 1, sm: 3, md: 4 },
    py: { xs: 2, sm: 3, md: 4 }
  }

  // Variante testo spiegazioni
  const bodyVariant = isMobile ? 'body2' : 'body1'

  return (
    <Box sx={wrapperSx}>
      {/* Titolo principale */}
      <Box mb={3} textAlign={isMobile ? 'center' : 'left'}>
        <Typography variant={isMobile ? 'h5' : 'h4'} component="h1">
          🔧 Gestione delle Acutizzazioni
        </Typography>
        <Divider sx={{ mt: 1 }} />
      </Box>

      {/* Iperglicemia */}
      <Section title="In caso di iperglicemia:">
        <List sx={{ pt: 0 }} disablePadding>
          {[
            'Idratarsi: bere molta acqua aiuta a eliminare il glucosio in eccesso',
            'Evitare cibi e bevande zuccherate',
            'Contattare il medico se la glicemia supera i 300 mg/dl',
            'Verificare la presenza di chetoni nelle urine (vedi “Che cosa sono i chetoni?”)'
          ].map((text, i) => (
            <ListItem key={i} sx={{ py: isMobile ? 1 : 1.5 }}>
              <ListItemText primary={text} primaryTypographyProps={{ variant: bodyVariant }} />
            </ListItem>
          ))}
        </List>
      </Section>

      {/* Spazio */}
      <Box my={2} />

      {/* Ipopiglicemia */}
      <Section title="In caso di ipoglicemia (glicemia < 70 mg/dl):">
        <List sx={{ pt: 0 }} disablePadding>
          {[
            'Assumere zuccheri: 3 bustine da 5 g ciascuna (tot. 15 g)',
            'Attendere 15 min e ricontrollare la glicemia',
            'Ripetere ogni 15 min fino a glicemia > 100 mg/dl',
            'Se non migliora, ripetere zuccheri e contattare il medico'
          ].map((text, i) => (
            <ListItem key={i} sx={{ py: isMobile ? 1 : 1.5 }}>
              <ListItemText primary={text} primaryTypographyProps={{ variant: bodyVariant }} />
            </ListItem>
          ))}
        </List>
        <Typography 
          variant="body2" 
          color="error" 
          sx={{ mt: 1, fontWeight: 'bold' }}
        >
          ⚠️ Se non riconosciuta e trattata, l’ipoglicemia può portare a morte.
        </Typography>
      </Section>

      <Box my={2} />

      {/* Chetoni */}
      <Section title="🧪 Che cosa sono i chetoni?">
        <Typography paragraph variant={bodyVariant}>
          I chetoni sono sostanze prodotte dal fegato quando il corpo brucia grassi invece di
          zuccheri per produrre energia. Succede quando:
        </Typography>
        <List sx={{ pt: 0 }} disablePadding>
          {[
            'La glicemia è molto alta',
            'C’è mancanza di insulina',
            'Il corpo è sotto stress (febbre o infezioni)'
          ].map((text, i) => (
            <ListItem key={i} sx={{ py: isMobile ? 1 : 1.5 }}>
              <ListItemText primary={text} primaryTypographyProps={{ variant: bodyVariant }} />
            </ListItem>
          ))}
        </List>
        <Typography variant="body2" color="error" gutterBottom sx={{ fontWeight: 'bold' }}>
          ⚠️ Un’eccessiva presenza di chetoni può portare a chetoacidosi diabetica, una
          complicanza grave e potenzialmente pericolosa per la vita.
        </Typography>

        <Typography variant="h6" gutterBottom>
          🧴 Controllo dei chetoni:
        </Typography>
        <List sx={{ pt: 0 }} disablePadding>
          {[
            'Usa strisce urinarie reperibili in farmacia',
            'Verifica soprattutto se glicemia > 250–300 mg/dl',
            'Fai attenzione a sintomi come: nausea/vomito, respiro profondo e accelerato, alito fruttato, confusione o stanchezza eccessiva'
          ].map((text, i) => (
            <ListItem key={i} sx={{ py: isMobile ? 1 : 1.5 }}>
              <ListItemText primary={text} primaryTypographyProps={{ variant: bodyVariant }} />
            </ListItem>
          ))}
        </List>

        <Typography variant="body2" color="error" gutterBottom sx={{ fontWeight: 'bold', mt: 1 }}>
          🚨 Chiama il medico o l’infermiere se:
        </Typography>
        <List sx={{ pt: 0 }} disablePadding>
          {[
            'I chetoni sono moderati o alti',
            'La glicemia resta alta nonostante il trattamento',
            'Compaiono sintomi di chetoacidosi'
          ].map((text, i) => (
            <ListItem key={i} sx={{ py: isMobile ? 1 : 1.5 }}>
              <ListItemText primary={text} primaryTypographyProps={{ variant: bodyVariant }} />
            </ListItem>
          ))}
        </List>
      </Section>
    </Box>
  )
}

export default DiabeteAcutizzazioni
