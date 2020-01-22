// export class SongModel {
//   attributes: SongAttributes;
//   id: string;
//   type: string;
//   href: string;
//   container?: {
//     id: string;
//   };
// }
export class SongModel {
  id: string;
  fireid?: string;
  art: string;
  name: string;
  artist: string;
  votes?: string[];
  numvotes?: number;
  time?: string;
}

// export class SongAttributes {
//   releaseDate: string;
//   albumName: string;
//   artistName: string;
//   durationInMillis: number;
//   name: string;
//   trackNumber: number;
//   playParams: PlayParams;
//   artwork: Artwork;
//   contentRating: string;
// }

// export class Artwork {
//   width: number;
//   height: number;
//   url: string;
//   bgColor: string;
//   textColor1: string;
// }

// export class PlayParams {
//   id: string;
//   isLibrary: boolean;
//   kind: string;
//   catalogId: string;
// }
