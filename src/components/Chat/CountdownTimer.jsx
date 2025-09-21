import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ 
  expiresAt, 
  onExpire, 
  className = '',
  showIcon = true,
  size = 'sm' 
}) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        if (onExpire && typeof onExpire === 'function') {
          onExpire();
        }
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
      setIsExpired(false);
    };

    // Calculate initial time
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (isExpired) {
    return (
      <div className={`flex items-center space-x-1 text-red-600 ${className}`}>
        {showIcon && <Clock size={size === 'sm' ? 14 : 16} />}
        <span className={`font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          Expired
        </span>
      </div>
    );
  }

  if (!timeLeft) {
    return null;
  }

  const getTimeColor = () => {
    const totalHours = timeLeft.hours + (timeLeft.minutes / 60);
    if (totalHours <= 2) return 'text-red-600'; // Last 2 hours - red
    if (totalHours <= 6) return 'text-orange-600'; // Last 6 hours - orange
    return 'text-gray-600'; // More than 6 hours - gray
  };

  const formatTime = () => {
    const parts = [];
    
    if (timeLeft.hours > 0) {
      parts.push(`${timeLeft.hours}h`);
    }
    
    if (timeLeft.minutes > 0 || timeLeft.hours > 0) {
      parts.push(`${timeLeft.minutes}m`);
    }
    
    // Always show seconds if less than 1 hour remaining
    if (timeLeft.hours === 0) {
      parts.push(`${timeLeft.seconds}s`);
    }
    
    return parts.join(' ');
  };

  return (
    <div className={`flex items-center space-x-1 rtl:space-x-reverse ${getTimeColor()} ${className}`}>
      {showIcon && <Clock size={size === 'sm' ? 14 : 16} />}
      <span className={`font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {formatTime()} left
      </span>
    </div>
  );
};

export default CountdownTimer;
