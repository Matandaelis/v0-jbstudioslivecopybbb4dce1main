# Development Mode: Working with Disabled Authentication

## Current Status

**Authentication Status**: Check your `.env.local` file for `NEXT_PUBLIC_ENABLE_AUTH`

```bash
# Development (Auth Disabled)
NEXT_PUBLIC_ENABLE_AUTH=false
AUTH_DEBUG=true

# Production (Auth Enabled)
NEXT_PUBLIC_ENABLE_AUTH=true
AUTH_DEBUG=false
```

## What This Means

When `NEXT_PUBLIC_ENABLE_AUTH=false`:

✅ All routes are accessible without login
✅ You are automatically logged in as: **Development User**
  - Email: dev@localhost.local
  - Role: host
  - ID: dev-user-001

✅ All role checks are bypassed
✅ All permission checks are bypassed
✅ Logout is a no-op (you stay logged in)

❌ Real user authentication does NOT work
❌ Real user sessions are NOT created
❌ Real permission enforcement does NOT apply

## Development User Info

```typescript
{
  id: 'dev-user-001',
  email: 'dev@localhost.local',
  name: 'Development User',
  role: 'host',
  created_at: '2024-01-01T00:00:00.000Z'
}
```

This user is used for all API calls and database operations when auth is disabled.

## Testing Features

When auth is disabled, you can freely test:

- All page functionality
- Data display without login barriers
- Navigation and routing
- API endpoints and responses
- Database queries and mutations
- Component rendering without auth checks

**Important**: When auth is re-enabled, test these thoroughly:
- User login/logout flows
- Role-based access control
- Protected routes and redirects
- Session persistence
- API authentication tokens
- Permission-based UI elements

## Debug Logging

When `AUTH_DEBUG=true`, you'll see debug messages:

```
[AUTH_DEBUG] Auth disabled, using development user
[AUTH_DEBUG] API: Auth disabled, returning dev user
[MIDDLEWARE] Auth disabled - allowing access to /host-dashboard
```

This helps you understand what the auth system is doing. Remove debug mode before deployment.

## Important Reminders

### ⚠️ BEFORE RE-ENABLING AUTH:

1. **Coordinate with team** - Don't surprise people with auth suddenly working
2. **Plan maintenance window** - Notify users they might need to log in
3. **Backup your data** - Save important dev data before cleanup
4. **Review the checklist** - See `AUTH_BYPASS_STRATEGY.md` for full process

### 🗑️ DATA CLEANUP:

All data created while auth is disabled should be deleted before re-enabling:

```sql
-- Remove dev mode records (if you added _dev_mode flag)
DELETE FROM chat_messages WHERE _dev_mode = true;
DELETE FROM live_streams WHERE _dev_mode = true;

-- Or delete by dev user ID
DELETE FROM live_streams WHERE host_id = 'dev-user-001';
```

### 📝 DO NOT:

- ❌ Commit changes while auth is disabled
- ❌ Deploy to production with `NEXT_PUBLIC_ENABLE_AUTH=false`
- ❌ Share test data created in dev mode with production
- ❌ Assume role/permission checks will work when auth is re-enabled

## Re-enablement Steps

When you're ready to re-enable authentication:

1. **Stop development server**
2. **Change `.env.local`**:
   ```bash
   NEXT_PUBLIC_ENABLE_AUTH=true
   AUTH_DEBUG=false
   ```
3. **Clean up dev data** (optional but recommended)
4. **Re-enable RLS in Supabase** (if disabled):
   ```sql
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
   ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
   -- etc.
   ```
5. **Start development server**
6. **Test login with real account**
7. **Verify protected routes work**
8. **Check API authentication**

## Debugging Issues

### Auth not disabled?

Check your environment variable:
```bash
echo $NEXT_PUBLIC_ENABLE_AUTH
# Should output: false
```

Clear Next.js cache:
```bash
rm -rf .next
npm run dev
```

### Still being redirected to login?

1. Check middleware.ts has been updated
2. Verify auth-config.ts is imported
3. Restart dev server
4. Clear browser cache/cookies

### Role checks not being bypassed?

Check that `ProtectedRoute` component shows the yellow development warning. If not:
1. Verify `authDisabled` prop is being passed
2. Check `useAuth()` returns `authDisabled: true`
3. Restart dev server

## See Also

- `AUTH_BYPASS_STRATEGY.md` - Complete implementation strategy
- `AUTH_MIGRATION_CHECKLIST.md` - Pre/during/post-disable tasks
- `lib/auth-config.ts` - Configuration module
- `lib/api-auth.ts` - API authentication helpers

## Questions?

Refer to the comprehensive `AUTH_BYPASS_STRATEGY.md` document for detailed information about the entire process, security considerations, and re-enablement procedures.
