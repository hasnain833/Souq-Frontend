import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 'md', 
  interactive = false, 
  onRatingChange = null,
  showValue = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const handleStarClick = (starValue) => {
    if (interactive && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const renderStar = (index) => {
    const starValue = index + 1;
    const isFilled = starValue <= rating;
    const isPartiallyFilled = starValue > rating && starValue - 1 < rating;
    
    return (
      <div
        key={index}
        className={`relative ${interactive ? 'cursor-pointer' : ''}`}
        onClick={() => handleStarClick(starValue)}
      >
        {/* Background star (empty) */}
        <Star
          className={`${sizeClasses[size]} text-gray-300 ${interactive ? 'hover:text-yellow-400 transition-colors' : ''}`}
          fill="currentColor"
        />
        
        {/* Foreground star (filled) */}
        {(isFilled || isPartiallyFilled) && (
          <Star
            className={`absolute top-0 left-0 ${sizeClasses[size]} text-yellow-500`}
            fill="currentColor"
            style={{
              clipPath: isPartiallyFilled 
                ? `inset(0 ${100 - ((rating - Math.floor(rating)) * 100)}% 0 0)`
                : 'none'
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
