/**
 * Date Normalization Engine
 * Standardizes bank statement dates into canonical YYYY-MM-DD.
 * Handles Indian, UK, ISO, and alphanumeric formats safely.
 */

const MONTH_NAMES_MAP = {
  jan: '01', january: '01',
  feb: '02', february: '02',
  mar: '03', march: '03',
  apr: '04', april: '04',
  may: '05',
  jun: '06', june: '06',
  jul: '07', july: '07',
  aug: '08', august: '08',
  sep: '09', sept: '09', september: '09',
  oct: '10', october: '10',
  nov: '11', november: '11',
  dec: '12', december: '12'
};

/**
 * Validates whether a day/month/year combination forms a real calendar date.
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @returns {boolean}
 */
export function isValidCalendarDate(year, month, day) {
  if (year < 1990 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const daysInMonth = [
    31,
    (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31
  ];

  return day <= daysInMonth[month - 1];
}

/**
 * Normalizes any supported date string into YYYY-MM-DD.
 * @param {string} rawDate
 * @returns {{ date: string|null, isValid: boolean, error?: string }}
 */
export function normalizeDate(rawDate) {
  if (!rawDate || typeof rawDate !== 'string') {
    return { date: null, isValid: false, error: 'Date is missing or empty' };
  }

  const clean = rawDate.trim();
  if (clean.length === 0) {
    return { date: null, isValid: false, error: 'Date is empty' };
  }

  // 1. ISO format: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = clean.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:[T\s].*)?$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    const d = parseInt(isoMatch[3], 10);
    if (isValidCalendarDate(y, m, d)) {
      return {
        date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        isValid: true
      };
    }
    return { date: null, isValid: false, error: `Invalid calendar date: ${clean}` };
  }

  // 2. Named Month format: e.g. "08-Oct-2026", "08 Oct 2026", "8-October-2026", "Oct 08, 2026"
  const namedMatch1 = clean.match(/^(\d{1,2})[\s/-]+([A-Za-z]{3,9})[\s/-]+(\d{2,4})$/);
  if (namedMatch1) {
    const d = parseInt(namedMatch1[1], 10);
    const mStr = namedMatch1[2].toLowerCase();
    let y = parseInt(namedMatch1[3], 10);
    if (y < 100) y += 2000;

    const m = MONTH_NAMES_MAP[mStr];
    if (m && isValidCalendarDate(y, parseInt(m, 10), d)) {
      return {
        date: `${y}-${m}-${String(d).padStart(2, '0')}`,
        isValid: true
      };
    }
  }

  const namedMatch2 = clean.match(/^([A-Za-z]{3,9})[\s/-]+(\d{1,2}),?[\s/-]+(\d{2,4})$/);
  if (namedMatch2) {
    const mStr = namedMatch2[1].toLowerCase();
    const d = parseInt(namedMatch2[2], 10);
    let y = parseInt(namedMatch2[3], 10);
    if (y < 100) y += 2000;

    const m = MONTH_NAMES_MAP[mStr];
    if (m && isValidCalendarDate(y, parseInt(m, 10), d)) {
      return {
        date: `${y}-${m}-${String(d).padStart(2, '0')}`,
        isValid: true
      };
    }
  }

  // 3. Indian / British format (Day first): DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})(?:[T\s].*)?$/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10);
    let y = parseInt(dmyMatch[3], 10);
    if (y < 100) y += 2000;

    // Default to Day/Month/Year (Indian banking standard)
    if (isValidCalendarDate(y, m, d)) {
      return {
        date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        isValid: true
      };
    }

    // If day was > 12 and month was day (Month/Day/Year US format)
    if (d <= 12 && m > 12 && isValidCalendarDate(y, d, m)) {
      return {
        date: `${y}-${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}`,
        isValid: true
      };
    }

    return { date: null, isValid: false, error: `Invalid date: ${clean}` };
  }

  // 4. Standard Date fallback
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = parsed.getMonth() + 1;
    const d = parsed.getDate();
    if (isValidCalendarDate(y, m, d)) {
      return {
        date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        isValid: true
      };
    }
  }

  return { date: null, isValid: false, error: `Unrecognized or ambiguous date format: "${clean}"` };
}
