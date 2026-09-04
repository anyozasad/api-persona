import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.estaAutenticado()) return router.createUrlTree(['/login']);
  const usuario = auth.usuario();
  if (usuario?.rol !== 'Administrador') {
    auth.limpiarSesion();
    return router.createUrlTree(['/login']);
  }
  return true;
};
