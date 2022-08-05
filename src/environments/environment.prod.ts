import { urls, assetsUrl } from './url';
import { env } from './env';

export const environment = {
  production: true,
  host: 'https://vananavan.com',
  ...urls,
  ...env,
  ...assetsUrl
};
