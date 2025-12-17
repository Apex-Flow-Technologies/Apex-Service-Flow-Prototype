import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';


export interface Technician {
  username: string; // unique id
  name: string;     // display name
}


export const fetchTechnicians = async (): Promise<Technician[]> => {
  const q = query(
    collection(db, 'user'),
    where('role', '==', 'technician')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      username: data.username,
      name: data.name,
    };
  });
};
