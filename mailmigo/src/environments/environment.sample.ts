import { Environment, EnvironmentType } from './types';

const environment: Environment = {
  type: EnvironmentType.LOCAL,
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

export default environment;
