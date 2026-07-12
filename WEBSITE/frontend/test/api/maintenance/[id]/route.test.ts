import { PATCH } from '@/app/api/maintenance/[id]/route';
import { queryOne } from '@/lib/db';
import { NextRequest } from 'next/server';

describe('Maintenance [id] API', () => {
  beforeEach(() => jest.clearAllMocks());

  const createRequest = (body: any) => ({
    json: jest.fn().mockResolvedValue(body)
  } as unknown as NextRequest);

  describe('PATCH', () => {
    it('completes maintenance and marks vehicle as Available', async () => {
      // 1. Fetch current log
      (queryOne as jest.Mock).mockResolvedValueOnce({ vehicle_id: 10, status: 'Active' });
      // 2. Update log to completed
      (queryOne as jest.Mock).mockResolvedValueOnce({ id: 5, status: 'Completed' });
      // 3. Fetch vehicle to see if retired
      (queryOne as jest.Mock).mockResolvedValueOnce({ status: 'In Shop' });
      // 4. Update vehicle status to Available
      (queryOne as jest.Mock).mockResolvedValueOnce({});
      
      const req = createRequest({ status: 'Completed' });
      const params = Promise.resolve({ id: '5' });
      
      const res = await PATCH(req, { params });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.status).toBe('Completed');
      
      expect(queryOne).toHaveBeenCalledTimes(4);
      expect(queryOne).toHaveBeenNthCalledWith(
        4, 
        "UPDATE vehicles SET status = 'Available' WHERE id = $1", 
        [10]
      );
    });

    it('returns 404 if maintenance log is not found', async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce(null);
      const req = createRequest({ status: 'Completed' });
      const params = Promise.resolve({ id: '999' });
      
      const res = await PATCH(req, { params });
      expect(res.status).toBe(404);
    });
  });
});
