import { GET, POST } from '@/app/api/trips/route';
import { query, queryOne } from '@/lib/db';
import { NextRequest } from 'next/server';

describe('Trips API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (body: any) => ({
    json: jest.fn().mockResolvedValue(body)
  } as unknown as NextRequest);

  describe('GET', () => {
    it('fetches all trips with joins', async () => {
      (query as jest.Mock).mockResolvedValueOnce([{ id: 1, source: 'NYC', destination: 'LA' }]);
      const res = await GET();
      const json = await res.json();
      expect(json).toHaveLength(1);
      expect(query).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST', () => {
    it('rejects Trip if cargo weight exceeds vehicle capacity', async () => {
      // Mock vehicle lookup (Available but capacity is 1000kg)
      (queryOne as jest.Mock).mockResolvedValueOnce({ capacity_kg: 1000, status: 'Available' });

      const req = createRequest({ vehicle_id: 1, cargo_weight_kg: 1500 });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toContain('Cargo weight exceeds capacity');
    });

    it('rejects Trip if driver is suspended', async () => {
      // Vehicle OK
      (queryOne as jest.Mock).mockResolvedValueOnce({ capacity_kg: 2000, status: 'Available' });
      // Driver suspended
      (queryOne as jest.Mock).mockResolvedValueOnce({ status: 'Suspended', license_expiry: '2099-01-01' });

      const req = createRequest({ vehicle_id: 1, driver_id: 2, cargo_weight_kg: 500 });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toContain('Driver cannot be assigned');
    });

    it('creates a Trip successfully if constraints are met', async () => {
      // Vehicle OK
      (queryOne as jest.Mock).mockResolvedValueOnce({ capacity_kg: 2000, status: 'Available' });
      // Driver OK
      (queryOne as jest.Mock).mockResolvedValueOnce({ status: 'Available', license_expiry: '2099-01-01' });
      // Insert query
      (queryOne as jest.Mock).mockResolvedValueOnce({ id: 1, status: 'Draft' });

      const req = createRequest({ vehicle_id: 1, driver_id: 2, cargo_weight_kg: 1500 });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.status).toBe('Draft');
      expect(queryOne).toHaveBeenCalledTimes(3); 
    });
  });
});
