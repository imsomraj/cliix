import { randomUUID } from 'node:crypto';

import { resolveIconForUrl } from '@/lib/icon-resolution';

export type DashboardLink = {
  id: string;
  title: string;
  url: string;
  position: number;
  isEnabled: boolean;
  iconUrl: string;
  iconSource: 'manual' | 'known-platform' | 'favicon';
  manualIconUrl: string | null;
};

export type SocialItem = {
  id: string;
  platform: string;
  url: string;
  position: number;
  isEnabled: boolean;
  iconUrl: string;
  iconSource: 'manual' | 'known-platform' | 'favicon';
  manualIconUrl: string | null;
};

const links = new Map<string, DashboardLink>();
const socialItems = new Map<string, SocialItem>();

const sortByPosition = <T extends { position: number }>(items: T[]) => items.sort((a, b) => a.position - b.position);

export const dashboardStore = {
  listLinks(): DashboardLink[] {
    return sortByPosition(Array.from(links.values()));
  },
  createLink(input: Omit<DashboardLink, 'id' | 'position' | 'iconUrl' | 'iconSource'>): DashboardLink {
    const position = links.size;
    const icon = resolveIconForUrl({ url: input.url, manualIconUrl: input.manualIconUrl });

    const link: DashboardLink = {
      id: randomUUID(),
      position,
      iconUrl: icon.iconUrl,
      iconSource: icon.source,
      ...input,
    };

    links.set(link.id, link);
    return link;
  },
  updateLink(id: string, input: Partial<Omit<DashboardLink, 'id' | 'position' | 'iconSource' | 'iconUrl'>>): DashboardLink | null {
    const existing = links.get(id);
    if (!existing) return null;

    const next = { ...existing, ...input };
    const icon = resolveIconForUrl({ url: next.url, manualIconUrl: next.manualIconUrl });
    next.iconUrl = icon.iconUrl;
    next.iconSource = icon.source;

    links.set(id, next);
    return next;
  },
  deleteLink(id: string): boolean {
    const deleted = links.delete(id);
    this.reorderLinks(
      this.listLinks().map((link, index) => ({ id: link.id, position: index })),
    );
    return deleted;
  },
  reorderLinks(items: Array<{ id: string; position: number }>): DashboardLink[] {
    items.forEach(({ id, position }) => {
      const link = links.get(id);
      if (link) {
        link.position = position;
        links.set(id, link);
      }
    });
    return this.listLinks();
  },
  setLinkEnabled(id: string, isEnabled: boolean): DashboardLink | null {
    const link = links.get(id);
    if (!link) return null;

    link.isEnabled = isEnabled;
    links.set(id, link);
    return link;
  },
  listSocialItems(): SocialItem[] {
    return sortByPosition(Array.from(socialItems.values()));
  },
  createSocialItem(input: Omit<SocialItem, 'id' | 'position' | 'iconUrl' | 'iconSource'>): SocialItem {
    const position = socialItems.size;
    const icon = resolveIconForUrl({
      url: input.url,
      manualIconUrl: input.manualIconUrl,
      platform: input.platform,
    });

    const item: SocialItem = {
      id: randomUUID(),
      position,
      iconUrl: icon.iconUrl,
      iconSource: icon.source,
      ...input,
    };

    socialItems.set(item.id, item);
    return item;
  },
  updateSocialItem(id: string, input: Partial<Omit<SocialItem, 'id' | 'position' | 'iconSource' | 'iconUrl'>>): SocialItem | null {
    const existing = socialItems.get(id);
    if (!existing) return null;

    const next = { ...existing, ...input };
    const icon = resolveIconForUrl({
      url: next.url,
      manualIconUrl: next.manualIconUrl,
      platform: next.platform,
    });
    next.iconUrl = icon.iconUrl;
    next.iconSource = icon.source;

    socialItems.set(id, next);
    return next;
  },
  deleteSocialItem(id: string): boolean {
    const deleted = socialItems.delete(id);
    this.reorderSocialItems(
      this.listSocialItems().map((item, index) => ({ id: item.id, position: index })),
    );
    return deleted;
  },
  reorderSocialItems(items: Array<{ id: string; position: number }>): SocialItem[] {
    items.forEach(({ id, position }) => {
      const item = socialItems.get(id);
      if (item) {
        item.position = position;
        socialItems.set(id, item);
      }
    });
    return this.listSocialItems();
  },
  setSocialItemEnabled(id: string, isEnabled: boolean): SocialItem | null {
    const item = socialItems.get(id);
    if (!item) return null;

    item.isEnabled = isEnabled;
    socialItems.set(id, item);
    return item;
  },
};
