import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-platform',
  templateUrl: './platform.component.html',
  styleUrls: ['./platform.component.css']
})
export class PlatformComponent implements OnInit {
  events: string[] = [];

  constructor(
    private db: AngularFirestore,
    private router: Router,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.auth.user$.subscribe(usr => {
      this.db.collection('hosts').doc(usr.uid).get().toPromise().then(docsS => {
        this.events = docsS.data().events;
      });
    });
  }

  home() {
    this.router.navigate(['']);
  }

  creat() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const events = this.events.concat([code]);

    this.auth.user$.subscribe(usr => {
      this.db.collection('events').doc(code).set({creator: {name: usr.displayName, email: usr.email}});
      this.db.collection('hosts').doc(usr.uid).update({events});
      this.router.navigate(['host', code]);
    });
  }

  goto(code: string) {
    this.router.navigate(['host', code]);
  }
}
