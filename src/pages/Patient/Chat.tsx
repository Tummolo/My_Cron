import React, { FC, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Box, Typography, Paper, List, ListItem,
  TextField, IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../../contexts/AuthContext';

interface Msg { user: 'user'|'admin'; text: string; ts: number }

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
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  // inizializziamo la ref a null
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = makeSocket();
    socketRef.current = socket;
    const room = `private-chat-${userId}`;
    socket.emit('join', room);

    // messaggi realtime
    socket.on('message', (m: Msg) => {
      setMsgs(ms => [...ms, m]);
    });

    // carica cronologia
    fetch(`${API}/chat/history.php?user_id=${userId}`, {
      credentials: 'include'
    })
      .then(r => r.json())
      .then((raw: any[]) => {
        setMsgs(raw.map(m => ({ user: m.user, text: m.text, ts: +m.ts })));
      })
      .catch(console.error);

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = () => {
    const txt = input.trim();
    if (!txt) return;
    const ts = Date.now();
    const message: Msg = { user: 'user', text: txt, ts };
    setMsgs(ms => [...ms, message]);
    setInput('');

    const room = `private-chat-${userId}`;
    socketRef.current?.emit('message', { room, ...message });
  };

  return (
    <Box display="flex" flexDirection="column" height="100%" p={2}>
      <Typography variant="h5">💬 Chat</Typography>
      <Paper sx={{ flex:1, p:1, my:2, overflowY:'auto' }}>
        <List>
          {msgs.map((m, i) => (
            <ListItem
              key={i}
              sx={{ justifyContent: m.user==='user' ? 'flex-end' : 'flex-start' }}
            >
              <Box
                p={1}
                bgcolor={m.user==='user' ? 'primary.main' : 'grey.300'}
                color={m.user==='user' ? 'primary.contrastText' : 'black'}
                borderRadius={2}
                position="relative"
                maxWidth="70%"
              >
                {m.text}
                <Typography
                  component="span"
                  sx={{
                    position:'absolute', bottom:-16, right:4,
                    fontSize:'0.625rem',
                    color: m.user==='user' ? 'primary.contrastText' : 'text.secondary'
                  }}
                >
                  {new Date(m.ts).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                </Typography>
              </Box>
            </ListItem>
          ))}
          <div ref={endRef}/>
        </List>
      </Paper>
      <Box display="flex">
        <TextField
          fullWidth multiline maxRows={4}
          placeholder="Scrivi..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==='Enter' && !e.shiftKey && (e.preventDefault(), send())}
        />
        <IconButton onClick={send} color="primary">
          <SendIcon/>
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chat;
