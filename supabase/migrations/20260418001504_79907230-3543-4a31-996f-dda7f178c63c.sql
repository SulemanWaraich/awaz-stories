
-- Insert a synthetic auth user so the seed creator profile can be linked.
-- The instance_id matches Supabase's default. Password is a random hash that
-- cannot be used to log in (no email confirmed, encrypted_password is bogus).
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token,
  email_change, email_change_token_new, recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated',
  'editorial+seed@awaz.internal',
  crypt('seed-no-login-' || gen_random_uuid()::text, gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Awaz Editorial","role":"creator"}'::jsonb,
  false, '', '', '', ''
)
ON CONFLICT (id) DO NOTHING;
