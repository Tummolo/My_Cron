import React, { FC, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  TextField,
  IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../../contexts/AuthContext';

interface Msg {
  user: 'user' | 'admin';
  text: string;
  ts: number;
}

// Base URL delle API e URL del socket (Railway / dev)
const API = import.meta.env.VITE_API_BASE as string;
const SOCKET_URL = import.meta.env.VITE_CHAT_SERVER_URL as string;

function makeSocket(): Socket {
  return io(SOCKET_URL, {
    transports: ['websocket'],
    withCredentials: true
  });
}

const Chat: FC = () => {
  const { user } = useAuth();
  const userId = user!.id;
  const room = `private-chat-${userId}`;

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Tenere traccia degli id già mostrati per evitare duplicati
  const seen = useRef<Set<string>>(new Set());

  // Sottoscrizione e caricamento cronologia
  useEffect(() => {
    const socket = makeSocket();
    socketRef.current = socket;
    socket.emit('join', room);

    socket.on('message', (m: Msg) => {
      const key = `${m.ts}-${m.user}`;
      if (!seen.current.has(key)) {
        seen.current.add(key);
        setMsgs(ms => [...ms, m]);
      }
    });

    // Cronologia
    fetch(`${API}/chat/history.php?user_id=${userId}`, { credentials: 'include' })
      .then(r => r.json())
      .then((raw: any[]) => {
        const history = raw.map(m => ({
          user: m.user as 'user' | 'admin',
          text: m.text,
          ts: +m.ts
        }));
        // dedup e ordina
        const unique = history.filter(m => {
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

  // Scroll down
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = () => {
    const txt = input.trim();
    if (!txt) return;
    const ts = Date.now();
    const m: Msg = { user: 'user', text: txt, ts };

    // 1) UI immediata
    setMsgs(ms => [...ms, m]);
    seen.current.add(`${ts}-user`);
    setInput('');

    // 2) invio al server
    socketRef.current?.emit('message', { room, ...m });
  };

  // Formattazione orario (ora:minuti) – se non è di oggi, mostra anche giorno
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const today = new Date();
    const sameDay =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return sameDay ? time : d.toLocaleDateString() + ' ' + time;
  };

  return (
    <Box display="flex" flexDirection="column" height="100%" p={2}>
      <Typography variant="h5">💬 Chat</Typography>
      <Paper sx={{ flex: 1, p: 1, my: 2, overflowY: 'auto' }}>
        <List>
          {msgs.map((m, i) => (
            <ListItem
              key={i}
              sx={{ justifyContent: m.user === 'user' ? 'flex-end' : 'flex-start' }}
            >
              <Box
                p={1}
                bgcolor={m.user === 'user' ? 'primary.main' : 'grey.300'}
                color={m.user === 'user' ? 'primary.contrastText' : 'black'}
                borderRadius={2}
                position="relative"
                maxWidth="70%"
              >
                {m.text}
                <Typography
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: -16,
                    right: 4,
                    fontSize: '0.625rem',
                    color: m.user === 'user' ? 'primary.contrastText' : 'text.secondary'
                  }}
                >
                  {formatTime(m.ts)}
                </Typography>
              </Box>
            </ListItem>
          ))}
          <div ref={endRef} />
        </List>
      </Paper>
      <Box display="flex">
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Scrivi..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e =>
            e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())
          }
        />
        <IconButton onClick={send} color="primary">
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chat;
