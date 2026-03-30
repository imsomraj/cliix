export type DeviceInfo = {
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

type AnalyticsState = {
  pageViews: PageViewEvent[];
  clicks: ClickEvent[];
};

declare global {
  // eslint-disable-next-line no-var
  var __analyticsState__: AnalyticsState | undefined;
}

const state: AnalyticsState =
  globalThis.__analyticsState__ ??
  (globalThis.__analyticsState__ = {
    pageViews: [],
    clicks: [],
  });

export function writePageView(event: PageViewEvent) {
  state.pageViews.push(event);
}

export function writeClick(event: ClickEvent) {
  state.clicks.push(event);
}

export function getAnalyticsSummary() {
  const totalViews = state.pageViews.length;
  const totalClicks = state.clicks.length;

  const clicksByLink = state.clicks.reduce<Record<string, number>>((acc, click) => {
    acc[click.linkId] = (acc[click.linkId] ?? 0) + 1;
    return acc;
  }, {});

  const topLinks = Object.entries(clicksByLink)
    .map(([linkId, clicks]) => ({ linkId, clicks }))
    .sort((a, b) => b.clicks - a.clicks);

  const daily = state.clicks.reduce<Record<string, number>>((acc, click) => {
    const day = click.timestamp.slice(0, 10);
    acc[day] = (acc[day] ?? 0) + 1;
    return acc;
  }, {});

  const dailyTrend = Object.entries(daily)
    .map(([date, clicks]) => ({ date, clicks }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalViews,
    totalClicks,
    perLink: topLinks,
    daily: dailyTrend,
  };
}
