import { GET } from '@/app/api/dashboard/route';
import { query, queryOne } from '@/lib/db';

describe('Dashboard API (GET)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('aggregates dashboard statistics correctly and calculates fleet utilization', async () => {
    // 1. queryOne: overall stats
    (queryOne as jest.Mock).mockResolvedValueOnce({
      active_vehicles: 10,
      available_vehicles: 5,
      vehicles_in_maintenance: 2,
      active_trips: 3,
      pending_trips: 1,
      drivers_on_duty: 8,
    });

    // 2. query: vehicle status breakdown
    (query as jest.Mock).mockResolvedValueOnce([
      { status: 'Available', count: '5' },
      { status: 'On Trip', count: '3' },
      { status: 'In Shop', count: '2' },
      { status: 'Retired', count: '1' }
    ]);

    // 3. query: recent trips
    (query as jest.Mock).mockResolvedValueOnce([
       { id: 1, driver_name: 'John Doe', status: 'Dispatched' }
    ]);

    const req = await GET();
    const data = await req.json();

    // The API responds with the raw stats properly mixed in
    expect(data.active_vehicles).toBe(10);
    expect(data.available_vehicles).toBe(5);
    
    // Check utilization calculation => (3 on trip / 10 active) * 100 = 30
    expect(data.fleet_utilization).toBe(30);

    // Ensure the breakdown merged correctly
    expect(data.vehicle_breakdown).toEqual({
      'Available': 5,
      'On Trip': 3,
      'In Shop': 2,
      'Retired': 1,
    });

    // Ensure recent trips are attached
    expect(data.recent_trips).toHaveLength(1);
    expect(data.recent_trips[0].driver_name).toBe('John Doe');

    // Ensure it queried exactly those 3 times
    expect(queryOne).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledTimes(2);
  });
});
