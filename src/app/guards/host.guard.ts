import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { AuthService} from '../services/auth.service';
import { Observable, forkJoin, combineLatest } from 'rxjs';
import { tap, map, take, switchMap, catchError } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

@Injectable()
export class HostGuard implements CanActivate {
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
        return res[0].email === (res[1] as any).data().creator.email;
      }),
      tap(isCreator => {
        if (!isCreator) {
          this.router.navigate(['queue', next.params.code]);
        }
      }),
      catchError(() => this.router.navigate(['']))
    );
  }
}
