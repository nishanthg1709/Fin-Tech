/**
 * Indian Currency & Number Formatters
 * Uses standard Indian numbering system (e.g. ₹1,000, ₹10,000, ₹1,00,000)
 * Replaces all financial currency usage with ₹ (INR).
 */

export function formatINR(amount, options = {}) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }

  const num = Number(amount);
  const { decimals = false, compact = false } = options;

  // Compact representation for very large numbers if requested
  if (compact && Math.abs(num) >= 100000) {
    const inLakhs = num / 100000;
    return `₹${inLakhs.toFixed(2).replace(/\.?0+$/, '')}L`;
  }

  const formatted = num.toLocaleString('en-IN', {
    maximumFractionDigits: decimals ? 2 : 0,
    minimumFractionDigits: decimals ? 2 : 0
  });

  return `₹${formatted}`;
}

/**
 * Format Indian number without currency symbol
 */
export function formatIndianNumber(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '0';
  return Number(amount).toLocaleString('en-IN');
}
