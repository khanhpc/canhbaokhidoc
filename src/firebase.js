import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB9cliuQlLAchN5PZzTxhv-nGtvcCmASOs",
  authDomain: "gasmonitor-c5922.firebaseapp.com",
  databaseURL: "https://gasmonitor-c5922-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gasmonitor-c5922",
  storageBucket: "gasmonitor-c5922.firebasestorage.app",
  messagingSenderId: "784192059878",
  appId: "1:784192059878:web:c874b8c51124aca3457e27",
  measurementId: "G-SQVGB49CEW"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app);