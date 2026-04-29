---
description: Creating a new Admin Account
---

# Creating a new Admin Account

oops!Pleasured relies on Supabase Auth. To make an account an "admin" able to access the `/admin` portal, it needs to be present in the `user_roles` database table with the `admin` role.

Since the `user_roles` table involves Row-Level Security (RLS) policies that only allow existing admins to modify roles, creating the *very first* admin must be done via a secure server environment, or using the Supabase Service Role key.

We have deployed a secure edge function to handle this:

### Using the Edge Function to create an admin account

Run the following command in PowerShell, replacing the `email` and `password` with your desired credentials. The `SETUP_SECRET` must match the one configured in the Supabase edge function secrets (`oops_admin_setup_2026`).

```powershell
Invoke-RestMethod -Uri "https://fqjlxzwpvefnqiihtedo.supabase.co/functions/v1/setup-admin" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body '{"setup_secret":"oops_admin_setup_2026", "email":"admin2@oopspleasured.com", "password":"SecurePassword123!"}'
```

If it succeeds, you'll receive a response indicating the user and their admin role was created successfully. You can then log into the `/admin/login` page on the website.
