import { GET, POST } from '@/app/api/expenses/route';
import { query, queryOne } from '@/lib/db';
import { NextRequest } from 'next/server';

describe('Expenses API', () => {
  beforeEach(() => jest.clearAllMocks());

  const createRequest = (body: any) => ({
    json: jest.fn().mockResolvedValue(body)
  } as unknown as NextRequest);

  describe('GET', () => {
    it('returns a list of expenses', async () => {
      (query as jest.Mock).mockResolvedValueOnce([{ id: 1, total: 150 }]);
      const res = await GET();
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json[0].total).toBe(150);
      expect(query).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST', () => {
    it('creates a new expense entry', async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce({ id: 2, status: 'Pending' });
      
      const req = createRequest({ trip_id: 1, vehicle_id: 1, toll: 10 });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.id).toBe(2);
      expect(queryOne).toHaveBeenCalledTimes(1);
    });
  });
});
