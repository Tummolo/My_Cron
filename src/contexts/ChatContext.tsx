// src/contexts/ChatContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

interface ChatContextValue {
  hasUnreadUser: boolean
  markUserRead: () => void
  hasUnreadAdmin: boolean
  markAdminRead: () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)
const API = import.meta.env.VITE_API_BASE as string    // es. '/api'
const SOCKET_URL = import.meta.env.VITE_CHAT_SERVER_URL as string

function makeSocket(): Socket {
  return io(SOCKET_URL, {
    transports: ['websocket'],
    withCredentials: true
  })
}

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const userId = user!.id
  const [hasUnreadUser, setHasUnreadUser] = useState(false)
  const [hasUnreadAdmin, setHasUnreadAdmin] = useState(false)

  useEffect(() => {
    if (!user) return
    const socket = makeSocket()

    if (user.role === 'admin') {
      // Admin: join every patient's room and listen for user messages
      fetch(`${API}/patients/list.php`, { credentials: 'include' })
        .then(r => r.json())
        .then((list: { user_id: number }[]) => {
          list.forEach(p => {
            const room = `private-chat-${p.user_id}`
            socket.emit('join', room)
          })
        })
        .catch(console.error)

      socket.on('message', (m: any) => {
        if (m.user === 'user') {
          setHasUnreadAdmin(true)
        }
      })
    } else {
      // User: join own room and listen for admin messages
      const room = `private-chat-${userId}`
      socket.emit('join', room)
      socket.on('message', (m: any) => {
        if (m.user === 'admin') {
          setHasUnreadUser(true)
        }
      })
    }

    return () => {
      socket.disconnect()
    }
  }, [user, userId])

  return (
    <ChatContext.Provider
      value={{
        hasUnreadUser,
        markUserRead: () => setHasUnreadUser(false),
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
