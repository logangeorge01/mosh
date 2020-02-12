import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MusicService } from '../services/music.service';
import { PlayerService, PlaybackStates } from '../services/player.service';
import { NgModel } from '@angular/forms';
import { SongModel } from '../models/song';

declare var MusicKit: any;

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css']
})
export class HostComponent implements OnInit, OnDestroy {
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
  public playbackStates = PlaybackStates;
  private subscription: Subscription;
  searchh: string;
  queue0: SongModel;

  @HostListener('document:keydown.enter', ['$event']) onEnterKeydownHandler(event) {
    event.preventDefault();
    this.searc(this.searchh);
  }

  constructor(
    private db: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute,
    public auth: AuthService,
    public music: MusicService,
    public playerService: PlayerService
  ) {
    this.music.musicKit.addEventListener( MusicKit.Events.playbackStateDidChange, this.playbackStateDidChange.bind(this) );
  }

  ngOnInit() {
    this.code = this.route.snapshot.paramMap.get('code');
    this.subscription = this.auth.user$.subscribe(usr => this.email = usr.email);

    this.db.collection('events').doc(this.code).get().toPromise().then(event => this.creator = event.data().creator);

    this.nowPlaying$ = this.db.collection('events').doc(this.code).collection('nowPlaying').doc('np').snapshotChanges().pipe(
      map(docS => docS.payload.data() as SongModel)
    );

    // tslint:disable-next-line: max-line-length
    const colref = this.db.collection('events').doc(this.code).collection('songs', ref => ref.orderBy('numvotes', 'desc').orderBy('time', 'asc'));
    this.songs$ = colref.snapshotChanges().pipe(
      map(docsS => {
        const songs = docsS.map(docS => {
          const data = docS.payload.doc.data();
          const fireid = docS.payload.doc.id;
          return { fireid, ...data } as SongModel;
        });
        this.playerService.setQueue(songs);
        if (songs[0]) {
          this.queue0 = songs[0];
        }
        return songs;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  playbackStateDidChange( event: any ): void {
    const playbackState = PlaybackStates[ PlaybackStates[event.state] ];
    if (playbackState === 5 && this.queue0) {
      this.updateNowPlaying(this.queue0);
      this.remov(this.queue0.fireid);
    }
  }

  searc(search: string) {
    this.token = this.music.getToken();

    const url = `https://api.music.apple.com/v1/catalog/us/search?term=${search.replace(/ /g, '+')}&limit=4&types=songs`;
    Promise.resolve(fetch(url, {headers: {
      Authorization: 'Bearer ' + this.token
    }}).then(res => res.json())
    .then(r => {
      if (!r.results.songs) {
        return;
      }
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
      art: this.suggests[index].art,
      name: this.suggests[index].name,
      artist: this.suggests[index].artist,
      votes: [],
      numvotes: 0,
      time: firebase.firestore.FieldValue.serverTimestamp(),
      addedby: 'Host'
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

  updateNowPlaying(song: SongModel) {
    this.db.collection('events').doc(this.code).collection('nowPlaying').doc('np').set(song);
  }

  playpause(cur: SongModel) {
    if (this.playerService.playbackState === this.playbackStates.PLAYING) {
      this.playerService.pause().subscribe();
    } else if (this.playerService.playbackState === this.playbackStates.PAUSED) {
      this.playerService.play().subscribe();
    } else {
      this.playerService.setQueueFromItems([cur]).subscribe();
      this.updateNowPlaying(cur);
      this.remov(cur.fireid);
    }
  }

  skip(cur: SongModel) {
    this.playerService.skipToNextItem();
    this.updateNowPlaying(cur);
    this.remov(cur.fireid);
  }

  cance(uid: string) {
    this.db.collection('events').doc(this.code).delete();
    this.db.collection('hosts').doc(uid).get().toPromise().then(docS => {
      const events: string[] = docS.data().events;
      events.splice(events.indexOf(this.code), 1);
      return events;
    }).then((events: string[]) => {
      this.db.collection('hosts').doc(uid).update({events});
    }).then(() => this.router.navigate(['']));
  }

  leav() {
    this.router.navigate(['']);
  }

  playstate() {
    switch (this.playerService.playbackState) {
      case (0):
      case (3):
        return 'assets/play.png';
      case (2):
        return 'assets/pause.svg';
      default:
        return 'assets/loading.gif';
    }
  }
}
