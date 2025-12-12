// Shared Technician type and data for manager views
export interface Technician {
  id: string;
  name: string;
  image: string;
  activeTickets: number;
  specialty: string;
}

export const INITIAL_TECHNICIANS: Technician[] = [
  {
    id: 'tech1',
    name: 'Alice Smith',
    image: 'https://randomuser.me/api/portraits/women/65.jpg',
    activeTickets: 3,
    specialty: 'Hardware & Printers',
  },
  {
    id: 'tech2',
    name: 'Bob Johnson',
    image: 'https://randomuser.me/api/portraits/men/65.jpg',
    activeTickets: 5,
    specialty: 'Network & Servers',
  },
  {
    id: 'tech3',
    name: 'Charlie Lee',
    image: 'https://randomuser.me/api/portraits/men/68.jpg',
    activeTickets: 1,
    specialty: 'Software & Accounts',
  },
  {
    id: 'tech4',
    name: 'David Kim',
    image: 'https://randomuser.me/api/portraits/men/70.jpg',
    activeTickets: 0,
    specialty: 'Mobile Devices',
  },
];

