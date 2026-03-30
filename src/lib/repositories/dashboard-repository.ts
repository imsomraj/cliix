import { randomUUID } from 'node:crypto';

import { resolveIconForUrl } from '@/lib/icon-resolution';
import { postgrestRequest } from '@/lib/data/postgrest';

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

type LinkRow = {
  id: string;
  title: string;
  url: string;
  position: number;
  is_enabled: boolean;
  icon_url: string;
  icon_source: DashboardLink['iconSource'];
  manual_icon_url: string | null;
};

type SocialRow = {
  id: string;
  platform: string;
  url: string;
  position: number;
  is_enabled: boolean;
  icon_url: string;
  icon_source: SocialItem['iconSource'];
  manual_icon_url: string | null;
};

const useInMemoryMocks = process.env.ENABLE_LOCAL_INMEMORY_MOCKS === 'true' && process.env.NODE_ENV !== 'production';

const links = new Map<string, DashboardLink>();
const socialItems = new Map<string, SocialItem>();

const sortByPosition = <T extends { position: number }>(items: T[]) => items.sort((a, b) => a.position - b.position);

function mapLinkRow(row: LinkRow): DashboardLink {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    position: row.position,
    isEnabled: row.is_enabled,
    iconUrl: row.icon_url,
    iconSource: row.icon_source,
    manualIconUrl: row.manual_icon_url,
  };
}

function mapSocialRow(row: SocialRow): SocialItem {
  return {
    id: row.id,
    platform: row.platform,
    url: row.url,
    position: row.position,
    isEnabled: row.is_enabled,
    iconUrl: row.icon_url,
    iconSource: row.icon_source,
    manualIconUrl: row.manual_icon_url,
  };
}

export const dashboardRepository = {
  async listLinks(userId: string, accessToken: string): Promise<DashboardLink[]> {
    if (useInMemoryMocks) {
      return sortByPosition(Array.from(links.values()));
    }

    const rows = await postgrestRequest<LinkRow[]>({
      path: `/links?user_id=eq.${userId}&select=*&order=position.asc`,
      accessToken,
    });

    return rows.map(mapLinkRow);
  },

  async createLink(
    userId: string,
    accessToken: string,
    input: Omit<DashboardLink, 'id' | 'position' | 'iconUrl' | 'iconSource'>,
  ): Promise<DashboardLink> {
    const icon = resolveIconForUrl({ url: input.url, manualIconUrl: input.manualIconUrl });

    if (useInMemoryMocks) {
      const link: DashboardLink = {
        id: randomUUID(),
        position: links.size,
        iconUrl: icon.iconUrl,
        iconSource: icon.source,
        ...input,
      };
      links.set(link.id, link);
      return link;
    }

    const existing = await this.listLinks(userId, accessToken);
    const rows = await postgrestRequest<LinkRow[]>({
      path: '/links',
      method: 'POST',
      accessToken,
      headers: {
        Prefer: 'return=representation',
      },
      body: [
        {
          user_id: userId,
          title: input.title,
          url: input.url,
          manual_icon_url: input.manualIconUrl,
          is_enabled: input.isEnabled,
          icon_url: icon.iconUrl,
          icon_source: icon.source,
          position: existing.length,
        },
      ],
    });

    return mapLinkRow(rows[0]);
  },

  async updateLink(
    userId: string,
    accessToken: string,
    id: string,
    input: Partial<Omit<DashboardLink, 'id' | 'position' | 'iconSource' | 'iconUrl'>>,
  ): Promise<DashboardLink | null> {
    if (useInMemoryMocks) {
      const existing = links.get(id);
      if (!existing) return null;

      const next = { ...existing, ...input };
      const icon = resolveIconForUrl({ url: next.url, manualIconUrl: next.manualIconUrl });
      next.iconUrl = icon.iconUrl;
      next.iconSource = icon.source;
      links.set(id, next);
      return next;
    }

    const current = await postgrestRequest<LinkRow[]>({
      path: `/links?id=eq.${id}&user_id=eq.${userId}&select=*`,
      accessToken,
    });

    if (current.length === 0) return null;

    const next = {
      ...mapLinkRow(current[0]),
      ...input,
    };

    const icon = resolveIconForUrl({ url: next.url, manualIconUrl: next.manualIconUrl });

    const rows = await postgrestRequest<LinkRow[]>({
      path: `/links?id=eq.${id}&user_id=eq.${userId}`,
      method: 'PATCH',
      accessToken,
      headers: {
        Prefer: 'return=representation',
      },
      body: {
        title: next.title,
        url: next.url,
        manual_icon_url: next.manualIconUrl,
        is_enabled: next.isEnabled,
        icon_url: icon.iconUrl,
        icon_source: icon.source,
      },
    });

    return rows[0] ? mapLinkRow(rows[0]) : null;
  },

  async deleteLink(userId: string, accessToken: string, id: string): Promise<boolean> {
    if (useInMemoryMocks) {
      const deleted = links.delete(id);
      const ordered = sortByPosition(Array.from(links.values()));
      ordered.forEach((link, index) => {
        link.position = index;
        links.set(link.id, link);
      });
      return deleted;
    }

    const existing = await postgrestRequest<LinkRow[]>({
      path: `/links?id=eq.${id}&user_id=eq.${userId}&select=id`,
      accessToken,
    });

    if (existing.length === 0) return false;

    await postgrestRequest<unknown>({
      path: `/links?id=eq.${id}&user_id=eq.${userId}`,
      method: 'DELETE',
      accessToken,
    });

    const remaining = await this.listLinks(userId, accessToken);
    await this.reorderLinks(
      userId,
      accessToken,
      remaining.map((link, index) => ({ id: link.id, position: index })),
    );

    return true;
  },

  async reorderLinks(userId: string, accessToken: string, items: Array<{ id: string; position: number }>): Promise<DashboardLink[]> {
    if (useInMemoryMocks) {
      items.forEach(({ id, position }) => {
        const link = links.get(id);
        if (link) {
          link.position = position;
          links.set(id, link);
        }
      });

      return sortByPosition(Array.from(links.values()));
    }

    await Promise.all(
      items.map(({ id, position }) =>
        postgrestRequest<unknown>({
          path: `/links?id=eq.${id}&user_id=eq.${userId}`,
          method: 'PATCH',
          accessToken,
          body: { position },
        }),
      ),
    );

    return this.listLinks(userId, accessToken);
  },

  async setLinkEnabled(userId: string, accessToken: string, id: string, isEnabled: boolean): Promise<DashboardLink | null> {
    if (useInMemoryMocks) {
      const link = links.get(id);
      if (!link) return null;
      link.isEnabled = isEnabled;
      links.set(id, link);
      return link;
    }

    const rows = await postgrestRequest<LinkRow[]>({
      path: `/links?id=eq.${id}&user_id=eq.${userId}`,
      method: 'PATCH',
      accessToken,
      headers: { Prefer: 'return=representation' },
      body: { is_enabled: isEnabled },
    });

    return rows[0] ? mapLinkRow(rows[0]) : null;
  },

  async createSocialItem(
    userId: string,
    accessToken: string,
    input: Omit<SocialItem, 'id' | 'position' | 'iconUrl' | 'iconSource'>,
  ): Promise<SocialItem> {
    const icon = resolveIconForUrl({
      url: input.url,
      manualIconUrl: input.manualIconUrl,
      platform: input.platform,
    });

    if (useInMemoryMocks) {
      const item: SocialItem = {
        id: randomUUID(),
        position: socialItems.size,
        iconUrl: icon.iconUrl,
        iconSource: icon.source,
        ...input,
      };
      socialItems.set(item.id, item);
      return item;
    }

    const existing = await this.listSocialItems(userId, accessToken);
    const rows = await postgrestRequest<SocialRow[]>({
      path: '/social_links',
      method: 'POST',
      accessToken,
      headers: {
        Prefer: 'return=representation',
      },
      body: [
        {
          user_id: userId,
          platform: input.platform,
          url: input.url,
          manual_icon_url: input.manualIconUrl,
          is_enabled: input.isEnabled,
          icon_url: icon.iconUrl,
          icon_source: icon.source,
          position: existing.length,
        },
      ],
    });

    return mapSocialRow(rows[0]);
  },

  async listSocialItems(userId: string, accessToken: string): Promise<SocialItem[]> {
    if (useInMemoryMocks) {
      return sortByPosition(Array.from(socialItems.values()));
    }

    const rows = await postgrestRequest<SocialRow[]>({
      path: `/social_links?user_id=eq.${userId}&select=*&order=position.asc`,
      accessToken,
    });

    return rows.map(mapSocialRow);
  },

  async updateSocialItem(
    userId: string,
    accessToken: string,
    id: string,
    input: Partial<Omit<SocialItem, 'id' | 'position' | 'iconSource' | 'iconUrl'>>,
  ): Promise<SocialItem | null> {
    if (useInMemoryMocks) {
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
    }

    const current = await postgrestRequest<SocialRow[]>({
      path: `/social_links?id=eq.${id}&user_id=eq.${userId}&select=*`,
      accessToken,
    });

    if (current.length === 0) return null;

    const next = {
      ...mapSocialRow(current[0]),
      ...input,
    };

    const icon = resolveIconForUrl({
      url: next.url,
      manualIconUrl: next.manualIconUrl,
      platform: next.platform,
    });

    const rows = await postgrestRequest<SocialRow[]>({
      path: `/social_links?id=eq.${id}&user_id=eq.${userId}`,
      method: 'PATCH',
      accessToken,
      headers: {
        Prefer: 'return=representation',
      },
      body: {
        platform: next.platform,
        url: next.url,
        manual_icon_url: next.manualIconUrl,
        is_enabled: next.isEnabled,
        icon_url: icon.iconUrl,
        icon_source: icon.source,
      },
    });

    return rows[0] ? mapSocialRow(rows[0]) : null;
  },

  async deleteSocialItem(userId: string, accessToken: string, id: string): Promise<boolean> {
    if (useInMemoryMocks) {
      const deleted = socialItems.delete(id);
      const ordered = sortByPosition(Array.from(socialItems.values()));
      ordered.forEach((item, index) => {
        item.position = index;
        socialItems.set(item.id, item);
      });
      return deleted;
    }

    const existing = await postgrestRequest<SocialRow[]>({
      path: `/social_links?id=eq.${id}&user_id=eq.${userId}&select=id`,
      accessToken,
    });

    if (existing.length === 0) return false;

    await postgrestRequest<unknown>({
      path: `/social_links?id=eq.${id}&user_id=eq.${userId}`,
      method: 'DELETE',
      accessToken,
    });

    const remaining = await this.listSocialItems(userId, accessToken);
    await this.reorderSocialItems(
      userId,
      accessToken,
      remaining.map((item, index) => ({ id: item.id, position: index })),
    );

    return true;
  },

  async reorderSocialItems(
    userId: string,
    accessToken: string,
    items: Array<{ id: string; position: number }>,
  ): Promise<SocialItem[]> {
    if (useInMemoryMocks) {
      items.forEach(({ id, position }) => {
        const item = socialItems.get(id);
        if (item) {
          item.position = position;
          socialItems.set(id, item);
        }
      });

      return sortByPosition(Array.from(socialItems.values()));
    }

    await Promise.all(
      items.map(({ id, position }) =>
        postgrestRequest<unknown>({
          path: `/social_links?id=eq.${id}&user_id=eq.${userId}`,
          method: 'PATCH',
          accessToken,
          body: { position },
        }),
      ),
    );

    return this.listSocialItems(userId, accessToken);
  },

  async setSocialItemEnabled(userId: string, accessToken: string, id: string, isEnabled: boolean): Promise<SocialItem | null> {
    if (useInMemoryMocks) {
      const item = socialItems.get(id);
      if (!item) return null;
      item.isEnabled = isEnabled;
      socialItems.set(id, item);
      return item;
    }

    const rows = await postgrestRequest<SocialRow[]>({
      path: `/social_links?id=eq.${id}&user_id=eq.${userId}`,
      method: 'PATCH',
      accessToken,
      headers: { Prefer: 'return=representation' },
      body: { is_enabled: isEnabled },
    });

    return rows[0] ? mapSocialRow(rows[0]) : null;
  },
};
