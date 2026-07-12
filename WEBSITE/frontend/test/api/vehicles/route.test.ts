import { GET, POST } from '@/app/api/vehicles/route';
import { query, queryOne } from '@/lib/db';
import { NextRequest } from 'next/server';

describe('Vehicles API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createGetRequest = (url: string) => ({
    url,
  } as unknown as NextRequest);

  const createPostRequest = (body: any) => ({
    json: jest.fn().mockResolvedValue(body)
  } as unknown as NextRequest);

  describe('GET', () => {
    it('returns vehicles based on search params', async () => {
      (query as jest.Mock).mockResolvedValueOnce([{ id: 1, type: 'Truck', status: 'Available' }]);
      
      const req = createGetRequest('http://localhost/api/vehicles?type=Truck&dispatchable=true');
      const res = await GET(req);
      const json = await res.json();
      
      expect(res.status).toBe(200);
      expect(json).toHaveLength(1);
      // Ensure the query builder got hit appropriately
      expect(query).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST', () => {
    it('creates a new vehicle uniquely', async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce(null); // Registration check
      (queryOne as jest.Mock).mockResolvedValueOnce({ id: 1, registration_no: 'TRK-999' }); // Insert record
      
      const req = createPostRequest({ registration_no: 'TRK-999', type: 'Van' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.registration_no).toBe('TRK-999');
    });

    it('rejects duplicate registration numbers', async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce({ id: 1 }); // Found dup
      
      const req = createPostRequest({ registration_no: 'TRK-999' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('Registration number must be unique');
    });
  });
});
