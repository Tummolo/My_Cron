// src/components/Chat.tsx

import React, { FC, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Box,
  Typography,    // ← <— Mancava questa importazione
  Paper,
  List,
  ListItem,
  TextField,
  IconButton,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../../contexts/AuthContext';

interface Msg {
  user: 'user' | 'admin';
  text: string;
  ts: number;
}

const API = import.meta.env.VITE_API_BASE as string;
const SOCKET_URL = import.meta.env.VITE_CHAT_SERVER_URL as string;

function makeSocket(): Socket {
  return io(SOCKET_URL, {
    transports: ['websocket'],
    withCredentials: true,
  });
}

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
    return timeOnly;
  } else {
    return `${d.toLocaleDateString()} ${timeOnly}`;
  }
}

const Chat: FC = () => {
  const { user } = useAuth();
  const userId = user!.id;
  const room = `private-chat-${userId}`;

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Per evitare duplicati
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    const socket = makeSocket();
    socketRef.current = socket;

    // “Join” alla stanza dedicata
    socket.emit('join', room);

    // Listener messaggi in arrivo
    socket.on('message', (m: Msg) => {
      // Creo una chiave unica su timestamp+sender per evitare duplicati
      const key = `${m.ts}-${m.user}`;
      if (!seen.current.has(key)) {
        seen.current.add(key);
        setMsgs((ms) => [...ms, m]);
      }
    });

    // Ricevo la cronologia dal server
    fetch(`${API}/chat/history.php?user_id=${userId}`, {
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((raw: any[]) => {
        const history = raw.map((m) => ({
          user: m.user as 'user' | 'admin',
          text: m.text,
          ts: +m.ts,
        }));
        // Filtro i duplicati (stesso ts+user)
        const unique = history.filter((m) => {
          const key = `${m.ts}-${m.user}`;
          if (seen.current.has(key)) return false;
          seen.current.add(key);
          return true;
        });
        setMsgs(unique);
      })
      .catch(console.error);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, room]);

  // Scroll automatico in fondo alla chat
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // Invio messaggio dal paziente
  const send = () => {
    const txt = input.trim();
    if (!txt) return;
    const ts = Date.now();
    const m: Msg = { user: 'user', text: txt, ts };

    // 1) Aggiungo subito in UI
    setMsgs((ms) => [...ms, m]);
    seen.current.add(`${ts}-user`);
    setInput('');

    // 2) Mando al server
    socketRef.current?.emit('message', { room, ...m });
  };

  // Costruisco l’array di ReactNode per data + bubble
  const renderMessageList = () => {
    const rendered: React.ReactNode[] = [];
    let lastDate: string | null = null;

    msgs.forEach((m, idx) => {
      const d = new Date(m.ts);
      const dateStr = d.toLocaleDateString(); // “DD/MM/YYYY”

      if (dateStr !== lastDate) {
        rendered.push(
          <Box
            key={`divider-${idx}`}
            display="flex"
            justifyContent="center"
            my={1}
          >
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
        lastDate = dateStr;
      }

      const timeOnly = d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const isUser = m.user === 'user';

      rendered.push(
        <ListItem
          key={`msg-${idx}`}
          sx={{ justifyContent: isUser ? 'flex-end' : 'flex-start' }}
        >
          <Paper
            elevation={2}
            sx={{
              p: 1.5,
              backgroundColor: isUser ? 'primary.main' : 'grey.100',
              color: isUser ? 'primary.contrastText' : 'text.primary',
              borderRadius: 2,
              maxWidth: '70%',
              position: 'relative',
              mb: 2, // 16px di margine sotto al bubble
            }}
          >
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
              {m.text}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                bottom: -32, // margine leggermente più ampio
                right: 8,
                color: isUser ? 'primary.contrastText' : 'text.secondary',
              }}
            >
              {timeOnly}
            </Typography>
          </Paper>
        </ListItem>
      );
    });

    rendered.push(<div key="end" ref={endRef} />);
    return rendered;
  };

  return (
    <Box display="flex" flexDirection="column" height="100%" p={2}>
      <Typography variant="h5" color="text.primary">
        💬 Chat
      </Typography>

      <Paper
        sx={{
          flex: 1,
          p: 2,
          my: 2,
          overflowY: 'auto',
          backgroundColor: 'grey.50',
          borderRadius: 2,
        }}
        elevation={1}
      >
        <List disablePadding>{renderMessageList()}</List>
      </Paper>

      <Box display="flex" alignItems="center" mt={1}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Scrivi un messaggio..."
          multiline
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === 'Enter' &&
            !e.shiftKey &&
            (e.preventDefault(), send())
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
  );
};

export default Chat;
