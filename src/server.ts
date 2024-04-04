import { App } from '@/app';
import { ContractRoute } from '@/routes/contract.route';
import { ValidateEnv } from '@utils/validateEnv';
import { JobRoute } from './routes/jobs.route';

ValidateEnv();

const app = new App([new ContractRoute(), new JobRoute()]);

app.listen();
