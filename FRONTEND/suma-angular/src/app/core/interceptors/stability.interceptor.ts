import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, throwError, timer } from 'rxjs';

const RETRYABLE_STATUS = new Set([0, 500, 502, 503, 504]);

export const stabilityInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET' || !req.url.startsWith('/api')) {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: 1,
      delay: (error: HttpErrorResponse) => {
        if (!RETRYABLE_STATUS.has(Number(error?.status ?? 0))) {
          return throwError(() => error);
        }
        return timer(250);
      }
    })
  );
};
