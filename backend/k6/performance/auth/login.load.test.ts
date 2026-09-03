import http from 'k6/http';
import { Options } from 'k6/options';
import { BASE_URL } from '../../config/config.ts';
import { checkingStatus } from '../../config/utils.ts';

export const options: Options = {
  scenarios: {
    register: {
      executor: 'constant-arrival-rate',
      exec: 'loginFlow',
      rate: 50,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 100,
    },
  },

  thresholds: {
    http_req_failed: ['rate<0.1'],
    'http_req_duration{endpoint:login}': ['p(95)<200'],
  },
};

export function loginFlow() {
  const identity = `vladiso@gmail.com`;
  const password = 'Password123&';

  const payload = { identity, password };
  const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'login' },
  });
  console.log('STATUS:', res.status, 'BODY:', res.body);

  checkingStatus(res, 200);
}
