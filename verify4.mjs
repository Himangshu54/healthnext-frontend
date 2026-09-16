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

const emails = ['admin01.demo@healthnext.example', 'admin@healthnext.org', 'admin01@healthnext.example', 'admin01@healthnext.org'];
const passwords = ['Test@123', 'admin123', 'password', 'password123'];

async function run() {
  for (const email of emails) {
    for (const password of passwords) {
      try {
        const creds = await signInWithEmailAndPassword(auth, email, password);
        console.log("SUCCESS:", email, password, "uid:", creds.user.uid);
        process.exit(0);
      } catch (e) {
        // ignore
      }
    }
  }
  console.log("No valid admin combinations found.");
  process.exit(0);
}

run();
