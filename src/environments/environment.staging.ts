import { urls, assetsUrl } from './url';
import { env } from './env';

export const environment = {
  production: true,
  host: 'https://vanana.cosmico.dev',
  ...urls,
  ...env,
  ...assetsUrl
};
