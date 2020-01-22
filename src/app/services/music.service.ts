import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { from } from 'rxjs';
import * as jwt from 'jsonwebtoken';

declare var MusicKit: any;

@Injectable({
  providedIn: 'root'
})
export class MusicService {
    musicKit: any;
    isAuthorized = false;

    constructor() {

        MusicKit.configure({
          developerToken: this.getToken(),
          app: {
            name: 'mosh',
            build: '1.0'
          }
        });

        this.musicKit = MusicKit.getInstance();
        this.musicKit.addEventListener( MusicKit.Events.authorizationStatusDidChange, this.authorizationStatusDidChange.bind(this) );

        this.isAuthorized = this.musicKit.isAuthorized;
    }

    getToken() {
      const iat = Math.round(new Date().getTime() / 1000);
      const exp = iat + 86400;
      const info = environment.applemusic;
      const headers = {algorithm: info.algorithm, keyid: info.keyid};
      const payload = {iss: info.iss, iat, exp};
      return jwt.sign(payload, info.secret, headers);
    }

    authorize(): void {
      from( this.musicKit.authorize() ).subscribe( () => {
        this.isAuthorized = true;
      });
    }

    unauthorize(): void {
      from( this.musicKit.unauthorize() ).subscribe( () => {
        this.isAuthorized = false;
      });
    }

    authorizationStatusDidChange(event): void {
      this.isAuthorized = event.authorizationStatus;
      // if ( this.isAuthorized ) {
      //   location.reload();
      // }
    }


    addAuthChangeListener( func ) {
      this.musicKit.addEventListener( MusicKit.Events.authorizationStatusDidChange, func );
    }
}
