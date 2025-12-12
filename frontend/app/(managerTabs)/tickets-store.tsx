import React, { createContext, useContext, useMemo, useState } from 'react';
import { ALL_TICKETS, Ticket } from './data/tickets';

type TicketStore = {
  tickets: Ticket[];
  getTicket: (id: string) => Ticket | undefined;
  assignTicket: (id: string, technician: string) => void;
  confirmClosure: (id: string) => void;
};

const TicketsContext = createContext<TicketStore | null>(null);

export const TicketsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>(ALL_TICKETS);

  const assignTicket = (id: string, technician: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'In Progress', technician } : t))
    );
  };

  const confirmClosure = (id: string) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'Closed' } : t)));
  };

  const value = useMemo<TicketStore>(
    () => ({
      tickets,
      getTicket: (id) => tickets.find((t) => t.id === id),
      assignTicket,
      confirmClosure,
    }),
    [tickets]
  );

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>;
};

export const useTickets = () => {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error('useTickets must be used within TicketsProvider');
  return ctx;
};

