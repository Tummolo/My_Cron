// src/components/ChatAdmin.tsx
import React, { FC, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Box, Typography, List, ListItemButton,
  ListItemAvatar, Avatar, ListItemText,
  Badge, Paper, TextField, IconButton
} from '@mui/material';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import SendIcon from '@mui/icons-material/Send';
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

const ChatAdmin: FC = () => {
  const { user } = useAuth();
  const { markAdminRead } = useChat();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [sel, setSel]         = useState<Patient | null>(null);
  const [unread, setUnread]   = useState<Record<string,boolean>>({});
  const [msgs, setMsgs]       = useState<Msg[]>([]);
  const [input, setInput]     = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const socketRef = useRef<Socket | null>(null);
  // ref per avere sempre il sel corrente dentro il handler socket
  const selRef = useRef<Patient | null>(sel);
  useEffect(() => { selRef.current = sel; }, [sel]);

  // 1) Mount: connetti socket, carica pazienti, join stanze, imposta handler
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true
    });
    socketRef.current = socket;

    // 1a) Carica lista pazienti
    fetch(`${API}/patients/list.php`, { credentials: 'include' })
      .then(r => r.json())
      .then((list: Patient[]) => {
        setPatients(list);
        // init unread a false per ciascuna stanza e join
        const init: Record<string,boolean> = {};
        list.forEach(p => {
          const room = `private-chat-${p.user_id}`;
          init[room] = false;
          socket.emit('join', room);
        });
        setUnread(init);
      })
      .catch(console.error);

    // 1b) Handler messaggi real-time
    socket.on('message', (m: Msg) => {
      const { room } = m;
      // se sto visualizzando proprio quella stanza...
      if (selRef.current && room === `private-chat-${selRef.current.user_id}`) {
        setMsgs(ms => [...ms, m]);
      } else {
        // altrimenti metto badge
        setUnread(u => ({ ...u, [room]: true }));
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // solo una volta

  // 2) Ogni volta che cambio paziente selezionato → carico storia + azzero badge
  useEffect(() => {
    if (!sel) return;

    markAdminRead();
    setMsgs([]);
    const room = `private-chat-${sel.user_id}`;
    setUnread(u => ({ ...u, [room]: false }));

    fetch(`${API}/chat/history.php?user_id=${sel.user_id}`, { credentials: 'include' })
      .then(r => r.json())
      .then((raw: any[]) => {
        setMsgs(raw.map(m => ({
          room,
          user: m.user,
          text: m.text,
          ts: +m.ts
        })));
      })
      .catch(console.error);

  }, [sel, markAdminRead]);

  // 3) Scroll automatico in fondo
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // 4) Invio messaggio
  const send = () => {
    if (!sel || !input.trim()) return;
    const room = `private-chat-${sel.user_id}`;
    const message: Msg = {
      room,
      user: 'admin',
      text: input.trim(),
      ts: Date.now()
    };
    setInput('');
    socketRef.current?.emit('message', message);
  };

  return (
    <Box display="flex" height="80vh">
      {/* Sidebar pazienti */}
      <Box width={240} borderRight={1} p={1} overflow="auto">
        <Typography variant="h6">Chat Pazienti</Typography>
        <List>
          {patients.map(p => {
            const room = `private-chat-${p.user_id}`;
            const has = !!unread[room];
            return (
              <ListItemButton
                key={p.user_id}
                selected={sel?.user_id === p.user_id}
                onClick={() => setSel(p)}
              >
                {/* Badge sull’avatar */}
                <ListItemAvatar>
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={!has}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <Avatar>
                      <ChatBubbleIcon />
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                {/* Badge accanto al nome */}
                <Badge
                  color="error"
                  variant="dot"
                  invisible={!has}
                  sx={{ ml: 1 }}
                >
                  <ListItemText primary={`${p.nome} ${p.cognome}`} />
                </Badge>
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Finestra chat */}
      {sel ? (
        <Box flexGrow={1} display="flex" flexDirection="column" p={2}>
          <Typography variant="h6">Chat con {sel.nome}</Typography>
          <Paper sx={{ flex:1, p:1, overflowY:'auto', mb:2 }}>
            {msgs.map((m, i) => {
              const time = new Date(m.ts)
                .toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
              return (
                <Box
                  key={i}
                  display="flex"
                  justifyContent={m.user === 'admin' ? 'flex-end' : 'flex-start'}
                  mb={1}
                >
                  <Box
                    px={2} py={1}
                    bgcolor={m.user === 'admin' ? 'primary.main' : 'grey.300'}
                    color={m.user === 'admin' ? 'primary.contrastText' : 'black'}
                    borderRadius={2}
                    position="relative"
                    maxWidth="60%"
                  >
                    {m.text}
                    <Typography
                      component="span"
                      sx={{
                        position:'absolute',
                        bottom:-16,
                        right:4,
                        fontSize:'0.625rem',
                        color: m.user === 'admin'
                          ? 'primary.contrastText'
                          : 'text.secondary'
                      }}
                    >
                      {time}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
            <div ref={endRef} />
          </Paper>

          <Box display="flex">
            <TextField
              fullWidth
              placeholder="Scrivi..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e =>
                e.key === 'Enter' && !e.shiftKey &&
                (e.preventDefault(), send())
              }
            />
            <IconButton onClick={send} color="primary">
              <SendIcon/>
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Box flexGrow={1} display="flex" alignItems="center" justifyContent="center">
          <Typography color="text.secondary">Seleziona un paziente</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ChatAdmin;
