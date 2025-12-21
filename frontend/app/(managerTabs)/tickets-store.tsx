import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Ticket, subscribeToTickets } from './data/tickets';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

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

  /* ✅ FIXED: ASSIGN DOES NOT START WORK */
  const assignTicket = async (
    id: string,
    technician: AssignedTechnician
  ) => {
    await updateDoc(doc(db, 'tickets', id), {
      status: 'assigned',                 // ✅ FIX HERE
      assignedToId: technician.username,  // technician identity
      assignedToName: technician.name,    // UI display
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
