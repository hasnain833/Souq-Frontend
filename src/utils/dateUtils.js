import { formatDistanceToNow, isValid, parseISO } from 'date-fns';

/**
 * Safely format a date string to show time distance from now
 * @param {string|Date} dateString - The date to format
 * @param {Object} options - Options for formatting
 * @returns {string} Formatted date string or fallback
 */
export const formatSafeDate = (dateString, options = { addSuffix: true }) => {
  if (!dateString) return 'recently';
  
  try {
    let date;
    if (typeof dateString === 'string') {
      date = parseISO(dateString);
    } else {
      date = new Date(dateString);
    }
    
    if (isValid(date)) {
      return formatDistanceToNow(date, options);
    } else {
      console.warn('Invalid date provided to formatSafeDate:', dateString);
      return 'recently';
    }
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return 'recently';
  }
};

/**
 * Format date for display in a standard format
 * @param {string|Date} dateString - The date to format
 * @returns {string} Formatted date string
 */
export const formatDisplayDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    let date;
    if (typeof dateString === 'string') {
      date = parseISO(dateString);
    } else {
      date = new Date(dateString);
    }
    
    if (isValid(date)) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      console.warn('Invalid date provided to formatDisplayDate:', dateString);
      return 'N/A';
    }
  } catch (error) {
    console.error('Error formatting display date:', error, dateString);
    return 'N/A';
  }
};

/**
 * Check if a date string is valid
 * @param {string|Date} dateString - The date to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  
  try {
    let date;
    if (typeof dateString === 'string') {
      date = parseISO(dateString);
    } else {
      date = new Date(dateString);
    }
    
    return isValid(date);
  } catch (error) {
    return false;
  }
};
