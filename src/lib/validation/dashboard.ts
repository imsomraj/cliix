import { z } from 'zod';

import { optionalSanitizedUrlSchema, sanitizedUrlSchema } from './url';

const idSchema = z.string().uuid('Invalid id');

const displayNameSchema = z.string().trim().min(1, 'Name is required').max(120, 'Name is too long');

const positionSchema = z.number().int().nonnegative();

const enabledSchema = z.boolean();

export const createLinkSchema = z.object({
  title: displayNameSchema,
  url: sanitizedUrlSchema,
  isEnabled: enabledSchema.default(true),
  manualIconUrl: optionalSanitizedUrlSchema,
});

export const updateLinkSchema = z.object({
  id: idSchema,
  title: displayNameSchema.optional(),
  url: sanitizedUrlSchema.optional(),
  isEnabled: enabledSchema.optional(),
  manualIconUrl: optionalSanitizedUrlSchema.optional(),
});

export const deleteLinkSchema = z.object({
  id: idSchema,
});

export const reorderLinksSchema = z.object({
  items: z.array(z.object({ id: idSchema, position: positionSchema })).min(1),
});

export const setLinkEnabledSchema = z.object({
  id: idSchema,
  isEnabled: enabledSchema,
});

export const createSocialItemSchema = z.object({
  platform: displayNameSchema,
  url: sanitizedUrlSchema,
  isEnabled: enabledSchema.default(true),
  manualIconUrl: optionalSanitizedUrlSchema,
});

export const updateSocialItemSchema = z.object({
  id: idSchema,
  platform: displayNameSchema.optional(),
  url: sanitizedUrlSchema.optional(),
  isEnabled: enabledSchema.optional(),
  manualIconUrl: optionalSanitizedUrlSchema.optional(),
});

export const deleteSocialItemSchema = z.object({
  id: idSchema,
});

export const reorderSocialItemsSchema = z.object({
  items: z.array(z.object({ id: idSchema, position: positionSchema })).min(1),
});

export const setSocialItemEnabledSchema = z.object({
  id: idSchema,
  isEnabled: enabledSchema,
});
