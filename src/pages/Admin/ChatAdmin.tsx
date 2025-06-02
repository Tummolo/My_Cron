// src/components/ChatAdmin.tsx

import React, { FC, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Badge,
  Paper,
  TextField,
  IconButton,
  Chip,
  Snackbar,
} from '@mui/material';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';

interface Msg {
  room: string;
  user: 'user' | 'admin';
  text: string;
  ts: number;
}
interface Patient {
  user_id: number;
  nome: string;
  cognome: string;
}

const API = import.meta.env.VITE_API_BASE as string;
const SOCKET_URL = import.meta.env.VITE_CHAT_SERVER_URL as string;

/**
 * Restituisce “HH:MM” se la data è oggi,
 * altrimenti “DD/MM/YYYY HH:MM”
 */
function formatTimestamp(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  const sameDay =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const timeOnly = d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  if (sameDay) {
    return timeOnly; // “23:05”
  } else {
    const datePart = d.toLocaleDateString(); // “02/06/2025”
    return `${datePart} ${timeOnly}`;
  }
}

const ChatAdmin: FC = () => {
  const { user } = useAuth();
  const { markAdminRead } = useChat();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [sel, setSel] = useState<Patient | null>(null);
  const [unread, setUnread] = useState<Record<string, boolean>>({});
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [notifications, setNotifications] = useState<
    { id: number; text: string; open: boolean }[]
  >([]);
  const endRef = useRef<HTMLDivElement>(null);

  const socketRef = useRef<Socket | null>(null);
  const selRef = useRef<Patient | null>(sel);
  const patientsRef = useRef<Patient[]>(patients);

  // Mantengo sincronizzate le ref di “sel” e “patients”
  useEffect(() => {
    selRef.current = sel;
  }, [sel]);
  useEffect(() => {
    patientsRef.current = patients;
  }, [patients]);

  // ───────────────────────────────────────────────────────────
  // (1) ALL’AVVIO: connessione a Socket, caricamento pazienti, join stanze
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });
    socketRef.current = socket;

    // (1a) Carico lista pazienti
    fetch(`${API}/patients/list.php`, { credentials: 'include' })
      .then((r) => r.json())
      .then((list: Patient[]) => {
        setPatients(list);
        // imposto unread=false e join in ogni stanza
        const init: Record<string, boolean> = {};
        list.forEach((p) => {
          const room = `private-chat-${p.user_id}`;
          init[room] = false;
          socket.emit('join', room);
        });
        setUnread(init);
      })
      .catch(console.error);

    // (1b) Handler in arrivo di messaggi real-time
    socket.on('message', (m: any) => {
      // Guard di sicurezza: se m.room non esiste, ignoro
      if (!m || typeof m.room !== 'string') {
        console.warn('ChatAdmin: evento "message" senza campo room:', m);
        return;
      }
      const { room, user: fromUser, text, ts } = m as Msg;

      // Se Admin sta guardando proprio quella stanza, mostro direttamente
      if (selRef.current && room === `private-chat-${selRef.current.user_id}`) {
        setMsgs((ms) => [...ms, { room, user: fromUser, text, ts }]);
      } else {
        // Altrimenti setto badge e creo notifica
        setUnread((u) => ({ ...u, [room]: true }));
        const patientId = parseInt(room.replace('private-chat-', ''), 10);
        const pat = patientsRef.current.find((p) => p.user_id === patientId);
        if (pat) {
          setNotifications((old) => {
            const next = [
              ...old,
              {
                id: Date.now(),
                text: `Nuovo messaggio da ${pat.nome} ${pat.cognome}`,
                open: true,
              },
            ];
            console.log('DEBUG → notifications now:', next);
            return next;
          });
        }
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // ───────────────────────────────────────────────────────────
  // (2) Ogni volta che cambia “sel” (paziente selezionato):
  //     - Carico cronologia
  //     - Azzero badge “unread” per quella stanza
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sel) {
      setMsgs([]);
      return;
    }
    markAdminRead();
    setMsgs([]);
    const room = `private-chat-${sel.user_id}`;
    setUnread((u) => ({ ...u, [room]: false }));

    fetch(`${API}/chat/history.php?user_id=${sel.user_id}`, {
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((raw: any[]) => {
        const history: Msg[] = raw.map((m) => ({
          room,
          user: m.user,
          text: m.text,
          ts: +m.ts,
        }));
        setMsgs(history);
      })
      .catch(console.error);
  }, [sel, markAdminRead]);

  // ───────────────────────────────────────────────────────────
  // (3) Scroll in fondo ogni volta che “msgs” cambia
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // ───────────────────────────────────────────────────────────
  // (4) Invio messaggio (Admin → Paziente)
  // ───────────────────────────────────────────────────────────
  const send = () => {
    if (!sel || !input.trim()) return;
    const room = `private-chat-${sel.user_id}`;
    const message: Msg = {
      room,
      user: 'admin',
      text: input.trim(),
      ts: Date.now(),
    };
    setMsgs((ms) => [...ms, message]);
    socketRef.current?.emit('message', message);
    setInput('');
  };

  // ───────────────────────────────────────────────────────────
  // (5) Chiudo una notifica (Snackbar)
  // ───────────────────────────────────────────────────────────
  const handleCloseNotification = (id: number) => {
    setNotifications((old) =>
      old.map((n) => (n.id === id ? { ...n, open: false } : n))
    );
  };

  // ───────────────────────────────────────────────────────────
  // (6) Costruisco la lista messaggi, con divider per data
  // ───────────────────────────────────────────────────────────
  const renderMessageList = () => {
    const rendered: React.ReactNode[] = [];
    let lastDateStr: string | null = null;

    msgs.forEach((m, idx) => {
      const d = new Date(m.ts);
      const dateStr = d.toLocaleDateString();

      if (dateStr !== lastDateStr) {
        rendered.push(
          <Box key={`divider-${idx}`} display="flex" justifyContent="center" my={1}>
            <Chip
              label={dateStr}
              size="small"
              sx={{
                backgroundColor: 'grey.300',
                color: 'text.secondary',
                fontWeight: 500,
              }}
            />
          </Box>
        );
        lastDateStr = dateStr;
      }

      const timeOnly = d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const isAdmin = m.user === 'admin';

      rendered.push(
        <Box
          key={`msg-${idx}`}
          display="flex"
          justifyContent={isAdmin ? 'flex-end' : 'flex-start'}
          mb={2}    /* margine verticale di 16px */
          px={2}
        >
          <Paper
            elevation={2}
            sx={{
              p: 1.5,
              backgroundColor: isAdmin ? 'primary.main' : 'grey.100',
              color: isAdmin ? 'primary.contrastText' : 'text.primary',
              borderRadius: 2,
              maxWidth: '60%',
              position: 'relative',
            }}
          >
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
              {m.text}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                bottom: -32, /* margine maggiore sotto la bubble */
                right: 8,
                color: isAdmin ? 'primary.contrastText' : 'text.secondary',
              }}
            >
              {timeOnly}
            </Typography>
          </Paper>
        </Box>
      );
    });

    rendered.push(<div key="end" ref={endRef} />);
    return rendered;
  };

  return (
    <Box display="flex" height="80vh">
      {/* ───────────────────────────────────────────
             SIDEBAR: lista pazienti
         ─────────────────────────────────────────── */}
      <Box
        width={260}
        borderRight={1}
        borderColor="grey.300"
        bgcolor="grey.50"
        p={2}
        overflow="auto"
      >
        <Typography variant="h6" gutterBottom>
          Chat Pazienti
        </Typography>
        <List>
          {patients.map((p) => {
            const room = `private-chat-${p.user_id}`;
            const hasUnread = !!unread[room];
            return (
              <ListItemButton
                key={p.user_id}
                selected={sel?.user_id === p.user_id}
                onClick={() => setSel(p)}
                sx={{
                  borderRadius: 1,
                  my: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                  },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={!hasUnread}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <Avatar>
                      <ChatBubbleIcon />
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={`${p.nome} ${p.cognome}`}
                  primaryTypographyProps={{ noWrap: true }}
                  sx={{ ml: 1 }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* ───────────────────────────────────────────
             FINESTRA CHAT DELL’ADMIN
         ─────────────────────────────────────────── */}
      {sel ? (
        <Box flexGrow={1} display="flex" flexDirection="column" p={2}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Chat con {sel.nome} {sel.cognome}
          </Typography>

          <Paper
            sx={{
              flex: 1,
              p: 2,
              overflowY: 'auto',
              backgroundColor: 'grey.50',
              borderRadius: 2,
            }}
            elevation={1}
          >
            {renderMessageList()}
          </Paper>

          <Box display="flex" alignItems="center" mt={2}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Scrivi un messaggio..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())
              }
              sx={{
                backgroundColor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <IconButton
              onClick={send}
              color="primary"
              sx={{
                ml: 1,
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' },
                p: 1.5,
                borderRadius: '50%',
              }}
            >
              <SendIcon sx={{ color: 'white' }} />
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Box
          flexGrow={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography color="text.secondary">
            Seleziona un paziente dalla lista
          </Typography>
        </Box>
      )}

      {/* ───────────────────────────────────────────
             SNACKBARS DI NOTIFICA (restano, ma senza bottone “di prova”)
         ─────────────────────────────────────────── */}
      {notifications.map((notif) => (
        <Snackbar
          key={notif.id}
          open={notif.open}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          className="MuiSnackbar-root"
          message={notif.text}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={() => handleCloseNotification(notif.id)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        />
      ))}
    </Box>
  );
};

export default ChatAdmin;
