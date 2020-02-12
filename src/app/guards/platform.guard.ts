import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { AuthService} from '../services/auth.service';
import { Observable, forkJoin, combineLatest, of } from 'rxjs';
import { tap, map, take, switchMap, catchError } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

@Injectable()
export class PlatformGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private db: AngularFirestore
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.auth.user$.pipe(
      map(usr => {
        if (!usr) {
          this.router.navigate(['']);
        }
        return !!usr;
      }),
      catchError(() => this.router.navigate(['']))
    );
  }
}
