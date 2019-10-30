import { Component, OnInit } from '@angular/core';
import * as jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.css']
})
export class QueueComponent implements OnInit {
  title = 'mosh';
  songs$: Observable<any[]>;
  token: string;
  code: string;
  uname: string;
  creator = '';

  constructor(private db: AngularFirestore, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.code = this.route.snapshot.paramMap.get('code');
    this.uname = this.route.snapshot.paramMap.get('uname');

    this.db.collection('events').doc(this.code).get().toPromise().then(event => this.creator = event.data().creator);

    const colref = this.db.collection('events').doc(this.code).collection('songs', ref => ref.orderBy('votes', 'desc'));
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

  add(search: string) {
    // tslint:disable-next-line: max-line-length
    const secret = '-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg67Q6fjQUSSFT1qER\neFZuL16WrnIWgBi4zazFjMUyWG+gCgYIKoZIzj0DAQehRANCAARva/RzREDKokkK\n6p8gibcsw+jf1IkhY1luThWC/irbz2R4LiC6jA4vLaE1BpVRT6teFL1jXPtFQfxl\nqZeGUDK3\n-----END PRIVATE KEY-----';
    const keyid = 'UDNS67YNJF';
    const iss = '69835AGEY7';
    const algorithm = 'ES256';
    const iat = Math.round(new Date().getTime() / 1000);
    const exp = iat + 86400;
    const headers = {algorithm, keyid};
    const payload = {iss, iat, exp};
    this.token = jwt.sign(payload, secret, headers);

    const url = `https://api.music.apple.com/v1/catalog/us/search?term=${search.replace(/ /g, '+')}&limit=1&types=songs`;
    fetch(url, {headers: {
      Authorization: 'Bearer ' + this.token
    }}).then(res => res.json())
    .then(res => {
      const data = res.results.songs.data[0].attributes;
      this.db.collection('events').doc(this.code).collection('songs').add({
        art: data.artwork.url.replace('{w}x{h}', '125x125'),
        name: data.name,
        artist: data.artistName,
        votes: [],
        numvotes: 0
      });
    });
  }

  remove(id: string) {
    this.db.collection('events').doc(this.code).collection('songs').doc(id).delete();
  }

  upvote(id: string) {
    const docref = this.db.collection('events').doc(this.code).collection('songs').doc(id);
    docref.get().toPromise().then(songS => {
      const votes: string[] = songS.data().votes;
      if (!votes.includes(this.uname)) {
        docref.update({
          votes: votes.concat([this.uname]),
          numvotes: firebase.firestore.FieldValue.increment(1)
        });
      }
    });
  }

  checkCreator(): boolean {
    return this.uname === this.creator;
  }

  cancel() {
    this.db.collection('events').doc(this.code).delete();
    this.router.navigate(['']);
  }

  leave() {
    this.router.navigate(['']);
  }
}
