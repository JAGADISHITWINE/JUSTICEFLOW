import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ClientPortalService } from '../services/client-portal.service';

export const clientAuthGuard: CanActivateFn = (route, state) => {
  const portalService = inject(ClientPortalService);
  const router = inject(Router);

  if (portalService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/portal/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
