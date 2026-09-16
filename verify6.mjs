import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCv-FjDPZFKLfj2XaZW1K7ybys8B1VI85s",
  authDomain: "healthnext-01.firebaseapp.com",
  projectId: "healthnext-01",
  storageBucket: "healthnext-01.firebasestorage.app",
  messagingSenderId: "538376748075",
  appId: "1:538376748075:web:d70649586bfee09538be6e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    console.log("Querying organisations...");
    const d = await getDoc(doc(db, 'organisations', 'ORG001'));
    if (d.exists()) {
      console.log("Found:", d.data());
    } else {
      console.log("Doesn't exist or no permission.");
    }
  } catch(e) {
    console.log("error:", e.message);
  }
  process.exit(0);
}

run();
