/**
 * Generate unique booking reference
 * Format: EVT-YYYYMMDD-RANDOM
 */
export function generateBookingReference() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `EVT-${year}${month}${day}-${randomPart}`;
}

// Example output: EVT-20260211-A7K9M2