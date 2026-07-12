import { POST } from '@/app/api/auth/login/route';
import { queryOne } from '@/lib/db';
import { NextRequest } from 'next/server';

describe('Auth Login API (POST)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (body: any) => {
    return {
      json: jest.fn().mockResolvedValue(body)
    } as unknown as NextRequest;
  };

  it('handles successful login correctly', async () => {
    // Mock 1: Check lock status (Not locked)
    (queryOne as jest.Mock).mockResolvedValueOnce(null);
    // Mock 2: Get user data (Valid)
    (queryOne as jest.Mock).mockResolvedValueOnce({ 
      id: 1, email: 'admin@test.com', name: 'Admin User', role: 'admin', password_hash: 'secure123' 
    });
    // Mock 3: Delete attempts (Cleanup)
    (queryOne as jest.Mock).mockResolvedValueOnce({});

    const req = createMockRequest({ email: 'admin@test.com', password: 'secure123', role: 'admin' });
    const res = await POST(req);
    const json = await res.json();
    
    expect(res.status).toBe(200);
    expect(json.email).toBe('admin@test.com');
    expect(json.role).toBe('admin');
    expect(queryOne).toHaveBeenCalledTimes(3);
  });

  it('rejects a locked out account early', async () => {
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1);

    // Mock 1: account is currently locked!
    (queryOne as jest.Mock).mockResolvedValueOnce({ 
        failed_count: 5, 
        locked_until: futureDate.toISOString() 
    });

    const req = createMockRequest({ email: 'locked@test.com', password: 'password', role: 'admin' });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(423); // Locked HTTP status
    expect(json.error).toContain('Account locked');
    expect(queryOne).toHaveBeenCalledTimes(1); // Should immediately return, not doing any more queries
  });

  it('increments failed attempts on bad password', async () => {
    // Mock 1: lock status (not locked)
    (queryOne as jest.Mock).mockResolvedValueOnce(null);
    // Mock 2: user lookup
    (queryOne as jest.Mock).mockResolvedValueOnce({ 
        id: 1, email: 'admin@test.com', role: 'admin', password_hash: 'secure123' 
    });
    // Mock 3: Insertion of failed attempt record
    (queryOne as jest.Mock).mockResolvedValueOnce({});

    const req = createMockRequest({ email: 'admin@test.com', password: 'WRONGPASSWORD', role: 'admin' });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401); 
    expect(json.error).toBe('Invalid credentials');
    expect(queryOne).toHaveBeenCalledTimes(3); // Lookup + Lock check + Insert fail record
  });
});
