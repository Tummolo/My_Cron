// src/pages/Impostazioni/Impostazioni.tsx

import React, { FC, useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Grid,
  Paper,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const Impostazioni: FC = () => {
  // Stato per tema chiaro/scuro
  const [darkMode, setDarkMode] = useState(false);

  // Stato per notifiche
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Stati per cambio password
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  // Handler per il cambio password
  const handleChangePassword = () => {
    setPwdError(null);
    setPwdSuccess(null);

    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdError('Compila tutti i campi.');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError('La nuova password e la conferma non corrispondono.');
      return;
    }
    // Qui chiameresti l’API per cambiare la password...
    // fetch('/api/user/change-password', { method: 'POST', ... })
    //   .then(...)
    //   .catch(...)
    //   .finally(...)
    setPwdSuccess('Password aggiornata con successo.');
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
  };

  // Handler per esportazione dati
  const handleExportData = () => {
    // Esempio di callback per scaricare un file
    // fetch('/api/user/export-data')
    //   .then(res => res.blob())
    //   .then(blob => {
    //     const url = window.URL.createObjectURL(blob);
    //     const link = document.createElement('a');
    //     link.href = url;
    //     link.setAttribute('download', 'dati_pazienti.csv');
    //     document.body.appendChild(link);
    //     link.click();
    //     link.remove();
    //   });
    console.log('Esporta dati (simulato)');
  };

  return (
    <Box p={{ xs: 1, sm: 2, md: 4 }}>
      <Typography variant="h5" gutterBottom>
        Impostazioni
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Aspetto
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
          }
          label="Tema scuro"
        />
        <Typography variant="body2" color="textSecondary">
          {darkMode
            ? 'Il tema scuro è abilitato. Cambia stile interfaccia.'
            : 'Il tema chiaro è abilitato.'}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Notifiche
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
            />
          }
          label="Abilita notifiche"
        />
        <Typography variant="body2" color="textSecondary">
          {notificationsEnabled
            ? 'Riceverai notifiche sulle nuove attività.'
            : 'Le notifiche sono disattivate.'}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Cambia Password
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              type="password"
              label="Password corrente"
              fullWidth
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} />
          <Grid item xs={12} sm={6}>
            <TextField
              type="password"
              label="Nuova password"
              fullWidth
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="password"
              label="Conferma nuova password"
              fullWidth
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
            />
          </Grid>
          {pwdError && (
            <Grid item xs={12}>
              <Typography color="error">{pwdError}</Typography>
            </Grid>
          )}
          {pwdSuccess && (
            <Grid item xs={12}>
              <Typography color="success.main">{pwdSuccess}</Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleChangePassword}>
              Salva nuova password
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Esporta dati
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Scarica un archivio CSV dei dati attuali.
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportData}
        >
          Esporta CSV
        </Button>
      </Paper>
    </Box>
  );
};

export default Impostazioni;
