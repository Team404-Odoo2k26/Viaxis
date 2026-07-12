import { GET, POST } from '@/app/api/maintenance/route';
import { query, queryOne } from '@/lib/db';
import { NextRequest } from 'next/server';

describe('Maintenance API', () => {
  beforeEach(() => jest.clearAllMocks());

  const createRequest = (body: any) => ({
    json: jest.fn().mockResolvedValue(body)
  } as unknown as NextRequest);

  describe('GET', () => {
    it('returns maintenance logs', async () => {
      (query as jest.Mock).mockResolvedValueOnce([{ id: 1, service_type: 'Oil Change' }]);
      const res = await GET();
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json[0].service_type).toBe('Oil Change');
      expect(query).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST', () => {
    it('creates a maintenance log and changes vehicle status to In Shop', async () => {
      // 1. Insert Log
      (queryOne as jest.Mock).mockResolvedValueOnce({ id: 2, status: 'Active' });
      // 2. Fetch vehicle status to check if Retired
      (queryOne as jest.Mock).mockResolvedValueOnce({ status: 'Available' });
      // 3. Update vehicle query
      (queryOne as jest.Mock).mockResolvedValueOnce({});
      
      const req = createRequest({ vehicle_id: 10, service_type: 'Brakes', status: 'Active' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.status).toBe('Active');
      
      // Ensure the exact side effect happened!
      expect(queryOne).toHaveBeenCalledTimes(3); 
      expect(queryOne).toHaveBeenNthCalledWith(
        3, 
        "UPDATE vehicles SET status = 'In Shop' WHERE id = $1", 
        [10]
      );
    });
  });
});
