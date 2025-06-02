// src/pages/Admin/GestionePazienti.tsx

import React, { FC, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
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
  Tab,
  InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

interface Patient {
  id: number;
  username: string;
  nome: string;
  cognome: string;
  dob: string;
  place_of_birth: string;
  sex: 'M' | 'F';
  malattia: 'Diabete' | 'Scompenso Cardiaco';
  codice_fiscale: string;
  status: 'pending' | 'active' | 'inactive';
}

type FormState = {
  nome: string;
  cognome: string;
  dob: string;
  place: string;
  sesso: '' | 'M' | 'F';
  email: string;
  status: 'pending' | 'active' | 'inactive';
  malattia: '' | 'Diabete' | 'Scompenso Cardiaco';
  cfManual?: string;
};

const GestionePazienti: FC = () => {
  // Lista pazienti
  const [list, setList] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  // Stato per la barra di ricerca (single)
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog crea/modifica
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [manualCF, setManualCF] = useState(false);

  // Stato interno del form
  const [form, setForm] = useState<FormState>({
    nome: '',
    cognome: '',
    dob: '',
    place: '',
    sesso: '',
    email: '',
    status: 'pending',
    malattia: '',
    cfManual: '',
  });

  // Snackbar (toast)
  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Dettaglio / Tabs
  const [detailOpen, setDetailOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [therapyEntries, setTherapyEntries] = useState<any[]>([]);
  const [diaryLoading, setDiaryLoading] = useState(false);
  const [therapyLoading, setTherapyLoading] = useState(false);

  // Helper: capitalizza prima lettera di ogni parola
  const capFirst = (s: string) =>
    s
      .toLowerCase()
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  // Helper: formatta ISO → DD/MM/YYYY
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('it-IT');
  };

  // Fetch dei pazienti
  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patients/list.php');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      setList(
        raw.map((p: any) => ({
          ...p,
          id: p.user_id,
        }))
      );
    } catch (e: any) {
      setSnack({ open: true, message: `Errore: ${e.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Lista filtrata in base a query unica (nome O cognome)
  const filteredList = list.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.nome.toLowerCase().includes(q) ||
      p.cognome.toLowerCase().includes(q)
    );
  });

  // Gestione campi form (input testuali)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: ['nome', 'cognome', 'place'].includes(name) ? capFirst(value) : value,
    }));
  };

  // Gestione campi form (select)
  const handleSelect = (e: any) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Nuovo paziente: resetta form e apre dialog
  const handleNew = () => {
    setIsEdit(false);
    setEditId(null);
    setManualCF(false);
    setForm({
      nome: '',
      cognome: '',
      dob: '',
      place: '',
      sesso: '',
      email: '',
      status: 'pending',
      malattia: '',
      cfManual: '',
    });
    setOpen(true);
  };

  // Modifica paziente: popola form e apre dialog
  const handleEdit = (p: Patient) => {
    setIsEdit(true);
    setEditId(p.id);
    setManualCF(false);
    setForm({
      nome: p.nome,
      cognome: p.cognome,
      dob: p.dob,
      place: p.place_of_birth,
      sesso: p.sex,
      email: '',
      status: p.status,
      malattia: p.malattia,
      cfManual: '',
    });
    setOpen(true);
  };

  // Salva (creazione o modifica)
  const handleSave = async () => {
    const url = isEdit ? '/api/patients/update.php' : '/api/patients/create.php';
    const payload: any = { ...form };
    if (isEdit && editId != null) {
      payload.id = editId;
      delete payload.email; // in modifica non serve l'email
    }
    if (!manualCF) delete payload.cfManual;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res
        .json()
        .catch(() => {
          throw new Error('Risposta non JSON');
        });
      if (!res.ok) throw new Error(json.error || 'Errore interno');

      setOpen(false);
      setSnack({
        open: true,
        message: isEdit
          ? 'Paziente aggiornato'
          : `Invito inviato a ${form.nome} ${form.cognome}`,
        severity: 'success',
      });
      await fetchList();
    } catch (err: any) {
      setSnack({ open: true, message: err.message, severity: 'error' });
    }
  };

  // Disattiva paziente
  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Disattivare questo paziente?')) return;
    try {
      const res = await fetch('/api/patients/delete.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Errore');
      setSnack({ open: true, message: 'Paziente disattivato', severity: 'success' });
      fetchList();
    } catch (err: any) {
      setSnack({ open: true, message: err.message, severity: 'error' });
    }
  };

  // Apri dettaglio e carica diario + terapia
  const handleRowClick = (id: number) => {
    setDetailOpen(true);
    setTabIndex(0);

    setDiaryLoading(true);
    fetch(`/api/patients/diario/read.php?user_id=${id}`)
      .then((r) => r.json())
      .then((data) => setDiaryEntries(data))
      .catch((e) =>
        setSnack({ open: true, message: `Errore diario: ${e.message}`, severity: 'error' })
      )
      .finally(() => setDiaryLoading(false));

    setTherapyLoading(true);
    fetch(`/api/patients/terapia/read.php?user_id=${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setTherapyEntries(json.data);
        else throw new Error(json.message || 'Errore terapia');
      })
      .catch((e) =>
        setSnack({ open: true, message: `Errore terapia: ${e.message}`, severity: 'error' })
      )
      .finally(() => setTherapyLoading(false));
  };

  return (
    <Box p={{ xs: 1, sm: 2, md: 4 }}>
      {/* Header con titolo, pulsante ricerca e pulsante Nuovo Paziente */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Gestione Pazienti</Typography>
        <Box display="flex" alignItems="center" gap={1}>
          {/* Se searchOpen è false: mostra solo l'icona di ricerca */}
          {!searchOpen ? (
            <Tooltip title="Cerca per nome o cognome">
              <IconButton onClick={() => setSearchOpen(true)} size="small">
                <SearchIcon />
              </IconButton>
            </Tooltip>
          ) : (
            // Se searchOpen è true: mostra il TextField singolo
            <TextField
              placeholder="Cerca nome o cognome…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchOpen(false);
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ width: 200 }}
            />
          )}

          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleNew}
          >
            Nuovo Paziente
          </Button>
        </Box>
      </Box>

      {/* Tabella di elenco pazienti (usa filteredList) */}
      {loading ? (
        <Box textAlign="center" py={4}>
          <CircularProgress />
        </Box>
      ) : filteredList.length === 0 ? (
        <Typography align="center" color="text.secondary">
          {searchOpen && searchQuery
            ? 'Nessun paziente corrisponde ai criteri di ricerca.'
            : 'Nessun paziente da mostrare.'}
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  'Nome',
                  'Cognome',
                  'Data di Nascita',
                  'Luogo di Nascita',
                  'Sesso',
                  'Malattia',
                  'Codice Fiscale',
                  'Status',
                  'Azioni',
                ].map((col) => (
                  <TableCell
                    key={col}
                    sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredList.map((p) => (
                <TableRow
                  key={p.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleRowClick(p.id)}
                >
                  <TableCell>{p.nome}</TableCell>
                  <TableCell>{p.cognome}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {formatDate(p.dob)}
                  </TableCell>
                  <TableCell>{p.place_of_birth}</TableCell>
                  <TableCell>
                    {p.sex === 'M' ? 'Maschio' : 'Femmina'}
                  </TableCell>
                  <TableCell>{p.malattia}</TableCell>
                  <TableCell>{p.codice_fiscale}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        p.status.charAt(0).toUpperCase() + p.status.slice(1)
                      }
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
                    <Box display="flex" gap={1}>
                      <Tooltip title="Modifica">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(p);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Disattiva">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => handleDelete(e, p.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog per creazione/modifica paziente */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEdit ? 'Modifica Paziente' : 'Nuovo Paziente'}
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Nome"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Cognome"
              name="cognome"
              value={form.cognome}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Data di Nascita"
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Luogo di Nascita"
              name="place"
              value={form.place}
              onChange={handleChange}
              fullWidth
            />

            <FormControl fullWidth>
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

            <FormControl fullWidth>
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
                <MenuItem value="Scompenso Cardiaco">
                  Scompenso Cardiaco
                </MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={manualCF}
                  onChange={(e) => setManualCF(e.target.checked)}
                />
              }
              label="Inserisci CF manuale"
            />
            {manualCF && (
              <TextField
                label="Codice Fiscale"
                name="cfManual"
                value={form.cfManual}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    cfManual: e.target.value.toUpperCase(),
                  }))
                }
                fullWidth
              />
            )}

            {isEdit ? (
              <FormControl fullWidth>
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
            ) : (
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpen(false)}>Annulla</Button>
          <Button variant="contained" onClick={handleSave}>
            {isEdit ? 'Salva Modifiche' : 'Salva & Invia Invito'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Dettaglio Paziente con Tabs */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        fullWidth
        maxWidth="xl"
      >
        <DialogTitle>Dettagli Paziente</DialogTitle>
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
        >
          <Tab label="Diario" />
          <Tab label="Terapia" />
        </Tabs>
        <DialogContent>
          {tabIndex === 0 ? (
            diaryLoading ? (
              <Box textAlign="center" py={4}>
                <CircularProgress />
              </Box>
            ) : diaryEntries.length === 0 ? (
              <Typography align="center" color="text.secondary" py={2}>
                Nessuna voce di diario.
              </Typography>
            ) : (
              <TableContainer component={Paper} elevation={1} sx={{ mt: 2 }}>
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
                        'Note',
                      ].map((h) => (
                        <TableCell
                          key={h}
                          sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {diaryEntries.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {formatDate(e.entry_date)}
                        </TableCell>
                        <TableCell>{e.glicemia_pre}</TableCell>
                        <TableCell>{e.glicemia_post}</TableCell>
                        <TableCell>
                          {e.chetoni_checked ? 'Sì' : 'No'}
                        </TableCell>
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
              </TableContainer>
            )
          ) : therapyLoading ? (
            <Box textAlign="center" py={4}>
              <CircularProgress />
            </Box>
          ) : therapyEntries.length === 0 ? (
            <Typography align="center" color="text.secondary" py={2}>
              Nessun piano terapeutico.
            </Typography>
          ) : (
            <TableContainer component={Paper} elevation={1} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {[
                      'Data',
                      'Tipologia',
                      'Farmaco',
                      'Dosaggio',
                      'Orario',
                      'Modalità',
                      'Note',
                    ].map((h) => (
                      <TableCell
                        key={h}
                        sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {therapyEntries.map((t) => (
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
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDetailOpen(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GestionePazienti;
