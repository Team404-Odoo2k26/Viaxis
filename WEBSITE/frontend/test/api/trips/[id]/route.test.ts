import { PATCH } from '@/app/api/trips/[id]/route';
import { queryOne } from '@/lib/db';
import { NextRequest } from 'next/server';

describe('Trips [id] API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (body: any) => ({
    json: jest.fn().mockResolvedValue(body)
  } as unknown as NextRequest);

  describe('PATCH', () => {
    it('dispatches a draft trip successfully and updates assets to On Trip', async () => {
      // 1. Existing Trip lookup
      (queryOne as jest.Mock).mockResolvedValueOnce({ status: 'Draft', vehicle_id: 1, driver_id: 2 });
      // 2. Vehicle lookup
      (queryOne as jest.Mock).mockResolvedValueOnce({ status: 'Available', capacity_kg: 1000 });
      // 3. Driver lookup
      (queryOne as jest.Mock).mockResolvedValueOnce({ status: 'Available', license_expiry: '2099-01-01' });
      // 4. Update Vehicle Status
      (queryOne as jest.Mock).mockResolvedValueOnce({});
      // 5. Update Driver Status
      (queryOne as jest.Mock).mockResolvedValueOnce({});
      // 6. Update Trip
      (queryOne as jest.Mock).mockResolvedValueOnce({ id: 9, status: 'Dispatched' });

      const req = createRequest({ status: 'Dispatched', cargo_weight_kg: 500 }); // Cargo is under 1000 limit
      const params = Promise.resolve({ id: '9' });

      const res = await PATCH(req, { params });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.status).toBe('Dispatched');
      
      expect(queryOne).toHaveBeenCalledTimes(6);
      expect(queryOne).toHaveBeenNthCalledWith(4, "UPDATE vehicles SET status = 'On Trip' WHERE id = $1", [1]);
      expect(queryOne).toHaveBeenNthCalledWith(5, "UPDATE drivers SET status = 'On Trip' WHERE id = $1", [2]);
    });

    it('completes a dispatched trip and frees assets', async () => {
      // 1. Existing Trip lookup
      (queryOne as jest.Mock).mockResolvedValueOnce({ status: 'Dispatched', vehicle_id: 1, driver_id: 2 });
      // 2. Update Trip
      (queryOne as jest.Mock).mockResolvedValueOnce({ id: 9, status: 'Completed' });
      // 3. Update Vehicle
      (queryOne as jest.Mock).mockResolvedValueOnce({});
      // 4. Update Driver
      (queryOne as jest.Mock).mockResolvedValueOnce({});

      const req = createRequest({ status: 'Completed', final_odometer: 15000, fuel_consumed_liters: 100 });
      const params = Promise.resolve({ id: '9' });

      const res = await PATCH(req, { params });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(queryOne).toHaveBeenCalledTimes(4);
      expect(queryOne).toHaveBeenNthCalledWith(3, "UPDATE vehicles SET status = 'Available', odometer = $1 WHERE id = $2", [15000, 1]);
      expect(queryOne).toHaveBeenNthCalledWith(4, "UPDATE drivers SET status = 'Available' WHERE id = $1", [2]);
    });
  });
});
