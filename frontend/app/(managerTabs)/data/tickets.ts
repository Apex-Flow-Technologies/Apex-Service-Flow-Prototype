import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';


export type TicketStatus =
  | 'New'
  | 'In Progress'
  | 'Waiting for Confirmation'
  | 'Closed';


export type Ticket = {
  id: string;              
  ticketId: string;        
  title: string;
  description: string;
  customer: string;
  date: string;
  status: TicketStatus;
  technician?: string;
};

const formatTicketId = (id: number | string | undefined) => {
  if (id === undefined || id === null) return 'Ticket ID #0000';
  return `Ticket ID #${String(id).padStart(4, '0')}`;
};

const normalizeStatus = (rawStatus: string): TicketStatus => {
  switch (rawStatus) {
    case 'open':
      return 'New';
    case 'in progress':
      return 'In Progress';
    case 'waiting_for_confirmation':
      return 'Waiting for Confirmation';
    case 'closed':
      return 'Closed';
    default:
      return 'New';
  }
};


export const subscribeToTickets = (
  setTickets: (tickets: Ticket[]) => void
) => {
  const q = query(collection(db, 'tickets'));

  const unsubscribe = onSnapshot(q, snapshot => {
    const ticketsData: Ticket[] = snapshot.docs.map(doc => {
      const data: any = doc.data();

      return {
        id: doc.id, // Firestore slug ID
        ticketId: formatTicketId(data.ticketId), 
        description: data.description ?? '',
        title: data.description
          ? data.description.split(' ').slice(0, 3).join(' ')
          : 'No description',
        customer: data.userName ?? 'Unknown',
        date: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString().split('T')[0]
          : 'N/A',
        status: normalizeStatus(data.status),
        technician: data.assignedToName ?? undefined,
      };
    });

    setTickets(ticketsData);
  });

  return unsubscribe;
};
