import { postgrestRequest } from '@/lib/data/postgrest';

type DeviceInfo = {
  userAgent?: string;
  platform?: string;
};

export type ClickEvent = {
  linkId: string;
  userId?: string;
  timestamp: string;
  referrer?: string;
  device?: DeviceInfo;
};

export type PageViewEvent = {
  page: string;
  userId?: string;
  timestamp: string;
  referrer?: string;
  device?: DeviceInfo;
};

type ClickRow = {
  link_id: string;
  occurred_at: string;
};

type PageviewRow = {
  occurred_at: string;
};

const useInMemoryMocks = process.env.ENABLE_LOCAL_INMEMORY_MOCKS === 'true' && process.env.NODE_ENV !== 'production';

const localState: {
  clicks: ClickEvent[];
  pageviews: PageViewEvent[];
} = globalThis.__localAnalyticsState__ ?? {
  clicks: [],
  pageviews: [],
};

declare global {
  // eslint-disable-next-line no-var
  var __localAnalyticsState__: typeof localState | undefined;
}

globalThis.__localAnalyticsState__ = localState;

export const analyticsRepository = {
  async insertClick(event: ClickEvent) {
    if (useInMemoryMocks) {
      localState.clicks.push(event);
      return;
    }

    await postgrestRequest<unknown>({
      path: '/analytics_clicks',
      method: 'POST',
      body: [
        {
          link_id: event.linkId,
          user_id: event.userId ?? null,
          occurred_at: event.timestamp,
          referrer: event.referrer ?? null,
          user_agent: event.device?.userAgent ?? null,
          platform: event.device?.platform ?? null,
        },
      ],
    });
  },

  async insertPageview(event: PageViewEvent) {
    if (useInMemoryMocks) {
      localState.pageviews.push(event);
      return;
    }

    await postgrestRequest<unknown>({
      path: '/analytics_pageviews',
      method: 'POST',
      body: [
        {
          page: event.page,
          user_id: event.userId ?? null,
          occurred_at: event.timestamp,
          referrer: event.referrer ?? null,
          user_agent: event.device?.userAgent ?? null,
          platform: event.device?.platform ?? null,
        },
      ],
    });
  },

  async getSummary() {
    if (useInMemoryMocks) {
      const clicksByLink = localState.clicks.reduce<Record<string, number>>((acc, click) => {
        acc[click.linkId] = (acc[click.linkId] ?? 0) + 1;
        return acc;
      }, {});

      const daily = localState.clicks.reduce<Record<string, number>>((acc, click) => {
        const day = click.timestamp.slice(0, 10);
        acc[day] = (acc[day] ?? 0) + 1;
        return acc;
      }, {});

      return {
        totalViews: localState.pageviews.length,
        totalClicks: localState.clicks.length,
        perLink: Object.entries(clicksByLink)
          .map(([linkId, clicks]) => ({ linkId, clicks }))
          .sort((a, b) => b.clicks - a.clicks),
        daily: Object.entries(daily)
          .map(([date, clicks]) => ({ date, clicks }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      };
    }

    const [clickRows, pageviewRows] = await Promise.all([
      postgrestRequest<ClickRow[]>({ path: '/analytics_clicks?select=link_id,occurred_at' }),
      postgrestRequest<PageviewRow[]>({ path: '/analytics_pageviews?select=occurred_at' }),
    ]);

    const clicksByLink = clickRows.reduce<Record<string, number>>((acc, click) => {
      acc[click.link_id] = (acc[click.link_id] ?? 0) + 1;
      return acc;
    }, {});

    const daily = clickRows.reduce<Record<string, number>>((acc, click) => {
      const day = click.occurred_at.slice(0, 10);
      acc[day] = (acc[day] ?? 0) + 1;
      return acc;
    }, {});

    return {
      totalViews: pageviewRows.length,
      totalClicks: clickRows.length,
      perLink: Object.entries(clicksByLink)
        .map(([linkId, clicks]) => ({ linkId, clicks }))
        .sort((a, b) => b.clicks - a.clicks),
      daily: Object.entries(daily)
        .map(([date, clicks]) => ({ date, clicks }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  },
};
