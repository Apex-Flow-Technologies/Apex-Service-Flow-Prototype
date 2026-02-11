import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export interface Technician {
  username: string;
  name: string;
}

export const fetchTechnicians = async (): Promise<Technician[]> => {
  const q = query(
    collection(db, 'user'), // ✅ FIX: match rules
    where('role', '==', 'technician')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map(doc => {
      const data = doc.data();
      if (!data.username || !data.name) return null;

      return {
        username: data.username,
        name: data.name,
      };
    })
    .filter(Boolean) as Technician[];
};
