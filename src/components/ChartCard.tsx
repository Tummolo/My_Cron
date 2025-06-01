import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface Props {
  title: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<Props> = ({ title, children }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        {children}
      </Box>
    </CardContent>
  </Card>
);

export default ChartCard;
