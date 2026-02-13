import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Ticket, subscribeToTickets } from '@/data/tickets';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { addDoc, collection, serverTimestamp, getDoc} from 'firebase/firestore'; //for activity log


/* ---------------- CONTEXT TYPE ---------------- */

type AssignedTechnician = {
  username: string; // REAL identity
  name: string;     // UI display
};

type TicketStore = {
  tickets: Ticket[];
  getTicket: (id: string) => Ticket | undefined;

  assignTicket: (id: string, technician: AssignedTechnician) => Promise<void>;
  confirmClosure: (id: string) => Promise<void>;
};

/* ---------------- CONTEXT ---------------- */

const TicketsContext = createContext<TicketStore | null>(null);

/* ---------------- PROVIDER ---------------- */

export const TicketsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const unsub = subscribeToTickets(setTickets);
    return () => unsub();
  }, []);

  
  const assignTicket = async (
  id: string,
  technician: AssignedTechnician
) => {
  const ticketRef = doc(db, 'tickets', id);

  // GET ticket data first
const snap = await getDoc(ticketRef);

let ticketNumber = id; // fallback

if (snap.exists()) {
  const data = snap.data();
  if (data?.ticketId) {
    ticketNumber = String(data.ticketId).padStart(4, '0');
  }
}


  await updateDoc(ticketRef, {
    status: 'assigned',
    assignedToId: technician.username,
    assignedToName: technician.name,
  });

  //ACTIVITY LOG
  await addDoc(collection(db, "activities"), {
    type: "assignment",
    action: `TICKET #${ticketNumber} assigned to ${technician.name}`,
    timestamp: serverTimestamp(),
    status: "active",
  });
};

const confirmClosure = async (id: string) => {
  const ticketRef = doc(db, 'tickets', id);

const snap = await getDoc(ticketRef);

let ticketNumber = id; // fallback

if (snap.exists()) {
  const data = snap.data();
  if (data?.ticketId) {
    ticketNumber = String(data.ticketId).padStart(4, '0');
  }
}

  await updateDoc(ticketRef, {
    status: 'closed',
  });

  // ACTIVITY LOG
  await addDoc(collection(db, "activities"), {
    type: "completion",
    action: `TICKET #${ticketNumber} approved and closed by manager`,
    timestamp: serverTimestamp(),
    status: "active",
  });
};


  const value = useMemo(
    () => ({
      tickets,
      getTicket: (id: string) => tickets.find(t => t.id === id),
      assignTicket,
      confirmClosure,
    }),
    [tickets]
  );

  return (
    <TicketsContext.Provider value={value}>
      {children}
    </TicketsContext.Provider>
  );
};

/* ---------------- HOOK ---------------- */

export const useTickets = () => {
  const ctx = useContext(TicketsContext);
  if (!ctx) {
    throw new Error('useTickets must be used inside TicketsProvider');
  }
  return ctx;
};
