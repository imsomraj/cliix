'use server';

import {
  createLinkSchema,
  createSocialItemSchema,
  deleteLinkSchema,
  deleteSocialItemSchema,
  reorderLinksSchema,
  reorderSocialItemsSchema,
  setLinkEnabledSchema,
  setSocialItemEnabledSchema,
  updateLinkSchema,
  updateSocialItemSchema,
} from '@/lib/validation/dashboard';
import { dashboardStore } from '@/lib/store/dashboard-store';

export async function createLinkAction(input: unknown) {
  const payload = createLinkSchema.parse(input);
  return dashboardStore.createLink(payload);
}

export async function updateLinkAction(input: unknown) {
  const payload = updateLinkSchema.parse(input);
  const updated = dashboardStore.updateLink(payload.id, payload);

  if (!updated) {
    throw new Error('Link not found');
  }

  return updated;
}

export async function deleteLinkAction(input: unknown) {
  const payload = deleteLinkSchema.parse(input);
  const deleted = dashboardStore.deleteLink(payload.id);

  if (!deleted) {
    throw new Error('Link not found');
  }

  return { ok: true };
}

export async function reorderLinksAction(input: unknown) {
  const payload = reorderLinksSchema.parse(input);
  return dashboardStore.reorderLinks(payload.items);
}

export async function setLinkEnabledAction(input: unknown) {
  const payload = setLinkEnabledSchema.parse(input);
  const link = dashboardStore.setLinkEnabled(payload.id, payload.isEnabled);

  if (!link) {
    throw new Error('Link not found');
  }

  return link;
}

export async function createSocialItemAction(input: unknown) {
  const payload = createSocialItemSchema.parse(input);
  return dashboardStore.createSocialItem(payload);
}

export async function updateSocialItemAction(input: unknown) {
  const payload = updateSocialItemSchema.parse(input);
  const updated = dashboardStore.updateSocialItem(payload.id, payload);

  if (!updated) {
    throw new Error('Social item not found');
  }

  return updated;
}

export async function deleteSocialItemAction(input: unknown) {
  const payload = deleteSocialItemSchema.parse(input);
  const deleted = dashboardStore.deleteSocialItem(payload.id);

  if (!deleted) {
    throw new Error('Social item not found');
  }

  return { ok: true };
}

export async function reorderSocialItemsAction(input: unknown) {
  const payload = reorderSocialItemsSchema.parse(input);
  return dashboardStore.reorderSocialItems(payload.items);
}

export async function setSocialItemEnabledAction(input: unknown) {
  const payload = setSocialItemEnabledSchema.parse(input);
  const item = dashboardStore.setSocialItemEnabled(payload.id, payload.isEnabled);

  if (!item) {
    throw new Error('Social item not found');
  }

  return item;
}
