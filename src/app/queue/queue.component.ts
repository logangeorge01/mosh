import { Component, OnInit, OnDestroy } from '@angular/core';
import * as jwt from 'jsonwebtoken';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.css']
})
export class QueueComponent implements OnInit, OnDestroy {
  title = 'mosh';
  songs$: Observable<any[]>;
  suggests: {
    art: string,
    name: string,
    artist: string
  }[];
  token: string;
  code: string;
  email: string;
  creator: {
    name: string,
    email: string
  };
  private subscription: Subscription;

  constructor(
    private db: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.code = this.route.snapshot.paramMap.get('code');
    this.subscription = this.auth.user$.subscribe(usr => this.email = usr.email);

    this.db.collection('events').doc(this.code).get().toPromise().then(event => this.creator = event.data().creator);

    // tslint:disable-next-line: max-line-length
    const colref = this.db.collection('events').doc(this.code).collection('songs', ref => ref.orderBy('numvotes', 'desc').orderBy('time', 'asc'));
    this.songs$ = colref.snapshotChanges().pipe(
      map(docsS => {
        return docsS.map(docS => {
          const data = docS.payload.doc.data();
          const id = docS.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  searc(search: string) {
    const iat = Math.round(new Date().getTime() / 1000);
    const exp = iat + 86400;
    const info = environment.applemusic;
    const headers = {algorithm: info.algorithm, keyid: info.keyid};
    const payload = {iss: info.iss, iat, exp};
    this.token = jwt.sign(payload, info.secret, headers);

    const url = `https://api.music.apple.com/v1/catalog/us/search?term=${search.replace(/ /g, '+')}&limit=4&types=songs`;
    Promise.resolve(fetch(url, {headers: {
      Authorization: 'Bearer ' + this.token
    }}).then(res => res.json())
    .then(r => {
      this.suggests = r.results.songs.data.map(obj => {
        return {
          art: obj.attributes.artwork.url.replace('{w}x{h}', '125x125'),
          name: obj.attributes.name,
          artist: obj.attributes.artistName
        };
      });
    }));
  }

  addd(index: number) {
    this.db.collection('events').doc(this.code).collection('songs').add({
      art: this.suggests[index].art.replace('{w}x{h}', '125x125'),
      name: this.suggests[index].name,
      artist: this.suggests[index].artist,
      votes: [],
      numvotes: 0,
      time: firebase.firestore.FieldValue.serverTimestamp()
    });
    delete this.suggests;
  }

  remov(id: string) {
    this.db.collection('events').doc(this.code).collection('songs').doc(id).delete();
  }

  upvot(id: string) {
    const docref = this.db.collection('events').doc(this.code).collection('songs').doc(id);
    docref.get().toPromise().then(songS => {
      const votes: string[] = songS.data().votes;
      if (!votes.includes(this.email)) {
        docref.update({
          votes: votes.concat([this.email]),
          numvotes: firebase.firestore.FieldValue.increment(1)
        });
      }
    });
  }

  cance() {
    this.db.collection('events').doc(this.code).delete();
    this.router.navigate(['']);
  }

  leav() {
    this.router.navigate(['']);
  }
}
