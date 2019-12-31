import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { AuthService} from '../services/auth.service';
import { Observable, combineLatest } from 'rxjs';
import { tap, map, take, catchError } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class QueueGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private db: AngularFirestore
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return combineLatest(
      this.auth.user$,
      this.db.collection('events').doc(next.params.code).get().pipe(
        catchError(() => this.router.navigate(['']))
      )
    ).pipe(
      map(res => {
        return res[0].email !== (res[1] as any).data().creator.email;
      }),
      tap(isNotCreator => {
        if (!isNotCreator) {
          this.router.navigate(['host', next.params.code]);
        }
      }),
      catchError(() => this.router.navigate(['']))
    );
  }
}
