import { dashboardService } from '@/lib/services/dashboard-service';

import { SocialDashboardClient } from './SocialDashboardClient';

export default async function DashboardSocialPage() {
  const items = await dashboardService.listSocialItems();

  return <SocialDashboardClient initialItems={items} />;
}
