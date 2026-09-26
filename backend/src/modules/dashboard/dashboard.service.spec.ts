import { DashboardService } from './dashboard.service.js';

function utcDateOffset(days: number) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

describe('DashboardService', () => {
  it('returns 90 daily request values and fills days without requests with zero', async () => {
    const appointmentRequestModel = {
      count: vi.fn().mockResolvedValue(0),
      findAll: vi.fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { date: utcDateOffset(-2), count: '3' },
          { date: utcDateOffset(0), count: '1' },
        ]),
    };
    const countModel = {
      count: vi.fn().mockResolvedValue(0),
    };

    const service = new DashboardService(
      appointmentRequestModel as never,
      countModel as never,
      countModel as never,
      countModel as never,
      countModel as never,
      countModel as never,
      countModel as never,
      countModel as never,
    );

    const dashboard = await service.getDashboard();

    expect(dashboard.requestTrend).toHaveLength(90);
    expect(dashboard.requestTrend).toContainEqual({
      date: utcDateOffset(-2),
      count: 3,
    });
    expect(dashboard.requestTrend).toContainEqual({
      date: utcDateOffset(-1),
      count: 0,
    });
    expect(dashboard.requestTrend[89]).toEqual({
      date: utcDateOffset(0),
      count: 1,
    });
  });
});
