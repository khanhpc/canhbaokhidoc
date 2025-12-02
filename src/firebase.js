import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

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

// Khởi tạo app
const app = initializeApp(firebaseConfig);

// Xuất biến 'db' ra để App.js sử dụng
export const db = getDatabase(app);