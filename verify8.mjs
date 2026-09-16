import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
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
const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  try {
    await signInWithEmailAndPassword(auth, 'employee06.demo@healthnext.example', 'Test@123');
    console.log("Logged in.");

    // Query for Organization Administrator
    const q = query(collection(db, 'users'), where('role', '==', 'Organization Administrator'));
    const snap = await getDocs(q);
    if (snap.empty) {
      console.log("No Organization Administrators found globally.");
    } else {
      snap.forEach(d => console.log("Admin:", d.data()));
    }
  } catch(e) {
    console.log("error:", e.message);
  }
  process.exit(0);
}

run();
