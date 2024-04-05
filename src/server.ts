import { App } from '@/app';
import { ContractRoute } from '@/routes/contract.route';
import { ValidateEnv } from '@utils/validateEnv';
import { JobRoute } from './routes/jobs.route';
import { BalanceRoute } from './routes/balance.route';

ValidateEnv();

const app = new App([new ContractRoute(), new JobRoute(), new BalanceRoute()]);

app.listen();
