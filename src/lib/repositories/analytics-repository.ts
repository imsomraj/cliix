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

type SummaryTotalsRow = {
  total_views: number;
  total_clicks: number;
};

type SummaryPerLinkRow = {
  link_id: string;
  clicks: number;
};

type SummaryDailyRow = {
  date: string;
  clicks: number;
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
      path: '/analytics_events',
      method: 'POST',
      body: [
        {
          event_type: 'click',
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
      path: '/analytics_events',
      method: 'POST',
      body: [
        {
          event_type: 'pageview',
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

  async getSummary(userId?: string, accessToken?: string) {
    if (useInMemoryMocks) {
      const scopedClicks = userId ? localState.clicks.filter((click) => click.userId === userId) : localState.clicks;
      const scopedPageviews = userId ? localState.pageviews.filter((view) => view.userId === userId) : localState.pageviews;

      const clicksByLink = scopedClicks.reduce<Record<string, number>>((acc, click) => {
        acc[click.linkId] = (acc[click.linkId] ?? 0) + 1;
        return acc;
      }, {});

      const daily = scopedClicks.reduce<Record<string, number>>((acc, click) => {
        const day = click.timestamp.slice(0, 10);
        acc[day] = (acc[day] ?? 0) + 1;
        return acc;
      }, {});

      return {
        totalViews: scopedPageviews.length,
        totalClicks: scopedClicks.length,
        perLink: Object.entries(clicksByLink)
          .map(([linkId, clicks]) => ({ linkId, clicks }))
          .sort((a, b) => b.clicks - a.clicks),
        daily: Object.entries(daily)
          .map(([date, clicks]) => ({ date, clicks }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      };
    }

    const [totalsRows, perLinkRows, dailyRows] = await Promise.all([
      postgrestRequest<SummaryTotalsRow[]>({
        path: `/rpc/analytics_summary_totals`,
        method: 'POST',
        accessToken,
        body: {
          p_user_id: userId ?? null,
        },
      }),
      postgrestRequest<SummaryPerLinkRow[]>({
        path: '/rpc/analytics_summary_per_link',
        method: 'POST',
        accessToken,
        body: {
          p_user_id: userId ?? null,
        },
      }),
      postgrestRequest<SummaryDailyRow[]>({
        path: '/rpc/analytics_summary_daily',
        method: 'POST',
        accessToken,
        body: {
          p_user_id: userId ?? null,
        },
      }),
    ]);

    const totals = totalsRows[0] ?? { total_views: 0, total_clicks: 0 };

    return {
      totalViews: totals.total_views,
      totalClicks: totals.total_clicks,
      perLink: perLinkRows.map((row) => ({
        linkId: row.link_id,
        clicks: row.clicks,
      })),
      daily: dailyRows.map((row) => ({
        date: row.date,
        clicks: row.clicks,
      })),
    };
  },
};
