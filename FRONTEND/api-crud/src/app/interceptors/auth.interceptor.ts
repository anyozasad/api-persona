import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  if (!token || !req.url.startsWith('http://127.0.0.1:8000/api/')) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }));
};
