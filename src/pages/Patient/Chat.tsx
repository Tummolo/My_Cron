// src/components/Chat.tsx
import React, { FC, useEffect, useState, useRef } from 'react';
import Pusher from 'pusher-js';
import {
  Box, Typography, Paper, List, ListItem,
  TextField, IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../../contexts/AuthContext';

interface Msg { user: 'user'|'admin'; text: string; ts: number }

const API = import.meta.env.VITE_API_BASE as string;
const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY!;
const CLUSTER    = import.meta.env.VITE_PUSHER_CLUSTER!;

function makePusher() {
  // DEBUG: vedi cosa succede in console
  Pusher.logToConsole = true;

  return new Pusher(PUSHER_KEY, {
    cluster: CLUSTER,
    forceTLS: true,
    authEndpoint: `${API}/chat/auth.php`,
    auth: {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    },
    withCredentials: true
  });
}

const Chat: FC = () => {
  const { user } = useAuth();
  const userId = user!.id;
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pusher = makePusher();
    const channel = pusher.subscribe(`private-chat-${userId}`);

    channel.bind('pusher:subscription_succeeded', () => {
      // sottoscritto, carico la cronologia
      fetch(`${API}/chat/history.php?user_id=${userId}`, {
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

    channel.bind('new-message', (m: Msg) => {
      setMsgs(ms => [...ms, {
        user: m.user,
        text: m.text,
        ts: +m.ts
      }]);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`private-chat-${userId}`);
      pusher.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = () => {
    const txt = input.trim();
    if (!txt) return;
    const ts = Date.now();
    setMsgs(ms => [...ms, { user: 'user', text: txt, ts }]);
    setInput('');

    fetch(`${API}/chat/save.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        sender: 'user',
        text: txt,
        ts
      })
    }).catch(console.error);
  };

  return (
    <Box display="flex" flexDirection="column" height="100%" p={2}>
      <Typography variant="h5">💬 Chat</Typography>
      <Paper sx={{ flex:1, p:1, my:2, overflowY:'auto' }}>
        <List>
          {msgs.map((m,i) => (
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
          onKeyDown={e =>
            e.key==='Enter' && !e.shiftKey &&
            (e.preventDefault(), send())
          }
        />
        <IconButton onClick={send} color="primary">
          <SendIcon/>
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chat;
