import { dashboardRepository } from '@/lib/repositories/dashboard-repository';
import { getSessionTokens, restoreSupabaseSession } from '@/lib/supabase/server';

async function getDashboardAuthContext() {
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

export const dashboardService = {
  async listLinks() {
    const auth = await getDashboardAuthContext();
    return dashboardRepository.listLinks(auth.userId, auth.accessToken);
  },
  async createLink(input: Parameters<typeof dashboardRepository.createLink>[2]) {
    const auth = await getDashboardAuthContext();
    return dashboardRepository.createLink(auth.userId, auth.accessToken, input);
  },
  async updateLink(id: string, input: Parameters<typeof dashboardRepository.updateLink>[3]) {
    const auth = await getDashboardAuthContext();
    return dashboardRepository.updateLink(auth.userId, auth.accessToken, id, input);
  },
  async deleteLink(id: string) {
    const auth = await getDashboardAuthContext();
    return dashboardRepository.deleteLink(auth.userId, auth.accessToken, id);
  },
  async reorderLinks(items: Array<{ id: string; position: number }>) {
    const auth = await getDashboardAuthContext();
    return dashboardRepository.reorderLinks(auth.userId, auth.accessToken, items);
  },
  async setLinkEnabled(id: string, isEnabled: boolean) {
    const auth = await getDashboardAuthContext();
    return dashboardRepository.setLinkEnabled(auth.userId, auth.accessToken, id, isEnabled);
  },
  async listSocialItems() {
    const auth = await getDashboardAuthContext();
    return dashboardRepository.listSocialItems(auth.userId, auth.accessToken);
  },
  async createSocialItem(input: Parameters<typeof dashboardRepository.createSocialItem>[2]) {
    const auth = await getDashboardAuthContext();
    return dashboardRepository.createSocialItem(auth.userId, auth.accessToken, input);
  },
  async updateSocialItem(id: string, input: Parameters<typeof dashboardRepository.updateSocialItem>[3]) {
    const auth = await getDashboardAuthContext();
    return dashboardRepository.updateSocialItem(auth.userId, auth.accessToken, id, input);
  },
  async deleteSocialItem(id: string) {
    const auth = await getDashboardAuthContext();
    return dashboardRepository.deleteSocialItem(auth.userId, auth.accessToken, id);
  },
  async reorderSocialItems(items: Array<{ id: string; position: number }>) {
    const auth = await getDashboardAuthContext();
    return dashboardRepository.reorderSocialItems(auth.userId, auth.accessToken, items);
  },
  async setSocialItemEnabled(id: string, isEnabled: boolean) {
    const auth = await getDashboardAuthContext();
    return dashboardRepository.setSocialItemEnabled(auth.userId, auth.accessToken, id, isEnabled);
  },
};
