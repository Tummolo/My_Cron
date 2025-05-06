// src/pages/Admin/GestionePazienti.tsx
import React, { FC, useEffect, useState } from 'react'
import {
  Typography,
  Box,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Tabs,
  Tab
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

interface Patient {
  id: number
  username: string
  nome: string
  cognome: string
  dob: string
  place_of_birth: string
  sex: 'M' | 'F'
  malattia: 'Diabete' | 'Scompenso Cardiaco'
  codice_fiscale: string
  status: 'pending' | 'active' | 'inactive'
}

type FormState = {
  nome: string
  cognome: string
  dob: string
  place: string
  sesso: '' | 'M' | 'F'
  email: string
  status: 'pending' | 'active' | 'inactive'
  malattia: '' | 'Diabete' | 'Scompenso Cardiaco'
  cfManual?: string
}

const GestionePazienti: FC = () => {
  // lista pazienti
  const [list, setList] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)

  // dialog crea/modifica
  const [open, setOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [manualCF, setManualCF] = useState(false)

  // form interno
  const [form, setForm] = useState<FormState>({
    nome: '',
    cognome: '',
    dob: '',
    place: '',
    sesso: '',
    email: '',
    status: 'pending',
    malattia: '',
    cfManual: ''
  })

  // toast
  const [snack, setSnack] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'success'
  })

  // dettaglio / tabs
  const [detailOpen, setDetailOpen] = useState(false)
  const [tabIndex, setTabIndex] = useState(0)
  const [diaryEntries, setDiaryEntries] = useState<any[]>([])
  const [therapyEntries, setTherapyEntries] = useState<any[]>([])
  const [diaryLoading, setDiaryLoading] = useState(false)
  const [therapyLoading, setTherapyLoading] = useState(false)

  // helper per capitalizzare
  const capFirst = (s: string) =>
    s
      .toLowerCase()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

  // formatta ISO → DD/MM/YYYY
  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('it-IT')
  }

  // fetch lista
  const fetchList = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/patients/list.php')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw = await res.json()
      setList(raw.map((p: any) => ({ ...p, id: p.user_id })))
    } catch (e: any) {
      setSnack({ open: true, message: `Errore: ${e.message}`, severity: 'error' })
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchList()
  }, [])

  // form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(f => ({
      ...f,
      [name]: ['nome', 'cognome', 'place'].includes(name) ? capFirst(value) : value
    }))
  }
  const handleSelect = (e: any) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  // nuovo paziente
  const handleNew = () => {
    setIsEdit(false)
    setEditId(null)
    setManualCF(false)
    setForm({
      nome: '',
      cognome: '',
      dob: '',
      place: '',
      sesso: '',
      email: '',
      status: 'pending',
      malattia: '',
      cfManual: ''
    })
    setOpen(true)
  }

  // modifica paziente
  const handleEdit = (p: Patient) => {
    setIsEdit(true)
    setEditId(p.id)
    setManualCF(false)
    setForm({
      nome: p.nome,
      cognome: p.cognome,
      dob: p.dob,
      place: p.place_of_birth,
      sesso: p.sex,
      email: '',
      status: p.status,
      malattia: p.malattia,
      cfManual: ''
    })
    setOpen(true)
  }

  // salva creazione / modifica
  const handleSave = async () => {
    const url = isEdit ? '/api/patients/update.php' : '/api/patients/create.php'
    const payload: any = { ...form }
    if (isEdit && editId != null) {
      payload.id = editId
      delete payload.email
    }
    if (!manualCF) delete payload.cfManual

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await res.json().catch(() => {
        throw new Error('Risposta non JSON')
      })
      if (!res.ok) throw new Error(json.error || 'Errore interno')

      setOpen(false)
      setSnack({
        open: true,
        message: isEdit
          ? 'Paziente aggiornato'
          : `Invito inviato a ${form.nome} ${form.cognome}`,
        severity: 'success'
      })
      await fetchList()
    } catch (err: any) {
      setSnack({ open: true, message: err.message, severity: 'error' })
    }
  }

  // disattiva paziente
  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (!confirm('Disattivare questo paziente?')) return
    try {
      const res = await fetch('/api/patients/delete.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Errore')
      setSnack({ open: true, message: 'Paziente disattivato', severity: 'success' })
      fetchList()
    } catch (err: any) {
      setSnack({ open: true, message: err.message, severity: 'error' })
    }
  }

  // apre dettaglio e carica diario + terapia
  const handleRowClick = (id: number) => {
    setDetailOpen(true)
    setTabIndex(0)

    setDiaryLoading(true)
    fetch(`/api/patients/diario/read.php?user_id=${id}`)
      .then(r => r.json())
      .then(data => setDiaryEntries(data))
      .catch(e =>
        setSnack({ open: true, message: `Errore diario: ${e.message}`, severity: 'error' })
      )
      .finally(() => setDiaryLoading(false))

    setTherapyLoading(true)
    fetch(`/api/patients/terapia/read.php?user_id=${id}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) setTherapyEntries(json.data)
        else throw new Error(json.message || 'Errore terapia')
      })
      .catch(e =>
        setSnack({ open: true, message: `Errore terapia: ${e.message}`, severity: 'error' })
      )
      .finally(() => setTherapyLoading(false))
  }

  return (
    <Box>
      {/* header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Gestione Pazienti</Typography>
        <Button variant="contained" onClick={handleNew}>
          Nuovo Paziente
        </Button>
      </Box>

      {/* tabella */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : list.length === 0 ? (
        <Typography align="center" color="text.secondary">
          Nessun paziente da mostrare.
        </Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              {['Nome', 'Cognome', 'DOB', 'Luogo', 'Sesso', 'Malattia', 'CF', 'Status', 'Azioni'].map(
                col => (
                  <TableCell key={col} sx={{ fontWeight: 'bold' }}>
                    {col}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map(p => (
              <TableRow
                key={p.id}
                sx={{ cursor: 'pointer' }}
                onClick={() => handleRowClick(p.id)}
              >
                <TableCell>{p.nome}</TableCell>
                <TableCell>{p.cognome}</TableCell>
                <TableCell>{p.dob}</TableCell>
                <TableCell>{p.place_of_birth}</TableCell>
                <TableCell>{p.sex}</TableCell>
                <TableCell>{p.malattia}</TableCell>
                <TableCell>{p.codice_fiscale}</TableCell>
                <TableCell>
                  <Chip
                    label={p.status}
                    size="small"
                    color={
                      p.status === 'active'
                        ? 'success'
                        : p.status === 'pending'
                        ? 'warning'
                        : 'error'
                    }
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Modifica">
                    <IconButton
                      size="small"
                      onClick={e => {
                        e.stopPropagation()
                        handleEdit(p)
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Disattiva">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={e => handleDelete(e, p.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* dialog crea/modifica */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{isEdit ? 'Modifica Paziente' : 'Nuovo Paziente'}</DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 2 }}>
          <TextField
            label="Nome"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Cognome"
            name="cognome"
            value={form.cognome}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Data di Nascita"
            name="dob"
            type="date"
            value={form.dob}
            onChange={handleChange}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Luogo di Nascita"
            name="place"
            value={form.place}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="sesso-label">Sesso</InputLabel>
            <Select
              labelId="sesso-label"
              label="Sesso"
              name="sesso"
              value={form.sesso}
              onChange={handleSelect}
            >
              <MenuItem value="" disabled>
                – Seleziona –  
              </MenuItem>
              <MenuItem value="M">Maschio</MenuItem>
              <MenuItem value="F">Femmina</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel id="malattia-label">Malattia</InputLabel>
            <Select
              labelId="malattia-label"
              label="Malattia"
              name="malattia"
              value={form.malattia}
              onChange={handleSelect}
            >
              <MenuItem value="" disabled>
                – Seleziona –  
              </MenuItem>
              <MenuItem value="Diabete">Diabete</MenuItem>
              <MenuItem value="Scompenso Cardiaco">Scompenso Cardiaco</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={<Switch checked={manualCF} onChange={e => setManualCF(e.target.checked)} />}
            label="Inserisci CF manuale"
            sx={{ mt: 1, mb: 1 }}
          />
          {manualCF && (
            <TextField
              label="Codice Fiscale"
              name="cfManual"
              value={form.cfManual}
              onChange={e =>
                setForm(f => ({
                  ...f,
                  cfManual: e.target.value.toUpperCase()
                }))
              }
              fullWidth
              margin="dense"
            />
          )}
          {!isEdit ? (
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              margin="dense"
            />
          ) : (
            <FormControl fullWidth margin="dense">
              <InputLabel id="status-label">Stato</InputLabel>
              <Select
                labelId="status-label"
                label="Stato"
                name="status"
                value={form.status}
                onChange={handleSelect}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Annulla</Button>
          <Button variant="contained" onClick={handleSave}>
            {isEdit ? 'Salva Modifiche' : 'Salva & Invia Invito'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* dialog dettaglio con tabs */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>Dettagli Paziente</DialogTitle>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}>
          <Tab label="Diario" />
          <Tab label="Terapia" />
        </Tabs>
        <DialogContent sx={{ pt: 1 }}>
          {tabIndex === 0 ? (
            diaryLoading ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {[
                      'Data',
                      'Glicemia Pre',
                      'Glicemia Post',
                      'Chetoni',
                      'Peso',
                      'Pressione',
                      'Attività',
                      'Alimentazione',
                      'Note'
                    ].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {diaryEntries.map(e => (
                    <TableRow key={e.id}>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {formatDate(e.entry_date)}
                      </TableCell>
                      <TableCell>{e.glicemia_pre}</TableCell>
                      <TableCell>{e.glicemia_post}</TableCell>
                      <TableCell>{e.chetoni_checked ? 'Sì' : 'No'}</TableCell>
                      <TableCell>{e.peso}</TableCell>
                      <TableCell>
                        {e.pressione_sistolica}/{e.pressione_diastolica}
                      </TableCell>
                      <TableCell>{e.attivita}</TableCell>
                      <TableCell>{e.alimentazione}</TableCell>
                      <TableCell>{e.note}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          ) : therapyLoading ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Data', 'Tipologia', 'Farmaco', 'Dosaggio', 'Orario', 'Modalità', 'Note'].map(
                    h => (
                      <TableCell key={h} sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        {h}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {therapyEntries.map(t => (
                  <TableRow key={t.id}>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {formatDate(t.created_at)}
                    </TableCell>
                    <TableCell>{t.drug_type}</TableCell>
                    <TableCell>{t.drug_name}</TableCell>
                    <TableCell>{t.dosage}</TableCell>
                    <TableCell>{t.schedule}</TableCell>
                    <TableCell>{t.mode}</TableCell>
                    <TableCell>{t.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>

      {/* snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default GestionePazienti
