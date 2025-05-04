// src/pages/Patient/Diabete/Educazione.tsx
import React, { FC, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer // Importato per la tabella responsiva
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import PieChartIcon from '@mui/icons-material/PieChart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HealingIcon from '@mui/icons-material/Healing';
import TableChartIcon from '@mui/icons-material/TableChart';

// Chart.js
import 'chart.js/auto';
import { Pie } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`diabete-educ-tabpanel-${index}`}
    aria-labelledby={`diabete-educ-tab-${index}`}
  >
    {/* Aggiunto pb={isMobile ? 1 : 2} per coerenza con altri spazi */}
    {value === index && <Box width="100%" pb={2}>{children}</Box>}
  </div>
);

const a11yProps = (index: number) => ({
  id: `diabete-educ-tab-${index}`,
  'aria-controls': `diabete-educ-tabpanel-${index}`
});

const EducazioneDiabete: FC = () => {
  const [tab, setTab] = useState(0);
  const handleChange = (_: React.SyntheticEvent, newTab: number) => setTab(newTab);
  // MediaQuery per rilevare schermi piccoli (es. smartphone)
  const isMobile = useMediaQuery('(max-width:600px)');

  const pieData = {
    labels: [
      'Alimentazione equilibrata',
      'Attività fisica regolare',
      'Terapia farmacologica'
    ],
    datasets: [
      {
        data: [33, 33, 34],
        backgroundColor: ['#90caf9', '#f48fb1', '#a5d6a7'],
        hoverOffset: 4
      }
    ]
  };

  const pieOptions: ChartOptions<'pie'> = {
    plugins: {
      legend: {
        // Posizione legenda ottimizzata per mobile/desktop
        position: (isMobile ? 'bottom' : 'right') as 'bottom' | 'right'
      }
    },
    maintainAspectRatio: false // Cruciale per controllare l'altezza con sx
  };

  // Stile comune per il padding interno delle Card ottimizzato per mobile
  const cardContentPaddingSx = { p: isMobile ? 1.5 : 2 };
  // Stile comune per i margini verticali tra sezioni ottimizzato per mobile
  const sectionMarginSx = { mt: isMobile ? 1.5 : 2 };

  return (
    // Padding generale ridotto su mobile
    <Box px={isMobile ? 1 : 3} py={isMobile ? 1 : 2}>
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        align="center"
        gutterBottom
        // Aggiunto un margine inferiore leggermente ridotto su mobile
        sx={{ mb: isMobile ? 2 : 3 }}
      >
        📖 Conosci e gestisci il tuo diabete di tipo 2
      </Typography>

      <Tabs
        value={tab}
        onChange={handleChange}
        // Tab scorrevoli su mobile, larghezza piena su desktop
        variant={isMobile ? 'scrollable' : 'fullWidth'}
        scrollButtons="auto" // Mostra pulsanti di scorrimento se necessario
        aria-label="Sezioni educazione diabete"
        sx={{
          mb: isMobile ? 2 : 3, // Margine inferiore ridotto su mobile
          borderBottom: 1, // Aggiunge una linea sotto i tab
          borderColor: 'divider', // Colore della linea standard MUI
          '& .MuiTab-root': {
            minWidth: isMobile ? 70 : 'auto', // Leggermente ridotto minWidth mobile
            fontSize: isMobile ? '0.75rem' : '0.875rem' // Font leggermente più piccolo su mobile
          },
          '& .MuiTabs-indicator': { height: 3, borderRadius: 1.5 } // Indicatore leggermente più sottile
        }}
      >
        <Tab icon={<InfoIcon />} label="Panoramica" {...a11yProps(0)} />
        <Tab icon={<PieChartIcon />} label="Descrizione" {...a11yProps(1)} />
        <Tab icon={<RestaurantIcon />} label="Dieta" {...a11yProps(2)} />
        <Tab icon={<FitnessCenterIcon />} label="Attività" {...a11yProps(3)} />
        <Tab icon={<HealingIcon />} label="Piede" {...a11yProps(4)} />
        <Tab icon={<TableChartIcon />} label="Tabella" {...a11yProps(5)} />
      </Tabs>

      {/* 0. Panoramica */}
      <TabPanel value={tab} index={0}>
        <Card elevation={1}>
          <CardContent sx={cardContentPaddingSx}>
            <Typography paragraph variant={isMobile ? 'body2' : 'body1'} sx={{ mb: 0 }}> {/* Rimosso margine inferiore del paragrafo */}
              “Conoscere il proprio diabete è il primo passo per vivere meglio ogni giorno.
              Questa guida ti aiuterà a capire cosa succede nel tuo corpo, cosa puoi fare per
              stare meglio e come usare correttamente i farmaci. Piccoli cambiamenti quotidiani
              portano a grandi cambiamenti nel futuro. Sei il protagonista della tua salute!”
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 1. Descrizione */}
      <TabPanel value={tab} index={1}>
        <Card elevation={1}>
          <CardContent sx={cardContentPaddingSx}>
            <Box
              display="flex"
              // Layout a colonna su mobile, a riga su desktop
              flexDirection={isMobile ? 'column' : 'row'}
              gap={isMobile ? 2 : 3} // Gap leggermente ridotto su mobile
            >
              {/* testo */}
              <Box flex={1} sx={{ order: isMobile ? 2 : 1 }}> {/* Testo sotto il grafico su mobile */}
                <List dense disablePadding> {/* disablePadding per maggiore controllo */}
                  <ListItem sx={{ pt: 0, pb: 0.5 }}> {/* Padding ridotto */}
                    <ListItemText
                      primary="1. Cos'è il Diabete Mellito di Tipo 2?"
                      primaryTypographyProps={{ variant: isMobile ? 'h6' : 'h6', fontSize: isMobile ? '1.1rem' : '1.25rem' }} // Font size h6 leggermente ridotto su mobile
                    />
                  </ListItem>
                  {[
                    'Il diabete mellito di tipo 2 è una malattia metabolica cronica caratterizzata da elevati livelli di glucosio nel sangue (iperglicemia).',
                    "L’insulina è un ormone prodotto dal pancreas che consente al glucosio di entrare nelle cellule per essere utilizzato come fonte di energia.",
                    "Nel diabete di tipo 2, l’insulina non agisce in modo efficace (insulino-resistenza) e/o viene prodotta in quantità insufficiente.",
                    "Il glucosio, quindi, rimane nel sangue invece di entrare nelle cellule."
                  ].map(text => (
                    <ListItem key={text} sx={{ py: 0.25 }}> {/* Padding verticale ridotto */}
                      <ListItemText primary={text} primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/>
                    </ListItem>
                  ))}
                </List>

                <List dense disablePadding sx={sectionMarginSx}>
                  <ListItem sx={{ pt: 0, pb: 0.5 }}>
                    <ListItemText
                      primary="Fattori di rischio"
                      primaryTypographyProps={{ variant: isMobile ? 'h6' : 'h6', fontSize: isMobile ? '1.1rem' : '1.25rem' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.25 }}>
                    <ListItemText primary="Modificabili: Sovrappeso/obesità, Alimentazione sbilanciata, Sedentarietà" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/>
                  </ListItem>
                  <ListItem sx={{ py: 0.25 }}>
                    <ListItemText primary="Non modificabili: Età, Familiarità, Etnia" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/>
                  </ListItem>
                </List>

                <Box sx={sectionMarginSx}>
                  <Typography variant={isMobile ? 'h6' : 'h6'} fontSize={isMobile ? '1.1rem' : '1.25rem'}>Range glicemico a digiuno raccomandato</Typography>
                  <Typography variant={isMobile ? 'body2' : 'body1'} >80–110 mg/dl</Typography>
                </Box>

                <List dense disablePadding sx={sectionMarginSx}>
                  <ListItem sx={{ pt: 0, pb: 0.5 }}>
                    <ListItemText
                      primary="I tre pilastri della gestione del diabete"
                      primaryTypographyProps={{ variant: isMobile ? 'h6' : 'h6', fontSize: isMobile ? '1.1rem' : '1.25rem' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.25 }}><ListItemText primary="1. Alimentazione equilibrata" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
                  <ListItem sx={{ py: 0.25 }}><ListItemText primary="2. Attività fisica regolare" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
                  <ListItem sx={{ py: 0.25 }}><ListItemText primary="3. Terapia farmacologica (se prescritta)" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
                </List>
              </Box>

              {/* pie chart */}
              <Box
                flex="0 0 auto" // Non cresce/riduce, base automatica
                width="100%" // Occupa tutta la larghezza disponibile in colonna
                maxWidth={isMobile ? '100%' : '40%'} // Limita larghezza su desktop
                // Altezza ottimizzata per mobile/desktop
                sx={{ height: isMobile ? 220 : 300, order: isMobile ? 1 : 2 }} // Grafico sopra il testo su mobile
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <Pie data={pieData} options={pieOptions} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 2. Dieta */}
      <TabPanel value={tab} index={2}>
        <Card elevation={1}>
          <CardContent sx={cardContentPaddingSx}>
            <List dense disablePadding>
              <ListItem sx={{ pt: 0, pb: 0.5 }}>
                <ListItemText
                  primary="🥗 Trattamento non farmacologico – Dieta"
                  primaryTypographyProps={{ variant: isMobile ? 'h6' : 'h6', fontSize: isMobile ? '1.1rem' : '1.25rem' }}
                />
              </ListItem>
            </List>
            {/* Scopo della dieta */}
            <List dense disablePadding sx={{ mb: isMobile ? 1 : 1.5 }}>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemText primary="Scopo della dieta:" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1', fontWeight: 'bold' }}/>
              </ListItem>
              {[
                'Mantenere il peso forma',
                "Limitare l’uso di farmaci",
                "Migliorare lo stato di salute generale",
                "Mantenere i valori glicemici nel range",
                "Prevenire complicanze cardiovascolari, renali, oculari e neurologiche"
              ].map(text => (
                <ListItem key={text} sx={{ py: 0.25, pl: 3 }}> {/* Indentazione per elenco puntato */}
                  <ListItemText primary={`• ${text}`} primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/>
                </ListItem>
              ))}
            </List>

            {/* Indice Glicemico */}
            <List dense disablePadding sx={{ mb: isMobile ? 1 : 1.5 }}>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemText
                  primary="Indice Glicemico (IG)"
                  primaryTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold', fontSize: isMobile ? '0.9rem' : '1rem' }} // Leggermente più piccolo
                />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="L’indice glicemico indica la velocità con cui un alimento contenente carboidrati aumenta la glicemia." primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="IG > 100: da evitare" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Basso IG (legumi, cereali integrali): sazietà prolungata" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Alto IG (zuccheri semplici): fame precoce" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
            </List>

            {/* Ripartizione nutrizionale */}
            <Typography variant={isMobile ? 'h6' : 'h6'} fontSize={isMobile ? '1.1rem' : '1.25rem'} sx={{ mb: isMobile ? 0.5 : 1 }}>
              Ripartizione nutrizionale consigliata
            </Typography>
            <List dense disablePadding>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="🍷 Ridurre o evitare l’assunzione di alcol" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemText primary="🍞 Carboidrati: 50–60%" secondary="Pane integrale/segale, pasta integrale, riso integrale, patate (piccole dosi), legumi, frutta con buccia, verdure" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1', fontWeight: 'bold' }} secondaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}/>
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemText primary="🥩 Proteine: ~20%" secondary="Carne magra, pesce azzurro, uova (2–3 settimanali), legumi, formaggi magri, yogurt magro" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1', fontWeight: 'bold' }} secondaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}/>
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemText primary="🫒 Grassi: 20–30%" secondary="Olio EVO a crudo (max 2 cucchiai), frutta secca (una manciata), pesce azzurro" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1', fontWeight: 'bold' }} secondaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}/>
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemText primary="🥦 Fibre: 25–30 g/die" secondary="Verdure a ogni pasto, pane/pasta integrali, 2–3 frutti con buccia, legumi 2–3 volte/settimana" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1', fontWeight: 'bold' }} secondaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}/>
              </ListItem>
            </List>

            {/* Frequenza Pasti */}
            <Box sx={sectionMarginSx}>
              <Typography variant={isMobile ? 'h6' : 'h6'} fontSize={isMobile ? '1.1rem' : '1.25rem'} sx={{ mb: isMobile ? 0.5 : 1 }}>Frequenza pasti</Typography>
              <List dense disablePadding>
                {[
                  'Colazione: 7:30', 'Spuntino: 10:30', 'Pranzo: 13:30',
                  'Spuntino: 16:30', 'Cena: 19:30', 'Spuntino: 22:30'
                ].map(item => (
                  <ListItem key={item} sx={{ py: 0.25 }}>
                    <ListItemText primary={item} primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/>
                  </ListItem>
                ))}
              </List>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 3. Attività */}
      <TabPanel value={tab} index={3}>
        <Card elevation={1}>
          <CardContent sx={cardContentPaddingSx}>
            <Typography variant={isMobile ? 'h6' : 'h6'} fontSize={isMobile ? '1.1rem' : '1.25rem'} gutterBottom>
              🏃‍♀️ Trattamento non farmacologico – Attività fisica
            </Typography>
            <List dense disablePadding sx={{ mb: isMobile ? 1 : 1.5 }}>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Almeno 30 minuti al giorno (camminata, bici, nuoto)" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Riduce glicemia e aumenta sensibilità all’insulina" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
            </List>

            <Typography variant='subtitle1' fontWeight='bold' fontSize={isMobile ? '0.9rem' : '1rem'} gutterBottom>
              Linee guida per l’esercizio fisico
            </Typography>
            <List dense disablePadding>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Controllare glicemia prima:" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1', fontWeight: 'bold' }}/></ListItem>
              <ListItem sx={{ py: 0.25, pl: 3 }}><ListItemText primary="< 80 mg/dl: rimandare o snack" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
              <ListItem sx={{ py: 0.25, pl: 3 }}><ListItemText primary="80–200 mg/dl: ok" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
              <ListItem sx={{ py: 0.25, pl: 3 }}><ListItemText primary="> 200 mg/dl: evitare intensa" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Se < 100 mg/dl: snack pre-esercizio" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 4. Piede Diabetico */}
      <TabPanel value={tab} index={4}>
        <Card elevation={1}>
          <CardContent sx={cardContentPaddingSx}>
            <Typography variant={isMobile ? 'h6' : 'h6'} fontSize={isMobile ? '1.1rem' : '1.25rem'} gutterBottom>
              🦶 Prevenzione del Piede Diabetico
            </Typography>

            {/* Controllo giornaliero */}
            <Typography variant='subtitle1' fontWeight='bold' fontSize={isMobile ? '0.9rem' : '1rem'} gutterBottom>
              Controllo giornaliero dei piedi
            </Typography>
            <List dense disablePadding sx={{ mb: isMobile ? 1 : 1.5 }}>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Ispezione quotidiana: tagli, vesciche, calli, ulcere, arrossamenti, gonfiori, infezioni, cambiamenti di colore o temperatura" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Usa uno specchio per controllare la pianta del piede" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
            </List>

            {/* Cura dei piedi */}
            <Typography variant='subtitle1' fontWeight='bold' fontSize={isMobile ? '0.9rem' : '1rem'} gutterBottom>
              Cura dei piedi
            </Typography>
            <List dense disablePadding sx={{ mb: isMobile ? 1 : 1.5 }}>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Lavaggio quotidiano con sapone neutro; asciugare accuratamente tra le dita" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Crema idratante (non tra le dita)" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
            </List>

             {/* Taglio unghie e calzature */}
            <Typography variant='subtitle1' fontWeight='bold' fontSize={isMobile ? '0.9rem' : '1rem'} gutterBottom>
              Taglio unghie e calzature
            </Typography>
            <List dense disablePadding sx={{ mb: isMobile ? 1 : 1.5 }}>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Taglia le unghie seguendo forma naturale; evita limature aggressive" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Scarpe comode, ventilate, giuste; mai scalzi" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Controlla interno scarpe per oggetti" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
            </List>

            {/* Circolazione e sintomi */}
            <Typography variant='subtitle1' fontWeight='bold' fontSize={isMobile ? '0.9rem' : '1rem'} gutterBottom>
              Circolazione e sintomi
            </Typography>
            <List dense disablePadding sx={{ mb: isMobile ? 1 : 1.5 }}>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Camminata regolare e non fumare" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Cambia posizione di frequente" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Segnala dolore, formicolio, infezioni al medico" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
            </List>

            {/* Visite mediche */}
            <Typography variant='subtitle1' fontWeight='bold' fontSize={isMobile ? '0.9rem' : '1rem'} gutterBottom>
              Visite mediche regolari
            </Typography>
            <List dense disablePadding sx={{ mb: isMobile ? 1.5 : 2 }}>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Controllo annuale (o più spesso) da podologo" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Mantenere buona glicemia per prevenire danni" primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
            </List>

            {/* Quando contattare il medico */}
            <Typography variant={isMobile ? 'h6' : 'h6'} fontSize={isMobile ? '1.1rem' : '1.25rem'} gutterBottom>
              🏥 Quando contattare il medico?
            </Typography>
            <List dense disablePadding>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Noti tagli o ferite che non guariscono." primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Hai arrossamenti, gonfiore o dolore persistente." primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Avverti intorpidimento, formicolio o perdita di sensibilità ai piedi." primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Le unghie dei piedi sono ingrossate o presentano segni di infezione." primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
              <ListItem sx={{ py: 0.25 }}><ListItemText primary="Vedi segni di infezione (pus, cattivo odore, calore) o pelle molto arrossata." primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}/></ListItem>
            </List>
            <Typography paragraph variant={isMobile ? 'body2' : 'body1'} sx={{ mt: isMobile ? 1.5 : 2, mb: 0 }}> {/* Margine sup. ridotto su mobile, rimosso inf. */}
              Ricorda! 🧠 Una corretta gestione della glicemia, l’adozione di abitudini quotidiane
              di cura dei piedi e il monitoraggio regolare sono fondamentali per prevenire le
              complicazioni ai piedi nel diabete. Prenditi cura dei tuoi piedi, ogni giorno! 👣
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 5. Tabella Insuline */}
      <TabPanel value={tab} index={5}>
        <Card elevation={1}>
          <CardContent sx={cardContentPaddingSx}>
            <Typography variant={isMobile ? 'h6' : 'h6'} fontSize={isMobile ? '1.1rem' : '1.25rem'} gutterBottom>
              💉 Tipi di Insulina e Conservazione
            </Typography>
            {/* TableContainer rende la tabella scorrevole orizzontalmente su mobile */}
            <TableContainer sx={{ overflowX: 'auto', '-webkit-overflow-scrolling': 'touch' }}>
              <Table size="small" aria-label="Tabella tipi di insulina">
                <TableHead>
                  <TableRow>
                    {/* Intestazioni con nowrap per evitare a capo, ma testo può restringersi */}
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Tipo di Insulina</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Esempi</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Durata dopo apertura</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Conservazione chiusa</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Conservazione dopo apertura</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { tipo: 'Rapida / Ultra-rapida', esempi: 'Humalog, Novorapid, Fiasp', durata: '28 giorni', chiusa: 'In frigo (2–8°C)', aperta: 'Ambiente max 25°C, riparo luce' },
                    { tipo: 'Lenta / Lunga durata', esempi: 'Lantus, Levemir, Tresiba', durata: 'Lantus: 28 gg; Levemir: 42 gg; Tresiba: 56 gg', chiusa: 'In frigo (2–8°C)', aperta: 'Stesse condizioni' },
                    { tipo: 'Intermedia (NPH)', esempi: 'Humulin N, Insulatard', durata: '28 giorni', chiusa: 'In frigo', aperta: 'Ambiente max 25°C' },
                    { tipo: 'Premiscelate (Mix)', esempi: 'Novomix 30, Humalog Mix', durata: '28 giorni', chiusa: 'In frigo', aperta: 'Ambiente max 25°C' }
                  ].map((row) => (
                    <TableRow key={row.tipo} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {/* Celle con font leggermente ridotto su mobile */}
                      <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>{row.tipo}</TableCell>
                      <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>{row.esempi}</TableCell>
                      <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>{row.durata}</TableCell>
                      <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>{row.chiusa}</TableCell>
                      <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>{row.aperta}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default EducazioneDiabete;