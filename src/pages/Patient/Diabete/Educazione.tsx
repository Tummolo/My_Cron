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
  TableContainer
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import PieChartIcon from '@mui/icons-material/PieChart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HealingIcon from '@mui/icons-material/Healing';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import WarningIcon from '@mui/icons-material/Warning';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import TabletIcon from '@mui/icons-material/Tablet';

import 'chart.js/auto';
import { Pie } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';

// Import immagine panoramica
import usImage from '../../../img/us.jpeg';

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
  const isMobile = useMediaQuery('(max-width:600px)');

  const pieData = {
    labels: [
      'Alimentazione equilibrata',
      'Attività fisica regolare',
      'Terapia farmacologica'
    ],
    datasets: [{
      data: [33, 33, 34],
      backgroundColor: ['#90caf9', '#f48fb1', '#a5d6a7'],
      hoverOffset: 4
    }]
  };
  const pieOptions: ChartOptions<'pie'> = {
    plugins: {
      legend: {
        position: (isMobile ? 'bottom' : 'right') as 'bottom' | 'right'
      }
    },
    maintainAspectRatio: false
  };

  const cardContentPaddingSx = { p: isMobile ? 1.5 : 2 };
  const sectionMarginSx = { mt: isMobile ? 1.5 : 2 };

  return (
    <Box px={isMobile ? 1 : 3} py={isMobile ? 1 : 2}>
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        align="center"
        gutterBottom
        sx={{ mb: isMobile ? 2 : 3 }}
      >
        📖 Conosci e gestisci il tuo diabete di tipo 2
      </Typography>

      <Tabs
        value={tab}
        onChange={handleChange}
        variant={isMobile ? 'scrollable' : 'fullWidth'}
        scrollButtons="auto"
        aria-label="Sezioni educazione diabete"
        sx={{
          mb: isMobile ? 2 : 3,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            minWidth: isMobile ? 70 : 'auto',
            fontSize: isMobile ? '0.75rem' : '0.875rem'
          },
          '& .MuiTabs-indicator': { height: 3, borderRadius: 1.5 }
        }}
      >
        <Tab icon={<InfoIcon />}          label="Panoramica"   {...a11yProps(0)} />
        <Tab icon={<PieChartIcon />}      label="Descrizione"  {...a11yProps(1)} />
        <Tab icon={<RestaurantIcon />}    label="Dieta"        {...a11yProps(2)} />
        <Tab icon={<HealingIcon />}       label="Piede"        {...a11yProps(3)} />
        <Tab icon={<BloodtypeIcon />}     label="DestroStick"  {...a11yProps(4)} />
        <Tab icon={<WarningIcon />}       label="Complicanze"  {...a11yProps(5)} />
        <Tab icon={<LocalPharmacyIcon />} label="Insulina"     {...a11yProps(6)} />
        <Tab icon={<TabletIcon />}        label="Ipoglicemizzanti" {...a11yProps(7)} />
      </Tabs>

      {/* 0. Panoramica */}
      <TabPanel value={tab} index={0}>
        <Card elevation={1}>
          <CardContent sx={cardContentPaddingSx}>
            <Typography paragraph variant={isMobile ? 'body2' : 'body1'} sx={{ mb: 0 }}>
              “Conoscere il proprio diabete è il primo passo per vivere meglio ogni giorno.
              Questa guida ti aiuterà a capire cosa succede nel tuo corpo, cosa puoi fare per
              stare meglio e come usare correttamente i farmaci. Piccoli cambiamenti quotidiani
              portano a grandi cambiamenti nel futuro. Sei il protagonista della tua salute!”
            </Typography>
            {/* Immagine centrata sotto testo */}
            <Box display="flex" justifyContent="center" mt={2}>
              <Box
                component="img"
                src={usImage}
                alt="Illustrazione Diabete"
                sx={{
                  width: isMobile ? '100%' : '50%',
                  height: 'auto',
                  maxWidth: 300
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 1. Descrizione */}
      <TabPanel value={tab} index={1}>
        <Card elevation={1}>
          <CardContent sx={cardContentPaddingSx}>
            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={isMobile ? 2 : 3}>
              <Box flex={1} sx={{ order: isMobile ? 2 : 1 }}>
                <List dense disablePadding>
                  <ListItem sx={{ pt: 0, pb: 0.5 }}>
                    <ListItemText
                      primary="1. Cos'è il Diabete Mellito di Tipo 2?"
                      primaryTypographyProps={{ variant:'h6', fontSize:isMobile?'1.1rem':'1.25rem' }}
                    />
                  </ListItem>
                  {[
                    'Il diabete mellito di tipo 2 è una malattia metabolica cronica caratterizzata da elevati livelli di glucosio nel sangue (iperglicemia).',
                    "L’insulina è un ormone prodotto dal pancreas che consente al glucosio di entrare nelle cellule per essere utilizzato come fonte di energia.",
                    "Nel diabete di tipo 2, l’insulina non agisce in modo efficace (insulino-resistenza) e/o viene prodotta in quantità insufficiente.",
                    "Il glucosio, quindi, rimane nel sangue invece di entrare nelle cellule."
                  ].map(text => (
                    <ListItem key={text} sx={{ py: 0.25 }}>
                      <ListItemText primary={text} primaryTypographyProps={{ variant:isMobile?'body2':'body1' }}/>
                    </ListItem>
                  ))}
                </List>

                <List dense disablePadding sx={sectionMarginSx}>
                  <ListItem sx={{ pt: 0, pb: 0.5 }}>
                    <ListItemText
                      primary="Fattori di rischio"
                      primaryTypographyProps={{ variant:'h6', fontSize:isMobile?'1.1rem':'1.25rem' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.25 }}>
                    <ListItemText primary="Modificabili: Sovrappeso/obesità, Alimentazione sbilanciata, Sedentarietà" primaryTypographyProps={{ variant:isMobile?'body2':'body1' }}/>
                  </ListItem>
                  <ListItem sx={{ py: 0.25 }}>
                    <ListItemText primary="Non modificabili: Età, Familiarità, Etnia" primaryTypographyProps={{ variant:isMobile?'body2':'body1' }}/>
                  </ListItem>
                </List>

                <Box sx={sectionMarginSx}>
                  <Typography variant='h6' fontSize={isMobile?'1.1rem':'1.25rem'}>
                    Range glicemico a digiuno raccomandato
                  </Typography>
                  <Typography variant={isMobile?'body2':'body1'}>
                    80–110 mg/dl
                  </Typography>
                </Box>

                <List dense disablePadding sx={sectionMarginSx}>
                  <ListItem sx={{ pt: 0, pb: 0.5 }}>
                    <ListItemText
                      primary="I tre pilastri della gestione del diabete"
                      primaryTypographyProps={{ variant:'h6', fontSize:isMobile?'1.1rem':'1.25rem' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.25 }}>
                    <ListItemText primary="1. Alimentazione equilibrata" primaryTypographyProps={{ variant:isMobile?'body2':'body1' }}/>
                  </ListItem>
                  <ListItem sx={{ py: 0.25 }}>
                    <ListItemText primary="2. Attività fisica regolare" primaryTypographyProps={{ variant:isMobile?'body2':'body1' }}/>
                  </ListItem>
                  <ListItem sx={{ py: 0.25 }}>
                    <ListItemText primary="3. Terapia farmacologica (se prescritta)" primaryTypographyProps={{ variant:isMobile?'body2':'body1' }}/>
                  </ListItem>
                </List>
              </Box>

              <Box
                flex="0 0 auto"
                width="100%"
                maxWidth={isMobile?'100%':'40%'}
                sx={{ height:isMobile?220:300, order:isMobile?1:2 }}
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

      {/* 2. Dieta (Dieta + Attività) */}
      <TabPanel value={tab} index={2}>
        {/* Dieta */}
        <Card elevation={1}>
          <CardContent sx={cardContentPaddingSx}>
            <List dense disablePadding>
              <ListItem sx={{ pt: 0, pb: 0.5 }}>
                <ListItemText
                  primary="🥗 Trattamento non farmacologico – Dieta"
                  primaryTypographyProps={{ variant:'h6', fontSize:isMobile?'1.1rem':'1.25rem' }}
                />
              </ListItem>
            </List>
            <List dense disablePadding sx={{ mb: isMobile?1:1.5 }}>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemText primary="Scopo della dieta:" primaryTypographyProps={{ variant:isMobile?'body2':'body1', fontWeight:'bold' }}/>
              </ListItem>
              {[
                'Mantenere il peso forma',
                "Limitare l’uso di farmaci",
                "Migliorare lo stato di salute generale",
                "Mantenere i valori glicemici nel range",
                "Prevenire complicanze cardiovascolari, renali, oculari e neurologiche"
              ].map(txt => (
                <ListItem key={txt} sx={{ py:0.25, pl:3 }}>
                  <ListItemText primary={`• ${txt}`} primaryTypographyProps={{ variant:isMobile?'body2':'body1' }}/>
                </ListItem>
              ))}
            </List>
            <List dense disablePadding sx={{ mb: isMobile?1:1.5 }}>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemText
                  primary="Indice Glicemico (IG)"
                  primaryTypographyProps={{ variant:'subtitle1', fontWeight:'bold', fontSize:isMobile?'0.9rem':'1rem' }}
                />
              </ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="L’indice glicemico indica la velocità con cui un alimento contenente carboidrati aumenta la glicemia." primaryTypographyProps={{ variant:isMobile?'body2':'body1' }}/></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="IG > 100: da evitare" primaryTypographyProps={{ variant:isMobile?'body2':'body1' }}/></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Basso IG (legumi, cereali integrali): sazietà prolungata" primaryTypographyProps={{ variant:isMobile?'body2':'body1' }}/></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Alto IG (zuccheri semplici): fame precoce" primaryTypographyProps={{ variant:isMobile?'body2':'body1' }}/></ListItem>
            </List>
            <Typography variant='h6' fontSize={isMobile?'1.1rem':'1.25rem'} sx={{ mb: isMobile?0.5:1 }}>
              Ripartizione nutrizionale consigliata
            </Typography>
            <List dense disablePadding>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="🍷 Ridurre o evitare l’assunzione di alcol" primaryTypographyProps={{ variant:isMobile?'body2':'body1' }}/></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="🍞 Carboidrati: 50–60%" secondary="Pane integrale/segale, pasta integrale, riso integrale, patate (piccole dosi), legumi, frutta con buccia, verdure" primaryTypographyProps={{ variant:isMobile?'body2':'body1', fontWeight:'bold' }} secondaryTypographyProps={{ variant:isMobile?'caption':'body2' }}/></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="🥩 Proteine: ~20%" secondary="Carne magra, pesce azzurro, uova (2–3 settimanali), legumi, formaggi magri, yogurt magro" primaryTypographyProps={{ variant:isMobile?'body2':'body1', fontWeight:'bold' }} secondaryTypographyProps={{ variant:isMobile?'caption':'body2' }}/></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="🫒 Grassi: 20–30%" secondary="Olio EVO a crudo (max 2 cucchiai), frutta secca (una manciata), pesce azzurro" primaryTypographyProps={{ variant:isMobile?'body2':'body1', fontWeight:'bold' }} secondaryTypographyProps={{ variant:isMobile?'caption':'body2' }}/></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="🥦 Fibre: 25–30 g/die" secondary="Verdure a ogni pasto, pane/pasta integrali, 2–3 frutti con buccia, legumi 2–3 volte/settimana" primaryTypographyProps={{ variant:isMobile?'body2':'body1', fontWeight:'bold' }} secondaryTypographyProps={{ variant:isMobile?'caption':'body2' }}/></ListItem>
            </List>
            <Box sx={sectionMarginSx}>
              <Typography variant='h6' fontSize={isMobile?'1.1rem':'1.25rem'} sx={{ mb: isMobile?0.5:1 }}>
                Frequenza pasti
              </Typography>
              <List dense disablePadding>
                {[
                  'Colazione: 7:30',
                  'Spuntino: 10:30',
                  'Pranzo: 13:30',
                  'Spuntino: 16:30',
                  'Cena: 19:30',
                  'Spuntino: 22:30'
                ].map(t => (
                  <ListItem key={t} sx={{ py:0.25 }}>
                    <ListItemText primary={t} primaryTypographyProps={{ variant:isMobile?'body2':'body1' }}/>
                  </ListItem>
                ))}
              </List>
            </Box>
          </CardContent>
        </Card>
        {/* Attività */}
        <Card elevation={1} sx={{ mt: sectionMarginSx.mt }}>
          <CardContent sx={cardContentPaddingSx}>
            <Typography variant={isMobile?'h6':'h6'} fontSize={isMobile?'1.1rem':'1.25rem'} gutterBottom>
              🏃‍♀️ Trattamento non farmacologico – Attività fisica
            </Typography>
            <List dense disablePadding sx={{ mb: isMobile?1:1.5 }}>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Almeno 30 minuti al giorno (camminata, bici, nuoto)" primaryTypographyProps={{ variant:isMobile?'body2':'body1' }}/></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Riduce glicemia e aumenta sensibilità all’insulina" primaryTypographyProps={{ variant:isMobile?'body2':'body1' }}/></ListItem>
            </List>
            <Typography variant='subtitle1' fontWeight='bold' fontSize={isMobile?'0.9rem':'1rem'} gutterBottom>
              Linee guida per l’esercizio fisico
            </Typography>
            <List dense disablePadding>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Controllare glicemia prima:" primaryTypographyProps={{ variant:isMobile?'body2':'body1', fontWeight:'bold' }}/></ListItem>
              <ListItem sx={{ py:0.25, pl:3 }}><ListItemText primary="< 80 mg/dl: rimandare o snack" /></ListItem>
              <ListItem sx={{ py:0.25, pl:3 }}><ListItemText primary="80–200 mg/dl: ok" /></ListItem>
              <ListItem sx={{ py:0.25, pl:3 }}><ListItemText primary="> 200 mg/dl: evitare intensa" /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Se < 100 mg/dl: snack pre-esercizio" /></ListItem>
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 3. Piede */}
      <TabPanel value={tab} index={3}>
        <Card elevation={1}>
          <CardContent sx={cardContentPaddingSx}>
            <Typography variant={isMobile?'h6':'h6'} fontSize={isMobile?'1.1rem':'1.25rem'} gutterBottom>
              🦶 Prevenzione del Piede Diabetico
            </Typography>
            <Typography variant='subtitle1' fontWeight='bold'>Controllo giornaliero dei piedi</Typography>
            <List dense disablePadding sx={{ mb: isMobile?1:1.5 }}>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Ispezione quotidiana: tagli, vesciche, calli, ulcere, arrossamenti, gonfiori, infezioni, cambiamenti di colore o temperatura" /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Usa uno specchio per controllare la pianta del piede" /></ListItem>
            </List>
            <Typography variant='subtitle1' fontWeight='bold'>Cura dei piedi</Typography>
            <List dense disablePadding sx={{ mb: isMobile?1:1.5 }}>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Lavaggio quotidiano con sapone neutro; asciugare accuratamente tra le dita" /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Crema idratante (non tra le dita)" /></ListItem>
            </List>
            <Typography variant='subtitle1' fontWeight='bold'>Taglio unghie e calzature</Typography>
            <List dense disablePadding sx={{ mb: isMobile?1:1.5 }}>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Taglia le unghie seguendo forma naturale; evita limature aggressive" /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Scarpe comode, ventilate, giuste; mai scalzi" /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Controlla interno scarpe per oggetti" /></ListItem>
            </List>
            <Typography variant='subtitle1' fontWeight='bold'>Circolazione e sintomi</Typography>
            <List dense disablePadding sx={{ mb: isMobile?1:1.5 }}>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Camminata regolare e non fumare" /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Cambia posizione di frequente" /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Segnala dolore, formicolio, infezioni al medico" /></ListItem>
            </List>
            <Typography variant='subtitle1' fontWeight='bold'>Visite mediche regolari</Typography>
            <List dense disablePadding sx={{ mb: isMobile?1.5:2 }}>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Controllo annuale (o più spesso) da podologo" /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Mantenere buona glicemia per prevenire danni" /></ListItem>
            </List>
            <Typography paragraph variant={isMobile?'body2':'body1'} sx={{ mt: isMobile?1.5:2, mb:0 }}>
              Ricorda! 🧠 Una corretta gestione della glicemia, l’adozione di abitudini quotidiane
              di cura dei piedi e il monitoraggio regolare sono fondamentali per prevenire le
              complicazioni ai piedi nel diabete. Prenditi cura dei tuoi piedi, ogni giorno! 👣
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 4. DestroStick (DestroStick + Misurazione) */}
      <TabPanel value={tab} index={4}>
        <Card elevation={1}>
          <CardContent sx={cardContentPaddingSx}>
            <Typography variant='h6' gutterBottom>✅ DestroStick</Typography>
            <Typography paragraph>Come misurare la glicemia con il DestroStick</Typography>
            <List dense disablePadding>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="1. Lavare accuratamente le mani con acqua tiepida e sapone neutro." /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="2. Utilizzare il pungidito sul lato del polpastrello, non al centro (più doloroso)." /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="3. Scartare la prima goccia di sangue, poiché potrebbe essere contaminata e fornire un risultato falsato." /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="4. Raccogliere la seconda goccia sul sensore del glucometro." /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="5. Annotare il valore ottenuto nel diario glicemico (cartaceo o digitale)." /></ListItem>
            </List>
          </CardContent>
        </Card>
        <Card elevation={1} sx={{ mt: sectionMarginSx.mt }}>
          <CardContent sx={cardContentPaddingSx}>
            <Typography variant='h6' gutterBottom>⏰ Quando misurare la glicemia durante il giorno?</Typography>
            <Typography paragraph>La frequenza dipende dal tipo di terapia, ma in generale si consiglia di misurare:</Typography>
            <Typography variant="subtitle1" fontWeight="bold">Se in terapia insulinica:</Typography>
            <List dense disablePadding sx={{ pl:3 }}>
              {[
                'Appena svegli (a digiuno)',
                'Prima dei pasti principali (colazione, pranzo, cena)',
                '2 ore dopo i pasti principali (per valutare il picco postprandiale)',
                'Prima di coricarsi',
                'Se si avvertono sintomi di ipoglicemia o iperglicemia'
              ].map(item => (
                <ListItem key={item} sx={{ py:0.25 }}><ListItemText primary={item} /></ListItem>
              ))}
            </List>
            <Typography paragraph>📝 Totale: fino a 6–7 volte al giorno, se indicato dal medico</Typography>
            <Typography variant="subtitle1" fontWeight="bold">Se NON in terapia insulinica:</Typography>
            <List dense disablePadding sx={{ pl:3 }}>
              {[
                'A digiuno (mattino)',
                '2 ore dopo un pasto principale (es. pranzo o cena), a giorni alterni',
                'In caso di sintomi strani (stanchezza improvvisa, sudorazione, vista offuscata)'
              ].map(item => (
                <ListItem key={item} sx={{ py:0.25 }}><ListItemText primary={item} /></ListItem>
              ))}
            </List>
            <Typography paragraph>🕒 In generale: anche 1–2 volte al giorno, o come indicato dal diabetologo</Typography>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 5. Complicanze */}
      <TabPanel value={tab} index={5}>
        <Card elevation={1}>
          <CardContent sx={cardContentPaddingSx}>
            <Typography variant='h6' gutterBottom>🔍 Complicanze del diabete non controllato</Typography>
            <Typography paragraph>Se la glicemia resta alta per lunghi periodi, può danneggiare organi e vasi sanguigni.</Typography>
            <Typography variant="subtitle1" fontWeight="bold">Complicanze microvascolari:</Typography>
            <List dense disablePadding sx={{ pl:3 }}>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Retinopatia diabetica – problemi alla vista o cecità" /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Nefropatia diabetica – può portare a insufficienza renale" /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Neuropatia diabetica – formicolii, perdita di sensibilità, dolore" /></ListItem>
            </List>
            <Typography variant="subtitle1" fontWeight="bold">Complicanze macrovascolari:</Typography>
            <List dense disablePadding sx={{ pl:3 }}>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Infarto del miocardio – rischio aumentato" /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Ictus cerebrale" /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Arteriopatia periferica – ulcere e amputazioni" /></ListItem>
            </List>
            <Typography paragraph>📌 Controllare bene il diabete aiuta a prevenire queste complicanze.</Typography>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 6. Insulina (Tipi, Somministrazione, Tabella) */}
      <TabPanel value={tab} index={6}>
        <Card elevation={1}>
          <CardContent sx={cardContentPaddingSx}>
            <Typography variant='h6' gutterBottom>💉 Tipi di insulina, somministrazione e conservazione</Typography>
            <List dense disablePadding>
              <ListItem sx={{ py:0.25 }}>
                <ListItemText
                  primary="1. Insuline ad azione rapida o ultrarapida"
                  secondary="Esempio: Humalog, Novorapid; Somministrazione subito prima dei pasti; Inizio effetto: 15–20 min; Picco: ~2 h; Durata: 3–5 ore"
                  secondaryTypographyProps={{ component:'span' }}
                />
              </ListItem>
              <ListItem sx={{ py:0.25 }}>
                <ListItemText
                  primary="2. Insuline ad azione intermedia o lunga"
                  secondary="Esempio: Lantus, Levemir, Tresiba; Somministrazione 1–2 volte/die; Durata fino a 36 ore"
                  secondaryTypographyProps={{ component:'span' }}
                />
              </ListItem>
              <ListItem sx={{ py:0.25 }}>
                <ListItemText
                  primary="3. Insuline premiscelate"
                  secondary="Miscela rapida + intermedia; Utile per semplificare la terapia"
                  secondaryTypographyProps={{ component:'span' }}
                />
              </ListItem>
            </List>
            <Typography variant="subtitle1" fontWeight="bold" sx={sectionMarginSx}>📦 Conservazione delle penne di insulina</Typography>
            <List dense disablePadding sx={{ pl:3 }}>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Penne chiuse: frigorifero (2–8°C). Prima dell'uso, portare a temperatura ambiente per 30 min." /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Penne aperte: conservare a max 25°C, lontano da calore e luce diretta; togliere dal frigo 30 min prima dell’uso." /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Mai somministrare insulina fredda: rischio lipodistrofie." /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Segnare la data di apertura; verificare foglietto illustrativo per scadenze." /></ListItem>
            </List>
          </CardContent>
        </Card>
        <Card elevation={1} sx={{ mt: sectionMarginSx.mt }}>
          <CardContent sx={cardContentPaddingSx}>
            <Typography variant='h6' gutterBottom>📍 Somministrazione sottocutanea</Typography>
            <Typography variant="subtitle1" fontWeight="bold">Zone raccomandate:</Typography>
            <List dense disablePadding sx={{ pl:3 }}>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Addome (periombelicale)" /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Deltoide (braccio superiore)" /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Coscia (anteriore o laterale)" /></ListItem>
            </List>
            <Typography variant="subtitle1" fontWeight="bold" sx={sectionMarginSx}>Rotazione dei siti:</Typography>
            <List dense disablePadding sx={{ pl:3 }}>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Sempre stessa zona alla stessa ora (es. addome a colazione)." /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Mai iniettare sempre nello stesso punto preciso per evitare lipodistrofia." /></ListItem>
            </List>
            <Typography paragraph>✅ Regola d’oro: Stessa ora – stessa zona – stessa tecnica.</Typography>
          </CardContent>
        </Card>
        <Card elevation={1} sx={{ mt: sectionMarginSx.mt }}>
          <CardContent sx={cardContentPaddingSx}>
            <Typography variant='h6' gutterBottom>💉 Tipi di Insulina e Conservazione</Typography>
            <TableContainer sx={{ overflowX:'auto', '-webkit-overflow-scrolling':'touch' }}>
              <Table size="small" aria-label="Tabella tipi di insulina">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ whiteSpace:'nowrap', fontWeight:'bold' }}>Tipo di Insulina</TableCell>
                    <TableCell sx={{ whiteSpace:'nowrap', fontWeight:'bold' }}>Esempi</TableCell>
                    <TableCell sx={{ whiteSpace:'nowrap', fontWeight:'bold' }}>Durata dopo apertura</TableCell>
                    <TableCell sx={{ whiteSpace:'nowrap', fontWeight:'bold' }}>Conservazione chiusa</TableCell>
                    <TableCell sx={{ whiteSpace:'nowrap', fontWeight:'bold' }}>Conservazione dopo apertura</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { tipo:'Rapida / Ultra-rapida', esempi:'Humalog, Novorapid, Fiasp', durata:'28 giorni', chiusa:'In frigo (2–8°C)', aperta:'Ambiente max 25°C, riparo luce' },
                    { tipo:'Lenta / Lunga durata', esempi:'Lantus, Levemir, Tresiba', durata:'Lantus: 28 gg; Levemir: 42 gg; Tresiba: 56 gg', chiusa:'In frigo (2–8°C)', aperta:'Stesse condizioni' },
                    { tipo:'Intermedia (NPH)', esempi:'Humulin N, Insulatard', durata:'28 giorni', chiusa:'In frigo', aperta:'Ambiente max 25°C' },
                    { tipo:'Premiscelate (Mix)', esempi:'Novomix 30, Humalog Mix', durata:'28 giorni', chiusa:'In frigo', aperta:'Ambiente max 25°C' }
                  ].map(row => (
                    <TableRow key={row.tipo} sx={{ '&:last-child td, &:last-child th': { border:0 } }}>
                      <TableCell sx={{ fontSize:isMobile?'0.75rem':'0.875rem' }}>{row.tipo}</TableCell>
                      <TableCell sx={{ fontSize:isMobile?'0.75rem':'0.875rem' }}>{row.esempi}</TableCell>
                      <TableCell sx={{ fontSize:isMobile?'0.75rem':'0.875rem' }}>{row.durata}</TableCell>
                      <TableCell sx={{ fontSize:isMobile?'0.75rem':'0.875rem' }}>{row.chiusa}</TableCell>
                      <TableCell sx={{ fontSize:isMobile?'0.75rem':'0.875rem' }}>{row.aperta}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 7. Ipoglicemizzanti Orali */}
      <TabPanel value={tab} index={7}>
        <Card elevation={1}>
          <CardContent sx={cardContentPaddingSx}>
            <Typography variant='h6' gutterBottom>💊 Ipoglicemizzanti Orali: Metformina</Typography>
            <Typography paragraph>La metformina è uno dei farmaci più comunemente prescritti per il diabete di tipo 2.</Typography>
            <Typography variant="subtitle1" fontWeight="bold">Meccanismo d'azione:</Typography>
            <List dense disablePadding sx={{ pl:3 }}>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Riduce la produzione di glucosio da parte del fegato." /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Aumenta l’utilizzo del glucosio da parte dei muscoli." /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Può favorire un calo ponderale." /></ListItem>
            </List>
            <Typography variant="subtitle1" fontWeight="bold" sx={sectionMarginSx}>Dosaggio:</Typography>
            <List dense disablePadding sx={{ pl:3 }}>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Dose massima: 2 g/die, suddivisa in più somministrazioni." /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Si assume prima dei pasti per stimolare l’azione dell’insulina." /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Mai assumere dopo il pasto." /></ListItem>
            </List>
            <Typography variant="subtitle1" fontWeight="bold" sx={sectionMarginSx}>Effetti collaterali:</Typography>
            <List dense disablePadding sx={{ pl:3 }}>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Comuni: diarrea, nausea, gonfiore addominale." /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Rari: acidosi lattica in caso di insufficienza renale." /></ListItem>
              <ListItem sx={{ py:0.25 }}><ListItemText primary="Può interferire con l’assorbimento della vitamina B12." /></ListItem>
            </List>
          </CardContent>
        </Card>
      </TabPanel>

    </Box>
  );
};

export default EducazioneDiabete;
