import createClient from 'openapi-fetch/dist/index.cjs';
import { paths } from './schema.gen';

export const apiClient = createClient<paths>({
  baseUrl: 'http://localhost:3000',
  credentials: 'include',
});
