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
});
