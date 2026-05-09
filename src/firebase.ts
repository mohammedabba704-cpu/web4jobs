import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)' 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId) 
  : getFirestore(app);
export const auth = getAuth(app);

// Validate Connection to Firestore
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn(
        "Veuillez vérifier votre configuration Firebase. Le client est hors ligne.\n" +
        "Cela indique généralement :\n" +
        "1. Un bloqueur de publicités (Adblock, uBlock, Brave Shields) bloque la connexion à Firebase.\n" +
        "2. Vous n'avez pas de connexion internet.\n" +
        "3. Le domaine n'est pas autorisé dans la console Firebase.\n" +
        "4. La base de données Firestore n'est pas encore créée. Allez dans Firebase Console > Build > Firestore Database > Create database.\n", error
      );
    } else {
      console.warn("Firestore test connection warning:", error);
    }
  }
}

testConnection();
