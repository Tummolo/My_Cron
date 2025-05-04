// src/pages/Patient/Home.tsx
import React, { FC, useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Typography,
  Grid,
  Container,
  Card,
  CardActionArea,
  CardContent,
  useTheme,
  useMediaQuery,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  Button,
  Alert,
  Stack
} from '@mui/material'
import {
  Book,
  Warning,
  Build,
  ShowChart,
  MedicalServices,
  Chat,
  Feedback as FeedbackIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { useChat } from '../../contexts/ChatContext'
import { useAuth } from '../../contexts/AuthContext'

const sections = [
  { icon: <Book fontSize="inherit" />,            title: 'Conosci la tua Malattia', path: '/educazione' },
  { icon: <Warning fontSize="inherit" />,         title: 'Segnali di Allarme',      path: '/segnali' },
  { icon: <Build fontSize="inherit" />,           title: 'Gestione Acutizzazioni',  path: '/acutizzazioni' },
  { icon: <ShowChart fontSize="inherit" />,       title: 'Diario della Salute',     path: '/diario' },
  { icon: <MedicalServices fontSize="inherit" />, title: 'La Mia Terapia',          path: '/terapia' },
  { icon: <Chat fontSize="inherit" />,            title: 'Parla con un Infermiere', path: '/chat' }
]

const Home: FC = () => {
  const { hasUnreadUser, markUserRead } = useChat()
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()

  const [openModal, setOpenModal] = useState(false)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleOpen = () => setOpenModal(true)
  const handleClose = () => setOpenModal(false)
  const handleSubmit = () => {
    window.location.href =
      `mailto:anaadam@outlook.it?subject=${encodeURIComponent(
        'Segnalazione Problema'
      )}&body=${encodeURIComponent(message)}`
    setSent(true)
  }

  return (
    <Container maxWidth="md" sx={{ pt: isXs ? 2 : 4, pb: 4 }}>
      <Typography variant={isXs ? 'h5' : 'h4'} align="center" gutterBottom>
        Dashboard Paziente
      </Typography>

      <Grid container spacing={isXs ? 2 : 4} justifyContent="center">
        {sections.map((s, i) => {
          const isChatSection = s.path === '/chat'
          const iconWrapper = (
            <Badge
              color="error"
              variant="dot"
              invisible={!hasUnreadUser}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {s.icon}
            </Badge>
          )
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Card sx={{ borderRadius: 2, height: '100%' }} elevation={1}>
                <CardActionArea
                  component={RouterLink}
                  to={s.path}
                  onClick={isChatSection ? markUserRead : undefined}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: isXs ? 3 : 5,
                    px: 2,
                    height: '100%',
                    transition: 'transform .2s',
                    '&:hover': { transform: 'translateY(-3px)' },
                  }}
                >
                  <Box
                    sx={{
                      width: isXs ? 56 : 72,
                      height: isXs ? 56 : 72,
                      mb: isXs ? 1.5 : 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isXs ? 36 : 48,
                      color: 'primary.main',
                    }}
                  >
                    {isChatSection ? iconWrapper : s.icon}
                  </Box>
                  <CardContent sx={{ p: 0, textAlign: 'center' }}>
                    <Typography variant={isXs ? 'subtitle1' : 'h6'}>
                      {s.title}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )
        })}

        {/* Segnala popup */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card sx={{ borderRadius: 2, height: '100%' }} elevation={1}>
            <CardActionArea
              onClick={handleOpen}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: isXs ? 3 : 5,
                px: 2,
                height: '100%',
                transition: 'transform .2s',
                '&:hover': { transform: 'translateY(-3px)' },
              }}
            >
              <Box
                sx={{
                  width: isXs ? 56 : 72,
                  height: isXs ? 56 : 72,
                  mb: isXs ? 1.5 : 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isXs ? 36 : 48,
                  color: 'primary.main',
                }}
              >
                {/* Match fontSize with other icons */}
                <FeedbackIcon fontSize="inherit" />
              </Box>
              <CardContent sx={{ p: 0, textAlign: 'center' }}>
                <Typography variant={isXs ? 'subtitle1' : 'h6'}>
                  Segnala un Problema
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog Segnala Problema */}
      <Dialog open={openModal} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Segnala un Problema
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 1 }}>
            <Stack spacing={2}>
              {sent && (
                <Alert severity="success" onClose={() => setSent(false)}>
                  Pronto per inviare l’email!
                </Alert>
              )}
              <TextField
                label="Descrivi il problema"
                placeholder="Inserisci i dettagli qui..."
                multiline
                minRows={isXs ? 4 : 6}
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Box textAlign="center" pt={1}>
                <Button
                  variant="contained"
                  size={isXs ? 'medium' : 'large'}
                  onClick={handleSubmit}
                  disabled={!message.trim()}
                >
                  Invia Email
                </Button>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  )
}

export default Home
