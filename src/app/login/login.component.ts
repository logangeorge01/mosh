import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { from } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  fail = '';

  constructor(private db: AngularFirestore, private router: Router) { }

  login(email: string, code: string) {
    this.fail = '';
    if (email.slice(-15) === '@crimson.ua.edu') {
      from(this.db.collection('events').doc(code).get()).toPromise().then(doc => {
        if (doc.exists) {
          this.router.navigate(['queue', code, email.split('@')[0]]);
        } else {
          this.fail = 'event not found';
        }
      });
    } else {
      this.fail = 'email invalid';
    }
  }

  create(email: string) {
    this.fail = '';
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    if (email.slice(-15) === '@crimson.ua.edu') {
      this.db.collection('events').doc(code).set({creator: email.split('@')[0]});
      this.router.navigate(['queue', code, email.split('@')[0]]);
    } else {
      this.fail = 'email invalid';
    }
  }
}
