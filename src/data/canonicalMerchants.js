/**
 * Canonical Merchant Knowledge Base for Indian Financial Ecosystem
 * Normalizes raw transaction narrations, assigns categories, and details cancellation steps.
 */

export const CANONICAL_MERCHANTS = [
  {
    id: 'netflix',
    name: 'Netflix',
    patterns: [/netflix/i, /nflx/i, /netflix\.com/i],
    category: 'Entertainment',
    subcategory: 'Streaming Video',
    color: '#E50914',
    icon: 'tv',
    website: 'https://netflix.com',
    cancellationUrl: 'https://www.netflix.com/youraccount',
    cancellationDifficulty: 'Easy',
    cancellationSteps: [
      'Log into netflix.com in any browser',
      'Click your profile icon > Account',
      'Under Membership & Billing, click "Cancel Membership"',
      'Confirm cancellation (access remains until the current billing month ends)'
    ],
    defaultInterval: '1 Month',
    typicalPrice: 799
  },
  {
    id: 'spotify',
    name: 'Spotify',
    patterns: [/spotify/i, /spotify premium/i, /spotify p\d+/i],
    category: 'Entertainment',
    subcategory: 'Streaming Music',
    color: '#1DB954',
    icon: 'music',
    website: 'https://spotify.com',
    cancellationUrl: 'https://www.spotify.com/account/subscription/',
    cancellationDifficulty: 'Easy',
    cancellationSteps: [
      'Navigate to spotify.com/account',
      'Scroll to "Your plan" section',
      'Click "Change plan" > scroll down to "Cancel Spotify"',
      'Click "Cancel Premium"'
    ],
    defaultInterval: '1 Month',
    typicalPrice: 119
  },
  {
    id: 'canva',
    name: 'Canva Pro',
    patterns: [/canva/i, /canva pty/i],
    category: 'Productivity',
    subcategory: 'Design Software',
    color: '#00C4CC',
    icon: 'palette',
    website: 'https://canva.com',
    cancellationUrl: 'https://www.canva.com/settings/billing-and-teams',
    cancellationDifficulty: 'Easy',
    cancellationSteps: [
      'Open Canva and go to Account Settings',
      'Select "Billing & Teams"',
      'Under Subscriptions, click "Cancel subscription"'
    ],
    defaultInterval: '1 Month',
    typicalPrice: 499
  },
  {
    id: 'adobe',
    name: 'Adobe Creative Cloud',
    patterns: [/adobe/i, /adobe systems/i, /adobe creative/i],
    category: 'Productivity',
    subcategory: 'Design Software',
    color: '#FF0000',
    icon: 'palette',
    website: 'https://adobe.com',
    cancellationUrl: 'https://account.adobe.com/plans',
    cancellationDifficulty: 'Medium',
    cancellationSteps: [
      'Sign into account.adobe.com/plans',
      'Select "Manage plan" on your Creative Cloud subscription',
      'Click "Cancel your plan" and follow prompt'
    ],
    defaultInterval: '3 Months',
    typicalPrice: 5499
  },
  {
    id: 'insurance',
    name: 'HDFC Ergo Health & Life Insurance',
    patterns: [/insurance/i, /ergo/i, /hdfc ergo/i, /lic of india/i, /max life/i],
    category: 'Insurance',
    subcategory: 'Health & Life Insurance',
    color: '#004C8F',
    icon: 'shield',
    website: 'https://hdfcergo.com',
    cancellationUrl: 'https://www.hdfcergo.com/customer-support',
    cancellationDifficulty: 'Medium',
    cancellationSteps: [
      'Visit customer portal or contact your branch relationship manager',
      'Submit policy surrender / discontinuation form with ID verification'
    ],
    defaultInterval: '6 Months',
    typicalPrice: 12000
  },
  {
    id: 'amazon_prime',
    name: 'Amazon Prime',
    patterns: [/amazon[- ]?prime/i, /amzn[- ]?prime/i, /prime video/i],
    category: 'Entertainment',
    subcategory: 'Membership',
    color: '#FF9900',
    icon: 'shopping-bag',
    website: 'https://amazon.in',
    cancellationUrl: 'https://www.amazon.in/mc/manage',
    cancellationDifficulty: 'Easy',
    cancellationSteps: [
      'Go to Amazon.in > Your Account',
      'Select "Prime - View benefits and payment settings"',
      'Click "Manage membership" > "End membership"'
    ],
    defaultInterval: '1 Year',
    typicalPrice: 1499
  },
  {
    id: 'swiggy',
    name: 'Swiggy',
    patterns: [/swiggy/i, /bundl tech/i],
    category: 'Food & Dining',
    subcategory: 'Food Delivery',
    color: '#FC8019',
    icon: 'utensils',
    website: 'https://swiggy.com',
    cancellationUrl: '',
    cancellationDifficulty: 'N/A',
    defaultInterval: null
  },
  {
    id: 'zomato',
    name: 'Zomato',
    patterns: [/zomato/i],
    category: 'Food & Dining',
    subcategory: 'Food Delivery',
    color: '#E23744',
    icon: 'utensils',
    website: 'https://zomato.com',
    cancellationUrl: '',
    cancellationDifficulty: 'N/A',
    defaultInterval: null
  },
  {
    id: 'jio',
    name: 'Jio',
    patterns: [/reliance jio/i, /\bjio\b/i, /jio prepaid/i, /jio postpaid/i, /jio fiber/i],
    category: 'Utilities',
    subcategory: 'Mobile & Telecom',
    color: '#0A2885',
    icon: 'smartphone',
    website: 'https://jio.com',
    cancellationUrl: '',
    cancellationDifficulty: 'N/A',
    defaultInterval: '1 Month',
    typicalPrice: 399
  },
  {
    id: 'house_rent',
    name: 'House Rent',
    patterns: [/house rent/i, /rent payment/i, /landlord rent/i],
    category: 'Financial Commitments',
    subcategory: 'Housing / Rent',
    color: '#10B981',
    icon: 'home',
    website: '',
    cancellationUrl: '',
    cancellationDifficulty: 'N/A',
    defaultInterval: '1 Month',
    typicalPrice: 14500
  },
  {
    id: 'airtel_broadband',
    name: 'Airtel Xstream Fiber',
    patterns: [/airtel/i, /bharti airtel/i],
    category: 'Utilities',
    subcategory: 'Internet & Broadband',
    color: '#E40000',
    icon: 'wifi',
    website: 'https://airtel.in',
    cancellationUrl: '',
    cancellationDifficulty: 'Medium',
    defaultInterval: '1 Month',
    typicalPrice: 899
  },
  {
    id: 'electricity',
    name: 'State Electricity Board',
    patterns: [/electricity/i, /bescom/i, /tata power/i, /bses/i, /mseb/i],
    category: 'Utilities',
    subcategory: 'Electricity',
    color: '#F59E0B',
    icon: 'zap',
    website: '',
    cancellationUrl: '',
    cancellationDifficulty: 'N/A',
    defaultInterval: '1 Month',
    typicalPrice: 1247
  },
  {
    id: 'uber',
    name: 'Uber / Ola Rides',
    patterns: [/uber/i, /ola cabs/i, /ani tech/i],
    category: 'Transportation',
    subcategory: 'Cabs & Transit',
    color: '#000000',
    icon: 'car',
    website: 'https://uber.com',
    cancellationUrl: '',
    cancellationDifficulty: 'N/A',
    defaultInterval: null
  }
];

export const CATEGORIES = [
  'Entertainment',
  'Productivity',
  'Insurance',
  'Utilities',
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Other'
];
