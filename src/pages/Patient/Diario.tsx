// Diario.tsx
import React, { FC } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DiabeteDiario   from './Diabete/Diario';
import ScompensoDiario from './Scompenso/Diario';

const Diario: FC = () => {
  const { user } = useAuth();
  if (!user?.malattia) return null;
  return user.malattia === 'Diabete'
    ? <DiabeteDiario />
    : <ScompensoDiario />;
};

export default Diario;
