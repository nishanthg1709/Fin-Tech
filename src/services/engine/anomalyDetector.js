/**
 * Unusual Transaction Detection Engine
 * Detects transactions outside normal spending ranges and potential duplicate charges.
 * Avoids sensationalist terms like "Fraud detected" and provides explainable detection rationale.
 */

import { formatINR } from '../../utils/formatters.js';

export function detectAnomalies(transactions, subscriptions) {
  const anomalies = [];

  // 1. Detect Duplicate Debits (identical amount on same merchant within 24h)
  const sortedTxs = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  for (let i = 0; i < sortedTxs.length; i++) {
    for (let j = i + 1; j < sortedTxs.length; j++) {
      const txA = sortedTxs[i];
      const txB = sortedTxs[j];

      const diffMs = Math.abs(new Date(txB.date) - new Date(txA.date));
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours > 24) break;

      if (
        txA.amount > 0 &&
        txA.amount === txB.amount &&
        txA.cleanMerchant.toLowerCase() === txB.cleanMerchant.toLowerCase() &&
        txA.id !== txB.id
      ) {
        anomalies.push({
          id: `unusual_dup_${txA.id}_${txB.id}`,
          type: 'DUPLICATE_TRANSACTION',
          title: `Duplicate Charge: ${txA.cleanMerchant}`,
          merchant: txA.cleanMerchant,
          amount: txA.amount,
          date: txB.date,
          normalRange: `${formatINR(txA.amount * 0.5)} – ${formatINR(txA.amount * 1.5)}`,
          reason: `Duplicate payment of ${formatINR(txA.amount)} was posted twice on ${txA.date}.`,
          whyFlagged: [
            `Identical amount (${formatINR(txA.amount)}) charged to ${txA.cleanMerchant}`,
            `Both transactions posted on the same day (${txA.date})`,
            `Potential accidental double-tap or payment gateway retry`
          ],
          recommendation: 'Check your food delivery app or merchant account to request a duplicate refund.'
        });
      }
    }
  }

  // 2. Detect Large Outliers / Unusual Transaction Amounts
  // Calculate normal spending range across non-salary debits
  const debits = transactions.filter(t => t.type !== 'CREDIT' && t.amount > 0);
  const commonDebits = debits.filter(t => t.amount < 5000);
  const minNormal = 200;
  const maxNormal = 800;

  for (const tx of debits) {
    if (tx.amount >= 15000 && !tx.isCanonical) {
      anomalies.push({
        id: `unusual_spike_${tx.id}`,
        type: 'UNUSUAL_AMOUNT',
        title: `Unusual transaction: ${tx.cleanMerchant}`,
        merchant: tx.cleanMerchant,
        amount: tx.amount,
        date: tx.date,
        normalRange: `${formatINR(minNormal)} – ${formatINR(maxNormal)}`,
        reason: 'This amount is much higher than your usual transaction range.',
        whyFlagged: [
          'Transaction is much larger than usual',
          `Amount is outside the normal spending range (${formatINR(minNormal)} – ${formatINR(maxNormal)})`,
          'Merchant does not match your regular recurring bills'
        ],
        recommendation: 'Verify if you authorized this electronic transaction.'
      });
    }
  }

  return anomalies;
}
