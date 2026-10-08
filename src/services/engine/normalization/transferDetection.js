/**
 * Internal and Peer Transfer Detection Engine
 * Conservatively identifies transactions that represent fund transfers rather
 * than normal spending or business income.
 */

const CONFIDENT_TRANSFER_PATTERNS = [
  /\bSELF\s+TRANSFER\b/i,
  /\bOWN\s+A\/?C\b/i,
  /\bOWN\s+ACCOUNT\b/i,
  /\bINTERNAL\s+TRANSFER\b/i,
  /\bFUNDS?\s+TRANSFER\b/i,
  /\bUPI\s+TRANSFER\b/i,
  /\bIMPS\s+TRANSFER\b/i,
  /\bNEFT\s+TRANSFER\b/i,
  /\bRTGS\s+TRANSFER\b/i,
  /\bSWEEP\s+(?:TRANSFER|TRF|IN|OUT)\b/i,
  /\bTRF\s+TO\s+(?:SAVING|CURRENT|OWN|A\/C)\b/i,
  /\bTRF\s+FROM\s+(?:SAVING|CURRENT|OWN|A\/C)\b/i,
  /\bTRANSFER\s+TO\s+(?:SAVINGS?|CURRENT|MY\s+ACCOUNT|FRIEND)\b/i,
  /\bTRANSFER\s+FROM\s+(?:SAVINGS?|CURRENT|MY\s+ACCOUNT|FRIEND)\b/i,
  /\bPEER\s+(?:TO\s+PEER\s+)?TRANSFER\b/i,
  /\bP2P\s+TRANSFER\b/i,
  /\bLINKED\s+ACCOUNT\s+TRF\b/i,
  /\bINTER-ACCOUNT\b/i,
  /\bAUTO-SWEEP\b/i
];

/**
 * Checks whether a transaction is a confident internal or account transfer.
 *
 * @param {string} originalDescription
 * @param {string} [merchant='']
 * @returns {{ isTransfer: boolean, confidence: number }}
 */
export function detectTransfer(originalDescription = '', merchant = '') {
  const text = `${originalDescription} ${merchant}`.trim();
  if (!text) {
    return { isTransfer: false, confidence: 0 };
  }

  for (const pattern of CONFIDENT_TRANSFER_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isTransfer: true,
        confidence: 0.95
      };
    }
  }

  return {
    isTransfer: false,
    confidence: 0
  };
}
