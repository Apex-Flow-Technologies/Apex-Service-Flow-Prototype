import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Ticket, subscribeToTickets } from './data/tickets';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/* ---------------- CONTEXT TYPE ---------------- */

type AssignedTechnician = {
  username: string; // ✅ REAL identity
  name: string;     // UI display
};

type TicketStore = {
  tickets: Ticket[];
  getTicket: (id: string) => Ticket | undefined;

  // ✅ FIX: accept technician object, not name string
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


  // ✅ FIXED: store BOTH id + name
  const assignTicket = async (
    id: string,
    technician: AssignedTechnician
  ) => {
    await updateDoc(doc(db, 'tickets', id), {
      status: 'in progress',
      assignedToId: technician.username,   // ✅ SAFE
      assignedToName: technician.name,     // UI only
    });
  };

  const confirmClosure = async (id: string) => {
    await updateDoc(doc(db, 'tickets', id), {
      status: 'closed',
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
