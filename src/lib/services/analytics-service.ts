import { analyticsRepository, ClickEvent, PageViewEvent } from '@/lib/repositories/analytics-repository';
import { getSessionTokens, restoreSupabaseSession } from '@/lib/supabase/server';

async function getAnalyticsAuthContext() {
  const session = await restoreSupabaseSession();
  const tokens = await getSessionTokens();

  if (!session?.user?.id || !tokens.accessToken) {
    throw new Error('Unauthorized');
  }

  return {
    userId: session.user.id,
    accessToken: tokens.accessToken,
  };
}

export const analyticsService = {
  async writeClick(event: ClickEvent) {
    await analyticsRepository.insertClick(event);
  },
  async writePageView(event: PageViewEvent) {
    await analyticsRepository.insertPageview(event);
  },
  async getSummary() {
    const auth = await getAnalyticsAuthContext();
    return analyticsRepository.getSummary(auth.userId, auth.accessToken);
  },
};
