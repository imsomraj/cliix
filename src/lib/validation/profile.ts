const USERNAME_REGEX = /^[a-z0-9_]{3,32}$/;
const BIO_MAX_LENGTH = 180;
const DISPLAY_NAME_MAX_LENGTH = 80;

const RESERVED_ROUTES = new Set([
  'admin',
  'api',
  'dashboard',
  'login',
  'signup',
  'settings',
  'help',
  '_next',
]);

export function sanitizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '_');
}

export function sanitizeDisplayName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function sanitizeBio(value: string): string {
  return value
    .trim()
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, BIO_MAX_LENGTH);
}

export function validateUsername(value: string): string | null {
  if (!USERNAME_REGEX.test(value)) {
    return 'Username must be 3-32 characters and use only lowercase letters, numbers, or underscores.';
  }

  if (RESERVED_ROUTES.has(value)) {
    return 'This username is reserved.';
  }

  return null;
}

export function validateDisplayName(value: string): string | null {
  if (!value) {
    return 'Display name is required.';
  }

  if (value.length > DISPLAY_NAME_MAX_LENGTH) {
    return `Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or less.`;
  }

  return null;
}

export function validateBio(value: string): string | null {
  if (value.length > BIO_MAX_LENGTH) {
    return `Bio must be ${BIO_MAX_LENGTH} characters or less.`;
  }

  return null;
}

export function isUsernameRouteAvailable(value: string): boolean {
  return !RESERVED_ROUTES.has(value);
}

export const profileValidationConstants = {
  BIO_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
};
