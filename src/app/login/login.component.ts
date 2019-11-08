import { Component, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { from, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnDestroy {
  fail = '';
  code: string;
  private subscription: Subscription = new Subscription();

  constructor(
    private db: AngularFirestore,
    private router: Router,
    public auth: AuthService
  ) { }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  joi(code: string) {
    this.fail = '';

    if (!code) {
      this.fail = 'must include event code';
      return;
    }

    this.subscription.add(this.auth.user$.subscribe(usr => {
      if (!usr) {
        this.auth.googleSignin().then(() => {
          from(this.db.collection('events').doc(code.trim()).get()).toPromise().then(doc => {
            if (doc.exists) {
              this.router.navigate(['queue', code.trim()]);
            } else {
              this.fail = 'event not found';
            }
          });
        });
      } else {
        from(this.db.collection('events').doc(code.trim()).get()).toPromise().then(doc => {
          if (doc.exists) {
            this.router.navigate(['queue', code.trim()]);
          } else {
            this.fail = 'event not found';
          }
        });
      }
    }));
  }

  creat() {
    this.fail = '';
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    this.subscription.add(this.auth.user$.subscribe(usr => {
      if (!usr) {
        this.auth.googleSignin().then(() => {
          this.subscription.add(this.auth.user$.subscribe(newusr => {
            this.db.collection('events').doc(code).set({creator: {name: newusr.displayName, email: newusr.email}}).then(() =>
              this.router.navigate(['queue', code])
            );
          }));
        });
      } else {
        this.db.collection('events').doc(code).set({creator: {name: usr.displayName, email: usr.email}}).then(() =>
          this.router.navigate(['queue', code])
        );
      }
    }));
  }
}
