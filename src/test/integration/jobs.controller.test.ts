import request from 'supertest';
import { App } from '@/app';
import { JobRoute } from '@/routes/jobs.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing Jobs', () => {
  describe('[GET] /jobs/unpaid', () => {
    it('200 response for listing unpaid jobs with profile_id header', async () => {
      const jobsRoute = new JobRoute();
      const app = new App([jobsRoute]);

      return request(app.getServer())
        .get(`${jobsRoute.path}/unpaid`)
        .set({ profile_id: '1' })
        .expect(200)
        .then(response => {
          expect(Array.isArray(response.body)).toBeTruthy();
          expect(response.body.length).toBeGreaterThan(0);
        });
    });

    it('404 response when profile_id header is missing', async () => {
      const jobsRoute = new JobRoute();
      const app = new App([jobsRoute]);

      return request(app.getServer()).get(`${jobsRoute.path}/unpaid`).expect(404);
    });
  });
});
