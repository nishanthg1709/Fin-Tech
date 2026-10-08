/**
 * Duplicate Detection Engine
 * Uses deterministic fingerprinting to identify and filter out duplicate transactions
 * across imports without deleting existing records.
 */

/**
 * Generates a deterministic transaction fingerprint.
 * Normalizes description whitespace, ensures 2 decimal places for amount,
 * and handles optional account identifiers.
 *
 * @param {Object} tx Canonical transaction object
 * @returns {string}
 */
export function generateFingerprint(tx) {
  if (!tx) return '';

  const date = String(tx.date || '').trim();
  const desc = String(tx.original_description || tx.description || tx.rawNarration || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

  const amount = (typeof tx.amount === 'number' && !isNaN(tx.amount))
    ? tx.amount.toFixed(2)
    : String(tx.amount || '0');

  const type = String(tx.type || '').trim().toLowerCase();
  const account = String(tx.account || '').trim().toLowerCase();

  return `${date}|${desc}|${amount}|${type}|${account}`;
}

/**
 * Checks a list of transactions for duplicates within the current batch
 * and against existing stored transactions.
 *
 * @param {Array} newTransactions Array of candidate transactions
 * @param {Array} [existingTransactions=[]] Array of already saved transactions
 * @returns {{
 *   uniqueTransactions: Array,
 *   duplicateTransactions: Array,
 *   duplicateCount: number,
 *   seenFingerprints: Set<string>
 * }}
 */
export function detectDuplicates(newTransactions = [], existingTransactions = []) {
  const seenFingerprints = new Set();

  // Index existing stored transactions
  for (const existing of existingTransactions) {
    const fp = existing.fingerprint || generateFingerprint(existing);
    if (fp) {
      seenFingerprints.add(fp);
    }
  }

  const uniqueTransactions = [];
  const duplicateTransactions = [];

  for (const tx of newTransactions) {
    const fp = tx.fingerprint || generateFingerprint(tx);

    if (seenFingerprints.has(fp)) {
      duplicateTransactions.push({
        ...tx,
        is_duplicate: true,
        fingerprint: fp
      });
    } else {
      seenFingerprints.add(fp);
      uniqueTransactions.push({
        ...tx,
        is_duplicate: false,
        fingerprint: fp
      });
    }
  }

  return {
    uniqueTransactions,
    duplicateTransactions,
    duplicateCount: duplicateTransactions.length,
    seenFingerprints
  };
}
