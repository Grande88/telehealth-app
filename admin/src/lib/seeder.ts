import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Ensures the signed-in user has a Firestore profile document with role: "admin".
 * Called once after successful Firebase Auth login.
 */
export async function ensureAdminProfile(uid: string, email: string, displayName?: string) {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      id: uid,
      email,
      name: displayName || email.split('@')[0],
      role: 'admin',
      joinDate: new Date().toISOString().split('T')[0],
      feedbackCount: 0,
    });
    console.log('[Seeder] Admin user profile created in Firestore.');
  } else if (userSnap.data()?.role !== 'admin') {
    await setDoc(userRef, { role: 'admin' }, { merge: true });
    console.log('[Seeder] Admin role set on existing user profile.');
  }
}
