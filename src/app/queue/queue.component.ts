import { Component, OnInit } from '@angular/core';
import * as jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.css']
})
export class QueueComponent implements OnInit {
  title = 'mosh';
  songs$: Observable<any[]>;
  suggests: {
    art: string,
    name: string,
    artist: string
  }[];
  token: string;
  code: string;
  uname: string;
  creator = '';

  constructor(private db: AngularFirestore, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.code = this.route.snapshot.paramMap.get('code');
    this.uname = this.route.snapshot.paramMap.get('uname');

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

  ssearch(search: string) {
    // tslint:disable-next-line: max-line-length
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
      // tslint:disable-next-line: max-line-length
      //this.suggests = [{art: './favicon.ico', artist: 'Peas', name: 'Boom Boom Pow'}, {art: './favicon.ico', artist: 'Young the Giant', name: 'Come a Little Closer'}, {art: './favicon.ico', artist: 'Eminem', name: 'Till I Collapse'}, {art: './favicon.ico', artist: 'Bazzi', name: 'Alone'}];
      this.suggests = r.results.songs.data.map(obj => {
        return {
          art: obj.attributes.artwork.url.replace('{w}x{h}', '125x125'),
          name: obj.attributes.name,
          artist: obj.attributes.artistName
        };
      });
    }));
  }

  add(index: number) {
    //console.log('index', index);
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
