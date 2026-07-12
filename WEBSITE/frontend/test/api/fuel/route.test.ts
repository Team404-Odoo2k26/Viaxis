import { GET, POST } from '@/app/api/fuel/route';
import { query, queryOne } from '@/lib/db';
import { NextRequest } from 'next/server';

describe('Fuel API', () => {
  beforeEach(() => jest.clearAllMocks());

  const createRequest = (body: any) => ({
    json: jest.fn().mockResolvedValue(body)
  } as unknown as NextRequest);

  describe('GET', () => {
    it('returns fuel logs', async () => {
      (query as jest.Mock).mockResolvedValueOnce([{ id: 10, liters: 50 }]);
      const res = await GET();
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json[0].liters).toBe(50);
      expect(query).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST', () => {
    it('inserts a new fuel log', async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce({ id: 1, vehicle_id: 5 });
      
      const req = createRequest({ vehicle_id: 5, log_date: '2026-07-12', liters: 40, cost: 60 });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.vehicle_id).toBe(5);
      expect(queryOne).toHaveBeenCalledTimes(1);
    });
  });
});
