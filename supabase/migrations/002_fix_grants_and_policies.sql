-- ============================================================================
-- Migration: 002_fix_grants_and_policies.sql
-- Description: Fix table-level grants for authenticated and anon roles,
--              reinforce RLS policies, and add automatic profile creation trigger.
-- Safe and idempotent: can be executed repeatedly in Supabase SQL Editor.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SCHEMA AND ROLE GRANTS
-- PostgREST runs queries as 'authenticated' or 'anon' roles.
-- In PostgreSQL, table-level grants MUST exist before Row Level Security (RLS)
-- policies are evaluated. Without table grants, PostgreSQL returns code 42501
-- ("permission denied for table ...") and PostgREST returns HTTP 401.
-- ----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- Grants for authenticated users (required for authenticated CRUD)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.transactions TO authenticated;

-- Grants for anon role (allows PostgREST to query; RLS policies ensure 0 rows returned)
GRANT SELECT ON TABLE public.profiles TO anon;
GRANT SELECT ON TABLE public.accounts TO anon;
GRANT SELECT ON TABLE public.transactions TO anon;

-- Configure future table default privileges in public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- ----------------------------------------------------------------------------
-- 2. ENSURE RLS IS ENABLED ON ALL TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. PROFILES POLICIES (Scaped strictly to auth.uid() = user_id)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can select own profile" ON public.profiles;
CREATE POLICY "Users can select own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
    ON public.profiles FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 4. ACCOUNTS POLICIES (Scoped strictly to auth.uid() = user_id)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can select own accounts" ON public.accounts;
CREATE POLICY "Users can select own accounts"
    ON public.accounts FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own accounts" ON public.accounts;
CREATE POLICY "Users can insert own accounts"
    ON public.accounts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own accounts" ON public.accounts;
CREATE POLICY "Users can update own accounts"
    ON public.accounts FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own accounts" ON public.accounts;
CREATE POLICY "Users can delete own accounts"
    ON public.accounts FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 5. TRANSACTIONS POLICIES (Scoped strictly to auth.uid() = user_id and owned account)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can select own transactions" ON public.transactions;
CREATE POLICY "Users can select own transactions"
    ON public.transactions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions"
    ON public.transactions FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND (
            account_id IS NULL
            OR EXISTS (
                SELECT 1 FROM public.accounts
                WHERE accounts.id = transactions.account_id
                AND accounts.user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions"
    ON public.transactions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id
        AND (
            account_id IS NULL
            OR EXISTS (
                SELECT 1 FROM public.accounts
                WHERE accounts.id = transactions.account_id
                AND accounts.user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions"
    ON public.transactions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 6. AUTOMATIC USER PROFILE TRIGGER
-- Ensures every new user registered in auth.users automatically receives a row
-- in public.profiles, populated from auth metadata, even if email confirmation
-- is required and the user has not logged in yet.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email
    )
    ON CONFLICT (user_id) DO UPDATE SET
        full_name = CASE 
            WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name 
            ELSE profiles.full_name 
        END,
        email = COALESCE(EXCLUDED.email, profiles.email),
        updated_at = NOW();
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Fallback: Do not block signup registration if profile insert encounters an edge case
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
