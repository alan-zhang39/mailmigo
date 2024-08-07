import { Environment, EnvironmentType } from "./types";

const environment: Environment = {
  type: EnvironmentType.DEV,
  firebaseConfig: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "mailmigo-dev.firebaseapp.com",
    databaseURL: "https://mailmigo-dev-default-rtdb.firebaseio.com",
    projectId: "mailmigo-dev",
    storageBucket: "mailmigo-dev.appspot.com",
    messagingSenderId: "112535735750",
    appId: "1:112535735750:web:ad1d5dff6fa522c3e5f6c7",
  },
};

export default environment;
