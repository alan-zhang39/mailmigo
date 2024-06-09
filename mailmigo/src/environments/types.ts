import { FirebaseOptions } from '@angular/fire/app';

export enum EnvironmentType {
  LOCAL,
  DEV,
  PROD,
}

export interface Environment {
  type: EnvironmentType;
  firebaseConfig: FirebaseOptions;
}
