import { urls, assetsUrl } from './url';
import { env } from './env';

export const environment = {
  production: true,
  host: 'https://vanana.appening.xyz',
  ...urls,
  ...env,
  ...assetsUrl
};
