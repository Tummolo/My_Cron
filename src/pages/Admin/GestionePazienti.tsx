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
  TextField,
  DialogActions,
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
  Switch
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
  const [list, setList] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [manualCF, setManualCF] = useState(false)

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

  const [snack, setSnack] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'success'
  })

  // carica pazienti
  const fetchList = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/patients/list.php')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Patient[] = await res.json()
      setList(data)
    } catch (e: any) {
      setSnack({ open: true, message: `Errore: ${e.message}`, severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const capitalizeFirstLetter = (str: string) =>
    str
      .toLowerCase()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let val = value
    if (['nome','cognome','place'].includes(name)) {
      val = capitalizeFirstLetter(value)
    }
    setForm(f => ({ ...f, [name]: val }))
  }
  const handleSelect = (e: any) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

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

  const handleSave = async () => {
    const url = isEdit ? '/api/patients/update.php' : '/api/patients/create.php'
    const payload: any = { ...form }
    if (!manualCF) delete payload.cfManual

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Errore interno')

      setOpen(false)
      setSnack({
        open: true,
        message: isEdit
          ? 'Paziente aggiornato con successo'
          : `Email inviata a ${form.nome} ${form.cognome}`,
        severity: 'success'
      })
      await fetchList()
    } catch (err: any) {
      setSnack({ open: true, message: err.message || 'Errore durante il salvataggio', severity: 'error' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Sei sicuro di voler disattivare questo paziente?')) return
    try {
      const res = await fetch('/api/patients/delete.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Errore interno')
      setSnack({ open: true, message: 'Paziente disattivato', severity: 'success' })
      await fetchList()
    } catch (err: any) {
      setSnack({ open: true, message: err.message || 'Errore durante l\'eliminazione', severity: 'error' })
    }
  }

  return (
    <Box>
      {/* header + bottone */}
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
        <Typography variant="h5">Gestione Pazienti</Typography>
        <Button variant="contained" onClick={handleNew}>Nuovo Paziente</Button>
      </Box>

      {/* loader o tabella */}
      {loading ? (
        <Box sx={{ display:'flex', justifyContent:'center', py:4 }}>
          <CircularProgress/>
        </Box>
      ) : list.length === 0 ? (
        <Typography sx={{ my:4, textAlign:'center' }} color="text.secondary">
          Nessun paziente da mostrare.
        </Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              {['Nome','Cognome','DOB','Luogo','Sesso','Malattia','CF','Status','Azioni'].map(h=>(
                <TableCell key={h} sx={{ fontWeight:'bold' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map(p=>(
              <TableRow key={p.id}>
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
                    color={p.status==='active'?'success':p.status==='inactive'?'default':'warning'}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Modifica">
                    <IconButton size="small" onClick={()=>handleEdit(p)}>
                      <EditIcon fontSize="small"/>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Disattiva">
                    <IconButton size="small" onClick={()=>handleDelete(p.id)}>
                      <DeleteIcon fontSize="small"/>
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* dialog di creazione/modifica */}
      <Dialog open={open} onClose={()=>setOpen(false)}>
        <DialogTitle>{isEdit ? 'Modifica Paziente' : 'Nuovo Paziente'}</DialogTitle>
        <DialogContent sx={{ pt:1, pb:2 }}>
          <TextField label="Nome" name="nome" value={form.nome} onChange={handleChange} fullWidth margin="dense"/>
          <TextField label="Cognome" name="cognome" value={form.cognome} onChange={handleChange} fullWidth margin="dense"/>
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

          <TextField label="Luogo di Nascita" name="place" value={form.place} onChange={handleChange} fullWidth margin="dense"/>

          <FormControl fullWidth margin="dense">
            <InputLabel id="sesso-label">Sesso</InputLabel>
            <Select
              labelId="sesso-label"
              label="Sesso"
              name="sesso"
              value={form.sesso}
              onChange={handleSelect}
            >
              <MenuItem value="" disabled>– Seleziona –</MenuItem>
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
              <MenuItem value="" disabled>– Seleziona –</MenuItem>
              <MenuItem value="Diabete">Diabete</MenuItem>
              <MenuItem value="Scompenso Cardiaco">Scompenso Cardiaco</MenuItem>
            </Select>
          </FormControl>

          {/* toggle per inserimento manuale CF */}
          <FormControlLabel
            control={
              <Switch checked={manualCF} onChange={e => setManualCF(e.target.checked)} />
            }
            label="Inserisci CF manuale"
            sx={{ mt:1, mb:1 }}
          />

          {manualCF && (
            <TextField
              label="Codice Fiscale"
              name="cfManual"
              value={form.cfManual}
              onChange={e => setForm(f=>({...f, cfManual: e.target.value.toUpperCase()}))}
              fullWidth
              margin="dense"
            />
          )}

          {!isEdit && (
            <TextField label="Email" name="email" type="email"
              value={form.email} onChange={handleChange}
              fullWidth margin="dense"/>
          )}
          {isEdit && (
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
        <DialogActions sx={{ px:2, pb:2 }}>
          <Button onClick={()=>setOpen(false)}>Annulla</Button>
          <Button variant="contained" onClick={handleSave}>
            {isEdit ? 'Salva Modifiche' : 'Salva & Invia Invito'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={()=>setSnack(s=>({...s,open:false}))}
        anchorOrigin={{ vertical:'bottom', horizontal:'center' }}
      >
        <Alert severity={snack.severity} onClose={()=>setSnack(s=>({...s,open:false}))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default GestionePazienti
