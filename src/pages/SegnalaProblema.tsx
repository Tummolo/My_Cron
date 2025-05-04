// src/pages/SegnalaProblema.tsx
import React, { FC, useState } from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

const SegnalaProblema: FC = () => {
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const theme = useTheme()
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))

  const handleSubmit = () => {
    window.location.href =
      `mailto:anaadam@outlook.it?subject=${encodeURIComponent(
        'Segnalazione Problema'
      )}&body=${encodeURIComponent(message)}`
    setSent(true)
  }

  const handleClose = () => {
    window.history.back()
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: isSm ? 2 : 3,
        backgroundColor: 'background.paper'
      }}
    >
      <Paper
        elevation={6}
        sx={{
          position: 'relative',
          width: '100%',
          borderRadius: 2,
          p: isSm ? 2 : 4
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
          size="large"
        >
          <CloseIcon />
        </IconButton>

        <Stack spacing={3}>
          <Typography variant={isSm ? 'h6' : 'h5'} align="center">
            Segnala un Problema
          </Typography>

          {sent && (
            <Alert severity="success" onClose={() => setSent(false)}>
              Pronto per inviare l’email!
            </Alert>
          )}

          <TextField
            label="Descrivi il problema"
            placeholder="Inserisci i dettagli qui..."
            multiline
            minRows={isSm ? 4 : 6}
            fullWidth
            value={message}
            onChange={e => setMessage(e.target.value)}
          />

          <Box textAlign="center" pt={1}>
            <Button
              variant="contained"
              size={isSm ? 'medium' : 'large'}
              onClick={handleSubmit}
              disabled={!message.trim()}
            >
              Invia Email
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  )
}

export default SegnalaProblema
