import { z } from 'zod';

const PROTOCOL_ALLOWLIST = new Set(['http:', 'https:']);

export const sanitizedUrlSchema = z
  .string()
  .trim()
  .min(1, 'URL is required')
  .max(2048, 'URL is too long')
  .transform((value) => value.replace(/\s+/g, ''))
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return PROTOCOL_ALLOWLIST.has(parsed.protocol);
    } catch {
      return false;
    }
  }, 'URL must be a valid http(s) URL')
  .transform((value) => {
    const parsed = new URL(value);

    parsed.protocol = parsed.protocol.toLowerCase();
    parsed.hostname = parsed.hostname.toLowerCase();

    if ((parsed.protocol === 'https:' && parsed.port === '443') || (parsed.protocol === 'http:' && parsed.port === '80')) {
      parsed.port = '';
    }

    if (!parsed.pathname) {
      parsed.pathname = '/';
    }

    return parsed.toString();
  });

export const optionalSanitizedUrlSchema = z.union([sanitizedUrlSchema, z.literal('').transform(() => null)]).nullable();
