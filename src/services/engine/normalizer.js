/**
 * Transaction Normalization & Cleansing Engine
 * Transforms messy raw bank narrations into clean canonical merchants with categories and metadata.
 */

import { CANONICAL_MERCHANTS } from '../../data/canonicalMerchants.js';

const PREFIX_PATTERNS = [
  /^UPI\s*[-:]\s*/i,
  /^NACH\s*[-:]\s*/i,
  /^CARD\s*[-:]\s*/i,
  /^POS\s*[-:]\s*/i,
  /^NEFT\s*[-:]\s*/i,
  /^IMPS\s*[-:]\s*/i,
  /^RTGS\s*[-:]\s*/i,
  /^ECS\s*[-:]\s*/i,
  /^POS\s+DEBIT\s*[-:]?\s*/i,
  /^POS\s+PURCHASE\s*[-:]?\s*/i,
  /^ACH\s+(?:WITHDRAWAL|DEBIT|PAYMENT)\s*[-:]?\s*/i,
  /^ACH\s*[-:]\s*/i,
  /^DIRECT\s+DEBIT\s*[-:]?\s*/i,
  /^DD\s*\*\s*/i,
  /^CHECKCARD\s*\d*\s*[-:]?\s*/i,
  /^RECURRING\s+(?:PAYMENT|CHARGE|BILL)\s*[-:]?\s*/i,
  /^CARD\s+PUR\s*[-:]?\s*/i,
  /^STRIPE\*\s*/i,
  /^SQ\s*\*\s*/i,
  /^PAYPAL\s*\*\s*/i,
  /^PURCHASE\s+AT\s*/i,
  /^ONLINE\s+PAYMENT\s*/i
];

const SUFFIX_LOCATION_PATTERNS = [
  /\b[A-Z]{2}\s+(?:US|USA|CA|NY|TX|WA|IL|FL|SE|GB|UK)\b/i,
  /\b(?:LOS GATOS|SAN FRANCISCO|SEATTLE|STOCKHOLM|NEW YORK|AUSTIN|CHICAGO)\s+[A-Z]{2}\b/i,
  /\b\d{5}(?:-\d{4})?\b/, // US Zip code
  /\*\s*[A-Z0-9]{5,}\b/,  // Asterisk followed by alphanumeric ref code
  /\bREF(?:#|:)?\s*[A-Z0-9]+\b/i,
  /\bID:\s*[A-Z0-9]+\b/i,
  /\bP\d{6,}\b/i          // Reference codes like P19827364
];

/**
 * Normalizes a raw bank narration string
 * @param {string} rawNarration
 * @param {string} [suggestedCategory]
 * @returns {Object} Cleaned merchant details
 */
export function normalizeTransaction(rawNarration, suggestedCategory = 'Other') {
  if (!rawNarration) {
    return {
      raw: '',
      cleanMerchant: 'Unknown Transaction',
      category: suggestedCategory,
      subcategory: 'Uncategorized',
      icon: 'receipt',
      color: '#64748B',
      confidence: 0.5,
      isCanonical: false
    };
  }

  // 1. Check against Canonical Merchants list first for highest accuracy
  for (const merchant of CANONICAL_MERCHANTS) {
    const matched = merchant.patterns.some(pattern => pattern.test(rawNarration));
    if (matched) {
      return {
        raw: rawNarration,
        merchantId: merchant.id,
        cleanMerchant: merchant.name,
        category: merchant.category,
        subcategory: merchant.subcategory,
        icon: merchant.icon,
        color: merchant.color,
        website: merchant.website,
        cancellationUrl: merchant.cancellationUrl,
        cancellationDifficulty: merchant.cancellationDifficulty,
        cancellationSteps: merchant.cancellationSteps,
        confidence: 0.98,
        isCanonical: true
      };
    }
  }

  // 2. Perform algorithmic cleaning for non-canonical merchants
  let cleaned = rawNarration.trim();

  // Strip prefixes
  for (const prefix of PREFIX_PATTERNS) {
    cleaned = cleaned.replace(prefix, '');
  }

  // Strip location & ref suffixes
  for (const suffix of SUFFIX_LOCATION_PATTERNS) {
    cleaned = cleaned.replace(suffix, '');
  }

  // Clean trailing punctuation and extra spaces
  cleaned = cleaned
    .replace(/[*#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Smart capitalization
  const words = cleaned.toLowerCase().split(' ').filter(Boolean);
  const formattedMerchant = words
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || rawNarration;

  // Derive inferred category
  const inferredCategory = inferCategoryFromText(formattedMerchant, suggestedCategory);

  return {
    raw: rawNarration,
    cleanMerchant: formattedMerchant,
    category: inferredCategory,
    subcategory: 'General Expense',
    icon: 'credit-card',
    color: '#3B82F6',
    confidence: 0.82,
    isCanonical: false,
    cancellationDifficulty: 'Medium'
  };
}

function inferCategoryFromText(text, fallback) {
  const lower = text.toLowerCase();
  if (/market|grocery|whole foods|trader joe|kroger|safeway|supermarket/i.test(lower)) {
    return 'Food & Dining';
  }
  if (/coffee|starbucks|blue bottle|dunkin|cafe/i.test(lower)) {
    return 'Food & Dining';
  }
  if (/uber|lyft|taxi|transit|metro|gas|shell|chevron/i.test(lower)) {
    return 'Transportation';
  }
  if (/hotel|airbnb|airline|delta|united|flight/i.test(lower)) {
    return 'Travel';
  }
  if (/hospital|clinic|pharmacy|cvs|walgreens|doctor/i.test(lower)) {
    return 'Health & Fitness';
  }
  if (/electric|water|gas|utility|conedison|pge/i.test(lower)) {
    return 'Utilities & Telecom';
  }
  return fallback || 'Other';
}
