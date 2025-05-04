// src/pages/Patient/TerapiaDiabete.tsx
import React, { FC, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../../contexts/AuthContext';

const ORAL_DRUGS = [
  'Metformina','Sulfaniluree','Repaglinide','Acarbosio','Pioglitazone',
  'Empagliflozin','Dapagliflozin','Canagliflozin','Ertugliflozin',
  'Sitagliptin','Saxagliptin','Linagliptin','Alogliptin','Glitazoni'
];
const SUBQ_DRUGS = [
  'Humalog','Novorapid','Fiasp','Lantus','Levemir','Tresiba',
  'Humulin N','Insulatard','Novomix 30','Humalog Mix'
];

interface Entry {
  id: number;
  drug_type: 'orale' | 'sottocute';
  drug_name: string;
  dosage: string;
  schedule: string;
  mode?: string;
  notes?: string;
}

const TerapiaDiabete: FC = () => {
  const { user } = useAuth();
  const user_id = user!.id;
  const api = '/api/patients/terapia';

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [form, setForm] = useState<Partial<Entry>>({
    drug_type: undefined,
    drug_name: '',
    dosage: '',
    schedule: '',
    mode: '',
    notes: ''
  });
  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // READ
  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api}/read.php?user_id=${user_id}`);
      const json = await res.json();
      if (json.success) setEntries(json.data);
      else throw new Error(json.message || 'Errore caricamento');
    } catch (e: any) {
      setEntries([]);
      setSnack({ open: true, message: e.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchList(); }, [user_id]);

  // New / Edit
  const handleNew = () => {
    setEditing(null);
    setForm({
      drug_type: undefined,
      drug_name: '',
      dosage: '',
      schedule: '',
      mode: '',
      notes: ''
    });
    setOpen(true);
  };
  const handleEdit = (e: Entry) => {
    setEditing(e);
    setForm({ ...e });
    setOpen(true);
  };
  const handleSave = async () => {
    if (!form.drug_type || !form.drug_name || !form.dosage || !form.schedule) {
      setSnack({ open: true, message: 'Compila tutti i campi obbligatori', severity: 'error' });
      return;
    }
    const url = editing ? `${api}/update.php` : `${api}/create.php`;
    const payload = { ...form, user_id, id: editing?.id };
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setSnack({ open: true, message: 'Salvataggio avvenuto', severity: 'success' });
        setOpen(false);
        fetchList();
      } else {
        throw new Error(json.message || 'Errore salvataggio');
      }
    } catch (e: any) {
      setSnack({ open: true, message: e.message, severity: 'error' });
    }
  };

  // DELETE
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${api}/delete.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, user_id })
      });
      const json = await res.json();
      if (json.success) {
        setSnack({ open: true, message: 'Cancellazione avvenuta', severity: 'success' });
        fetchList();
      } else {
        throw new Error(json.message || 'Errore cancellazione');
      }
    } catch (e: any) {
      setSnack({ open: true, message: e.message, severity: 'error' });
    }
  };

  const drugOptions = form.drug_type === 'orale' ? ORAL_DRUGS : SUBQ_DRUGS;

  // Responsive padding
  const wrapperSx = { p: { xs: 1, sm: 2, md: 3 } };

  return (
    <Box sx={wrapperSx}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
        💊 La Mia Terapia
      </Typography>

      <Button
        variant="contained"
        onClick={handleNew}
        fullWidth={isMobile}
        sx={{ mb: 2 }}
      >
        Nuovo Farmaco
      </Button>

      {loading ? (
        <Box textAlign="center"><CircularProgress /></Box>
      ) : entries.length === 0 ? (
        <Typography color="text.secondary">Nessuna terapia inserita.</Typography>
      ) : isMobile ? (
        <Stack spacing={2}>
          {entries.map(e => (
            <Card key={e.id} elevation={1}>
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {e.drug_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {e.drug_type.toUpperCase()}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleEdit(e)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(e.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Dosaggio: {e.dosage}
                </Typography>
                <Typography variant="body2">
                  Orari: {e.schedule}
                </Typography>
                {e.mode && (
                  <Typography variant="body2">
                    Modalità: {e.mode}
                  </Typography>
                )}
                {e.notes && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Note: {e.notes}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Farmaco</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Dosaggio</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Orari</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Modalità</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Note</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map(e => (
                <TableRow key={e.id}>
                  <TableCell>{e.drug_type}</TableCell>
                  <TableCell>{e.drug_name}</TableCell>
                  <TableCell>{e.dosage}</TableCell>
                  <TableCell>{e.schedule}</TableCell>
                  <TableCell>{e.mode}</TableCell>
                  <TableCell>{e.notes}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(e)}>
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
        </Box>
      )}

      {/* Dialog New/Edit */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
      >
        <DialogTitle>{editing ? 'Modifica Terapia' : 'Nuova Terapia'}</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth margin="dense">
            <InputLabel id="type-label">Tipo farmaco*</InputLabel>
            <Select
              labelId="type-label"
              value={form.drug_type || ''}
              label="Tipo farmaco*"
              onChange={e =>
                setForm(f => ({
                  ...f,
                  drug_type: e.target.value as 'orale' | 'sottocute',
                  drug_name: ''
                }))
              }
            >
              <MenuItem value="orale">Orale</MenuItem>
              <MenuItem value="sottocute">Sottocute</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel id="drug-label">Farmaco*</InputLabel>
            <Select
              labelId="drug-label"
              value={form.drug_name || ''}
              label="Farmaco*"
              disabled={!form.drug_type}
              onChange={e => setForm(f => ({ ...f, drug_name: e.target.value }))}
            >
              {(form.drug_type === 'orale' ? ORAL_DRUGS : SUBQ_DRUGS).map(d => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Dosaggio*" fullWidth margin="dense"
            value={form.dosage || ''}
            onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))}
          />
          <TextField
            label="Orari di assunzione*" fullWidth margin="dense"
            value={form.schedule || ''}
            onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))}
          />
          <TextField
            label="Modalità" fullWidth margin="dense"
            value={form.mode || ''}
            onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}
          />
          <TextField
            label="Note" fullWidth margin="dense" multiline rows={3}
            value={form.notes || ''}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annulla</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={
              !form.drug_type ||
              !form.drug_name ||
              !form.dosage ||
              !form.schedule
            }
          >
            {editing ? 'Salva' : 'Crea'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TerapiaDiabete;
