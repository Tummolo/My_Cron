// Segnali.tsx
import React, { FC } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DiabeteSegnali   from './Diabete/Segnali';
import ScompensoSegnali from './Scompenso/Segnali';

const Segnali: FC = () => {
  const { user } = useAuth();
  if (!user?.malattia) return null;
  return user.malattia === 'Diabete'
    ? <DiabeteSegnali />
    : <ScompensoSegnali />;
};

export default Segnali;
