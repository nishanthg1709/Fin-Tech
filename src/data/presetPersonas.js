/**
 * Indian Financial Institution Profiles & Transaction Dataset
 * All amounts are in INR (₹). Supports strictly 1 Month, 3 Months, 6 Months, and 1 Year intervals.
 */

export const INSTITUTIONS = [
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    country: 'India',
    color: '#004C8F',
    initialBalance: 94200.00,
    maskedAccount: 'Savings Account •••• 8102'
  },
  {
    id: 'icici',
    name: 'ICICI Bank',
    country: 'India',
    color: '#F37021',
    initialBalance: 62150.00,
    maskedAccount: 'Savings Account •••• 3419'
  },
  {
    id: 'sbi',
    name: 'SBI (State Bank of India)',
    country: 'India',
    color: '#280071',
    initialBalance: 51300.00,
    maskedAccount: 'Savings Account •••• 9924'
  },
  {
    id: 'axis',
    name: 'Axis Bank',
    country: 'India',
    color: '#97144D',
    initialBalance: 48900.00,
    maskedAccount: 'Savings Account •••• 5511'
  }
];

export const DEMO_TRANSACTIONS = [
  // --- RECURRING: 1 Month ---
  // Netflix: ₹799 latest (increased from ₹699)
  { id: 'tx_nf_01', date: '2026-10-02', rawNarration: 'UPI-NETFLIX-MUMBAI-AUTOPAY-REF9281', amount: 799, type: 'DEBIT' },
  { id: 'tx_nf_02', date: '2026-09-02', rawNarration: 'UPI-NETFLIX-MUMBAI-AUTOPAY-REF8812', amount: 799, type: 'DEBIT' },
  { id: 'tx_nf_03', date: '2026-08-02', rawNarration: 'UPI-NETFLIX-MUMBAI-AUTOPAY-REF7734', amount: 699, type: 'DEBIT' }, // was 699
  { id: 'tx_nf_04', date: '2026-07-02', rawNarration: 'UPI-NETFLIX-MUMBAI-AUTOPAY-REF6619', amount: 699, type: 'DEBIT' },
  { id: 'tx_nf_05', date: '2026-06-02', rawNarration: 'UPI-NETFLIX-MUMBAI-AUTOPAY-REF5510', amount: 699, type: 'DEBIT' },

  // Spotify: ₹119 monthly
  { id: 'tx_sp_01', date: '2026-10-01', rawNarration: 'NACH-SPOTIFY INDIA SERVICES PVT LTD-00192', amount: 119, type: 'DEBIT' },
  { id: 'tx_sp_02', date: '2026-09-01', rawNarration: 'NACH-SPOTIFY INDIA SERVICES PVT LTD-00181', amount: 119, type: 'DEBIT' },
  { id: 'tx_sp_03', date: '2026-08-01', rawNarration: 'NACH-SPOTIFY INDIA SERVICES PVT LTD-00170', amount: 119, type: 'DEBIT' },

  // Canva: ₹499 monthly
  { id: 'tx_cn_01', date: '2026-09-28', rawNarration: 'CARD-CANVA PTY LTD SYDNEY VIA STRIPE INDIA', amount: 499, type: 'DEBIT' },
  { id: 'tx_cn_02', date: '2026-08-28', rawNarration: 'CARD-CANVA PTY LTD SYDNEY VIA STRIPE INDIA', amount: 499, type: 'DEBIT' },
  { id: 'tx_cn_03', date: '2026-07-28', rawNarration: 'CARD-CANVA PTY LTD SYDNEY VIA STRIPE INDIA', amount: 499, type: 'DEBIT' },

  // --- RECURRING: 3 Months ---
  // Adobe: ₹5,499 every 3 Months (increased from ₹4,999)
  { id: 'tx_ad_01', date: '2026-09-15', rawNarration: 'CARD-ADOBE SYSTEMS INDIA BANGALORE-QUARTERLY', amount: 5499, type: 'DEBIT' },
  { id: 'tx_ad_02', date: '2026-06-15', rawNarration: 'CARD-ADOBE SYSTEMS INDIA BANGALORE-QUARTERLY', amount: 4999, type: 'DEBIT' }, // was 4999
  { id: 'tx_ad_03', date: '2026-03-15', rawNarration: 'CARD-ADOBE SYSTEMS INDIA BANGALORE-QUARTERLY', amount: 4999, type: 'DEBIT' },

  // --- RECURRING: 6 Months ---
  // Insurance: ₹12,000 every 6 Months
  { id: 'tx_ins_01', date: '2026-09-10', rawNarration: 'ACH-HDFC ERGO HEALTH INSURANCE PREMIUM', amount: 12000, type: 'DEBIT' },
  { id: 'tx_ins_02', date: '2026-03-10', rawNarration: 'ACH-HDFC ERGO HEALTH INSURANCE PREMIUM', amount: 12000, type: 'DEBIT' },

  // --- RECURRING: 1 Year ---
  // Amazon Prime: ₹1,499 every 1 Year
  { id: 'tx_ap_01', date: '2026-04-18', rawNarration: 'AMZN-PRIME ANNUAL MEMBERSHIP INDIA-00918', amount: 1499, type: 'DEBIT' },
  { id: 'tx_ap_02', date: '2025-04-18', rawNarration: 'AMZN-PRIME ANNUAL MEMBERSHIP INDIA-00812', amount: 1499, type: 'DEBIT' },

  // --- DAILY & UTILITY EXPENSES ---
  // Swiggy & Duplicates
  { id: 'tx_sw_01', date: '2026-09-24', rawNarration: 'UPI-SWIGGY BANGALORE-ORDER-298102', amount: 518, type: 'DEBIT' },
  { id: 'tx_sw_02', date: '2026-09-24', rawNarration: 'UPI-SWIGGY BANGALORE-ORDER-298102', amount: 518, type: 'DEBIT' }, // DUPLICATE!
  { id: 'tx_sw_03', date: '2026-09-18', rawNarration: 'UPI-SWIGGY BANGALORE-ORDER-291823', amount: 342, type: 'DEBIT' },
  { id: 'tx_sw_04', date: '2026-09-11', rawNarration: 'UPI-SWIGGY BANGALORE-ORDER-289102', amount: 276, type: 'DEBIT' },

  // Zomato
  { id: 'tx_zm_01', date: '2026-09-22', rawNarration: 'UPI-ZOMATO LIMITED GURGAON-DINING', amount: 421, type: 'DEBIT' },
  { id: 'tx_zm_02', date: '2026-09-14', rawNarration: 'UPI-ZOMATO LIMITED GURGAON-DELIVERY', amount: 683, type: 'DEBIT' },

  // Electricity
  { id: 'tx_el_01', date: '2026-09-16', rawNarration: 'BBPS-STATE ELECTRICITY BOARD-BILL-9182', amount: 1247, type: 'DEBIT' },
  { id: 'tx_el_02', date: '2026-08-16', rawNarration: 'BBPS-STATE ELECTRICITY BOARD-BILL-8821', amount: 1180, type: 'DEBIT' },

  // Internet (Airtel)
  { id: 'tx_int_01', date: '2026-09-20', rawNarration: 'BBPS-BHARTI AIRTEL XSTREAM FIBER BROADBAND', amount: 899, type: 'DEBIT' },
  { id: 'tx_int_02', date: '2026-08-20', rawNarration: 'BBPS-BHARTI AIRTEL XSTREAM FIBER BROADBAND', amount: 899, type: 'DEBIT' },

  // Cabs (Uber / Ola)
  { id: 'tx_ub_01', date: '2026-09-23', rawNarration: 'UPI-UBER INDIA TECHNOLOGY PVT LTD', amount: 385, type: 'DEBIT' },
  { id: 'tx_ub_02', date: '2026-09-19', rawNarration: 'UPI-UBER INDIA TECHNOLOGY PVT LTD', amount: 240, type: 'DEBIT' },

  // --- UNUSUAL TRANSACTION ---
  // High outlier debit compared to normal range (₹200 - ₹800)
  { id: 'tx_un_01', date: '2026-09-25', rawNarration: 'POS-UNKNOWN ELECTRONIC MERCHANT MUMBAI #889', amount: 18000, type: 'DEBIT' },

  // --- SALARY CREDITS ---
  { id: 'tx_sal_01', date: '2026-10-01', rawNarration: 'NEFT-SALARY CREDIT TECH OPS INDIA PVT LTD', amount: 75000, type: 'CREDIT' },
  { id: 'tx_sal_02', date: '2026-09-01', rawNarration: 'NEFT-SALARY CREDIT TECH OPS INDIA PVT LTD', amount: 75000, type: 'CREDIT' }
];

export const DEFAULT_USER = {
  name: 'User',
  email: 'user@example.com',
  balance: 78450.00,
  institution: INSTITUTIONS[0]
};
