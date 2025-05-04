// src/contexts/ChatContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react'
import Pusher from 'pusher-js'
import { useAuth } from './AuthContext'

interface ChatContextValue {
  hasUnreadUser: boolean
  markUserRead: () => void
  hasUnreadAdmin: boolean
  markAdminRead: () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)
const API            = import.meta.env.VITE_API_BASE as string   // es. '/api'
const PUSHER_KEY     = import.meta.env.VITE_PUSHER_KEY!
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER!

function makePusher() {
  return new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER,
    forceTLS: true,
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        const body = new URLSearchParams({
          socket_id: socketId,
          channel_name: channel.name
        })

        fetch(`${API}/chat/auth.php`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body
        })
          .then(res => {
            if (res.status === 403) {
              throw new Error('Non autorizzato')
            }
            if (!res.ok) {
              throw new Error(`Auth fallita (${res.status})`)
            }
            return res.json()
          })
          .then(data => {
            callback(null, data.auth)
          })
          .catch(err => {
            console.error('Pusher auth error:', err)
            callback(err, {} as any)
          })
      }
    })
  })
}

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const userId   = user!.id
  const [hasUnreadUser,  setHasUnreadUser]  = useState(false)
  const [hasUnreadAdmin, setHasUnreadAdmin] = useState(false)

  useEffect(() => {
    if (!user) return
    const pusher = makePusher()

    if (user.role === 'admin') {
      fetch(`${API}/patients/list.php`, { credentials: 'include' })
        .then(r => r.json())
        .then((list: { user_id: number }[]) => {
          list.forEach(p => {
            const ch = pusher.subscribe(`private-chat-${p.user_id}`)
            ch.bind('new-message', (m: any) => {
              if (m.user === 'user') setHasUnreadAdmin(true)
            })
          })
        })
        .catch(console.error)
    } else {
      const ch = pusher.subscribe(`private-chat-${userId}`)
      ch.bind('new-message', (m: any) => {
        if (m.user === 'admin') setHasUnreadUser(true)
      })
    }

    return () => { pusher.disconnect() }
  }, [user, userId])

  return (
    <ChatContext.Provider
      value={{
        hasUnreadUser,
        markUserRead:  () => setHasUnreadUser(false),
        hasUnreadAdmin,
        markAdminRead: () => setHasUnreadAdmin(false)
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat deve stare dentro ChatProvider')
  return ctx
}
