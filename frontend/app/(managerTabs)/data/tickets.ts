import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

/* ---------------- TYPES ---------------- */

export type TicketStatus =
  | 'New'
  | 'Assigned'
  | 'In Progress'
  | 'Waiting for Confirmation'
  | 'declined'
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
  assignedToId?: string;
};

/* ---------------- HELPERS ---------------- */

const formatTicketId = (id: number | string | undefined) => {
  if (id === undefined || id === null) return 'Ticket ID #0000';
  return `Ticket ID #${String(id).padStart(4, '0')}`;
};

/**
 * Convert Firestore status → App-safe TicketStatus
 */
const normalizeStatus = (rawStatus: string): TicketStatus => {
  if (!rawStatus) return 'New';

  const status = rawStatus.toLowerCase().trim();

  switch (status) {
    case 'open':
      return 'New';

    case 'assigned':
      return 'Assigned';

    case 'in progress':
    case 'in_progress':
      return 'In Progress';

    case 'waiting for confirmation':
    case 'waiting_for_confirmation':
      return 'Waiting for Confirmation';

    case 'declined':
      return 'declined';

    case 'closed':
      return 'Closed';

    default:
      return 'New';
  }
};

/* ---------------- SUBSCRIPTION ---------------- */

export const subscribeToTickets = (
  setTickets: (tickets: Ticket[]) => void
) => {
  const q = query(collection(db, 'tickets'));

  const unsubscribe = onSnapshot(q, snapshot => {
    const ticketsData: Ticket[] = snapshot.docs.map(doc => {
      const data: any = doc.data();

      return {
        id: doc.id,
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
        assignedToId: data.assignedToId ?? undefined,
      };
    });

    setTickets(ticketsData);
  });

  return unsubscribe;
};
