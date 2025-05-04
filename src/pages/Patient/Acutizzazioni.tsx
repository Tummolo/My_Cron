// src/pages/Patient/Acutizzazioni.tsx
import React, { FC } from 'react'
import { useAuth }    from '../../contexts/AuthContext'
import DiabeteAcutizzazioni   from './Diabete/Acutizzazioni'
import ScompensoAcutizzazioni from './Scompenso/Acutizzazioni'

const Acutizzazioni: FC = () => {
  const { user } = useAuth()
  if (!user?.malattia) return null

  return user.malattia === 'Diabete'
    ? <DiabeteAcutizzazioni />
    : <ScompensoAcutizzazioni />
}

export default Acutizzazioni
