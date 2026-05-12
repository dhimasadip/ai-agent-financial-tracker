/**
 * Centralized Environment Configuration
 * All environment variables are accessed through this module
 */

// Detect if running in development mode
const isDev = process.env.NODE_ENV === 'development';

// Database configuration
// Development: Uses DATABASE_TEST if set, otherwise falls back to DATABASE_URL
// Production: Uses DATABASE_URL only
export const db = {
  // In dev: prefer DATABASE_TEST, fallback to DATABASE_URL
  // In prod: use DATABASE_URL only
  url: isDev
    ? (process.env.DATABASE_TEST || process.env.DATABASE_URL || '')
    : (process.env.DATABASE_URL || ''),
  testUrl: process.env.DATABASE_TEST || '',
  prodUrl: process.env.DATABASE_URL || '',
  isDev,
} as const;

// Anthropic configuration
export const anthropic = {
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  baseUrl: process.env.ANTHROPIC_BASE_URL || undefined,
} as const;

// NextAuth configuration
export const auth = {
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-change-in-production',
  url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
} as const;

// Resend configuration (for email magic links)
export const resend = {
  apiKey: process.env.RESEND_API_KEY || '',
} as const;

// Demo user ID (only used when auth is not set up)
export const demo = {
  userId: process.env.DEMO_USER_ID || '00000000-0000-0000-0000-000000000001',
} as const;

// Check if database is configured
export const isDatabaseConfigured = () => {
  return !!db.url;
};

// Check if Anthropic is configured
export const isAnthropicConfigured = () => {
  return !!anthropic.apiKey;
};

// Get user ID from session or demo
// This will be replaced with proper session lookup after auth setup
export function getUserId(): string {
  return demo.userId;
}