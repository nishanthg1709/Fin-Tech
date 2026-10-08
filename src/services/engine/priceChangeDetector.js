/**
 * Price Change Detection Engine
 * Detects when a recurring payment becomes more expensive over time.
 * Provides clear, human-understandable explanations for users and hackathon judges.
 */

import { formatINR } from '../../utils/formatters.js';

export function detectPriceChanges(subscriptions) {
  const priceChanges = [];

  for (const sub of subscriptions) {
    if (!sub.history || sub.history.length < 2) continue;

    // Track distinct price points chronologically
    const distinctPricePoints = [];
    let previousAmount = null;

    for (const tx of sub.history) {
      if (previousAmount === null) {
        distinctPricePoints.push({
          date: tx.date,
          amount: tx.amount
        });
        previousAmount = tx.amount;
      } else if (Math.abs(tx.amount - previousAmount) >= 5) {
        // Price shifted by at least ₹5
        distinctPricePoints.push({
          date: tx.date,
          amount: tx.amount,
          previousAmount
        });
        previousAmount = tx.amount;
      }
    }

    if (distinctPricePoints.length > 1) {
      const latestChange = distinctPricePoints[distinctPricePoints.length - 1];
      const baselinePrice = latestChange.previousAmount;
      const newPrice = latestChange.amount;
      const difference = Number((newPrice - baselinePrice).toFixed(2));
      const percentageChange = Number(((difference / baselinePrice) * 100).toFixed(1));

      // Calculate annual impact based on interval
      let multiplier = 12; // 1 Month
      if (sub.interval === '3 Months') multiplier = 4;
      if (sub.interval === '6 Months') multiplier = 2;
      if (sub.interval === '1 Year') multiplier = 1;

      const annualImpact = difference * multiplier;

      // Plain, understandable explanation as instructed
      const explanation = `Your latest ${sub.merchantName} payment was ${formatINR(difference)} higher than the previous payment.`;
      const annualExplanation = `Estimated additional yearly cost: ${formatINR(annualImpact)}`;

      priceChanges.push({
        id: `change_${sub.id}_${latestChange.date}`,
        subscriptionId: sub.id,
        merchantName: sub.merchantName,
        category: sub.category,
        icon: sub.icon,
        color: sub.color,
        interval: sub.interval,
        oldPrice: baselinePrice,
        newPrice: newPrice,
        difference,
        percentageChange,
        isIncrease: difference > 0,
        effectiveDate: latestChange.date,
        annualImpact,
        explanation,
        annualExplanation,
        priceHistory: distinctPricePoints
      });
    }
  }

  // Sort by highest price jump
  return priceChanges.sort((a, b) => b.difference - a.difference);
}
