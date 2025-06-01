// src/pages/Patient/Diario.tsx
import React, { FC, useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoIcon from '@mui/icons-material/Info'
import { useAuth } from '../../../contexts/AuthContext'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
)

interface Entry {
  id: number
  entry_date: string
  glicemia_pre: number | null
  glicemia_post: number | null
  chetoni_checked: boolean
  peso: number | null
  pressione_sistolica: number | null
  pressione_diastolica: number | null
  attivita: string | null
  alimentazione: string | null
  note: string | null
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box pt={2}>{children}</Box>}
  </div>
)

const Diario: FC = () => {
  const { user } = useAuth()
  const user_id = user!.id

  // Stato principale
  const [tab, setTab] = useState(0)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)

  // Dialog New/Edit
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<Partial<Entry>>({
    entry_date: '',
    glicemia_pre: null,
    glicemia_post: null,
    chetoni_checked: false,
    peso: null,
    pressione_sistolica: null,
    pressione_diastolica: null,
    attivita: '',
    alimentazione: '',
    note: ''
  })

  // Dialog Info
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)
  const [infoEntry, setInfoEntry] = useState<Entry | null>(null)

  // Snackbar
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })

  // Grafici
  const [chartType, setChartType] = useState<'glicemia' | 'pressione' | 'peso'>('glicemia')
  const apiBase = 'https://ios2020.altervista.org/api/patients/diario'

  // —––––– READ
  const fetchEntries = async (): Promise<void> => {
    setLoading(true)
    try {
      const res = await fetch(`${apiBase}/read.php?user_id=${user_id}`)
      const data = await res.json()
      setEntries(Array.isArray(data) ? data : [])
    } catch {
      setSnack({ open: true, message: 'Errore caricamento', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchEntries()
  }, [])

  // Handlers generali
  const handleTab = (_: any, v: number) => setTab(v)
  const handleChange = (field: keyof Entry, v: any) => {
    setForm(f => ({ ...f, [field]: v }))
  }
  const closeSnack = () => setSnack(s => ({ ...s, open: false }))

  // Validazione data
  const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(form.entry_date || '')

  // —––––– CREATE / UPDATE
  const openNew = () => {
    setIsEdit(false)
    setEditId(null)
    setForm({
      entry_date: '',
      glicemia_pre: null,
      glicemia_post: null,
      chetoni_checked: false,
      peso: null,
      pressione_sistolica: null,
      pressione_diastolica: null,
      attivita: '',
      alimentazione: '',
      note: ''
    })
    setDialogOpen(true)
  }
  const openEdit = (e: Entry) => {
    setIsEdit(true)
    setEditId(e.id)
    setForm(e)
    setDialogOpen(true)
  }
  const handleSave = async () => {
    if (!form.entry_date || !isDateValid) {
      setSnack({ open: true, message: 'Data non valida', severity: 'error' })
      return
    }
    const url = isEdit ? `${apiBase}/update.php` : `${apiBase}/create.php`
    const payload = { ...form, user_id, id: editId }
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await res.json()
      if (json.success) {
        setSnack({ open: true, message: isEdit ? 'Voce aggiornata' : 'Voce creata', severity: 'success' })
        setDialogOpen(false)
        fetchEntries()
      } else throw new Error()
    } catch {
      setSnack({ open: true, message: 'Errore salvataggio', severity: 'error' })
    }
  }

  // —––––– DELETE
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${apiBase}/delete.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, user_id })
      })
      const json = await res.json()
      if (json.success) {
        setSnack({ open: true, message: 'Voce cancellata', severity: 'success' })
        fetchEntries()
      } else throw new Error()
    } catch {
      setSnack({ open: true, message: 'Errore cancellazione', severity: 'error' })
    }
  }

  // —––––– INFO
  const openInfo = (e: Entry) => {
    setInfoEntry(e)
    setInfoDialogOpen(true)
  }
  const closeInfo = () => setInfoDialogOpen(false)

  // —––––– Data ordinate
  // Ascendente (vecchio→recente) per i grafici
  const sortedAsc = [...entries].sort((a, b) => a.entry_date.localeCompare(b.entry_date))
  // Discendente (recente→vecchio) per la tabella Storico
  const sortedDesc = [...entries].sort((a, b) => b.entry_date.localeCompare(a.entry_date))

  // —––––– Chart Data (usando sortedAsc)
  const labels = sortedAsc.map(e => e.entry_date)
  const glicemiaData = {
    labels,
    datasets: [
      { label: 'Pre', data: sortedAsc.map(e => e.glicemia_pre || 0), borderColor: 'blue', fill: false },
      { label: 'Post', data: sortedAsc.map(e => e.glicemia_post || 0), borderColor: 'red', fill: false }
    ]
  }
  const pressureData = {
    labels,
    datasets: [
      { label: 'Sistolica', data: sortedAsc.map(e => e.pressione_sistolica || 0), borderColor: 'blue', fill: false },
      { label: 'Diastolica', data: sortedAsc.map(e => e.pressione_diastolica || 0), borderColor: 'red', fill: false }
    ]
  }
  const weightData = {
    labels,
    datasets: [{ label: 'Peso (kg)', data: sortedAsc.map(e => e.peso || 0), borderColor: 'green', fill: false }]
  }
  const chartOpts = { responsive: true as const, plugins: { legend: { position: 'bottom' as const } } }

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        📊 Diario della Salute
      </Typography>
      <Tabs value={tab} onChange={handleTab} variant="fullWidth">
        <Tab label="Inserimento" />
        <Tab label="Storico" />
        <Tab label="Visualizzazioni" />
      </Tabs>

      {/* Inserimento */}
      <TabPanel value={tab} index={0}>
        <Button variant="contained" onClick={openNew} sx={{ mb: 2 }}>
          Nuova Voce
        </Button>
        <Typography color="text.secondary">
          {loading ? 'Caricamento…' : 'Clicca “Nuova Voce” per inserire i dati.'}
        </Typography>
      </TabPanel>

      {/* Storico con InfoPopup */}
      <TabPanel value={tab} index={1}>
        {loading ? (
          <CircularProgress />
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Pre / Post</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Chetoni</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Peso</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Pressione</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedDesc.map(e => (
                <TableRow key={e.id}>
                  <TableCell>
                    <IconButton size="small" onClick={() => openInfo(e)}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                  <TableCell>{e.entry_date}</TableCell>
                  <TableCell>
                    {e.glicemia_pre || '-'} / {e.glicemia_post || '-'}
                  </TableCell>
                  <TableCell>{e.chetoni_checked ? '✔️' : '—'}</TableCell>
                  <TableCell>{e.peso || '-'}</TableCell>
                  <TableCell>
                    {e.pressione_sistolica || '-'} / {e.pressione_diastolica || '-'}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => openEdit(e)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(e.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TabPanel>

      {/* Visualizzazioni */}
      <TabPanel value={tab} index={2}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="chart-select-label">Grafico</InputLabel>
          <Select
            labelId="chart-select-label"
            label="Grafico"
            value={chartType}
            onChange={e => setChartType(e.target.value as any)}
          >
            <MenuItem value="glicemia">Glicemia</MenuItem>
            <MenuItem value="pressione">Pressione</MenuItem>
            <MenuItem value="peso">Peso</MenuItem>
          </Select>
        </FormControl>
        {chartType === 'glicemia' && (
          <Box>
            <Typography variant="h6">Glicemia (Pre/Post)</Typography>
            <Line data={glicemiaData} options={chartOpts} />
          </Box>
        )}
        {chartType === 'pressione' && (
          <Box>
            <Typography variant="h6">Pressione (Sistolica/Diastolica)</Typography>
            <Line data={pressureData} options={chartOpts} />
          </Box>
        )}
        {chartType === 'peso' && (
          <Box>
            <Typography variant="h6">Peso</Typography>
            <Line data={weightData} options={chartOpts} />
          </Box>
        )}
      </TabPanel>

      {/* Dialog Creazione/Modifica */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{isEdit ? 'Modifica Voce' : 'Nuova Voce'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Data"
            type="date"
            fullWidth
            margin="dense"
            value={form.entry_date}
            onChange={e => handleChange('entry_date', e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ pattern: '\\d{4}-\\d{2}-\\d{2}' }}
            error={!!form.entry_date && !isDateValid}
            helperText={!!form.entry_date && !isDateValid ? 'Formato AAAA-MM-GG' : ' '}
          />
          <TextField
            label="Glicemia Pre"
            type="number"
            fullWidth
            margin="dense"
            value={form.glicemia_pre || ''}
            onChange={e => handleChange('glicemia_pre', +e.target.value)}
          />
          <TextField
            label="Glicemia Post"
            type="number"
            fullWidth
            margin="dense"
            value={form.glicemia_post || ''}
            onChange={e => handleChange('glicemia_post', +e.target.value)}
          />
          {form.glicemia_post! > 250 && (
            <Box sx={{ mb: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.chetoni_checked || false}
                    onChange={e => handleChange('chetoni_checked', e.target.checked)}
                  />
                }
                label="Hai controllato i chetoni?"
              />
              <Typography variant="caption" color="text.secondary">
                Valori alti di chetoni possono indicare rischio di chetoacidosi.
              </Typography>
            </Box>
          )}
          <TextField
            label="Peso (kg)"
            type="number"
            fullWidth
            margin="dense"
            value={form.peso || ''}
            onChange={e => handleChange('peso', +e.target.value)}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="Pressione Sist."
              type="number"
              fullWidth
              margin="dense"
              value={form.pressione_sistolica || ''}
              onChange={e => handleChange('pressione_sistolica', +e.target.value)}
            />
            <TextField
              label="Pressione Diast."
              type="number"
              fullWidth
              margin="dense"
              value={form.pressione_diastolica || ''}
              onChange={e => handleChange('pressione_diastolica', +e.target.value)}
            />
          </Box>
          <TextField
            label="Attività"
            fullWidth
            margin="dense"
            value={form.attivita || ''}
            onChange={e => handleChange('attivita', e.target.value)}
          />
          <TextField
            label="Alimentazione"
            fullWidth
            multiline
            rows={2}
            margin="dense"
            value={form.alimentazione || ''}
            onChange={e => handleChange('alimentazione', e.target.value)}
          />
          <TextField
            label="Note"
            fullWidth
            multiline
            rows={2}
            margin="dense"
            value={form.note || ''}
            onChange={e => handleChange('note', e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annulla</Button>
          <Button variant="contained" onClick={handleSave}>
            {isEdit ? 'Salva' : 'Crea'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Info detagliata */}
      <Dialog open={infoDialogOpen} onClose={closeInfo} fullWidth maxWidth="sm">
        <DialogTitle>Dettagli Voce del {infoEntry?.entry_date}</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 1 }}>
            Attività
          </Typography>
          <Typography>{infoEntry?.attivita || '–'}</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
            Alimentazione
          </Typography>
          <Typography>{infoEntry?.alimentazione || '–'}</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
            Note
          </Typography>
          <Typography>{infoEntry?.note || '–'}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeInfo}>Chiudi</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnack} severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Diario
