import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

const TOKEN_KEY = 'mallqui_token';
const USER_KEY = 'mallqui_usuario';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  const esApi = req.url.startsWith('/api');

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token && esApi) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const request = esApi ? req.clone({ setHeaders: headers }) : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const esLogin = req.url.includes('/auth/login') || req.url.includes('/auth/register');
      if (error.status === 401 && !esLogin) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
        void router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
