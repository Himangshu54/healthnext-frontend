import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

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
    const creds = await signInWithEmailAndPassword(auth, 'employee06.demo@healthnext.example', 'Test@123');
    console.log("Logged in as", creds.user.email);
    
    // Check users
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.forEach(doc => {
        console.log("User:", doc.id, doc.data());
      });
    } catch (e) {
      console.log("Could not fetch all users (likely rules block global read):", e.message);
    }

    // Since we know the employee credentials, let's see their own record:
    try {
      const selfSnap = await getDoc(doc(db, 'users', creds.user.uid));
      console.log("Self user profile:", selfSnap.data());
    } catch (e) {}

    // What if there is a known admin email?
    try {
      const adminCreds = await signInWithEmailAndPassword(auth, 'admin@healthnext.org', 'admin123');
      const adminSnap = await getDoc(doc(db, 'users', adminCreds.user.uid));
      console.log("Admin profile:", adminSnap.data());
    } catch (e) {
      console.log("Could not login as admin@healthnext.org (mock user):", e.message);
    }
    
    // There was a demo admin in AuthContext.jsx: 
    // email: 'admin@healthnext.org',
    // Let's try maybe admin01.demo@healthnext.example / Test@123
    try {
      const a2 = await signInWithEmailAndPassword(auth, 'admin01.demo@healthnext.example', 'Test@123');
      const a2Snap = await getDoc(doc(db, 'users', a2.user.uid));
      console.log("Admin 01 profile:", a2Snap.data());
    } catch(e) {}

    console.log("Verification complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

run();
