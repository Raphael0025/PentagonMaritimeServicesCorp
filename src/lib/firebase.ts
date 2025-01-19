import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyB-1rv_yiYaVb7NZ5TcNr5WtjdTBoAsRKA",
    authDomain: "pentagondbms-1095a.firebaseapp.com",
    projectId: "pentagondbms-1095a",
    storageBucket: "pentagondbms-1095a.appspot.com",
    messagingSenderId: "932909452646",
    appId: "1:932909452646:web:392bd9e711c5f414ebcca7",
    measurementId: "G-GFRW1S619W"
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)