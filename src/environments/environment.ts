// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyAK5UeiBjyeHQ5K8QhsFaagCjOw2bAptZM',
    authDomain: 'mosh-1.firebaseapp.com',
    databaseURL: 'https://mosh-1.firebaseio.com',
    projectId: 'mosh-1',
    storageBucket: 'mosh-1.appspot.com',
    messagingSenderId: '456824925331',
    appId: '1:456824925331:web:d7984ed819cde74700f166',
    measurementId: 'G-7SMNK2005B'
  },
  applemusic: {
    // tslint:disable-next-line: max-line-length
    secret: '-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg67Q6fjQUSSFT1qER\neFZuL16WrnIWgBi4zazFjMUyWG+gCgYIKoZIzj0DAQehRANCAARva/RzREDKokkK\n6p8gibcsw+jf1IkhY1luThWC/irbz2R4LiC6jA4vLaE1BpVRT6teFL1jXPtFQfxl\nqZeGUDK3\n-----END PRIVATE KEY-----',
    keyid: 'UDNS67YNJF',
    iss: '69835AGEY7',
    algorithm: 'ES256'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
