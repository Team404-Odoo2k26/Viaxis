import { GET } from '@/app/api/analytics/route';
import { queryOne, query } from '@/lib/db';

describe('Analytics API (GET)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns correctly calculated analytics data using mocked db calls', async () => {
    // 1. fuelTotal
    (queryOne as jest.Mock).mockResolvedValueOnce({ total: '150' });
    // 2. maintTotal
    (queryOne as jest.Mock).mockResolvedValueOnce({ total: '250' });
    // 3. revenueTotal
    (queryOne as jest.Mock).mockResolvedValueOnce({ total: '2000' });
    // 4. acquisitionTotal
    (queryOne as jest.Mock).mockResolvedValueOnce({ total: '1000' });
    // 5. distanceFuel
    (queryOne as jest.Mock).mockResolvedValueOnce({ distance: '1000', fuel: '100' }); 
    // 6. vehicleStats
    (queryOne as jest.Mock).mockResolvedValueOnce({ total: '10', on_trip: '8' }); 

    // queries
    (query as jest.Mock).mockResolvedValueOnce([{ month: 'Jan 2026', revenue: 2000 }]); // Monthly Revenue
    (query as jest.Mock).mockResolvedValueOnce([{ registration_no: 'TRK-101', cost: 400 }]); // Top costliest

    const response = await GET();
    const data = await response.json();
    
    // Test logic correctness
    // fuelEfficiency = 1000 / 100 = 10
    expect(data.fuel_efficiency).toBe(10);
    // fleetUtilization = 8 / 10 = 80%
    expect(data.fleet_utilization).toBe(80);
    // operationalCost = 150 + 250 = 400
    expect(data.operational_cost).toBe(400);
    // ROI = (2000 - 400) / 1000 = 1.6, then multiplied by 100 = 160
    expect(data.vehicle_roi).toBe(160);
    
    // Ensure the DB mocked functions were called the exact right number of times
    expect(queryOne).toHaveBeenCalledTimes(6);
    expect(query).toHaveBeenCalledTimes(2);
  });
});
