import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

const TOKEN_KEY = 'mallqui_token';
const USER_KEY = 'mallqui_usuario';

function leerStorage(storage: Storage, key: string): string | null {
  try { return storage.getItem(key); } catch { return null; }
}

function limpiarStorage(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {}
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch {}
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = leerStorage(localStorage, TOKEN_KEY) ?? leerStorage(sessionStorage, TOKEN_KEY);
  const esApi = req.url.startsWith('/api');

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token && esApi) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let request = esApi ? req.clone({ setHeaders: headers }) : req;

  // Las pantallas administrativas y del cliente siempre deben leer datos frescos.
  // Evita que el navegador reutilice respuestas GET antiguas mientras se está trabajando.
  if (esApi && req.method === 'GET') {
    request = request.clone({
      setHeaders: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache'
      },
      setParams: {
        _ts: String(Date.now())
      }
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const esLogin = req.url.includes('/auth/login') || req.url.includes('/auth/register');
      if (error.status === 401 && !esLogin) {
        limpiarStorage();
        void router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
