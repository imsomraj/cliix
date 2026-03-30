import { dashboardService } from '@/lib/services/dashboard-service';

import { LinksDashboardClient } from './LinksDashboardClient';

export default async function DashboardLinksPage() {
  const links = await dashboardService.listLinks();

  return <LinksDashboardClient initialLinks={links} />;
}
