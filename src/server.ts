import { App } from '@/app';
import { ContractRoute } from '@/routes/contract.route';
import { ValidateEnv } from '@utils/validateEnv';

ValidateEnv();

const app = new App([new ContractRoute()]);

app.listen();
