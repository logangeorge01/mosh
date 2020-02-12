import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Observable, Subscription, of } from 'rxjs';
import { map, switchMap, tap, take } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MusicService } from '../services/music.service';
import { NgModel } from '@angular/forms';
import { SongModel } from '../models/song';

@Component({
  selector: 'app-root',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.css']
})
export class QueueComponent implements OnInit {
  title = 'mosh';
  songs$: Observable<SongModel[]>;
  nowPlaying$: Observable<SongModel>;
  suggests: SongModel[];
  token: string;
  code: string;
  email: string;
  creator: {
    name: string,
    email: string
  };
  searchh: string;
  uname: string;
  username: string = null;
  fail = '';

  @HostListener('document:keydown.enter', ['$event']) onSpaceKeydownHandler(event) {
    event.preventDefault();
    if (this.username) {
      this.searc(this.searchh);
    }
  }

  constructor(
    private db: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute,
    public auth: AuthService,
    private music: MusicService
  ) { }

  ngOnInit() {
    this.code = this.route.snapshot.paramMap.get('code');

    this.db.collection('events').doc(this.code).get().toPromise().then(event => this.creator = event.data().creator);

    this.nowPlaying$ = this.db.collection('events').doc(this.code).collection('nowPlaying').doc('np').snapshotChanges().pipe(
      map(docS => docS.payload.data() as SongModel)
    );

    // tslint:disable-next-line: max-line-length
    const colref = this.db.collection('events').doc(this.code).collection('songs', ref => ref.orderBy('numvotes', 'desc').orderBy('time', 'asc'));
    this.songs$ = colref.snapshotChanges().pipe(
      map(docsS => {
        return docsS.map(docS => {
          const data = docS.payload.doc.data();
          const fireid = docS.payload.doc.id;
          return { fireid, ...data } as SongModel;
        });
      })
    );

    this.username = localStorage.getItem('username');
  }

  uEnter(uname: string) {
    this.fail = '';
    const docRef = this.db.collection('events').doc(this.code);
    docRef.get().toPromise()
    .then(docS => {
      const usernames: any[] = docS.data().usernames || [];
      if (!usernames.includes(uname)) {
        usernames.push(uname);
        docRef.update({usernames});
        localStorage.setItem('username', uname);
        this.username = uname;
        return;
      }
      this.fail = 'Username taken';
    });
  }

  searc(search: string) {
    this.token = this.music.getToken();

    const url = `https://api.music.apple.com/v1/catalog/us/search?term=${search.replace(/ /g, '+')}&limit=4&types=songs`;
    Promise.resolve(fetch(url, {headers: {
      Authorization: 'Bearer ' + this.token
    }}).then(res => res.json())
    .then(r => {
      this.suggests = r.results.songs.data.map(obj => {
        return {
          id: obj.id,
          art: obj.attributes.artwork.url.replace('{w}x{h}', '125x125'),
          name: obj.attributes.name,
          artist: obj.attributes.artistName
        };
      });
    }));
  }

  addd(index: number) {
    this.db.collection('events').doc(this.code).collection('songs').add({
      id: this.suggests[index].id,
      art: this.suggests[index].art.replace('{w}x{h}', '125x125'),
      name: this.suggests[index].name,
      artist: this.suggests[index].artist,
      votes: [],
      numvotes: 0,
      time: firebase.firestore.FieldValue.serverTimestamp(),
      addedby: this.username
    });
    delete this.suggests;
  }

  upvot(id: string) {
    const docref = this.db.collection('events').doc(this.code).collection('songs').doc(id);
    docref.get().toPromise().then(songS => {
      const votes: string[] = songS.data().votes;
      if (!votes.includes(this.email)) {
        docref.update({
          votes: votes.concat([this.username]),
          numvotes: firebase.firestore.FieldValue.increment(1)
        });
      }
    });
  }

  leav() {
    this.router.navigate(['']);
  }
}
