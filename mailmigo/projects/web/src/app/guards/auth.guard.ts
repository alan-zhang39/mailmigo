import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivateChild,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { AuthService } from "../services/auth.service";
import { of, switchMap } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivateChild {
  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): MaybeAsync<GuardResult> {
    return this.auth.user$.pipe(
      switchMap((user) =>
        user === null ? this.router.navigateByUrl("/") : of(true),
      ),
    );
  }
}
