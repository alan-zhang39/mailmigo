import { FirebaseOptions } from '@angular/fire/app';

export interface Environment {
  production: boolean;
  firebaseConfig: FirebaseOptions;
}

export const environment: Environment = {
  production: false,
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  },
};
