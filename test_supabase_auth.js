/**
 * Verification Test Suite for Supabase Real Authentication (Phase 2A)
 * Tests client config, signup, login, logout, session persistence, profile service,
 * error mapping, and route protection without exposing credentials.
 */

import { readFileSync, existsSync } from 'fs';

// 0. Load .env into process.env for Node.js test environment
if (existsSync('.env')) {
  const envContent = readFileSync('.env', 'utf-8');
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

// Dynamically import module after environment variables are populated
const { supabase, authService, profileService, mapAuthError } = await import('./src/services/supabase.js');

console.log('====================================================');
console.log('🚀 RUNNING SUPABASE AUTHENTICATION TEST SUITE');
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

// ---------------------------------------------------------------------------
// 1. Auth Client Configuration & Security
// ---------------------------------------------------------------------------
console.log('1. Auth Client Configuration & Security:');
assert(existsSync('./src/services/supabase.js'), 'src/services/supabase.js exists');

const supabaseSource = readFileSync('./src/services/supabase.js', 'utf-8');
assert(supabaseSource.includes('createClient'), 'Initializes Supabase Client via @supabase/supabase-js createClient');
assert(supabaseSource.includes('VITE_SUPABASE_URL'), 'Uses VITE_SUPABASE_URL from environment');
assert(supabaseSource.includes('VITE_SUPABASE_ANON_KEY'), 'Uses VITE_SUPABASE_ANON_KEY from environment');
assert(!supabaseSource.includes('service_role'), 'Strictly never references service_role secret key');
assert(Boolean(supabase), 'Supabase client instance is initialized and exported');
assert(typeof authService.isConfigured === 'function', 'authService exposes isConfigured check');
assert(authService.isConfigured() === true, 'authService confirms active Supabase configuration');

// ---------------------------------------------------------------------------
// 2. Profile Service Responsibilities
// ---------------------------------------------------------------------------
console.log('\n2. Reusable Profile Service:');
assert(typeof profileService.getCurrentUser === 'function', 'profileService has getCurrentUser()');
assert(typeof profileService.getCurrentSession === 'function', 'profileService has getCurrentSession()');
assert(typeof profileService.getProfile === 'function', 'profileService has getProfile()');
assert(typeof profileService.createProfile === 'function', 'profileService has createProfile()');
assert(typeof profileService.updateProfile === 'function', 'profileService has updateProfile()');

// Test createProfile fallback/contract
const testProfilePayload = {
  userId: '00000000-0000-0000-0000-000000000001',
  fullName: 'Arjun Verma',
  email: 'arjun@smartmoney.in'
};
const created = await profileService.createProfile(testProfilePayload);
assert(created && created.user_id === testProfilePayload.userId, 'createProfile formats and returns valid profile payload');
assert(created.full_name === 'Arjun Verma', 'createProfile preserves full_name');
assert(created.email === 'arjun@smartmoney.in', 'createProfile preserves email');

// Test updateProfile contract
const updated = await profileService.updateProfile(testProfilePayload.userId, { full_name: 'Arjun K. Verma' });
assert(updated && updated.full_name === 'Arjun K. Verma', 'updateProfile applies field updates');

// ---------------------------------------------------------------------------
// 3. User-Friendly Error Mapping (No Raw DB Leakage)
// ---------------------------------------------------------------------------
console.log('\n3. Error Mapping & Presentation:');
assert(mapAuthError({ message: 'Invalid login credentials' }, 'login') === 'Invalid email or password', 'Maps Invalid login credentials cleanly');
assert(mapAuthError({ message: 'User already registered' }, 'signup') === 'An account with this email already exists', 'Maps User already registered cleanly');
assert(mapAuthError({ message: 'Password should be at least 6 characters' }, 'signup') === 'Password must be at least 6 characters.', 'Maps weak password cleanly');
assert(mapAuthError({ message: 'Failed to fetch' }, 'login') === 'Unable to connect to the server.', 'Maps network error cleanly');
assert(mapAuthError({ message: 'Unable to validate email address: invalid format' }, 'signup') === 'Please enter a valid email address.', 'Maps invalid email format cleanly');
assert(mapAuthError(null, 'signup') === 'Unable to create account. Please try again.', 'Safe fallback for null signup error');
assert(mapAuthError(null, 'login') === 'Invalid email or password', 'Safe fallback for null login error');

// ---------------------------------------------------------------------------
// 4. Signup Validation & Flow
// ---------------------------------------------------------------------------
console.log('\n4. Signup Flow & Validation:');
const emptySignup = await authService.signUp({ email: '', password: '', fullName: '' });
assert(emptySignup.success === false, 'Rejects empty signup submission');
assert(emptySignup.error.includes('email and password'), 'Prompts for missing email and password');

const weakPasswordSignup = await authService.signUp({ email: 'valid@example.com', password: '123', fullName: 'User' });
assert(weakPasswordSignup.success === false, 'Rejects passwords under 6 characters');
assert(weakPasswordSignup.error.includes('at least 6 characters'), 'Provides clear message for short password');

// Check SignupView component integration
const signupViewSource = readFileSync('./src/components/SignupView.jsx', 'utf-8');
assert(signupViewSource.includes('onSignup'), 'SignupView connects to onSignup prop');
assert(signupViewSource.includes('isSubmitting'), 'SignupView provides submission state');
assert(signupViewSource.includes('showPassword') && signupViewSource.includes('setShowPassword'), 'SignupView has showPassword toggle');
assert(signupViewSource.includes('Passwords do not match'), 'SignupView verifies password match');

// ---------------------------------------------------------------------------
// 5. Login Flow & Verification
// ---------------------------------------------------------------------------
console.log('\n5. Login Flow & Verification:');
const emptyLogin = await authService.signIn({ email: '', password: '' });
assert(emptyLogin.success === false, 'Rejects empty login submission');

const invalidCredsLogin = await authService.signIn({ email: 'nonexistent_test@example.com', password: 'wrongpassword123!' });
assert(invalidCredsLogin.success === false, 'Handles non-existent / invalid credentials gracefully');
assert(invalidCredsLogin.error === 'Invalid email or password', 'Presents clean error message on login failure');

// Check LoginView component integration
const loginViewSource = readFileSync('./src/components/LoginView.jsx', 'utf-8');
assert(loginViewSource.includes('onLogin'), 'LoginView connects to onLogin prop');
assert(loginViewSource.includes('isSubmitting'), 'LoginView provides submission state');
assert(loginViewSource.includes('showPassword') && loginViewSource.includes('setShowPassword'), 'LoginView has showPassword toggle');

// ---------------------------------------------------------------------------
// 6. Session Persistence & Auth State Synchronization
// ---------------------------------------------------------------------------
console.log('\n6. Session Persistence & State Synchronization:');
assert(typeof authService.onAuthStateChange === 'function', 'authService exposes onAuthStateChange listener');
const sub = authService.onAuthStateChange(() => {});
assert(sub && (sub.data?.subscription || typeof sub.unsubscribe === 'function'), 'onAuthStateChange returns valid subscription');
if (sub?.data?.subscription?.unsubscribe) sub.data.subscription.unsubscribe();

// ---------------------------------------------------------------------------
// 7. Logout & Application State Teardown
// ---------------------------------------------------------------------------
console.log('\n7. Logout Flow:');
assert(typeof authService.signOut === 'function', 'authService exposes signOut()');
const signOutResult = await authService.signOut();
assert(signOutResult.success === true, 'signOut resolves cleanly');

// Check App.jsx logout and teardown logic
const appSource = readFileSync('./src/App.jsx', 'utf-8');
assert(appSource.includes('authService.signOut()'), 'App.jsx calls authService.signOut()');
assert(appSource.includes('localStorage.removeItem(\'smart_expense_user\')'), 'App.jsx clears user storage on logout');
assert(appSource.includes('localStorage.removeItem(\'smart_expense_active_transactions\')'), 'App.jsx clears transactions on logout');
assert(appSource.includes('setUser(null)'), 'App.jsx clears active user state on logout');
assert(appSource.includes('navigate(\'/\')'), 'App.jsx redirects to landing page on logout');

// ---------------------------------------------------------------------------
// 8. Protected Routes & Authorization Boundary
// ---------------------------------------------------------------------------
console.log('\n8. Protected Routes & Route Boundary:');
assert(appSource.includes('const publicRoutes = [\'/\', \'/login\', \'/signup\']'), 'Defines public routes whitelist');
assert(appSource.includes('navigate(\'/login\')'), 'Redirects unauthenticated users attempting private pages to /login');
assert(appSource.includes('profileService.getCurrentSession()'), 'App initializes session from Supabase on mount');
assert(appSource.includes('authService.onAuthStateChange'), 'App listens to live auth state events');

// ---------------------------------------------------------------------------
// 9. Onboarding Preservation
// ---------------------------------------------------------------------------
console.log('\n9. Onboarding Flow Preservation:');
const onboardingSource = readFileSync('./src/components/OnboardingView.jsx', 'utf-8');
assert(onboardingSource.includes('Welcome'), 'Preserves welcome greeting');
assert(onboardingSource.includes('user?.name'), 'Connects to authenticated user name');
assert(onboardingSource.includes('/connect-bank'), 'Preserves progression to bank connection');

console.log('\n====================================================');
console.log(`TOTAL SUPABASE AUTH TESTS: ${total}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${total - passed}`);
console.log('====================================================');

if (passed === total) {
  console.log('🎉 ALL SUPABASE AUTHENTICATION TESTS PASSED PERFECTLY!\n');
} else {
  process.exit(1);
}
