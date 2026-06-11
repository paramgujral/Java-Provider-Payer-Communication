import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SharedService } from '../services/shared.service';
import { UserRole, RoleId } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private sharedService: SharedService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.sharedService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    const requiredRoles = route.data['roles'] as string[];
    const currentUser = this.sharedService.getCurrentUser();

    if (requiredRoles && currentUser && requiredRoles.includes(currentUser.role)) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
