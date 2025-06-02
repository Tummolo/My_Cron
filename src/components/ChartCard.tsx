// src/components/ChartCard.tsx
import React, { FC } from 'react';
import { Card, CardHeader, CardContent } from '@mui/material';

interface Props {
  title: string;
  children: React.ReactNode;
}

const ChartCard: FC<Props> = ({ title, children }) => {
  return (
    <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: '600' }}
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ px: 2, pt: 1, height: 'calc(100% - 48px)' }}>
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartCard;
