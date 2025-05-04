// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Auth/Login'
import PatientLayout from './layouts/PatientLayout'
import AdminLayout from './layouts/AdminLayout'
import SegnalaProblema from './pages/SegnalaProblema'
import { useAuth } from './contexts/AuthContext'
import { ChatProvider } from './contexts/ChatContext'
import Footer from './components/Footer'

export default function App() {
  const { user } = useAuth()

  return (
    <>
      <Routes>
        {/* Public route */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />

        {/* Segnala un Problema - accessibile anche senza wrapper */}
        <Route path="/segnala" element={<SegnalaProblema />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            user ? (
              <ChatProvider>
                {user.role === 'admin' ? (
                  <AdminLayout user={user} />
                ) : (
                  <PatientLayout user={user} />
                )}
              </ChatProvider>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
      {/* Footer sempre visibile */}
      <Footer />
    </>
  )
}