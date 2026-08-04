import { check } from 'k6';
import { RefinedResponse, ResponseType } from 'k6/http';

export function checkingStatus(
  res: RefinedResponse<ResponseType>,
  status: number,
) {
  return check(res, {
    'status matches expected': (res) => res.status === status,
  });
}
