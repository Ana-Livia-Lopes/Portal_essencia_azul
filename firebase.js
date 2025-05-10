const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = require("./config.json").firebase

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { app, db };