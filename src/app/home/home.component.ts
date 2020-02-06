import { Component, OnDestroy, HostListener } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { from, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnDestroy {
  fail = '';
  code: string;
  loading = false;
  private subscription: Subscription = new Subscription();

  @HostListener('document:keydown.enter', ['$event']) onSpaceKeydownHandler(event) {
    event.preventDefault();
    this.joi(this.code);
  }

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
    this.loading = true;

    if (!code) {
      this.fail = 'must include event code';
      return;
    }

    this.subscription.add(this.auth.user$.subscribe(usr => {
      if (!usr) {
        this.auth.googleSignin().then(() => {
          from(this.db.collection('events').doc(code.trim()).get()).toPromise().then(doc => {
            if (doc.exists) {
              this.router.navigate(['host', code.trim()]);
            } else {
              this.loading = false;
              this.fail = 'event not found';
            }
          });
        });
      } else {
        from(this.db.collection('events').doc(code.trim()).get()).toPromise().then(doc => {
          if (doc.exists) {
            this.router.navigate(['host', code.trim()]);
          } else {
            this.loading = false;
            this.fail = 'event not found';
          }
        });
      }
    }));
  }

  creat() {
    this.fail = '';
    this.loading = true;
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    this.subscription.add(this.auth.user$.subscribe(usr => {
      if (!usr) {
        this.auth.googleSignin().then(() => {
          this.subscription.add(this.auth.user$.subscribe(newusr => {
            this.db.collection('events').doc(code).set({creator: {name: newusr.displayName, email: newusr.email}}).then(() =>
              this.router.navigate(['host', code])
            );
          }));
        });
      } else {
        this.db.collection('events').doc(code).set({creator: {name: usr.displayName, email: usr.email}}).then(() =>
          this.router.navigate(['host', code])
        );
      }
    }));
  }
}
