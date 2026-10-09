import { createClient } from '@supabase/supabase-js';

// Supabase environment variables from Vite configuration (.env)
const SUPABASE_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL
  ? import.meta.env.VITE_SUPABASE_URL
  : (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL || null : null);

const SUPABASE_ANON_KEY = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY || null : null);

// Initialize single canonical Supabase Client
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'smart_expense_supabase_auth_token'
      }
    })
  : null;

const LOCAL_STORAGE_KEY = 'smart_expense_active_transactions';

/**
 * Maps raw auth and database errors to clean, user-facing error messages.
 * Prevents exposing internal tokens or raw database stack traces.
 */
export function mapAuthError(err, mode = 'login') {
  if (!err) {
    return mode === 'login' ? 'Invalid email or password' : 'Unable to create account. Please try again.';
  }

  const msg = (err.message || String(err)).toLowerCase();

  if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('connection refused') || msg.includes('timeout')) {
    return 'Unable to connect to the server.';
  }
  if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('duplicate')) {
    return 'An account with this email already exists';
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials') || msg.includes('invalid credentials')) {
    return 'Invalid email or password';
  }
  if (msg.includes('password should be at least') || msg.includes('weak password') || msg.includes('password must be')) {
    return 'Password must be at least 6 characters.';
  }
  if (msg.includes('email not confirmed') || msg.includes('not verified')) {
    return 'Please verify your email address before logging in.';
  }
  if (msg.includes('rate limit') || msg.includes('security purposes') || msg.includes('over_email_send_rate_limit')) {
    return 'Email rate limit reached. Please wait a moment and try again.';
  }
  if (msg.includes('invalid format') || msg.includes('invalid email') || msg.includes('valid email') || msg.includes('unable to validate email')) {
    return 'Please enter a valid email address.';
  }
  if (msg.includes('signups not allowed') || msg.includes('signups are disabled')) {
    return 'Signups are currently disabled in project settings.';
  }

  return mode === 'login'
    ? 'Invalid email or password'
    : (err.message || 'Unable to create account. Please try again.');
}

/**
 * Reusable Profile Service
 * Manages user profile data and synchronization with the Supabase `profiles` table.
 */
export const profileService = {
  /**
   * Retrieves current authenticated user.
   */
  async getCurrentUser() {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return null;
      return data.user;
    } catch {
      return null;
    }
  },

  /**
   * Retrieves current authenticated session.
   */
  async getCurrentSession() {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session) return null;
      return data.session;
    } catch {
      return null;
    }
  },

  /**
   * Fetches profile from `profiles` table, falling back to auth metadata if unavailable.
   */
  async getProfile(userId) {
    if (!supabase || !userId) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('Profile fetch note:', err?.message);
    }
    return null;
  },

  /**
   * Creates or ensures profile row in `profiles` table.
   */
  async createProfile({ userId, fullName, email }) {
    if (!userId) return null;
    const profilePayload = {
      user_id: userId,
      full_name: fullName || '',
      email: email || '',
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert([profilePayload], { onConflict: 'user_id' })
          .select()
          .maybeSingle();

        if (!error && data) {
          return data;
        }
        if (error) {
          console.warn('Profile persistence notice:', error.message);
        }
      } catch (err) {
        console.warn('Profile insert note:', err?.message);
      }
    }

    return profilePayload;
  },

  /**
   * Updates existing profile record.
   */
  async updateProfile(userId, updates) {
    if (!userId || !updates) return null;
    const payload = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(payload)
          .eq('user_id', userId)
          .select()
          .maybeSingle();

        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.warn('Profile update error:', err?.message);
      }
    }

    return { user_id: userId, ...payload };
  }
};

/**
 * Reusable Supabase Auth Service
 * Coordinates signUp, signIn, signOut, and real-time session subscription.
 */
export const authService = {
  isConfigured() {
    return Boolean(supabase);
  },

  /**
   * Registers a new user with Supabase Auth.
   * On success, creates user's profile in the `profiles` table.
   */
  async signUp({ email, password, fullName }) {
    if (!email || !password) {
      return { success: false, error: 'Please enter your email and password.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    if (!supabase) {
      return { success: false, error: 'Unable to connect to the server.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName?.trim() || ''
          }
        }
      });

      if (error) {
        console.warn('Supabase Auth signUp error:', {
          status: error.status,
          message: error.message,
          code: error.code
        });
        return { 
          success: false, 
          error: mapAuthError(error, 'signup'),
          details: {
            message: error.message,
            status: error.status,
            code: error.code
          }
        };
      }

      // Check for existing user where Supabase returned empty identities array
      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return { success: false, error: 'An account with this email already exists' };
      }

      // Create profile record for the authenticated user if session is active
      let profile = null;
      if (data?.session?.user) {
        profile = await profileService.createProfile({
          userId: data.session.user.id,
          fullName: fullName?.trim() || '',
          email: data.session.user.email
        });
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
        profile
      };
    } catch (err) {
      console.warn('Supabase Auth signUp exception:', err);
      return { success: false, error: mapAuthError(err, 'signup') };
    }
  },

  /**
   * Authenticates user credentials via Supabase Auth.
   * Loads user profile upon successful authentication.
   */
  async signIn({ email, password }) {
    if (!email || !password) {
      return { success: false, error: 'Please enter your email and password.' };
    }

    if (!supabase) {
      return { success: false, error: 'Unable to connect to the server.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        return { success: false, error: mapAuthError(error, 'login') };
      }

      let profile = null;
      if (data?.user) {
        profile = await profileService.getProfile(data.user.id);
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
        profile
      };
    } catch (err) {
      return { success: false, error: mapAuthError(err, 'login') };
    }
  },

  /**
   * Signs out current user from Supabase.
   */
  async signOut() {
    if (!supabase) return { success: true };
    try {
      await supabase.auth.signOut();
      return { success: true };
    } catch (err) {
      console.warn('SignOut note:', err?.message);
      return { success: true };
    }
  },

  /**
   * Subscribes to auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED).
   */
  onAuthStateChange(callback) {
    if (!supabase) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  }
};

/**
 * Existing Transactions Data Access Layer (Preserved for backward compatibility)
 */
export const supabaseService = {
  isConfigured() {
    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
  },

  async getTransactions(userId = null) {
    if (this.isConfigured() && supabase) {
      try {
        let query = supabase.from('transactions').select('*').order('transaction_date', { ascending: false });
        if (userId) {
          query = query.eq('user_id', userId);
        }
        const { data, error } = await query;
        if (!error && Array.isArray(data) && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local source:', err);
      }
    }

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}

    return [];
  },

  async insertTransactions(transactions = [], userId = null) {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return { success: true, count: 0 };
    }

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

    let remoteSaved = false;
    if (this.isConfigured() && supabase) {
      try {
        const { error } = await supabase.from('transactions').upsert(records);
        if (!error) {
          remoteSaved = true;
        }
      } catch (err) {
        console.warn('Supabase insert failed, saving to local state:', err);
      }
    }

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

  async clearTransactions(userId = null) {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}

    if (this.isConfigured() && userId && supabase) {
      try {
        await supabase.from('transactions').delete().eq('user_id', userId);
      } catch {}
    }
  }
};

// Re-export csvPersistenceService from canonical supabase module
export { 
  csvPersistenceService, 
  generateTransactionFingerprint, 
  formatTransactionRecord 
} from './csvPersistenceService.js';
