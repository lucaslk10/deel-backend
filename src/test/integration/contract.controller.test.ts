import request from 'supertest';
import { App } from '@/app';
import { ContractRoute } from '@routes/contract.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});
describe('Testing Contracts', () => {
  let appInstance: App;
  beforeAll(() => {
    // Initialize the app with ContractRoute as part of the setup
    const contractRoute = new ContractRoute();
    appInstance = new App([contractRoute]);
  });

  describe('[GET] /contracts/:id', () => {
    it('200 response findContractById with valid profile_id header', async () => {
      return request(appInstance.getServer())
        .get(`/contracts/1`) // Assuming '/contracts' is the base path in ContractRoute
        .set({ profile_id: '1' }) // Use actual profile_id that matches contract's client or contractor
        .expect(200)
        .then(response => {
          // Generic assertions about the response structure
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('status');
        });
    });

    it('404 when profile_id header is not set', async () => {
      return request(appInstance.getServer()).get(`/contracts/1`).expect(404);
    });
  });

  describe('[GET] /contracts', () => {
    it('200 response for listing non-terminated contracts with profile_id', async () => {
      return request(appInstance.getServer())
        .get(`/contracts`)
        .set({ profile_id: '1' })
        .expect(200)
        .then(response => {
          // Assuming non-terminated contracts exist for this profile_id
          expect(Array.isArray(response.body)).toBeTruthy();
          response.body.forEach(contract => {
            expect(contract).toHaveProperty('status');
            expect(contract.status).not.toBe('terminated');
          });
        });
    });

    it('404 response when profile_id header is missing', async () => {
      return request(appInstance.getServer()).get(`/contracts`).expect(404);
    });
  });
});
