// Shared Ticket type and mock data for manager views
export interface Ticket {
  id: string;
  title: string;
  customer: string;
  status: 'Open' | 'In Progress' | 'Pending Closure' | 'Closed';
  date: string;
}

export const ALL_TICKETS: Ticket[] = [
  { id: 'TCK-1042', title: 'Printer not working', customer: 'Jane Doe', status: 'Open', date: '2025-11-12' },
  { id: 'TCK-1041', title: 'Email sync issue', customer: 'John Smith', status: 'In Progress', date: '2025-11-11' },
  { id: 'TCK-1039', title: 'Network latency', customer: 'Acme Corp', status: 'Pending Closure', date: '2025-11-10' },
  { id: 'TCK-1038', title: 'Laptop Battery Dead', customer: 'Jane Doe', status: 'Closed', date: '2025-11-09' },
  { id: 'TCK-1037', title: 'Cannot access server', customer: 'Bob Johnson', status: 'In Progress', date: '2025-11-09' },
  { id: 'TCK-1036', title: 'New Software Request', customer: 'Alice Smith', status: 'Open', date: '2025-11-09' },
  { id: 'TCK-1035', title: 'PC setup for new hire', customer: 'HR Dept', status: 'Closed', date: '2025-11-08' },
];
