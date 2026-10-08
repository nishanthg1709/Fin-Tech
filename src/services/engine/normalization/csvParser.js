/**
 * CSV Statement Parser
 * Robust delimiter-aware CSV parser supporting quotes, commas within cells,
 * CRLF/LF line breaks, and whitespace trimming.
 */

/**
 * Splits a single CSV line into an array of string values,
 * respecting quoted cells (single and double quotes) with commas inside.
 * @param {string} line
 * @param {string} [delimiter=',']
 * @returns {string[]}
 */
export function splitCSVLine(line, delimiter = ',') {
  if (!line || typeof line !== 'string') return [];

  const result = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if ((char === '"' || char === "'") && (!inQuotes || char === quoteChar)) {
      // Check for escaped quote ("" or '')
      if (inQuotes && i + 1 < line.length && line[i + 1] === quoteChar) {
        current += quoteChar;
        i++; // Skip the second quote
      } else {
        inQuotes = !inQuotes;
        quoteChar = inQuotes ? char : '';
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Automatically detects the most likely delimiter from the header row.
 * @param {string} headerLine
 * @returns {string}
 */
export function detectDelimiter(headerLine) {
  if (!headerLine) return ',';
  const candidates = [',', ';', '\t', '|'];
  let best = ',';
  let maxCount = 0;

  for (const cand of candidates) {
    // Count candidate occurrences outside quotes
    let count = 0;
    let inQuotes = false;
    for (let i = 0; i < headerLine.length; i++) {
      if (headerLine[i] === '"' || headerLine[i] === "'") inQuotes = !inQuotes;
      else if (!inQuotes && headerLine[i] === cand) count++;
    }
    if (count > maxCount) {
      maxCount = count;
      best = cand;
    }
  }

  return best;
}

/**
 * Parses raw CSV string into { headers, rows, rawLines }
 * @param {string} csvText
 * @returns {{ headers: string[], rows: string[][], rawLines: string[], delimiter: string }}
 */
export function parseCSVRaw(csvText) {
  if (!csvText || typeof csvText !== 'string' || csvText.trim().length === 0) {
    throw new Error('The selected file is empty. Please provide a valid CSV file with transaction data.');
  }

  const lines = csvText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length < 2) {
    throw new Error('CSV must contain a header row and at least one transaction row.');
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitCSVLine(lines[0], delimiter);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i], delimiter);
    // Ignore completely empty rows
    if (cols.length === 0 || cols.every(c => !c || c.trim() === '')) {
      continue;
    }
    rows.push(cols);
  }

  if (rows.length === 0) {
    throw new Error('No transaction rows found in the CSV file.');
  }

  return {
    headers,
    rows,
    rawLines: lines,
    delimiter
  };
}
