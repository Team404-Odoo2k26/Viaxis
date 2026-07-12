import { PATCH } from '@/app/api/vehicles/[id]/route';
import { queryOne } from '@/lib/db';
import { NextRequest } from 'next/server';

describe('Vehicles [id] API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (body: any) => ({
    json: jest.fn().mockResolvedValue(body)
  } as unknown as NextRequest);

  describe('PATCH', () => {
    it('updates a vehicle successfully', async () => {
      // It passes registration check natively if registration_no is omitted
      (queryOne as jest.Mock).mockResolvedValueOnce({ id: 1, odometer: 50000 });
      
      const req = createMockRequest({ odometer: 50000 });
      const params = Promise.resolve({ id: '1' });
      
      const res = await PATCH(req, { params });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.odometer).toBe(50000);
      expect(queryOne).toHaveBeenCalledTimes(1); 
    });

    it('rejects update if new registration number belongs to another vehicle', async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce({ id: 2 }); // Conflict found
      
      const req = createMockRequest({ registration_no: 'TRK-DUPE' });
      const params = Promise.resolve({ id: '1' });
      
      const res = await PATCH(req, { params });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('Registration number must be unique');
    });
  });
});
