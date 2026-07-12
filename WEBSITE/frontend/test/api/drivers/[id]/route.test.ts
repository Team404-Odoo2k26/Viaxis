import { PATCH } from '@/app/api/drivers/[id]/route';
import { queryOne } from '@/lib/db';
import { NextRequest } from 'next/server';

describe('Drivers [id] API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (body: any) => ({
    json: jest.fn().mockResolvedValue(body)
  } as unknown as NextRequest);

  describe('PATCH', () => {
    it('updates a driver successfully', async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce({ id: 1, name: 'Alice Updated', status: 'On Trip' });
      
      const req = createMockRequest({ name: 'Alice Updated', status: 'On Trip' });
      const params = Promise.resolve({ id: '1' });
      
      const res = await PATCH(req, { params });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.name).toBe('Alice Updated');
      expect(queryOne).toHaveBeenCalledTimes(1);
    });
  });
});
