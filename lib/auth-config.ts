// Controls authentication behavior globally
// Set NEXT_PUBLIC_ENABLE_AUTH environment variable to control this

export const AUTH_CONFIG = {
  // Master switch for all authentication
  ENABLE_AUTH: process.env.NEXT_PUBLIC_ENABLE_AUTH === 'true' ?? true,
  
  // Logging and debugging
  AUTH_DEBUG: process.env.AUTH_DEBUG === 'true',
  
  // Public routes that always bypass auth
  PUBLIC_ROUTES: ['/', '/help-center', '/login', '/signup', '/live-showcase'],
  
  // Routes that require authentication
  PROTECTED_ROUTES: [
    '/host-dashboard',
    '/admin-dashboard',
    '/super-admin',
    '/live',
    '/affiliate-hub',
    '/vendor-dashboard',
    '/brand-partner-portal',
    '/creator-payout-dashboard',
  ],
  
  // Default development user when auth is disabled
  DEV_USER: {
    id: 'dev-user-001',
    email: 'dev@localhost.local',
    name: 'Development User',
    role: 'host' as const,
    created_at: new Date().toISOString(),
  },
}

export function isAuthEnabled(): boolean {
  return AUTH_CONFIG.ENABLE_AUTH
}

export function logAuthDebug(message: string, data?: any) {
  if (AUTH_CONFIG.AUTH_DEBUG) {
    console.log(`[AUTH_DEBUG] ${message}`, data || '')
  }
}

export function getDevUser() {
  return AUTH_CONFIG.DEV_USER as any
}
