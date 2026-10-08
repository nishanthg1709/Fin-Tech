/**
 * Merchant Normalization Engine
 * Normalizes raw transaction descriptions into clean canonical merchant names
 * using a maintainable keyword dictionary and intelligent algorithmic cleansing.
 *
 * CRITICAL RULE:
 * Never modifies or overwrites the original_description.
 */

// Maintainable Merchant Knowledge Base
export const MERCHANT_DICTIONARY = [
  // E-commerce & Shopping
  {
    merchant: 'Amazon',
    keywords: ['amazon', 'amzn', 'amazon pay', 'amazon.in', 'amazon seller', 'amzn mktp'],
    defaultCategory: 'Shopping'
  },
  {
    merchant: 'Flipkart',
    keywords: ['flipkart', 'flipkart internet', 'fkart'],
    defaultCategory: 'Shopping'
  },
  {
    merchant: 'Myntra',
    keywords: ['myntra', 'myntra designs'],
    defaultCategory: 'Shopping'
  },
  {
    merchant: 'Ajio',
    keywords: ['ajio', 'reliance retail ajio'],
    defaultCategory: 'Shopping'
  },
  {
    merchant: 'Nykaa',
    keywords: ['nykaa', 'fsn e-commerce'],
    defaultCategory: 'Shopping'
  },
  {
    merchant: 'Meesho',
    keywords: ['meesho', 'fashnear'],
    defaultCategory: 'Shopping'
  },
  {
    merchant: 'Decathlon',
    keywords: ['decathlon', 'decathlon sports'],
    defaultCategory: 'Shopping'
  },

  // Food & Dining
  {
    merchant: 'Swiggy',
    keywords: ['swiggy', 'bundl technologies'],
    defaultCategory: 'Food'
  },
  {
    merchant: 'Zomato',
    keywords: ['zomato', 'zomato limited', 'zomato media'],
    defaultCategory: 'Food'
  },
  {
    merchant: 'Starbucks',
    keywords: ['starbucks', 'tata starbucks'],
    defaultCategory: 'Food'
  },
  {
    merchant: 'McDonald\'s',
    keywords: ['mcdonald', 'mcdonalds', 'hardcastle'],
    defaultCategory: 'Food'
  },
  {
    merchant: 'Domino\'s',
    keywords: ['domino', 'dominos', 'jubilant foodworks'],
    defaultCategory: 'Food'
  },
  {
    merchant: 'KFC',
    keywords: ['kfc', 'yum restaurants'],
    defaultCategory: 'Food'
  },
  {
    merchant: 'Blue Tokai',
    keywords: ['blue tokai'],
    defaultCategory: 'Food'
  },
  {
    merchant: 'Chaayos',
    keywords: ['chaayos', 'sunshine teahouse'],
    defaultCategory: 'Food'
  },

  // Quick Commerce & Groceries
  {
    merchant: 'Blinkit',
    keywords: ['blinkit', 'grofers'],
    defaultCategory: 'Food'
  },
  {
    merchant: 'Zepto',
    keywords: ['zepto', 'kiranakart'],
    defaultCategory: 'Food'
  },
  {
    merchant: 'BigBasket',
    keywords: ['bigbasket', 'innovative retail'],
    defaultCategory: 'Food'
  },
  {
    merchant: 'DMart',
    keywords: ['dmart', 'avenue supermarts'],
    defaultCategory: 'Food'
  },
  {
    merchant: 'Nature\'s Basket',
    keywords: ['nature\'s basket', 'natures basket'],
    defaultCategory: 'Food'
  },

  // Travel & Transportation
  {
    merchant: 'Uber',
    keywords: ['uber', 'uber india', 'uber bv', 'uber trip'],
    defaultCategory: 'Transport'
  },
  {
    merchant: 'Ola Cabs',
    keywords: ['ola', 'olacabs', 'ani technologies'],
    defaultCategory: 'Transport'
  },
  {
    merchant: 'Rapido',
    keywords: ['rapido', 'roppen transportation'],
    defaultCategory: 'Transport'
  },
  {
    merchant: 'IRCTC',
    keywords: ['irctc', 'indian railway'],
    defaultCategory: 'Transport'
  },
  {
    merchant: 'MakeMyTrip',
    keywords: ['makemytrip', 'mmt'],
    defaultCategory: 'Transport'
  },
  {
    merchant: 'Shell',
    keywords: ['shell', 'shell petrol'],
    defaultCategory: 'Transport'
  },
  {
    merchant: 'Indian Oil',
    keywords: ['indian oil', 'indianoil', 'iocl'],
    defaultCategory: 'Transport'
  },
  {
    merchant: 'Bharat Petroleum',
    keywords: ['bharat petroleum', 'bpcl'],
    defaultCategory: 'Transport'
  },
  {
    merchant: 'Hindustan Petroleum',
    keywords: ['hindustan petroleum', 'hpcl'],
    defaultCategory: 'Transport'
  },

  // Entertainment & Streaming
  {
    merchant: 'Netflix',
    keywords: ['netflix', 'nflx', 'netflix.com', 'netflix entertainment'],
    defaultCategory: 'Entertainment'
  },
  {
    merchant: 'Spotify',
    keywords: ['spotify', 'spotify premium', 'spotify india'],
    defaultCategory: 'Entertainment'
  },
  {
    merchant: 'YouTube Premium',
    keywords: ['youtube', 'youtube premium', 'yt premium', 'google youtube'],
    defaultCategory: 'Entertainment'
  },
  {
    merchant: 'Amazon Prime',
    keywords: ['amazon prime', 'prime video', 'amzn prime'],
    defaultCategory: 'Entertainment'
  },
  {
    merchant: 'Disney+ Hotstar',
    keywords: ['hotstar', 'jiohotstar', 'disney hotstar'],
    defaultCategory: 'Entertainment'
  },
  {
    merchant: 'SonyLIV',
    keywords: ['sonyliv', 'sony liv'],
    defaultCategory: 'Entertainment'
  },
  {
    merchant: 'Zee5',
    keywords: ['zee5', 'zee entertainment'],
    defaultCategory: 'Entertainment'
  },
  {
    merchant: 'BookMyShow',
    keywords: ['bookmyshow', 'bms', 'bigtree entertainment'],
    defaultCategory: 'Entertainment'
  },
  {
    merchant: 'PVR Inox',
    keywords: ['pvr', 'inox', 'pvr inox', 'pvr cinemas'],
    defaultCategory: 'Entertainment'
  },

  // Tech, Productivity & Cloud
  {
    merchant: 'Apple',
    keywords: ['apple', 'itunes', 'apple.com', 'icloud', 'app store'],
    defaultCategory: 'Entertainment'
  },
  {
    merchant: 'Google',
    keywords: ['google', 'google one', 'google play', 'gsuite', 'google storage', 'google services'],
    defaultCategory: 'Utilities'
  },
  {
    merchant: 'Microsoft',
    keywords: ['microsoft', 'msft', 'office 365', 'microsoft 365', 'onedrive'],
    defaultCategory: 'Utilities'
  },
  {
    merchant: 'Adobe',
    keywords: ['adobe', 'adobe systems', 'adobe creative', 'photoshop'],
    defaultCategory: 'Entertainment'
  },
  {
    merchant: 'Canva',
    keywords: ['canva', 'canva pty', 'canva pro'],
    defaultCategory: 'Entertainment'
  },
  {
    merchant: 'ChatGPT',
    keywords: ['chatgpt', 'openai'],
    defaultCategory: 'Utilities'
  },
  {
    merchant: 'Claude',
    keywords: ['claude', 'anthropic'],
    defaultCategory: 'Utilities'
  },

  // Telecom, Bills & Utilities
  {
    merchant: 'Jio',
    keywords: ['jio', 'reliance jio', 'jio recharge', 'jio prepaid', 'jio fiber', 'jiocinema'],
    defaultCategory: 'Bills'
  },
  {
    merchant: 'Airtel',
    keywords: ['airtel', 'bharti airtel', 'airtel broadband', 'airtel prepaid', 'airtel dth'],
    defaultCategory: 'Bills'
  },
  {
    merchant: 'Vodafone Idea (Vi)',
    keywords: ['vodafone', 'idea cellular', ' vi ', 'vi recharge', 'vi postpaid'],
    defaultCategory: 'Bills'
  },
  {
    merchant: 'BESCOM Electricity',
    keywords: ['bescom', 'bangalore electricity', 'kptcl'],
    defaultCategory: 'Utilities'
  },
  {
    merchant: 'Tata Power',
    keywords: ['tata power', 'tpddl'],
    defaultCategory: 'Utilities'
  },
  {
    merchant: 'BSES Electricity',
    keywords: ['bses', 'bses rajdhani', 'bses yamuna'],
    defaultCategory: 'Utilities'
  },
  {
    merchant: 'Mahanagar Gas',
    keywords: ['mahanagar gas', 'mgl', 'igl', 'indraprastha gas'],
    defaultCategory: 'Utilities'
  },
  {
    merchant: 'Tata Play',
    keywords: ['tata play', 'tata sky'],
    defaultCategory: 'Bills'
  },

  // Healthcare & Fitness
  {
    merchant: 'Apollo Pharmacy',
    keywords: ['apollo', 'apollo pharmacy', 'apollo hospitals'],
    defaultCategory: 'Healthcare'
  },
  {
    merchant: 'PharmEasy',
    keywords: ['pharmeasy', 'axelia solutions'],
    defaultCategory: 'Healthcare'
  },
  {
    merchant: 'Tata 1mg',
    keywords: ['1mg', 'tata 1mg'],
    defaultCategory: 'Healthcare'
  },
  {
    merchant: 'Cult.fit',
    keywords: ['cult.fit', 'cultfit', 'curefit', 'cult pass'],
    defaultCategory: 'Healthcare'
  },
  {
    merchant: 'HDFC ERGO Insurance',
    keywords: ['hdfc ergo', 'ergo health'],
    defaultCategory: 'Healthcare'
  },

  // Financial Commitments & Rent
  {
    merchant: 'House Rent',
    keywords: ['house rent', 'flat rent', 'landlord', 'rent payment', 'rental'],
    defaultCategory: 'Bills'
  },
  {
    merchant: 'Home Loan EMI',
    keywords: ['home loan', 'housing loan', 'hml emi'],
    defaultCategory: 'Bills'
  },
  {
    merchant: 'Salary Credit',
    keywords: ['salary', 'salary credit', 'payroll', 'wages'],
    defaultCategory: 'Salary'
  }
];

// Prefixes commonly found in Indian & international bank narrations
const NARRATION_PREFIXES = [
  /^UPI\s*[-:/]\s*/i,
  /^NACH\s*[-:/]\s*/i,
  /^CARD\s*[-:/]\s*/i,
  /^POS\s*[-:/]\s*/i,
  /^NEFT\s*[-:/]\s*/i,
  /^IMPS\s*[-:/]\s*/i,
  /^RTGS\s*[-:/]\s*/i,
  /^ECS\s*[-:/]\s*/i,
  /^ACH\s*[-:/]\s*/i,
  /^BBPS\s*[-:/]\s*/i,
  /^ATM\s*[-:/]\s*/i,
  /^DD\s*[-:/]\s*/i,
  /^SI\s*[-:/]\s*/i,
  /^STANDING\s+INSTRUCTION\s*[-:/]\s*/i,
  /^PURCHASE\s+(?:AT|ON)\s+/i,
  /^ONLINE\s+PAYMENT\s+(?:TO|FOR)?\s*/i,
  /^DIRECT\s+DEBIT\s*[-:/]\s*/i,
  /^PAYMENT\s+(?:TO|FOR)\s+/i,
  /^CHECKCARD\s*\d*\s*[-:/]?\s*/i
];

// Suffixes commonly found in bank narrations
const NARRATION_SUFFIXES = [
  /\b[A-Z]{2}\s+(?:US|USA|IN|IND|CA|UK|GB)\b/i,
  /\b(?:MUMBAI|BANGALORE|BENGALURU|DELHI|NEW DELHI|HYDERABAD|CHENNAI|PUNE|KOLKATA|NOIDA|GURGAON)\b/i,
  /\b\d{5,6}\b/, // Pin / zip codes
  /\bREF(?:#|:)?\s*[A-Z0-9-]+\b/i,
  /\bORDER(?:#|:)?\s*[A-Z0-9-]+\b/i,
  /\bTXN(?:#|:)?\s*[A-Z0-9-]+\b/i,
  /\b[A-Z0-9]{8,}\b/ // Long alphanumeric reference tokens
];

/**
 * Normalizes a raw bank narration/merchant string into a clean merchant name.
 * PRESERVES original_description untouched.
 *
 * @param {string} rawDescription
 * @param {string} [rawMerchant='']
 * @returns {{
 *   merchant: string,
 *   isRecognized: boolean,
 *   matchedEntry?: Object
 * }}
 */
export function normalizeMerchant(rawDescription, rawMerchant = '') {
  const combinedText = `${rawMerchant || ''} ${rawDescription || ''}`.trim();
  if (!combinedText) {
    return { merchant: 'Unknown Merchant', isRecognized: false };
  }

  const upper = combinedText.toUpperCase();

  // 1. Check against dictionary keywords
  for (const entry of MERCHANT_DICTIONARY) {
    for (const kw of entry.keywords) {
      const kwUpper = kw.toUpperCase();
      // Match whole word or bounded phrase
      if (upper.includes(kwUpper)) {
        return {
          merchant: entry.merchant,
          isRecognized: true,
          matchedEntry: entry
        };
      }
    }
  }

  // 2. Algorithmic cleansing for unknown merchants
  let cleaned = (rawMerchant || rawDescription).trim();

  // Strip prefixes
  for (const prefix of NARRATION_PREFIXES) {
    cleaned = cleaned.replace(prefix, '');
  }

  // Strip suffixes
  for (const suffix of NARRATION_SUFFIXES) {
    cleaned = cleaned.replace(suffix, '');
  }

  // Strip asterisks, hashes, extra punctuation
  cleaned = cleaned
    .replace(/[*#/@|_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return { merchant: 'Unknown Merchant', isRecognized: false };
  }

  // Format into clean Title Case
  const words = cleaned.toLowerCase().split(' ').filter(Boolean);
  const titleCased = words
    .slice(0, 4) // Keep up to first 4 words for clean merchant name
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    merchant: titleCased || 'Unknown Merchant',
    isRecognized: false
  };
}
