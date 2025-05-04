// src/pages/Patient/Educazione.tsx
import React, { FC } from 'react'
import { useAuth } from '../../contexts/AuthContext'

import DiabeteEducazione from './Diabete/Educazione'
import ScompensoEducazione from './Scompenso/Educazione'

const Educazione: FC = () => {
  const { user } = useAuth()
  if (!user?.malattia) return null

  switch (user.malattia) {
    case 'Diabete':
      return <DiabeteEducazione />
    case 'Scompenso':
      return <ScompensoEducazione />
    default:
      return null
  }
}

export default Educazione
