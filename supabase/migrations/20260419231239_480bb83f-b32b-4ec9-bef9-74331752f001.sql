UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email IN ('listener.test@awaz.dev', 'creator.test@awaz.dev', 'admin.test@awaz.dev')
  AND email_confirmed_at IS NULL;