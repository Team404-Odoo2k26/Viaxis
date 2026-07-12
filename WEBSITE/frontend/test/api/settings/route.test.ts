import { GET, PATCH } from '@/app/api/settings/route';
import { queryOne } from '@/lib/db';
import { NextRequest } from 'next/server';

describe('Settings API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (body: any) => ({
    json: jest.fn().mockResolvedValue(body)
  } as unknown as NextRequest);

  describe('GET', () => {
    it('returns app settings', async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce({ depot_name: 'Main Depot' });
      
      const res = await GET();
      const json = await res.json();
      
      expect(res.status).toBe(200);
      expect(json.depot_name).toBe('Main Depot');
      expect(queryOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('PATCH', () => {
    it('updates app settings successfully', async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce({ depot_name: 'New Depot HQ', currency: 'USD' });
      
      const req = createRequest({ depot_name: 'New Depot HQ', currency: 'USD' });
      const res = await PATCH(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.depot_name).toBe('New Depot HQ');
      expect(queryOne).toHaveBeenCalledTimes(1);
    });
  });
});
