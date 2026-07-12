import { GET, POST } from '@/app/api/drivers/route';
import { query, queryOne } from '@/lib/db';
import { NextRequest } from 'next/server';

describe('Drivers API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns all drivers', async () => {
      (query as jest.Mock).mockResolvedValueOnce([{ id: 1, name: 'Alice' }]);
      const res = await GET();
      const json = await res.json();
      expect(json).toHaveLength(1);
      expect(json[0].name).toBe('Alice');
      expect(query).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST', () => {
    const createMockRequest = (body: any) => ({
      json: jest.fn().mockResolvedValue(body)
    } as unknown as NextRequest);

    it('creates a new driver when license is unique', async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce(null); // No existing driver
      (queryOne as jest.Mock).mockResolvedValueOnce({ id: 2, name: 'Bob', license_no: 'LIC123' }); // Insert return

      const req = createMockRequest({ name: 'Bob', license_no: 'LIC123' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.name).toBe('Bob');
      expect(queryOne).toHaveBeenCalledTimes(2);
    });

    it('rejects duplicate license number', async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce({ id: 1 }); // Existing driver found
      
      const req = createMockRequest({ name: 'Bob', license_no: 'LIC123' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('License number must be unique');
    });
  });
});
