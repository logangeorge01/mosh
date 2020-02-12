import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { AuthService} from '../services/auth.service';
import { Observable, combineLatest, of } from 'rxjs';
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
    return of(!!next.params.code);
  }
}
