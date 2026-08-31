import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

const TOKEN_KEY = 'mallqui_token';
const USER_KEY = 'mallqui_usuario';

function sesionActual(): { token: string | null; rol: string | null } {
  const token = localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);

  if (!token || !raw) return { token: null, rol: null };

  try {
    const usuario = JSON.parse(raw) as { rol?: string };
    return { token, rol: usuario.rol ?? null };
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    return { token: null, rol: null };
  }
}

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return sesionActual().token ? true : router.createUrlTree(['/login']);
};

// Cualquier boton existente que regrese a /login funciona como cierre de sesion real:
// revoca el token en Laravel y despues limpia el navegador.
export const logoutOnLoginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.estaAutenticado()) return true;

  return auth.logout().pipe(
    map(() => {
      auth.limpiarSesion();
      return true;
    }),
    catchError(() => {
      auth.limpiarSesion();
      return of(true);
    })
  );
};

export function roleGuard(rolesPermitidos: string[]): CanActivateFn {
  return () => {
    const router = inject(Router);
    const sesion = sesionActual();

    if (!sesion.token) return router.createUrlTree(['/login']);
    if (sesion.rol && rolesPermitidos.includes(sesion.rol)) return true;

    if (sesion.rol === 'Administrador') return router.createUrlTree(['/admin']);
    if (sesion.rol === 'Cliente') return router.createUrlTree(['/usuario']);
    return router.createUrlTree(['/']);
  };
}
