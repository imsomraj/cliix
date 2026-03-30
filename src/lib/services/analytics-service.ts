import { analyticsRepository, ClickEvent, PageViewEvent } from '@/lib/repositories/analytics-repository';

export const analyticsService = {
  async writeClick(event: ClickEvent) {
    await analyticsRepository.insertClick(event);
  },
  async writePageView(event: PageViewEvent) {
    await analyticsRepository.insertPageview(event);
  },
  async getSummary() {
    return analyticsRepository.getSummary();
  },
};
