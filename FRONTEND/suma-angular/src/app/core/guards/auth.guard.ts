import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

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

function sesionActual(): { token: string | null; rol: string | null } {
  const token = leerStorage(localStorage, TOKEN_KEY) ?? leerStorage(sessionStorage, TOKEN_KEY);
  const raw = leerStorage(localStorage, USER_KEY) ?? leerStorage(sessionStorage, USER_KEY);

  if (!token || !raw) return { token: null, rol: null };

  try {
    const usuario = JSON.parse(raw) as { rol?: string };
    return { token, rol: usuario.rol ?? null };
  } catch {
    limpiarStorage();
    return { token: null, rol: null };
  }
}

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return sesionActual().token ? true : router.createUrlTree(['/login']);
};

export const logoutOnLoginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.estaAutenticado()) return true;

  if (auth.rol === 'Administrador') return router.createUrlTree(['/admin']);
  if (auth.rol === 'Cliente') return router.createUrlTree(['/usuario']);
  if (auth.rol === 'Entrenador') return router.createUrlTree(['/entrenador']);

  auth.limpiarSesion();
  return true;
};

export function roleGuard(rolesPermitidos: string[]): CanActivateFn {
  return () => {
    const router = inject(Router);
    const sesion = sesionActual();

    if (!sesion.token) return router.createUrlTree(['/login']);
    if (sesion.rol && rolesPermitidos.includes(sesion.rol)) return true;

    if (sesion.rol === 'Administrador') return router.createUrlTree(['/admin']);
    if (sesion.rol === 'Cliente') return router.createUrlTree(['/usuario']);
    if (sesion.rol === 'Entrenador') return router.createUrlTree(['/entrenador']);
    return router.createUrlTree(['/']);
  };
}
