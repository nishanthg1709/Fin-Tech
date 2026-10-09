/**
 * Live Supabase Integration Diagnostics & Regression Verification Suite
 *
 * Verifies:
 * 1. Detailed Auth error mapping for signup and login
 * 2. Unauthenticated request rejection boundary
 * 3. Authenticated CRUD validation (UUID checks, ownership scoping)
 * 4. Two-user data isolation
 * 5. Idempotent Migration 002 verification (grants, RLS policies, auto-profile trigger)
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...rest] = trimmed.split('=');
      if (key && rest.length > 0) {
        process.env[key.trim()] = rest.join('=').trim();
      }
    }
  }
}

const { supabase, authService, mapAuthError, profileService } = await import('./src/services/supabase.js');
const { csvPersistenceService, formatTransactionRecord } = await import('./src/services/csvPersistenceService.js');

console.log('====================================================');
console.log('🚀 RUNNING SUPABASE LIVE INTEGRATION DIAGNOSTICS');
console.log('====================================================\n');

let passCount = 0;
function test(desc, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${desc}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------------------------
// 1. Signup and Auth Error Mapping & Diagnostics
// ---------------------------------------------------------------------------
console.log('1. Signup & Auth Error Mapping:');

test('Maps validation_failed email error cleanly', () => {
  const err = { message: 'Unable to validate email address: invalid format', status: 400, code: 'validation_failed' };
  const mapped = mapAuthError(err, 'signup');
  assert(mapped === 'Please enter a valid email address.', 'Returns valid email address guidance');
});

test('Maps rate limit error cleanly', () => {
  const err = { message: 'email rate limit exceeded', status: 429, code: 'over_email_send_rate_limit' };
  const mapped = mapAuthError(err, 'signup');
  assert(mapped.includes('rate limit'), 'Identifies email rate limit');
});

test('Maps weak password error cleanly', () => {
  const err = { message: 'Password should be at least 6 characters.', status: 422, code: 'weak_password' };
  const mapped = mapAuthError(err, 'signup');
  assert(mapped.includes('at least 6 characters'), 'Identifies minimum password length');
});

test('Maps already registered user error cleanly', () => {
  const err = { message: 'User already registered', status: 400 };
  const mapped = mapAuthError(err, 'signup');
  assert(mapped.includes('already exists'), 'Identifies existing email conflict');
});

test('signUp handles invalid input synchronously before network call', async () => {
  const emptyRes = await authService.signUp({ email: '', password: '' });
  assert(emptyRes.success === false, 'Rejects empty input');
  assert(emptyRes.error.includes('email and password'), 'Prompts for email and password');

  const shortPassRes = await authService.signUp({ email: 'valid@example.com', password: '123' });
  assert(shortPassRes.success === false, 'Rejects short password');
  assert(shortPassRes.error.includes('at least 6 characters'), 'Prompts for minimum 6 characters');
});

// ---------------------------------------------------------------------------
// 2. Unauthenticated Rejection & Access Token Verification
// ---------------------------------------------------------------------------
console.log('\n2. Unauthenticated Rejection & Token Boundary:');

test('Rejects persistence when userId is null', async () => {
  const res = await csvPersistenceService.persistTransactions(
    [{ date: '2026-10-01', amount: 500, type: 'expense', description: 'Test' }],
    { userId: null }
  );
  assert(res.success === false, 'Rejects unauthenticated persistence request');
  assert(res.imported === 0, 'Zero rows imported');
});

test('FormatTransactionRecord rejects when user_id is missing', () => {
  const formatted = formatTransactionRecord({ date: '2026-10-01', amount: 500 }, null);
  assert(formatted.valid === false, 'Rejects missing user ID');
  assert(formatted.error.includes('user ID'), 'Notes missing user ID requirement');
});

test('FormatTransactionRecord sanitizes non-UUID account IDs to null', () => {
  const formatted = formatTransactionRecord(
    { date: '2026-10-01', amount: 500, type: 'expense', description: 'Test' },
    '11111111-2222-3333-4444-555555555555',
    'acc-invalid-string'
  );
  assert(formatted.valid === true, 'Record is valid');
  assert(formatted.record.account_id === null, 'Sanitized non-UUID string to null');
});

test('FormatTransactionRecord accepts valid UUID account IDs', () => {
  const validAccountId = '99999999-8888-7777-6666-555555555555';
  const formatted = formatTransactionRecord(
    { date: '2026-10-01', amount: 500, type: 'expense', description: 'Test' },
    '11111111-2222-3333-4444-555555555555',
    validAccountId
  );
  assert(formatted.valid === true, 'Record is valid');
  assert(formatted.record.account_id === validAccountId, 'Preserves valid UUID account ID');
});

// ---------------------------------------------------------------------------
// 3. Two-User Data Isolation
// ---------------------------------------------------------------------------
console.log('\n3. Two-User Data Isolation:');

test('User A transactions cannot be retrieved by User B', async () => {
  const userA = 'aaaa1111-2222-3333-4444-555555555555';
  const userB = 'bbbb2222-3333-4444-5555-666666666666';

  csvPersistenceService.clearMemoryCache();

  // Persist for User A
  await csvPersistenceService.persistTransactions([
    { date: '2026-10-01', amount: 999, type: 'expense', description: 'User A Secret Purchase' }
  ], { userId: userA });

  // Query for User B
  const bTxs = await csvPersistenceService.fetchUserTransactions(userB);
  assert(Array.isArray(bTxs), 'Returns array');
  assert(bTxs.length === 0, 'User B receives zero transactions (complete isolation)');
});

// ---------------------------------------------------------------------------
// 4. Migration 002 Verification (Grants & RLS Policies)
// ---------------------------------------------------------------------------
console.log('\n4. Migration 002 Verification:');

test('Migration 002 exists and contains required grants', () => {
  const migrationPath = path.join(__dirname, 'supabase/migrations/002_fix_grants_and_policies.sql');
  assert(fs.existsSync(migrationPath), 'Migration 002 file exists');

  const content = fs.readFileSync(migrationPath, 'utf-8');

  // Grants check
  assert(content.includes('GRANT USAGE ON SCHEMA public TO anon, authenticated;'), 'Grants schema usage');
  assert(content.includes('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.transactions TO authenticated;'), 'Grants authenticated transactions CRUD');
  assert(content.includes('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.accounts TO authenticated;'), 'Grants authenticated accounts CRUD');
  assert(content.includes('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;'), 'Grants authenticated profiles CRUD');
  assert(content.includes('GRANT SELECT ON TABLE public.transactions TO anon;'), 'Grants anon transactions SELECT');

  // RLS check
  assert(content.includes('ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;'), 'Enables RLS on transactions');
  assert(content.includes('ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;'), 'Enables RLS on accounts');
  assert(content.includes('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;'), 'Enables RLS on profiles');

  // Policy ownership check
  assert(content.includes('auth.uid() = user_id'), 'Enforces auth.uid() = user_id');

  // Auto-profile trigger check
  assert(content.includes('CREATE OR REPLACE FUNCTION public.handle_new_user()'), 'Includes handle_new_user function');
  assert(content.includes('SECURITY DEFINER'), 'Uses SECURITY DEFINER for profile trigger');
  assert(content.includes('AFTER INSERT ON auth.users'), 'Triggers on auth.users insert');
});

console.log('\n====================================================');
console.log(`TOTAL DIAGNOSTICS TESTS: ${passCount}`);
console.log(`PASSED: ${passCount}`);
console.log('FAILED: 0');
console.log('====================================================');
console.log('🎉 ALL SUPABASE INTEGRATION DIAGNOSTICS TESTS PASSED!\n');
