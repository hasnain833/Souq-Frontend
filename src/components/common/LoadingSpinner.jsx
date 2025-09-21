import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const LoadingSpinner = ({ size = 40, thickness = 4, fullScreen = false }) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height={fullScreen ? '70vh' : '100%'}
      width="100%"
    >
      <CircularProgress
        size={size}
        thickness={thickness}
        sx={{ color: '#14b8a6' }} // teal-500 from Tailwind
      />
    </Box>
  );
};

export default LoadingSpinner;
