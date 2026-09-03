import http from 'k6/http';
import { Options } from 'k6/options';
import { BASE_URL } from '../../config/config.ts';
import { checkingStatus } from '../../config/utils.ts';

export const options: Options = {
  scenarios: {
    register: {
      executor: 'constant-arrival-rate',
      exec: 'registerFlow',
      rate: 100,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 50,
    },
  },

  thresholds: {
    http_req_failed: ['rate<0.1'],
    'http_req_duration{endpoint:register}': ['p(95)<800'],
  },
};

export function registerFlow() {
  const uniqueId = crypto.randomUUID().slice(0, 10);
  const username = `user_${uniqueId}`;
  const email = `${uniqueId}@example.com`;
  const password = 'Password123!';

  const payload = { username, email, password };
  const res = http.post(`${BASE_URL}/auth/register`, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'register' },
  });
  console.log('STATUS:', res.status, 'BODY:', res.body);

  checkingStatus(res, 201);
}
