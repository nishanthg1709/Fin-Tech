/**
 * Category Engine
 * Reusable, decoupled categorization service that assigns standardized categories
 * based on normalized merchant names, narration keywords, and transaction patterns.
 *
 * CANONICAL CATEGORIES:
 * - Food
 * - Shopping
 * - Transport
 * - Entertainment
 * - Healthcare
 * - Bills
 * - Utilities
 * - Salary
 * - Banking Fees
 * - Transfer
 * - Other
 */

export const CANONICAL_CATEGORIES = [
  'Food',
  'Shopping',
  'Transport',
  'Entertainment',
  'Healthcare',
  'Bills',
  'Utilities',
  'Salary',
  'Banking Fees',
  'Transfer',
  'Other'
];

/**
 * Assigns a canonical category to a transaction.
 *
 * @param {string} merchant Normalized merchant name
 * @param {string} originalDescription Full raw bank description
 * @param {Object} [options={}] Additional context (e.g. rawCategory, type, matchedEntry)
 * @returns {string} One of the canonical categories
 */
export function assignCategory(merchant = '', originalDescription = '', options = {}) {
  const { matchedEntry, rawCategory, type } = options;

  // 1. If merchant matched a dictionary entry with a defined defaultCategory
  if (matchedEntry?.defaultCategory) {
    return matchedEntry.defaultCategory;
  }

  const text = `${merchant} ${originalDescription} ${rawCategory || ''}`.toUpperCase();

  // 2. Salary (Income)
  if (
    type === 'income' && (
      text.includes('SALARY') ||
      text.includes('PAYROLL') ||
      text.includes('WAGES') ||
      text.includes('STIPEND') ||
      text.includes('BONUS')
    )
  ) {
    return 'Salary';
  }

  // 3. Banking Fees & Charges
  if (
    text.includes('BANK CHARGES') ||
    text.includes('ANNUAL FEE') ||
    text.includes('ATM FEE') ||
    text.includes('SMS CHARGES') ||
    text.includes('FINANCE CHARGES') ||
    text.includes('LATE FEE') ||
    text.includes('INTEREST DEBIT') ||
    text.includes('MIN BAL CHG') ||
    text.includes('SERVICE CHARGE')
  ) {
    return 'Banking Fees';
  }

  // 4. Food & Dining
  if (
    text.includes('SWIGGY') ||
    text.includes('ZOMATO') ||
    text.includes('STARBUCKS') ||
    text.includes('MCDONALD') ||
    text.includes('DOMINO') ||
    text.includes('PIZZA') ||
    text.includes('BURGER') ||
    text.includes('KFC') ||
    text.includes('SUBWAY') ||
    text.includes('CAFE') ||
    text.includes('COFFEE') ||
    text.includes('RESTAURANT') ||
    text.includes('DINING') ||
    text.includes('BAKERY') ||
    text.includes('CHAAYOS') ||
    text.includes('CHAI') ||
    text.includes('BLUE TOKAI') ||
    text.includes('BLINKIT') ||
    text.includes('ZEPTO') ||
    text.includes('BIGBASKET') ||
    text.includes('INSTAMART') ||
    text.includes('DMART') ||
    text.includes('SUPERMARKET') ||
    text.includes('GROCERY')
  ) {
    return 'Food';
  }

  // 5. Shopping & E-Commerce
  if (
    text.includes('AMAZON') ||
    text.includes('AMZN') ||
    text.includes('FLIPKART') ||
    text.includes('MYNTRA') ||
    text.includes('AJIO') ||
    text.includes('NYKAA') ||
    text.includes('MEESHO') ||
    text.includes('ZARA') ||
    text.includes('H&M') ||
    text.includes('DECATHLON') ||
    text.includes('RETAIL') ||
    text.includes('STORE') ||
    text.includes('APPAREL') ||
    text.includes('CLOTHING') ||
    text.includes('ELECTRONICS') ||
    text.includes('CROMA') ||
    text.includes('RELIANCE DIGITAL')
  ) {
    return 'Shopping';
  }

  // 6. Transport & Travel
  if (
    text.includes('UBER') ||
    text.includes('OLA') ||
    text.includes('RAPIDO') ||
    text.includes('TAXI') ||
    text.includes('CAB') ||
    text.includes('PETROL') ||
    text.includes('DIESEL') ||
    text.includes('FUEL') ||
    text.includes('SHELL') ||
    text.includes('INDIAN OIL') ||
    text.includes('BPCL') ||
    text.includes('HPCL') ||
    text.includes('METRO') ||
    text.includes('IRCTC') ||
    text.includes('RAILWAY') ||
    text.includes('FLIGHT') ||
    text.includes('AIRLINE') ||
    text.includes('INDIGO') ||
    text.includes('AIR INDIA') ||
    text.includes('MAKEMYTRIP') ||
    text.includes('MMT') ||
    text.includes('GOIBIBO')
  ) {
    return 'Transport';
  }

  // 7. Entertainment & Media
  if (
    text.includes('NETFLIX') ||
    text.includes('SPOTIFY') ||
    text.includes('YOUTUBE') ||
    text.includes('HOTSTAR') ||
    text.includes('SONYLIV') ||
    text.includes('ZEE5') ||
    text.includes('PRIME VIDEO') ||
    text.includes('BOOKMYSHOW') ||
    text.includes('PVR') ||
    text.includes('INOX') ||
    text.includes('CINEMA') ||
    text.includes('THEATRE') ||
    text.includes('CANVA') ||
    text.includes('ADOBE') ||
    text.includes('AUDIBLE') ||
    text.includes('PLAYSTATION') ||
    text.includes('XBOX') ||
    text.includes('STEAM')
  ) {
    return 'Entertainment';
  }

  // 8. Healthcare & Medical
  if (
    text.includes('APOLLO') ||
    text.includes('PHARMACY') ||
    text.includes('PHARMEASY') ||
    text.includes('1MG') ||
    text.includes('NETMEDS') ||
    text.includes('MEDPLUS') ||
    text.includes('HOSPITAL') ||
    text.includes('CLINIC') ||
    text.includes('DOCTOR') ||
    text.includes('HEALTH') ||
    text.includes('DENTAL') ||
    text.includes('DIAGNOSTICS') ||
    text.includes('LAB') ||
    text.includes('CULT.FIT') ||
    text.includes('CULTFIT') ||
    text.includes('GYM') ||
    text.includes('FITNESS')
  ) {
    return 'Healthcare';
  }

  // 9. Bills & Subscriptions
  if (
    text.includes('JIO') ||
    text.includes('AIRTEL') ||
    text.includes('VODAFONE') ||
    text.includes('IDEA') ||
    text.includes(' VI ') ||
    text.includes('RECHARGE') ||
    text.includes('BROADBAND') ||
    text.includes('FIBER') ||
    text.includes('ACT FIBERNET') ||
    text.includes('DTH') ||
    text.includes('TATA PLAY') ||
    text.includes('TATA SKY') ||
    text.includes('RENT') ||
    text.includes('LANDLORD') ||
    text.includes('EMI') ||
    text.includes('LOAN') ||
    text.includes('INSURANCE') ||
    text.includes('POLICY') ||
    text.includes('PREMIUM') ||
    text.includes('SIP')
  ) {
    return 'Bills';
  }

  // 10. Utilities
  if (
    text.includes('ELECTRICITY') ||
    text.includes('BESCOM') ||
    text.includes('TATA POWER') ||
    text.includes('BSES') ||
    text.includes('POWER') ||
    text.includes('WATER') ||
    text.includes('GAS') ||
    text.includes('MAHANAGAR GAS') ||
    text.includes('IGL') ||
    text.includes('MUNICIPAL') ||
    text.includes('UTILITIES') ||
    text.includes('GOOGLE') ||
    text.includes('MICROSOFT') ||
    text.includes('CHATGPT') ||
    text.includes('OPENAI')
  ) {
    return 'Utilities';
  }

  // 11. Normalize existing category if provided in CSV
  if (rawCategory && typeof rawCategory === 'string' && rawCategory !== 'Other') {
    const rawUpper = rawCategory.trim().toUpperCase();
    if (rawUpper.includes('FOOD') || rawUpper.includes('DINING')) return 'Food';
    if (rawUpper.includes('SHOPPING') || rawUpper.includes('RETAIL')) return 'Shopping';
    if (rawUpper.includes('TRANS') || rawUpper.includes('COMMUTE')) return 'Transport';
    if (rawUpper.includes('ENTERTAIN')) return 'Entertainment';
    if (rawUpper.includes('HEALTH') || rawUpper.includes('FITNESS') || rawUpper.includes('MED')) return 'Healthcare';
    if (rawUpper.includes('BILL') || rawUpper.includes('COMM')) return 'Bills';
    if (rawUpper.includes('UTIL')) return 'Utilities';
    if (rawUpper.includes('SALARY') || rawUpper.includes('INCOME')) return 'Salary';
    if (rawUpper.includes('FEE') || rawUpper.includes('CHARGE')) return 'Banking Fees';
    if (rawUpper.includes('TRANSFER')) return 'Transfer';
  }

  return 'Other';
}
