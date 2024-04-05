import request from 'supertest';
import { App } from '@/app';
import { AdminRoute } from '@routes/admin.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing Admin Endpoints', () => {
  let appInstance: App;
  beforeAll(() => {
    const adminRoute = new AdminRoute();
    appInstance = new App([adminRoute]);
  });

  describe('[GET] /admin/best-profession', () => {
    it('200 response for best profession with valid start and end dates', async () => {
      const startDate = '2020-01-01';
      const endDate = '2020-12-31';
      return request(appInstance.getServer())
        .get(`/admin/best-profession?start=${startDate}&end=${endDate}`)
        .set({ profile_id: '1' })
        .expect(200)
        .then(response => {
          // Generic assertions about the response structure
          expect(response.body).toHaveProperty('profession');
          expect(response.body).toHaveProperty('totalEarnings');
          expect(typeof response.body.totalEarnings).toBe('number');
        });
    });

    it('400 response when start or end date parameters are missing', async () => {
      return request(appInstance.getServer()).get(`/admin/best-profession`).set({ profile_id: '1' }).expect(400);
    });
  });

  describe('[GET] /admin/best-clients', () => {
    it('200 response for valid query parameters with limit', async () => {
      const startDate = '2020-01-01';
      const endDate = '2020-12-31';
      const limit = 1;
      return request(appInstance.getServer())
        .get(`/admin/best-clients?start=${startDate}&end=${endDate}&limit=${limit}`)
        .set({ profile_id: '1' })

        .expect(200)
        .then(response => {
          // Assuming the endpoint returns an array of clients
          expect(Array.isArray(response.body)).toBeTruthy();
          expect(response.body.length).toBeLessThanOrEqual(limit);
          if (response.body.length > 0) {
            // Example assertions, adjust based on actual response structure
            expect(response.body[0]).toHaveProperty('id');
            expect(response.body[0]).toHaveProperty('firstName');
            expect(response.body[0]).toHaveProperty('lastName');
            expect(response.body[0]).toHaveProperty('totalSpent');
          }
        });
    });

    it('400 response when required query parameters are missing', async () => {
      return request(appInstance.getServer()).get(`/admin/best-clients`).set({ profile_id: '1' }).expect(400);
    });

    it('200 response with default limit applied when limit is not specified', async () => {
      const startDate = '2020-01-01';
      const endDate = '2020-12-31';
      return request(appInstance.getServer())
        .get(`/admin/best-clients?start=${startDate}&end=${endDate}`)
        .set({ profile_id: '1' })
        .expect(200)
        .then(response => {
          // Assuming the default limit is 2, adjust assertion based on your default settings
          expect(Array.isArray(response.body)).toBeTruthy();
          expect(response.body.length).toBeLessThanOrEqual(2);
        });
    });
  });
});
