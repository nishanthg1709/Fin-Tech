/**
 * Verification Test for Supabase Database Schema Migration
 * Validates 001_initial_schema.sql structure, table definitions, RLS policies, and constraints.
 */

import { readFileSync, existsSync } from 'fs';

console.log('====================================================');
console.log('🚀 RUNNING SUPABASE DATABASE SCHEMA VERIFICATION');
console.log('====================================================\n');

let passed = 0;
let total = 0;

function assert(cond, msg) {
  total++;
  if (cond) {
    console.log(`  ✓ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    process.exitCode = 1;
  }
}

// 1. Migration File Existence
console.log('1. Migration File Check:');
const migrationPath = './supabase/migrations/001_initial_schema.sql';
assert(existsSync(migrationPath), 'Migration file supabase/migrations/001_initial_schema.sql exists');

const sql = readFileSync(migrationPath, 'utf-8');

// 2. Profiles Table Schema
console.log('\n2. Profiles Table Definition:');
assert(sql.includes('CREATE TABLE IF NOT EXISTS profiles'), 'Creates profiles table');
assert(sql.includes('id UUID PRIMARY KEY'), 'profiles has id UUID PRIMARY KEY');
assert(sql.includes('user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE'), 'profiles references auth.users(id) ON DELETE CASCADE');
assert(sql.includes('full_name TEXT'), 'profiles has full_name TEXT');
assert(sql.includes('email TEXT'), 'profiles has email TEXT');
assert(sql.includes('created_at TIMESTAMPTZ DEFAULT NOW()'), 'profiles has created_at');
assert(sql.includes('updated_at TIMESTAMPTZ DEFAULT NOW()'), 'profiles has updated_at');

// 3. Accounts Table Schema
console.log('\n3. Accounts Table Definition:');
assert(sql.includes('CREATE TABLE IF NOT EXISTS accounts'), 'Creates accounts table');
assert(sql.includes('id UUID PRIMARY KEY DEFAULT gen_random_uuid()'), 'accounts has id UUID PRIMARY KEY DEFAULT gen_random_uuid()');
assert(sql.includes('institution_name TEXT NOT NULL'), 'accounts has institution_name TEXT NOT NULL');
assert(sql.includes('account_name TEXT'), 'accounts has account_name TEXT');
assert(sql.includes('account_type TEXT'), 'accounts has account_type TEXT');
assert(sql.includes('masked_account_number TEXT'), 'accounts has masked_account_number TEXT');
assert(sql.includes("currency TEXT DEFAULT 'INR'"), 'accounts defaults currency to INR');
assert(sql.includes('opening_balance NUMERIC(14,2) DEFAULT 0'), 'accounts has opening_balance NUMERIC(14,2)');
assert(sql.includes('current_balance NUMERIC(14,2) DEFAULT 0'), 'accounts has current_balance NUMERIC(14,2)');

// 4. Transactions Table Schema
console.log('\n4. Transactions Table Definition & Constraints:');
assert(sql.includes('CREATE TABLE IF NOT EXISTS transactions'), 'Creates transactions table');
assert(sql.includes('account_id UUID REFERENCES accounts(id) ON DELETE CASCADE'), 'transactions references accounts(id) ON DELETE CASCADE');
assert(sql.includes('transaction_date TIMESTAMPTZ NOT NULL'), 'transactions has transaction_date TIMESTAMPTZ NOT NULL');
assert(sql.includes('amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0)'), 'transactions has amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0)');
assert(sql.includes("transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit'))"), 'transactions enforces transaction_type IN (credit, debit)');
assert(sql.includes('description TEXT'), 'transactions has description TEXT');
assert(sql.includes('original_description TEXT'), 'transactions has original_description TEXT');
assert(sql.includes('merchant TEXT'), 'transactions has merchant TEXT');
assert(sql.includes('normalized_merchant TEXT'), 'transactions has normalized_merchant TEXT');
assert(sql.includes('category TEXT'), 'transactions has category TEXT');
assert(sql.includes('subcategory TEXT'), 'transactions has subcategory TEXT');
assert(sql.includes('balance_after NUMERIC(14,2)'), 'transactions has balance_after NUMERIC(14,2)');
assert(sql.includes('reference_id TEXT'), 'transactions has reference_id TEXT');
assert(sql.includes('is_reviewed BOOLEAN DEFAULT FALSE'), 'transactions has is_reviewed BOOLEAN DEFAULT FALSE');
assert(sql.includes("source TEXT DEFAULT 'csv'"), "transactions defaults source to 'csv'");
assert(sql.includes('confidence NUMERIC(5,4)'), 'transactions has confidence NUMERIC(5,4)');
assert(sql.includes("metadata JSONB DEFAULT '{}'::jsonb"), 'transactions has metadata JSONB');

// 5. Performance Indexes
console.log('\n5. Performance Indexes:');
assert(sql.includes('idx_accounts_user_id ON accounts(user_id)'), 'Index on accounts.user_id');
assert(sql.includes('idx_transactions_user_id ON transactions(user_id)'), 'Index on transactions.user_id');
assert(sql.includes('idx_transactions_account_id ON transactions(account_id)'), 'Index on transactions.account_id');
assert(sql.includes('idx_transactions_transaction_date ON transactions(transaction_date)'), 'Index on transactions.transaction_date');
assert(sql.includes('idx_transactions_normalized_merchant ON transactions(normalized_merchant)'), 'Index on transactions.normalized_merchant');
assert(sql.includes('idx_transactions_category ON transactions(category)'), 'Index on transactions.category');

// 6. Row Level Security & Isolation Policies
console.log('\n6. Row Level Security & Ownership Policies:');
assert(sql.includes('ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;'), 'RLS enabled on profiles');
assert(sql.includes('ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;'), 'RLS enabled on accounts');
assert(sql.includes('ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;'), 'RLS enabled on transactions');

// Profiles policies
assert(sql.includes('CREATE POLICY "Users can select own profile"') && sql.includes('auth.uid() = user_id'), 'Profiles SELECT policy verifies auth.uid() = user_id');
assert(sql.includes('CREATE POLICY "Users can insert own profile"'), 'Profiles INSERT policy created');
assert(sql.includes('CREATE POLICY "Users can update own profile"'), 'Profiles UPDATE policy created');
assert(sql.includes('CREATE POLICY "Users can delete own profile"'), 'Profiles DELETE policy created');

// Accounts policies
assert(sql.includes('CREATE POLICY "Users can select own accounts"') && sql.includes('auth.uid() = user_id'), 'Accounts SELECT policy verifies auth.uid() = user_id');
assert(sql.includes('CREATE POLICY "Users can insert own accounts"'), 'Accounts INSERT policy created');
assert(sql.includes('CREATE POLICY "Users can update own accounts"'), 'Accounts UPDATE policy created');
assert(sql.includes('CREATE POLICY "Users can delete own accounts"'), 'Accounts DELETE policy created');

// Transactions policies with account isolation
assert(sql.includes('CREATE POLICY "Users can select own transactions"'), 'Transactions SELECT policy created');
assert(sql.includes('CREATE POLICY "Users can insert own transactions"'), 'Transactions INSERT policy created');
assert(sql.includes('CREATE POLICY "Users can update own transactions"'), 'Transactions UPDATE policy created');
assert(sql.includes('CREATE POLICY "Users can delete own transactions"'), 'Transactions DELETE policy created');

// Strict account ownership check preventing cross-user account assignment
const normalizedSql = sql.replace(/\s+/g, ' ');
assert(
  normalizedSql.includes('account_id IS NULL') && 
  normalizedSql.includes('EXISTS ( SELECT 1 FROM accounts WHERE accounts.id = transactions.account_id AND accounts.user_id = auth.uid() )'),
  'Transactions INSERT/UPDATE prevents referencing other users accounts'
);

// 7. Updated At Triggers
console.log('\n7. Automatic updated_at Trigger Functions:');
assert(sql.includes('update_updated_at_column()'), 'Trigger function update_updated_at_column exists');
assert(sql.includes('update_profiles_updated_at'), 'Trigger on profiles for updated_at');
assert(sql.includes('update_accounts_updated_at'), 'Trigger on accounts for updated_at');
assert(sql.includes('update_transactions_updated_at'), 'Trigger on transactions for updated_at');

console.log('\n====================================================');
console.log(`TOTAL SCHEMA TESTS: ${total}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${total - passed}`);
console.log('====================================================');

if (passed === total) {
  console.log('🎉 ALL SUPABASE SCHEMA TESTS PASSED PERFECTLY!\n');
} else {
  process.exit(1);
}
