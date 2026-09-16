import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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
    console.log("Querying unauthenticated...");
    const q = query(collection(db, 'users'), where('userId', '==', 'WORKER001'));
    const snap = await getDocs(q);
    snap.forEach(d => {
      console.log("Found:", d.data().email);
    });
    if (snap.empty) console.log("Empty result.");
  } catch(e) {
    console.log("error:", e.message);
  }
  process.exit(0);
}

run();
