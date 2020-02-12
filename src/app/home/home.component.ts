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

    from(this.db.collection('events').doc(code.trim()).get()).toPromise().then(doc => {
      if (doc.exists) {
        this.router.navigate(['queue', code.trim()]);
      } else {
        this.loading = false;
        this.fail = 'event not found';
      }
    });
  }

  hostLogin() {
    this.fail = '';
    this.loading = true;
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    this.subscription.add(this.auth.user$.subscribe(usr => {
      if (!usr) {
        this.auth.googleSignin().then(() => {
          this.subscription.add(this.auth.user$.subscribe());
          this.router.navigate(['platform']);
        });
      } else {
        this.router.navigate(['platform']);
      }
    }));
  }
}
