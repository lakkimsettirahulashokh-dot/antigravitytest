-- ==============================================================================
-- BTechPath AI OS — Migration 17: Secure Admin RLS & Role Assignment Table
-- Prevents self-promotion to admin role; makes admin authorization DB-authoritative
-- ==============================================================================

-- 1. SECURE ADMIN ROLE ASSIGNMENTS TABLE
--    This is the authoritative source of truth for admin status.
--    Populated only by the trigger that runs at user creation (for bootstrap)
--    or by an existing admin. Students can never self-insert.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_role_assignments (
    user_id   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email     TEXT NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    granted_by TEXT NOT NULL DEFAULT 'system_bootstrap'
);

ALTER TABLE public.admin_role_assignments ENABLE ROW LEVEL SECURITY;

-- Only admins can SELECT from this table (used by is_admin() SECURITY DEFINER)
DROP POLICY IF EXISTS "Admin reads role assignments" ON public.admin_role_assignments;
CREATE POLICY "Admin reads role assignments" ON public.admin_role_assignments
    FOR SELECT USING (public.is_admin());

-- No user can INSERT/UPDATE/DELETE — managed by DB triggers & admin functions only
DROP POLICY IF EXISTS "No self-assignment" ON public.admin_role_assignments;
CREATE POLICY "No self-assignment" ON public.admin_role_assignments
    FOR ALL USING (false) WITH CHECK (false);

-- 2. STRENGTHEN is_admin() FUNCTION
--    Checks admin_role_assignments first (most authoritative),
--    then falls back to profiles.role = 'admin' owned by auth.uid(),
--    never trusts email string from JWT alone as the sole final decision.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Primary: check dedicated admin_role_assignments table
    IF EXISTS (
        SELECT 1 FROM public.admin_role_assignments
        WHERE user_id = auth.uid()
    ) THEN
        RETURN true;
    END IF;

    -- Secondary: check profiles.role field
    IF EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RETURN true;
    END IF;

    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FIX PROFILES UPDATE RLS — PREVENT SELF-PROMOTION TO ADMIN
--    Students can update their own profile fields (name, branch, semester, etc.)
--    but CANNOT change their own role. Only an admin or DB trigger can set role.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (
        -- Admin can update anything
        public.is_admin()
        OR (
            -- Non-admin can only update their own row AND cannot elevate their role
            auth.uid() = id
            AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
        )
    );

-- 4. BOOTSTRAP: Grant admin role assignment to the authorized admin account
--    This runs safely (ON CONFLICT DO NOTHING) so it's idempotent.
--    It looks up the auth.users row by email to get the UUID.
--    The password is NOT set here — it is managed by Supabase Auth.
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_admin_email TEXT := 'rahulashokhlakkimsetty@gmail.com';
    v_admin_id UUID;
BEGIN
    -- Bootstrap primary admin
    SELECT id INTO v_admin_id FROM auth.users WHERE LOWER(email) = LOWER(v_admin_email) LIMIT 1;
    IF v_admin_id IS NOT NULL THEN
        INSERT INTO public.admin_role_assignments (user_id, email, granted_by)
        VALUES (v_admin_id, v_admin_email, 'system_bootstrap')
        ON CONFLICT (user_id) DO NOTHING;

        -- Also ensure profiles.role = 'admin'
        UPDATE public.profiles SET role = 'admin'
        WHERE id = v_admin_id AND role != 'admin';
    END IF;
END $$;

-- 5. UPDATE handle_new_user TRIGGER
--    When a new admin-email user registers, auto-insert into admin_role_assignments.
--    Students are never inserted into this table.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_email TEXT := 'rahulashokhlakkimsetty@gmail.com';
    v_is_admin BOOLEAN;
BEGIN
    v_is_admin := LOWER(NEW.email) = LOWER(v_admin_email);

    INSERT INTO public.profiles (id, email, full_name, role, tier)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        CASE WHEN v_is_admin THEN 'admin' ELSE 'student' END,
        'Engineering Scholar'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);

    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Auto-grant admin_role_assignments for admin emails
    IF v_is_admin THEN
        INSERT INTO public.admin_role_assignments (user_id, email, granted_by)
        VALUES (NEW.id, NEW.email, 'auto_trigger')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
