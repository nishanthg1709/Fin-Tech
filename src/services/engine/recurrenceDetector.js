/**
 * Recurring Payment Detection & Classification Engine
 * 
 * Analyzes transaction history to distinguish between:
 * 1. Category A — Subscriptions (streaming, software, apps, digital memberships)
 * 2. Category B — Bills & Utilities (telecom, electricity, gas, water, internet)
 * 3. Category C — Financial Commitments (rent, EMI, insurance, loan payments, SIP)
 * 4. Category D — Other Recurring (milk subscriptions, recurring services)
 * 5. Repeated spending that is NOT recurring (e.g. Flipkart, Swiggy with variable amounts/dates)
 * 
 * Calculates exact transparent metrics:
 * frequency, average amount, last payment date, next estimated payment date,
 * observed occurrences, amount variation, and explainability reasons.
 */

// Format date helper for explainability strings (e.g. "Sep 15, 2026" or "Sep 15")
function formatExplainDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

/**
 * Classifies a verified recurring payment into one of the four required categories:
 * - 'SUBSCRIPTION': Actual subscriptions (entertainment, software, streaming, apps)
 * - 'BILL': Bills & Utilities (telecom, internet, electricity, water, gas, DTH)
 * - 'COMMITMENT': Financial Commitments (house rent, EMI, loan, insurance, SIP)
 * - 'OTHER': Other genuine recurring payments
 */
export function classifyRecurringPayment(merchantName = '', category = '', subcategory = '', rawNarrations = '') {
  const text = `${merchantName} ${category} ${subcategory} ${rawNarrations}`.toUpperCase();

  // CATEGORY C — FINANCIAL COMMITMENTS
  if (
    text.includes('RENT') ||
    text.includes('LANDLORD') ||
    text.includes('HOUSE RENT') ||
    text.includes('EMI') ||
    text.includes('LOAN') ||
    text.includes('MORTGAGE') ||
    text.includes('INSURANCE') ||
    text.includes('ERGO') ||
    text.includes('MAX LIFE') ||
    text.includes('HDFC LIFE') ||
    text.includes('ICICI PRU') ||
    text.includes('SBI LIFE') ||
    text.includes('TATA AIA') ||
    text.includes('STAR HEALTH') ||
    text.includes('CARE HEALTH') ||
    text.includes('NIVA BUPA') ||
    text.includes('MAX BUPA') ||
    text.includes('POLICY') ||
    text.includes('PREMIUM') ||
    text.includes('SIP') ||
    text.includes('MUTUAL FUND') ||
    text.includes('BAJAJ FINANCE') ||
    category === 'Insurance' ||
    category === 'Financial Commitments'
  ) {
    return 'COMMITMENT';
  }

  // CATEGORY B — BILLS & UTILITIES
  if (
    text.includes('JIO') ||
    text.includes('AIRTEL') ||
    text.includes('VODAFONE') ||
    text.includes('IDEA') ||
    text.includes('VI ') || text.endsWith(' VI') ||
    text.includes('BSNL') ||
    text.includes('BROADBAND') ||
    text.includes('FIBER') ||
    text.includes('FIBERNET') ||
    text.includes('ACT FIBERNET') ||
    text.includes('HATHWAY') ||
    text.includes('ELECTRICITY') ||
    text.includes('BESCOM') ||
    text.includes('TATA POWER') ||
    text.includes('BSES') ||
    text.includes('POWER') ||
    text.includes('WATER') ||
    text.includes('JAL BOARD') ||
    text.includes('BWSSB') ||
    text.includes('GAS') ||
    text.includes('IGL') ||
    text.includes('MAHANAGAR GAS') ||
    text.includes('DTH') ||
    text.includes('TATA PLAY') ||
    text.includes('TATA SKY') ||
    text.includes('DISH TV') ||
    category === 'Utilities' ||
    category === 'Bills & Utilities'
  ) {
    return 'BILL';
  }

  // CATEGORY A — SUBSCRIPTIONS
  if (
    text.includes('NETFLIX') ||
    text.includes('SPOTIFY') ||
    text.includes('YOUTUBE') ||
    text.includes('PRIME') ||
    text.includes('HOTSTAR') ||
    text.includes('JIOHOTSTAR') ||
    text.includes('SONYLIV') ||
    text.includes('ZEE5') ||
    text.includes('VOOT') ||
    text.includes('AHA') ||
    text.includes('JIOCINEMA') ||
    text.includes('GOOGLE ONE') ||
    text.includes('GOOGLE PLAY') ||
    text.includes('APPLE') ||
    text.includes('ICLOUD') ||
    text.includes('ADOBE') ||
    text.includes('CANVA') ||
    text.includes('MICROSOFT') ||
    text.includes('OFFICE 365') ||
    text.includes('CHATGPT') ||
    text.includes('OPENAI') ||
    text.includes('CLAUDE') ||
    text.includes('NOTION') ||
    text.includes('FIGMA') ||
    text.includes('GITHUB') ||
    text.includes('CULT') ||
    text.includes('FITNESS PASS') ||
    text.includes('GYM') ||
    text.includes('HEADSPACE') ||
    text.includes('AUDIBLE') ||
    text.includes('PLAYSTATION') ||
    text.includes('XBOX') ||
    category === 'Entertainment' ||
    category === 'Productivity' ||
    subcategory === 'Streaming Video' ||
    subcategory === 'Streaming Music' ||
    subcategory === 'Design Software'
  ) {
    return 'SUBSCRIPTION';
  }

  // CATEGORY D — OTHER RECURRING
  return 'OTHER';
}

/**
 * Checks if a merchant is typical variable discretionary spending
 * (shopping, food delivery, groceries, fuel, rides) that must NOT be called recurring
 * unless it has verified consistent periodic mandate patterns.
 */
function isVariableSpendingMerchant(merchantName = '', category = '') {
  const text = `${merchantName} ${category}`.toUpperCase();
  return (
    text.includes('FLIPKART') ||
    text.includes('AMAZON RETAIL') ||
    text.includes('MYNTRA') ||
    text.includes('MEESHO') ||
    text.includes('AJIO') ||
    text.includes('NYKAA') ||
    text.includes('ZARA') ||
    text.includes('SWIGGY') ||
    text.includes('ZOMATO') ||
    text.includes('MCDONALD') ||
    text.includes('STARBUCKS') ||
    text.includes('DOMINO') ||
    text.includes('KFC') ||
    text.includes('BLINKIT') ||
    text.includes('ZEPTO') ||
    text.includes('INSTAMART') ||
    text.includes('BIGBASKET') ||
    text.includes('DMART') ||
    text.includes('MORE SUPERMARKET') ||
    text.includes('RELIANCE RETAIL') ||
    text.includes('RELIANCE FRESH') ||
    text.includes('INDIAN OIL') ||
    text.includes('HPCL') ||
    text.includes('BPCL') ||
    text.includes('SHELL') ||
    text.includes('UBER') ||
    text.includes('OLA') ||
    text.includes('RAPIDO') ||
    text.includes('BOOKMYSHOW') ||
    text.includes('PVR') ||
    text.includes('INOX') ||
    category === 'Food & Dining' ||
    category === 'Shopping'
  );
}

/**
 * Main Recurring Payments Detection Function
 * @param {Array} normalizedTransactions
 * @param {Object} [userOverrides] Map of merchant overrides from user reviews (e.g. { 'Flipkart': 'NOT_RECURRING' })
 * @returns {Array} Array of detected recurring payments with .unconfirmedRepeated attached
 */
export function detectRecurringExpenses(normalizedTransactions, userOverrides = {}) {
  if (!normalizedTransactions || !Array.isArray(normalizedTransactions) || normalizedTransactions.length === 0) {
    const emptyArr = [];
    emptyArr.unconfirmedRepeated = [];
    emptyArr.singlePaymentMerchants = [];
    return emptyArr;
  }

  // Load user overrides from localStorage if in browser environment and not passed
  let overrides = { ...userOverrides };
  if (typeof window !== 'undefined' && window.localStorage && Object.keys(overrides).length === 0) {
    try {
      const stored = localStorage.getItem('smart_expense_recurrence_overrides');
      if (stored) overrides = JSON.parse(stored);
    } catch {}
  }

  // Only evaluate debits / expenses (excluding income, credits, and transfers)
  const debits = normalizedTransactions.filter(tx => tx.amount > 0 && tx.type !== 'CREDIT' && tx.type !== 'income' && tx.type !== 'transfer');
  if (debits.length === 0) {
    const emptyArr = [];
    emptyArr.unconfirmedRepeated = [];
    emptyArr.singlePaymentMerchants = [];
    return emptyArr;
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
  const unconfirmedRepeated = [];
  const singlePaymentMerchants = [];

  for (const [merchantName, txs] of Object.entries(merchantGroups)) {
    // Check if user explicitly dismissed this merchant
    if (overrides[merchantName] === 'NOT_RECURRING') {
      continue;
    }

    // Sort transactions chronologically
    const sorted = [...txs].sort((a, b) => new Date(a.date) - new Date(b.date));
    const count = sorted.length;

    // Single payment check: section 13 requirement
    if (count === 1) {
      // If user explicitly marked it as recurring, respect user choice
      if (overrides[merchantName] !== 'RECURRING') {
        singlePaymentMerchants.push({
          id: `single_${merchantName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          merchantName,
          amount: sorted[0].amount,
          date: sorted[0].date,
          category: sorted[0].category || 'Other',
          reason: 'One payment found. More transaction history is needed to determine whether this is recurring.'
        });
        continue;
      }
    }

    // Check canonical metadata & narrations
    const isKnownSubscription = sorted[0].isCanonical && 
      ['Entertainment', 'Productivity', 'Insurance', 'Utilities', 'Bills & Utilities'].includes(sorted[0].category);

    const allNarrations = sorted.map(t => `${t.rawNarration || ''} ${t.description || ''} ${t.raw || ''} ${t.merchant || ''}`).join(' ').toUpperCase();

    // Check standing instruction / mandate / autopay keywords
    const hasAutopayKeyword = allNarrations.includes('AUTOPAY') || 
                              allNarrations.includes('NACH') || 
                              allNarrations.includes('ACH') || 
                              allNarrations.includes('MANDATE') || 
                              allNarrations.includes('STANDING INSTRUCTION') || 
                              allNarrations.includes('SI-') || 
                              allNarrations.includes('ECS') || 
                              allNarrations.includes('BBPS') || 
                              allNarrations.includes('AUTO-DEBIT') ||
                              allNarrations.includes('AUTODEBIT');

    const hasQuarterlyKeyword = allNarrations.includes('QUARTERLY') || allNarrations.includes('QUARTER');
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
    const hasWeeklyKeyword = allNarrations.includes('WEEKLY') || allNarrations.includes('1 WEEK');
    const hasMonthlyKeyword = allNarrations.includes('MONTHLY') || allNarrations.includes('1 MONTH');

    const hasExplicitRecurring = sorted.some(tx => 
      tx.recurring === true || 
      tx.isExplicitRecurring === true ||
      String(tx.recurring).toLowerCase() === 'true' ||
      String(tx.recurring).toLowerCase() === 'yes' ||
      String(tx.recurring) === '1' ||
      String(tx.data_type || '').toUpperCase() === 'RECURRING' ||
      String(tx.data_type || '').toUpperCase() === 'SUBSCRIPTION'
    );

    // Calculate day intervals between consecutive charges
    const intervals = [];
    for (let i = 1; i < count; i++) {
      const d1 = new Date(sorted[i - 1].date);
      const d2 = new Date(sorted[i].date);
      const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) intervals.push(diffDays);
    }

    const explicitCycleTx = sorted.find(t => t.billing_cycle_months || t.billingCycleMonths);
    const explicitMonths = explicitCycleTx ? Number(explicitCycleTx.billing_cycle_months || explicitCycleTx.billingCycleMonths) : null;

    const avgInterval = intervals.length > 0 
      ? intervals.reduce((a, b) => a + b, 0) / intervals.length 
      : null;

    // Check amount consistency across occurrences
    const amounts = sorted.map(t => Number(t.amount) || 0);
    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);
    const amountVariation = maxAmount - minAmount;
    const amountVariationRatio = minAmount > 0 ? amountVariation / minAmount : 0;
    const isAmountConsistent = count >= 2 && minAmount > 0 && (amountVariationRatio <= 0.35);

    // Interval regularity check
    const isRegularCadence = avgInterval !== null && (
      (avgInterval >= 5 && avgInterval <= 12) ||    // Weekly (~7d)
      (avgInterval >= 20 && avgInterval <= 45) ||   // 1 Month (~30d)
      (avgInterval >= 70 && avgInterval <= 110) ||  // 3 Months (~90d)
      (avgInterval >= 150 && avgInterval <= 220) || // 6 Months (~180d)
      (avgInterval >= 320 && avgInterval <= 400)    // 1 Year (~365d)
    );

    // FALSE POSITIVE & UNCERTAIN PATTERN CHECK: Section 3 & Section 11 requirement
    // E.g. Flipkart with ₹1,299, ₹2,499, ₹899 or Swiggy with irregular dates
    const isVariableSpending = isVariableSpendingMerchant(merchantName, sorted[0].category);
    const isConfirmedByUser = overrides[merchantName] === 'RECURRING';

    if (!isConfirmedByUser && (isVariableSpending || !isRegularCadence || !isAmountConsistent)) {
      if (!isKnownSubscription && !hasExplicitRecurring && !hasAutopayKeyword) {
        // Record as Needs Review / repeated spending, NOT subscription
        if (count >= 2) {
          unconfirmedRepeated.push({
            id: `review_${merchantName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            merchantName,
            count,
            amounts,
            avgAmount: Math.round(amounts.reduce((a, b) => a + b, 0) / count),
            amountVariation,
            lastPaymentDate: sorted[sorted.length - 1].date,
            category: sorted[0].category || 'Shopping',
            reason: 'Repeated merchant activity detected, but payment pattern is inconsistent.'
          });
        }
        continue;
      }
    }

    // Determine Cadence (Interval)
    let interval = '1 Month';
    let frequencyLabel = 'Monthly';
    let approxDays = 30;

    if (explicitMonths && !isNaN(explicitMonths) && explicitMonths > 0) {
      if (explicitMonths === 12) { interval = '1 Year'; frequencyLabel = 'Yearly'; approxDays = 365; }
      else if (explicitMonths === 6) { interval = '6 Months'; frequencyLabel = 'Half-Yearly'; approxDays = 180; }
      else if (explicitMonths === 3) { interval = '3 Months'; frequencyLabel = 'Quarterly'; approxDays = 90; }
      else if (explicitMonths === 1) { interval = '1 Month'; frequencyLabel = 'Monthly'; approxDays = 30; }
      else { interval = `${explicitMonths} Months`; frequencyLabel = `${explicitMonths} Months`; approxDays = explicitMonths * 30; }
    } else if (hasHalfYearKeyword) {
      interval = '6 Months'; frequencyLabel = 'Half-Yearly'; approxDays = 180;
    } else if (hasQuarterlyKeyword) {
      interval = '3 Months'; frequencyLabel = 'Quarterly'; approxDays = 90;
    } else if (hasAnnualKeyword) {
      interval = '1 Year'; frequencyLabel = 'Yearly'; approxDays = 365;
    } else if (hasWeeklyKeyword) {
      interval = 'Weekly'; frequencyLabel = 'Weekly'; approxDays = 7;
    } else if (hasMonthlyKeyword) {
      interval = '1 Month'; frequencyLabel = 'Monthly'; approxDays = 30;
    } else if (avgInterval !== null) {
      if (avgInterval >= 5 && avgInterval <= 12) {
        interval = 'Weekly'; frequencyLabel = 'Weekly'; approxDays = 7;
      } else if (avgInterval >= 20 && avgInterval <= 45) {
        interval = '1 Month'; frequencyLabel = 'Monthly'; approxDays = 30;
      } else if (avgInterval >= 70 && avgInterval <= 110) {
        interval = '3 Months'; frequencyLabel = 'Quarterly'; approxDays = 90;
      } else if (avgInterval >= 150 && avgInterval <= 220) {
        interval = '6 Months'; frequencyLabel = 'Half-Yearly'; approxDays = 180;
      } else if (avgInterval >= 320 && avgInterval <= 400) {
        interval = '1 Year'; frequencyLabel = 'Yearly'; approxDays = 365;
      } else if (isKnownSubscription || hasExplicitRecurring || hasAutopayKeyword) {
        interval = sorted[0].defaultInterval || '1 Month';
        frequencyLabel = interval === '1 Year' ? 'Yearly' : interval === '6 Months' ? 'Half-Yearly' : interval === '3 Months' ? 'Quarterly' : interval === 'Weekly' ? 'Weekly' : 'Monthly';
        approxDays = interval === '1 Year' ? 365 : interval === '6 Months' ? 180 : interval === '3 Months' ? 90 : interval === 'Weekly' ? 7 : 30;
      } else {
        continue;
      }
    } else if (isKnownSubscription) {
      interval = sorted[0].defaultInterval || '1 Month';
      frequencyLabel = interval === '1 Year' ? 'Yearly' : interval === '6 Months' ? 'Half-Yearly' : interval === '3 Months' ? 'Quarterly' : 'Monthly';
      approxDays = interval === '1 Year' ? 365 : interval === '6 Months' ? 180 : interval === '3 Months' ? 90 : 30;
    } else if (hasAutopayKeyword || hasExplicitRecurring) {
      interval = '1 Month'; frequencyLabel = 'Monthly'; approxDays = 30;
    } else {
      continue;
    }

    // Pricing calculations
    const latestTx = sorted[sorted.length - 1];
    const firstTx = sorted[0];
    const currentPrice = latestTx.amount;
    const averagePrice = Math.round(amounts.reduce((a, b) => a + b, 0) / count);
    const totalSpent = Number(amounts.reduce((a, b) => a + b, 0).toFixed(2));

    // Normalized monthly commitment & annual cost
    let multiplier = 12;
    let normalizedMonthly = currentPrice;
    if (interval === 'Weekly') {
      multiplier = 52;
      normalizedMonthly = Math.round((currentPrice * 52) / 12);
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

    // Calculate Next Estimated Payment Date
    const refDate = new Date('2026-10-08T00:00:00');
    const lastDate = new Date(latestTx.date);
    let nextDate = new Date(lastDate);

    if (interval === 'Weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (interval === '3 Months') nextDate.setMonth(nextDate.getMonth() + 3);
    else if (interval === '6 Months') nextDate.setMonth(nextDate.getMonth() + 6);
    else if (interval === '1 Year') nextDate.setFullYear(nextDate.getFullYear() + 1);
    else nextDate.setMonth(nextDate.getMonth() + 1);

    while (nextDate.getTime() < refDate.getTime()) {
      if (interval === 'Weekly') nextDate.setDate(nextDate.getDate() + 7);
      else if (interval === '3 Months') nextDate.setMonth(nextDate.getMonth() + 3);
      else if (interval === '6 Months') nextDate.setMonth(nextDate.getMonth() + 6);
      else if (interval === '1 Year') nextDate.setFullYear(nextDate.getFullYear() + 1);
      else nextDate.setMonth(nextDate.getMonth() + 1);
    }

    const nextEstimatedDate = nextDate.toISOString().split('T')[0];
    const nextDateFormatted = formatShortDate(nextEstimatedDate);

    // Confidence indicator: High confidence | Likely recurring | Needs review
    let confidenceLabel = 'Likely recurring';
    let isNextDateConfident = false;

    if (hasAutopayKeyword || (count >= 3 && amountVariation === 0 && isRegularCadence)) {
      confidenceLabel = 'High confidence';
      isNextDateConfident = true;
    } else if (count >= 2 && isAmountConsistent && isRegularCadence) {
      confidenceLabel = 'Likely recurring';
      isNextDateConfident = count >= 3;
    } else {
      confidenceLabel = 'Needs review';
      isNextDateConfident = false;
    }

    // CLASSIFICATION: Category A, B, C, or D
    const classification = classifyRecurringPayment(merchantName, latestTx.category, latestTx.subcategory, allNarrations);
    const classificationLabel = classification === 'SUBSCRIPTION' ? 'Subscription' :
                                classification === 'BILL' ? 'Bills & Utilities' :
                                classification === 'COMMITMENT' ? 'Financial Commitment' : 'Other Recurring';

    // Exact transparent explainability bullets (Section 10 requirement)
    const whyDetected = [
      `Same merchant found ${count} times`,
      `Average amount: ₹${averagePrice.toLocaleString('en-IN')}`,
      `Payments occur approximately every ${approxDays} days`,
      `Amount variation: ₹${amountVariation.toLocaleString('en-IN')}${amountVariation === 0 ? ' (stable pricing)' : ''}`,
      `Last payment: ${formatExplainDate(latestTx.date)}`
    ];

    detectedSubscriptions.push({
      id: `sub_${latestTx.merchantId || merchantName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      merchantName,
      category: latestTx.category || 'Other',
      subcategory: latestTx.subcategory,
      classification, // 'SUBSCRIPTION' | 'BILL' | 'COMMITMENT' | 'OTHER'
      classificationLabel,
      icon: latestTx.icon,
      color: latestTx.color,
      interval, // '1 Month' | '3 Months' | '6 Months' | '1 Year' | 'Weekly'
      frequencyLabel, // 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly' | 'Weekly'
      confidenceLabel, // 'High confidence' | 'Likely recurring' | 'Needs review'
      confidence: confidenceLabel === 'High confidence' ? 98 : confidenceLabel === 'Likely recurring' ? 88 : 72,
      currentPrice,
      amount: currentPrice,
      averagePrice,
      amountVariation,
      approxDays,
      totalSpent,
      annualCost,
      normalizedMonthly,
      occurrences: count,
      firstBillingDate: firstTx.date,
      lastBillingDate: latestTx.date,
      nextEstimatedDate,
      nextDateFormatted,
      isNextDateConfident,
      isActive: true,
      whyDetected,
      cancellationUrl: latestTx.cancellationUrl,
      cancellationDifficulty: latestTx.cancellationDifficulty || 'Medium',
      cancellationSteps: latestTx.cancellationSteps || [],
      history: sorted
    });
  }

  // Sort by highest annual cost
  detectedSubscriptions.sort((a, b) => b.annualCost - a.annualCost);

  // Attach unconfirmed and single payments metadata
  detectedSubscriptions.unconfirmedRepeated = unconfirmedRepeated;
  detectedSubscriptions.singlePaymentMerchants = singlePaymentMerchants;

  return detectedSubscriptions;
}

export function analyzeRecurringPayments(normalizedTransactions, userOverrides = {}) {
  const result = detectRecurringExpenses(normalizedTransactions, userOverrides);
  return {
    recurringPayments: result,
    subscriptions: result.filter(r => r.classification === 'SUBSCRIPTION'),
    bills: result.filter(r => r.classification === 'BILL'),
    commitments: result.filter(r => r.classification === 'COMMITMENT'),
    other: result.filter(r => r.classification === 'OTHER'),
    unconfirmedRepeated: result.unconfirmedRepeated || [],
    singlePaymentMerchants: result.singlePaymentMerchants || []
  };
}
