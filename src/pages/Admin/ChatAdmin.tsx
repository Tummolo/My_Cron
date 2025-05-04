// src/components/ChatAdmin.tsx
import React, { FC, useEffect, useState, useRef } from 'react';
import Pusher from 'pusher-js';
import {
  Box, Typography, List, ListItemButton,
  ListItemAvatar, Avatar, ListItemText,
  Badge, Paper, TextField, IconButton
} from '@mui/material';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import SendIcon from '@mui/icons-material/Send';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';

interface Msg { user:'user'|'admin'; text:string; ts:number }
interface Patient { user_id:number; nome:string; cognome:string }

const API         = import.meta.env.VITE_API_BASE as string;
const PUSHER_KEY  = import.meta.env.VITE_PUSHER_KEY!;
const CLUSTER     = import.meta.env.VITE_PUSHER_CLUSTER!;

function makePusher() {
  // abilita log JS per debug; rimuovi in produzione
  Pusher.logToConsole = true;

  return new Pusher(PUSHER_KEY, {
    cluster: CLUSTER,
    forceTLS: true,
    // authTransport AJAX e non WebSocket native
    authTransport: 'ajax',
    authEndpoint: `${API}/chat/auth.php`,
    auth: {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      params: {}  // non serve alcun parametro extra
    }
  });
}

const ChatAdmin: FC = () => {
  const { user } = useAuth();
  const { markAdminRead } = useChat();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sel, setSel]           = useState<Patient|null>(null);
  const [unread, setUnread]     = useState<Record<string,boolean>>({});
  const [msgs, setMsgs]         = useState<Msg[]>([]);
  const [input, setInput]       = useState('');
  const endRef                  = useRef<HTMLDivElement>(null);

  // 1) Carica lista pazienti
  useEffect(() => {
    fetch(`${API}/patients/list.php`, {
      credentials: 'include'
    })
      .then(r => r.json())
      .then(setPatients)
      .catch(console.error);
  }, []);

  // 2) Quando seleziono un paziente
  useEffect(() => {
    if (!sel) return;

    markAdminRead();
    setMsgs([]);
    const room = `private-chat-${sel.user_id}`;
    setUnread(u => ({ ...u, [room]: false }));

    const pusher = makePusher();
    const ch = pusher.subscribe(room);

    // sotto­scrizione riuscita: carico la cronologia
    ch.bind('pusher:subscription_succeeded', () => {
      fetch(`${API}/chat/history.php?user_id=${sel.user_id}`, {
        credentials: 'include'
      })
        .then(r => r.json())
        .then((raw: any[]) => {
          setMsgs(raw.map(m => ({
            user: m.user,
            text: m.text,
            ts: +m.ts
          })));
        })
        .catch(console.error);
    });

    // nuovo messaggio in realtime
    ch.bind('new-message', (m: Msg) => {
      setMsgs(ms => [...ms, { user: m.user, text: m.text, ts: +m.ts }]);
      setUnread(u => ({ ...u, [room]: true }));
    });

    return () => {
      ch.unbind_all();
      pusher.unsubscribe(room);
      pusher.disconnect();
    };
  }, [sel, markAdminRead]);

  // 3) Scroll in fondo ad ogni nuovo messaggio
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // 4) Invio messaggio da admin
  const send = () => {
    if (!sel || !input.trim()) return;
    const txt = input.trim();
    const ts  = Date.now();
    setMsgs(ms => [...ms, { user: 'admin', text: txt, ts }]);
    setInput('');

    fetch(`${API}/chat/save.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: sel.user_id,
        sender: 'admin',
        text: txt,
        ts
      })
    }).catch(console.error);
  };

  return (
    <Box display="flex" height="80vh">
      <Box width={240} borderRight={1} p={1} overflow="auto">
        <Typography variant="h6">Chat Pazienti</Typography>
        <List>
          {patients.map(p => {
            const room = `private-chat-${p.user_id}`;
            return (
              <ListItemButton
                key={p.user_id}
                selected={sel?.user_id === p.user_id}
                onClick={() => setSel(p)}
              >
                <ListItemAvatar>
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={!unread[room]}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <Avatar><ChatBubbleIcon/></Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText primary={`${p.nome} ${p.cognome}`} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {sel ? (
        <Box flexGrow={1} display="flex" flexDirection="column" p={2}>
          <Typography variant="h6">Chat con {sel.nome}</Typography>
          <Paper sx={{ flex:1, p:1, overflowY: 'auto', mb:2 }}>
            {msgs.map((m, i) => {
              const time = new Date(m.ts).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              });
              return (
                <Box
                  key={i}
                  display="flex"
                  justifyContent={m.user==='admin' ? 'flex-end' : 'flex-start'}
                  mb={1}
                >
                  <Box
                    px={2}
                    py={1}
                    bgcolor={m.user==='admin' ? 'primary.main' : 'grey.300'}
                    color={m.user==='admin' ? 'primary.contrastText' : 'black'}
                    borderRadius={2}
                    position="relative"
                    maxWidth="60%"
                  >
                    {m.text}
                    <Typography
                      component="span"
                      sx={{
                        position:'absolute', bottom:-16, right:4,
                        fontSize:'0.625rem',
                        color: m.user==='admin' ? 'primary.contrastText' : 'text.secondary'
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
                e.key==='Enter' && !e.shiftKey && (e.preventDefault(), send())
              }
            />
            <IconButton onClick={send} color="primary">
              <SendIcon/>
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Box flexGrow={1} display="flex" alignItems="center" justifyContent="center">
          <Typography color="text.secondary">
            Seleziona un paziente
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ChatAdmin;
