/**
 * Recurring Payment Detection Engine
 * Fully dynamic and dataset-driven cadence detection from real statement transactions.
 * Automatically analyzes merchant, narration descriptions (AUTOPAY, NACH, ACH, MANDATE, SI, etc.),
 * transaction frequency/date intervals, and amount consistency.
 * Supports: Weekly, 1 Month, 3 Months, 6 Months, and 1 Year intervals.
 * Never creates hardcoded fallback subscriptions.
 */

export function detectRecurringExpenses(normalizedTransactions) {
  if (!normalizedTransactions || !Array.isArray(normalizedTransactions) || normalizedTransactions.length === 0) {
    return [];
  }

  // Only evaluate debits / expenses
  const debits = normalizedTransactions.filter(tx => tx.amount > 0 && tx.type !== 'CREDIT');
  if (debits.length === 0) {
    return [];
  }

  // Group transactions by normalized merchant name
  const merchantGroups = {};
  for (const tx of debits) {
    const key = (tx.cleanMerchant && tx.cleanMerchant.trim()) || 
                (tx.merchant && tx.merchant.trim()) || 
                tx.description || 
                'Unknown';
    if (!merchantGroups[key]) {
      merchantGroups[key] = [];
    }
    merchantGroups[key].push(tx);
  }

  const detectedSubscriptions = [];

  for (const [merchantName, txs] of Object.entries(merchantGroups)) {
    // Sort transactions chronologically
    const sorted = [...txs].sort((a, b) => new Date(a.date) - new Date(b.date));
    const count = sorted.length;

    // Check if canonical subscription merchant (Netflix, Spotify, Canva, Adobe, Insurance, Prime)
    const isKnownSubscription = sorted[0].isCanonical && 
      ['Entertainment', 'Productivity', 'Insurance', 'Utilities', 'Bills & Utilities'].includes(sorted[0].category);

    // Concatenate all narration and description text
    const allNarrations = sorted.map(t => `${t.rawNarration || ''} ${t.description || ''} ${t.raw || ''} ${t.merchant || ''}`).join(' ').toUpperCase();

    // Check for standing instruction / mandate / autopay narration keywords
    const hasAutopayKeyword = allNarrations.includes('AUTOPAY') || 
                              allNarrations.includes('NACH') || 
                              allNarrations.includes('ACH') || 
                              allNarrations.includes('MANDATE') || 
                              allNarrations.includes('STANDING INSTRUCTION') || 
                              allNarrations.includes('SI-') || 
                              allNarrations.includes('ECS') || 
                              allNarrations.includes('BBPS') ||
                              allNarrations.includes('SUBSCRIPTION') ||
                              allNarrations.includes('RECURRING') ||
                              allNarrations.includes('AUTO-DEBIT') ||
                              allNarrations.includes('AUTODEBIT');

    // Check for explicit recurrence keywords in narrations
    const hasHalfYearKeyword = allNarrations.includes('SEMI-ANNUAL') || 
                               allNarrations.includes('SEMIANNUAL') || 
                               allNarrations.includes('HALF-YEAR') || 
                               allNarrations.includes('HALF YEARLY') || 
                               allNarrations.includes('HALF-YEARLY') || 
                               allNarrations.includes('6 MONTHS');
    const hasAnnualKeyword = !hasHalfYearKeyword && (
      allNarrations.includes('ANNUAL') || 
      allNarrations.includes('YEARLY') || 
      allNarrations.includes('1 YEAR') || 
      allNarrations.includes('ANNUALLY')
    );
    const hasQuarterlyKeyword = allNarrations.includes('QUARTERLY') || allNarrations.includes('QUARTER');
    const hasWeeklyKeyword = allNarrations.includes('WEEKLY') || allNarrations.includes('1 WEEK');
    const hasMonthlyKeyword = allNarrations.includes('MONTHLY') || allNarrations.includes('1 MONTH');

    // Check if explicit recurring flag is set in uploaded CSV
    const hasExplicitRecurring = sorted.some(tx => 
      tx.recurring === true || 
      tx.isExplicitRecurring === true ||
      String(tx.recurring).toLowerCase() === 'true' ||
      String(tx.recurring).toLowerCase() === 'yes' ||
      String(tx.recurring) === '1' ||
      String(tx.data_type || '').toUpperCase() === 'RECURRING' ||
      String(tx.data_type || '').toUpperCase() === 'SUBSCRIPTION'
    );

    // Skip daily meal/food delivery services unless explicitly marked recurring
    if (['Swiggy', 'Zomato', 'Uber / Ola Rides'].includes(merchantName) && !hasExplicitRecurring && !hasAutopayKeyword) {
      continue;
    }

    // Skip if single transaction and neither known subscription, explicit recurring, nor auto-debit narration
    if (count < 2 && !isKnownSubscription && !hasExplicitRecurring && !hasAutopayKeyword) {
      continue;
    }

    // Calculate day intervals between consecutive charges
    const intervals = [];
    for (let i = 1; i < count; i++) {
      const d1 = new Date(sorted[i - 1].date);
      const d2 = new Date(sorted[i].date);
      const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) intervals.push(diffDays);
    }

    // Check for explicit billing cycle months in CSV row
    const explicitCycleTx = sorted.find(t => t.billing_cycle_months || t.billingCycleMonths);
    const explicitMonths = explicitCycleTx ? Number(explicitCycleTx.billing_cycle_months || explicitCycleTx.billingCycleMonths) : null;

    const avgInterval = intervals.length > 0 
      ? intervals.reduce((a, b) => a + b, 0) / intervals.length 
      : null;

    // Check amount consistency across occurrences
    const amounts = sorted.map(t => Number(t.amount) || 0);
    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);
    const isAmountConsistent = count >= 2 && minAmount > 0 && ((maxAmount - minAmount) / minAmount <= 0.40);

    // If count >= 2 without explicit flags or known status, verify regularity
    if (count >= 2 && !isKnownSubscription && !hasExplicitRecurring && !hasAutopayKeyword) {
      const isRegularCadence = avgInterval !== null && (
        (avgInterval >= 5 && avgInterval <= 12) ||    // Weekly
        (avgInterval >= 20 && avgInterval <= 45) ||   // 1 Month
        (avgInterval >= 70 && avgInterval <= 110) ||  // 3 Months
        (avgInterval >= 150 && avgInterval <= 220) || // 6 Months
        (avgInterval >= 320 && avgInterval <= 400)    // 1 Year
      );

      if (!isRegularCadence && !isAmountConsistent) {
        continue; // Irregular non-recurring spending
      }
    }

    let interval = '1 Month';
    let confidence = 0.85;

    // Determine Cadence based on metadata, narration tokens, or transaction frequency
    if (explicitMonths && !isNaN(explicitMonths) && explicitMonths > 0) {
      if (explicitMonths === 12) interval = '1 Year';
      else if (explicitMonths === 6) interval = '6 Months';
      else if (explicitMonths === 3) interval = '3 Months';
      else if (explicitMonths === 1) interval = '1 Month';
      else interval = `${explicitMonths} Month${explicitMonths > 1 ? 's' : ''}`;
      confidence = 0.98;
    } else if (hasHalfYearKeyword) {
      interval = '6 Months';
      confidence = 0.92;
    } else if (hasQuarterlyKeyword) {
      interval = '3 Months';
      confidence = 0.94;
    } else if (hasAnnualKeyword) {
      interval = '1 Year';
      confidence = 0.94;
    } else if (hasWeeklyKeyword) {
      interval = 'Weekly';
      confidence = 0.92;
    } else if (hasMonthlyKeyword) {
      interval = '1 Month';
      confidence = 0.95;
    } else if (avgInterval !== null) {
      if (avgInterval >= 5 && avgInterval <= 12) {
        interval = 'Weekly';
        confidence = 0.92;
      } else if (avgInterval >= 20 && avgInterval <= 45) {
        interval = '1 Month';
        confidence = 0.95;
      } else if (avgInterval >= 70 && avgInterval <= 110) {
        interval = '3 Months';
        confidence = 0.91;
      } else if (avgInterval >= 150 && avgInterval <= 220) {
        interval = '6 Months';
        confidence = 0.88;
      } else if (avgInterval >= 320 && avgInterval <= 400) {
        interval = '1 Year';
        confidence = 0.85;
      } else if (isKnownSubscription || hasExplicitRecurring || hasAutopayKeyword) {
        interval = sorted[0].defaultInterval || '1 Month';
        confidence = 0.85;
      } else {
        continue; // Not a regular pattern
      }
    } else if (isKnownSubscription) {
      interval = sorted[0].defaultInterval || '1 Month';
      confidence = 0.90;
    } else if (hasAutopayKeyword || hasExplicitRecurring) {
      interval = '1 Month';
      confidence = 0.88;
    } else {
      continue;
    }

    // Compute pricing details in INR
    const latestTx = sorted[sorted.length - 1];
    const firstTx = sorted[0];
    const currentPrice = latestTx.amount;
    const averagePrice = Number((amounts.reduce((a, b) => a + b, 0) / count).toFixed(2));
    const totalSpent = Number(amounts.reduce((a, b) => a + b, 0).toFixed(2));

    // Calculate annual cost & normalized monthly commitment based on interval
    let multiplier = 12; // 1 Month
    let normalizedMonthly = currentPrice;
    if (interval === 'Weekly') {
      multiplier = 52;
      normalizedMonthly = Math.round(currentPrice * 4.33);
    } else if (interval === '3 Months') {
      multiplier = 4;
      normalizedMonthly = Math.round(currentPrice / 3);
    } else if (interval === '6 Months') {
      multiplier = 2;
      normalizedMonthly = Math.round(currentPrice / 6);
    } else if (interval === '1 Year') {
      multiplier = 1;
      normalizedMonthly = Math.round(currentPrice / 12);
    } else if (explicitMonths && explicitMonths > 0) {
      multiplier = 12 / explicitMonths;
      normalizedMonthly = Math.round(currentPrice / explicitMonths);
    }
    const annualCost = Math.round(currentPrice * multiplier);

    // Dynamic explainability reasons
    const whyDetected = [];
    if (hasAutopayKeyword) {
      whyDetected.push(`Mandate / auto-debit detected in transaction narration`);
    }
    if (count >= 2) {
      whyDetected.push(`Detected across ${count} statement transactions with regular ${interval} cadence`);
    } else {
      whyDetected.push(`Recurring commitment identified in statement history`);
    }
    if (isAmountConsistent) {
      whyDetected.push(`Consistent recurring payment amount profile (₹${currentPrice})`);
    } else {
      whyDetected.push(`Recurring cycle confirmed for ${merchantName}`);
    }

    detectedSubscriptions.push({
      id: `sub_${latestTx.merchantId || merchantName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      merchantName,
      category: latestTx.category || 'Other',
      subcategory: latestTx.subcategory,
      icon: latestTx.icon,
      color: latestTx.color,
      interval, // "Weekly" | "1 Month" | "3 Months" | "6 Months" | "1 Year"
      billing_cycle_months: explicitMonths || (interval === '1 Year' ? 12 : interval === '6 Months' ? 6 : interval === '3 Months' ? 3 : interval === 'Weekly' ? 0.25 : 1),
      confidence: Math.round(confidence * 100),
      currentPrice,
      amount: currentPrice,
      averagePrice,
      totalSpent,
      annualCost,
      normalizedMonthly,
      occurrences: count,
      firstBillingDate: firstTx.date,
      lastBillingDate: latestTx.date,
      isActive: true,
      whyDetected,
      cancellationUrl: latestTx.cancellationUrl,
      cancellationDifficulty: latestTx.cancellationDifficulty || 'Medium',
      cancellationSteps: latestTx.cancellationSteps || [],
      history: sorted
    });
  }

  // Sort by highest annual cost
  return detectedSubscriptions.sort((a, b) => b.annualCost - a.annualCost);
}
