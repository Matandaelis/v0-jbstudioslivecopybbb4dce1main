# Authentication Bypass Implementation Checklist

## Phase 1: Pre-Disable (Before Disabling Auth)

### Documentation
- [x] Backup current `middleware.ts` configuration
- [x] Document all current role-permission mappings in `lib/types.ts`
- [x] Record all protected routes in `middleware.ts`
- [x] Capture RLS policy definitions from Supabase
- [x] Save current session management flow

### Code Review
- [x] Identify all authentication checkpoints:
  - [x] Middleware route protection
  - [x] Auth context provider
  - [x] Protected route component
  - [x] API route authentication checks
  - [x] Server action authentication
- [x] List all protected routes in the app
- [x] Document current role permission structure

### Database
- [x] Export RLS policies:
  ```sql
  -- Export from Supabase SQL Editor
  -- Copy all ALTER TABLE ... ENABLE ROW LEVEL SECURITY statements
  -- Copy all CREATE POLICY statements
  ```
- [x] Create backup of user roles and permissions

### Team Communication
- [ ] Notify team that auth will be disabled
- [ ] Explain timeline and scope
- [ ] Share this checklist with relevant stakeholders
- [ ] Document expected changes in behavior

---

## Phase 2: Implementation (Creating Bypass Mechanism)

### New Files Created
- [x] `lib/auth-config.ts` - Feature flag configuration
- [x] `lib/api-auth.ts` - API authentication helper functions
- [x] `AUTH_BYPASS_STRATEGY.md` - Complete strategy document
- [x] `DEVELOPMENT_MODE_GUIDE.md` - Developer guide
- [x] `AUTH_IMPLEMENTATION_CHECKLIST.md` - This file

### Files Modified
- [x] `middleware.ts` - Added auth disable check
- [x] `context/auth-context.tsx` - Added dev user fallback
- [x] `components/protected-route.tsx` - Added dev mode warning
- [x] `app/api/livekit/token/route.ts` - Use new helper
- [x] `app/api/streams/route.ts` - Use new helper

### Code Changes Verification
- [x] All new code uses `isAuthEnabled()` flag
- [x] All components handle `authDisabled` prop
- [x] Dev user is consistently returned when auth disabled
- [x] Debug logging is implemented
- [x] No hardcoded authentication removals

### API Routes to Update

Still need to update these API routes to use `requireAuth()`:

- [ ] `app/api/streams/[streamId]/join/route.ts`
- [ ] `app/api/streams/[streamId]/chat/route.ts`
- [ ] `app/api/streams/[streamId]/viewers/route.ts`
- [ ] Any other authenticated API routes

Use template:
```typescript
import { requireAuth } from "@/lib/api-auth"

export async function POST(request: Request) {
  const { authorized, user, response } = await requireAuth()
  if (!authorized) return response
  
  // Rest of function...
}
```

---

## Phase 3: Activation (Disabling Auth)

### Environment Setup
- [ ] Update `.env.local`:
  ```bash
  NEXT_PUBLIC_ENABLE_AUTH=false
  AUTH_DEBUG=true
  ```
- [ ] Verify environment variable is set:
  ```bash
  echo $NEXT_PUBLIC_ENABLE_AUTH  # Should output: false
  ```

### Supabase Configuration
- [ ] OPTIONAL: Disable RLS policies (if you want full data access)
  ```sql
  ALTER TABLE users DISABLE ROW LEVEL SECURITY;
  ALTER TABLE live_streams DISABLE ROW LEVEL SECURITY;
  ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
  -- etc. for all tables that have RLS
  ```
- [ ] Or: Keep RLS enabled to test data access layer

### Build & Test
- [ ] Clear Next.js build cache:
  ```bash
  rm -rf .next
  ```
- [ ] Restart development server
- [ ] Test that you can access protected routes without login
- [ ] Verify console shows debug messages

### Functionality Testing
- [ ] Access `/host-dashboard` without login
- [ ] Access `/admin-dashboard` without login
- [ ] Check yellow dev warning appears
- [ ] Try API call to `/api/livekit/token` - should work
- [ ] Create a stream via API - should work
- [ ] Verify all pages load and function

---

## Phase 4: Development Period

### Daily Operations
- [ ] Create dev data as needed for testing
- [ ] Log issues and features being worked on
- [ ] Document any workarounds for auth-dependent features
- [ ] Keep track of dev data created (for cleanup later)

### Monitoring
- [ ] Monitor for any auth-related errors in console
- [ ] Check that debug logs help understand flow
- [ ] Verify database operations complete successfully
- [ ] Monitor for permission-related issues that will surface on re-enable

### Feature Development
- [ ] Build features without auth blockers
- [ ] Document features that assume authenticated users
- [ ] Test all user roles with dev user
- [ ] Record permission requirements

### What NOT To Do
- [ ] ❌ Don't commit `.env.local` with `NEXT_PUBLIC_ENABLE_AUTH=false`
- [ ] ❌ Don't deploy to production with auth disabled
- [ ] ❌ Don't delete auth code - only bypass it
- [ ] ❌ Don't assume tests will pass with auth re-enabled

---

## Phase 5: Pre-Re-enablement Preparation

### Data Cleanup (1-2 days before re-enabling)
- [ ] Identify all dev data created
- [ ] Backup important data if needed
- [ ] Delete dev mode records:
  ```sql
  DELETE FROM live_streams WHERE host_id = 'dev-user-001';
  DELETE FROM chat_messages WHERE sender_id = 'dev-user-001';
  -- etc.
  ```
- [ ] Verify test data is cleaned
- [ ] Take database backup

### Code Validation
- [ ] Review all modified files
- [ ] Verify no hardcoded auth bypasses remain
- [ ] Check that all auth checks use the feature flag
- [ ] Ensure debug logging can be disabled

### RLS Preparation
- [ ] Get RLS policy definitions from backup
- [ ] Prepare re-enable SQL statements:
  ```sql
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
  ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
  -- etc.
  ```
- [ ] Test RLS policies on staging if available
- [ ] Have Supabase dashboard open and ready

### Team Preparation
- [ ] Notify team of re-enablement time
- [ ] Document what they should test
- [ ] Prepare rollback plan
- [ ] Brief on expected behavior changes

---

## Phase 6: Re-enablement (The Actual Switch)

### Before Re-enablement
- [ ] Stop development server
- [ ] Ensure all team members are notified
- [ ] Have rollback plan ready
- [ ] Create database backup

### Update Configuration
- [ ] Change `.env.local`:
  ```bash
  NEXT_PUBLIC_ENABLE_AUTH=true
  AUTH_DEBUG=false
  ```
- [ ] Verify environment variable:
  ```bash
  echo $NEXT_PUBLIC_ENABLE_AUTH  # Should output: true
  ```

### Database
- [ ] Re-enable RLS policies in Supabase:
  ```sql
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
  ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
  -- etc.
  ```
- [ ] Verify all RLS policies are correct
- [ ] Test RLS with test queries

### Build & Start
- [ ] Clear Next.js cache:
  ```bash
  rm -rf .next
  ```
- [ ] Start development server
- [ ] Check for errors in console
- [ ] Look for auth initialization messages

### Testing Phase 1: Basic Flow
- [ ] Access `/` - should load homepage
- [ ] Try accessing `/host-dashboard` - should redirect to `/login`
- [ ] Login with test account - should work
- [ ] Verify session is created
- [ ] Access `/host-dashboard` - should load
- [ ] Logout - should clear session

### Testing Phase 2: API Authentication
- [ ] Call API without token - should return 401
- [ ] Call API with valid session - should work
- [ ] Verify user ID matches authenticated user
- [ ] Test role-based API access

### Testing Phase 3: Role-Based Access
- [ ] Create test accounts with different roles
- [ ] Login as host - access host features
- [ ] Login as admin - access admin features
- [ ] Try accessing wrong role page - should deny
- [ ] Check protected routes with each role

### Testing Phase 4: Permission Checks
- [ ] Test features requiring specific permissions
- [ ] Verify permission denials work correctly
- [ ] Check error messages are clear
- [ ] Verify audit logs record attempts

### Rollback Triggers

If any of these occur, consider rolling back:

- [ ] ⚠️ Login fails for all users
- [ ] ⚠️ Sessions not created
- [ ] ⚠️ Protected routes redirect everyone to login
- [ ] ⚠️ Database connection errors increase
- [ ] ⚠️ API rate of 401 errors is high
- [ ] ⚠️ RLS policies causing legitimate access denials

**To Rollback**:
```bash
# 1. Set auth disabled again
NEXT_PUBLIC_ENABLE_AUTH=false

# 2. Disable RLS if you enabled it
# (In Supabase SQL Editor)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE live_streams DISABLE ROW LEVEL SECURITY;
# etc.

# 3. Restart server
rm -rf .next
npm run dev

# 4. Investigate issue and retry
```

---

## Phase 7: Post-Re-enablement Monitoring

### First 24 Hours
- [ ] Monitor error logs closely
- [ ] Check authentication success rates
- [ ] Verify session creation and clearing
- [ ] Monitor API error rates
- [ ] Check for permission-related errors

### First Week
- [ ] Continue monitoring auth-related errors
- [ ] Check user login/logout flow
- [ ] Monitor for data access issues
- [ ] Verify role enforcement across app
- [ ] Test with variety of user roles

### Documentation
- [ ] Update `AUTH_IMPLEMENTATION_CHECKLIST.md` with results
- [ ] Document any issues encountered
- [ ] Record performance impact
- [ ] Note any changes needed to RLS policies
- [ ] Document lessons learned

### Success Criteria
- ✅ Users can login/logout successfully
- ✅ Sessions persist across page reloads
- ✅ Protected routes work correctly
- ✅ API authentication functions
- ✅ Role-based access is enforced
- ✅ No significant error rate increase
- ✅ Data access layer (RLS) works correctly
- ✅ Team confirms expected behavior restored

---

## Sign-Off

- **Completed By**: [Your name]
- **Date Disabled**: [Date]
- **Date Re-enabled**: [Date]
- **Duration**: [X days in dev mode]
- **Issues Encountered**: [Any issues]
- **Resolution**: [How resolved]
- **Approved By**: [Project lead/manager]

---

## Next Steps

1. Copy this checklist to a note-taking app or wiki
2. Work through Phase 1 items
3. Have another team member review your answers
4. Proceed to Phase 2 implementation
5. Test thoroughly in Phase 3
6. Document your experience
7. Plan re-enablement timeline before starting Phase 4

---

## Resources

- `AUTH_BYPASS_STRATEGY.md` - Detailed technical strategy
- `DEVELOPMENT_MODE_GUIDE.md` - Guide for developers during dev period
- `lib/auth-config.ts` - Configuration code
- `lib/api-auth.ts` - API helper functions
- `middleware.ts` - Route protection code
- `context/auth-context.tsx` - Session management code
