import request from 'supertest';
import { App } from '@/app';
import { ContractRoute } from '@routes/contract.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing Contracts', () => {
  describe('[GET] /contracts/:id', () => {
    it('200 response findContractById', async () => {
      const contractRoute = new ContractRoute();
      const users = contractRoute.contract.contract;

      users.findContractById = jest.fn().mockReturnValue([
        {
          id: 1,
        },
        {
          id: 2,
        },
        {
          id: 3,
        },
      ]);

      const app = new App([contractRoute]);
      return request(app.getServer()).get(`${contractRoute.path}/2`).set({ profile_id: '1' }).expect(200);
    });
    it('404 when not set profile_id headers', async () => {
      const contractRoute = new ContractRoute();
      const app = new App([contractRoute]);
      return request(app.getServer()).get(`${contractRoute.path}/2`).expect(404);
    });
  });
});
