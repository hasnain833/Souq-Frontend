import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import { useTranslation } from 'react-i18next';
// Optional if you want animation
// import { Player } from '@lottiefiles/react-lottie-player';
// import emptyBoxAnimation from './empty-box.json'; // Lottie animation

export const EmptyState = () => {
  const { t } = useTranslation()
  
  return (
    <Box className="flex flex-col items-center justify-center text-center py-10">
      {/* Simple Icon */}
      <SentimentDissatisfiedIcon fontSize="large" className="text-teal-500 animate-bounce" />

      {/* Optional Lottie Animation */}
      {/* 
      <Player
        autoplay
        loop
        src={emptyBoxAnimation}
        style={{ height: '150px', width: '150px' }}
      />
      */}

      <Typography variant="h6" className="mt-4 text-gray-800">
        {t("membersItems")}
      </Typography>
      <Typography variant="body2" className="text-gray-500 mt-1">
        {t("memberNotSelling")}
      </Typography>
    </Box>
  );
};
