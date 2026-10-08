/**
 * Supabase Transactions Data Access Layer
 * Integrates canonical transaction persistence with Supabase while maintaining
 * seamless local client persistence and offline compatibility.
 *
 * CANONICAL SCHEMA:
 * - id: string (primary key)
 * - user_id: string|null
 * - date: string (YYYY-MM-DD)
 * - original_description: string
 * - merchant: string
 * - amount: number (positive)
 * - type: string ("income" | "expense" | "transfer")
 * - category: string
 * - balance: number|null
 * - account: string|null
 * - source: string ("csv")
 * - is_reviewed: boolean
 * - created_at: string (ISO timestamp)
 */

const SUPABASE_URL = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_URL || null) : null;
const SUPABASE_ANON_KEY = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_ANON_KEY || null) : null;

const LOCAL_STORAGE_KEY = 'smart_expense_active_transactions';

export const supabaseService = {
  /**
   * Checks if Supabase connection is configured.
   */
  isConfigured() {
    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
  },

  /**
   * Retrieves transactions for a user.
   * Reads from Supabase if configured, falling back to local source of truth.
   * @param {string} [userId=null]
   * @returns {Promise<Array>}
   */
  async getTransactions(userId = null) {
    if (this.isConfigured()) {
      try {
        const query = userId 
          ? `${SUPABASE_URL}/rest/v1/transactions?user_id=eq.${encodeURIComponent(userId)}&order=date.desc`
          : `${SUPABASE_URL}/rest/v1/transactions?order=date.desc`;

        const res = await fetch(query, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });

        if (res.ok) {
          const remoteData = await res.json();
          if (Array.isArray(remoteData) && remoteData.length > 0) {
            return remoteData;
          }
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local source:', err);
      }
    }

    // Local source of truth
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}

    return [];
  },

  /**
   * Inserts or upserts canonical transactions into the database.
   * Updates both remote Supabase and local source of truth.
   *
   * @param {Array} transactions Array of canonical transactions
   * @param {string} [userId=null]
   * @returns {Promise<{ success: boolean, count: number, error?: string }>}
   */
  async insertTransactions(transactions = [], userId = null) {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return { success: true, count: 0 };
    }

    // Format clean canonical payload
    const records = transactions.map(tx => ({
      id: tx.id,
      user_id: userId || tx.user_id || null,
      date: tx.date,
      original_description: tx.original_description,
      merchant: tx.merchant,
      amount: Number(tx.amount) || 0,
      type: tx.type || 'expense',
      category: tx.category || 'Other',
      balance: tx.balance !== null && tx.balance !== undefined ? Number(tx.balance) : null,
      account: tx.account || null,
      source: tx.source || 'csv',
      is_reviewed: Boolean(tx.is_reviewed),
      created_at: tx.created_at || new Date().toISOString()
    }));

    // 1. Persist to Supabase if available
    let remoteSaved = false;
    if (this.isConfigured()) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(records)
        });
        if (res.ok) {
          remoteSaved = true;
        }
      } catch (err) {
        console.warn('Supabase insert failed, saving to local state:', err);
      }
    }

    // 2. Always persist to local source of truth
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage:', e);
    }

    return {
      success: true,
      count: records.length,
      remoteSaved
    };
  },

  /**
   * Clears transactions from local storage and database.
   */
  async clearTransactions(userId = null) {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}

    if (this.isConfigured() && userId) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/transactions?user_id=eq.${encodeURIComponent(userId)}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
      } catch {}
    }
  }
};
