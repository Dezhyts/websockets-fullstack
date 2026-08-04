export const BASE_URL = 'http://localhost:3000';
import { Options } from 'k6/options';

export const options: Options = {
  scenarios: {
    register_flow: {
      executor: 'ramping-vus',
      exec: 'registerFlow',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 20 },
        { duration: '20s', target: 20 },
        { duration: '5s', target: 0 },
      ],
    },
    login_flow: {
      executor: 'constant-arrival-rate',
      exec: 'loginFlow',
      rate: 10,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 10,
      maxVUs: 50,
      startTime: '5s',
    },
    refresh_flow: {
      executor: 'constant-arrival-rate',
      exec: 'refreshFlow',
      rate: 10,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 50,
      maxVUs: 50,
      startTime: '5s',
    },
  },

  thresholds: {
    http_req_failed: ['rate<0.1'],
    'http_req_duration{endpoint:register}': ['p(95)<800'],
    'http_req_duration{endpoint:login}': ['p(95)<300'],
    'http_req_duration{endpoint:refresh}': ['p(95)<150'],
  },
};
