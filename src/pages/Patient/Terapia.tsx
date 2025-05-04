// src/pages/Patient/Terapia.tsx (wrapper)
import React, { FC } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import DiabeteTerapia from './Diabete/Terapia'
import ScompensoTerapia from './Scompenso/Terapia'

const Terapia: FC = () => {
  const { user } = useAuth()
  if (!user?.malattia) return null

  return user.malattia === 'Diabete'
    ? <DiabeteTerapia />
    : <ScompensoTerapia />
}

export default Terapia
