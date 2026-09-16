import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

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

async function run() {
  try {
    const a2 = await signInWithEmailAndPassword(auth, 'admin01.demo@healthnext.example', 'Test@123');
    console.log("Admin 01 profile:", a2.user.email);
  } catch(e) {
    console.log("admin01 error:", e.message);
  }
  process.exit(0);
}

run();
