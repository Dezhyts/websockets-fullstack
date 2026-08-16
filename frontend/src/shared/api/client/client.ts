import createClient from 'openapi-fetch/dist/index.cjs';
import { paths } from '../schema.gen';

export const apiClient = createClient<paths>({
  baseUrl: 'http://localhost:3000',
  credentials: 'include',
});

apiClient.use({
  async onRequest({ request }) {
    if (typeof window === 'undefined') {
      try {
        const { cookies } = await import('next/headers');
        const cookiesStore = await cookies();
        const cookieString = cookiesStore.toString();

        // ВАЖНЫЙ ЛОГ: Посмотрим, видит ли Next.js хоть какие-то куки
        console.log('👉 COOKIES ON SERVER:', cookieString);

        if (cookieString) {
          request.headers.set('cookie', cookieString);
        }
      } catch (error) {
        console.log('❌ Error reading cookies:', error);
      }
    }
    return request;
  },
});

export async function getStreamIngresToken(roomName: string) {
  const { data, response } = await apiClient.GET('/media/token', {
    params: { query: { roomName } },
    cache: 'no-store',
  });

  if (!response.ok || !data) {
    return { data: null, isError: true as const, status: response.status };
  }

  return { data, isError: false as const, status: response.status };
}

export async function createStreamIngress(roomName: string) {
  const { data, response } = await apiClient.POST('/media/ingress', {
    body: { roomName },
  });

  if (!response.ok || !data) {
    return { data: null, isError: true as const, status: response.status };
  }

  return { data, isError: false as const, status: response.status };
}
