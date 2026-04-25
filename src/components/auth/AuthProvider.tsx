import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useStore } from '@/store';
import { Loader2 } from 'lucide-react';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { login, logout, isInitializing, setInitializing } = useStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch additional user data from Firestore
          const q = query(collection(db, "user"), where("uid", "==", firebaseUser.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            login({
              id: querySnapshot.docs[0].id,
              uid: firebaseUser.uid,
              name: userData.name,
              email: userData.email,
              role: userData.role,
            });
          } else {
            console.warn("User authenticated but no Firestore document found.");
            logout();
          }
        } catch (error) {
          console.error("Error restoring session:", error);
          logout();
        }
      } else {
        logout();
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, [login, logout, setInitializing]);

  if (isInitializing) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0B1221] text-white">
        <div className="relative mb-8">
            <div className="h-24 w-24 rounded-full border-t-2 border-l-2 border-blue-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full border-b-2 border-r-2 border-cyan-400 animate-spin-reverse"></div>
            </div>
        </div>
        <h2 className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 animate-pulse">
            APEX SERVICE FLOW
        </h2>
        <p className="mt-4 text-gray-400 text-sm font-medium tracking-widest flex items-center gap-2">
            INITIALIZING SECURE SESSION <Loader2 className="h-3 w-3 animate-spin" />
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
