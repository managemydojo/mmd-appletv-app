/**
 * Type-safe helpers for extracting user info from the auth store.
 *
 * The auth store's `user` field has two possible shapes:
 * - Post-login: `CurrentUser` with nested `user.user.email`, `user.user.firstName`
 * - Post-storage-reload: may be a flat `{ _id, email, firstName, ... }` if stored differently
 *
 * These selectors handle both shapes safely.
 */
import type { CurrentUser } from '../types/auth';

type MaybeUser = CurrentUser | null;

export function getUserEmail(user: MaybeUser): string {
  if (!user) return '';
  // Nested shape: user.user.email
  if (user.user && typeof user.user === 'object' && 'email' in user.user) {
    return user.user.email || '';
  }
  // Flat shape fallback
  const flat = user as unknown as Record<string, unknown>;
  if ('email' in flat && typeof flat.email === 'string') {
    return flat.email;
  }
  return '';
}

export function getUserFirstName(user: MaybeUser): string {
  if (!user) return '';
  // Nested shape: user.user.firstName
  if (user.user && typeof user.user === 'object' && 'firstName' in user.user) {
    return user.user.firstName || '';
  }
  // Flat shape fallback
  const flat = user as unknown as Record<string, unknown>;
  if ('firstName' in flat && typeof flat.firstName === 'string') {
    return flat.firstName;
  }
  return '';
}

export function getUserLastName(user: MaybeUser): string {
  if (!user) return '';
  // Nested shape: user.user.lastName
  if (user.user && typeof user.user === 'object' && 'lastName' in user.user) {
    const ln = (user.user as { lastName?: string }).lastName;
    return ln || '';
  }
  // Flat shape fallback
  const flat = user as unknown as Record<string, unknown>;
  if ('lastName' in flat && typeof flat.lastName === 'string') {
    return flat.lastName;
  }
  return '';
}

/**
 * Returns the user's full name (firstName + lastName). Falls back to firstName
 * alone, then email, then empty string.
 */
export function getUserFullName(user: MaybeUser): string {
  if (!user) return '';
  const first = getUserFirstName(user);
  const last = getUserLastName(user);
  const full = [first, last].filter(Boolean).join(' ').trim();
  return full || first || getUserEmail(user);
}

/**
 * Normalizes a backend role name (e.g., "Student", "Dojo Cast", "Admin") to
 * one of the app's internal role identifiers. Returns null if unrecognized.
 */
export function normalizeBackendRole(
  name: string | undefined | null,
): 'student' | 'dojo' | 'admin' | null {
  if (!name || typeof name !== 'string') return null;
  const n = name.toLowerCase().trim();
  if (n.includes('dojo')) return 'dojo';
  if (n.includes('admin')) return 'admin';
  if (n.includes('student')) return 'student';
  return null;
}

/**
 * Extracts the backend role name from a CurrentUser, handling both nested
 * (user.userRole.role.name) and flat (user.userRole.role.name) shapes.
 */
export function getBackendRoleName(user: MaybeUser): string {
  if (!user) return '';
  // Try standard nested shape
  const ur = (user as { userRole?: { role?: { name?: string } } }).userRole;
  if (ur?.role?.name) return ur.role.name;
  return '';
}

/** Human-readable label for an app role. */
export function roleLabel(role: 'student' | 'dojo' | 'admin'): string {
  switch (role) {
    case 'student':
      return 'Students';
    case 'dojo':
      return 'Dojo Cast';
    case 'admin':
      return 'Admin';
    default:
      return role;
  }
}
