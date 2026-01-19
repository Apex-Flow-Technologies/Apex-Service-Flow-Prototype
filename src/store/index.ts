import { create } from 'zustand';

// TypeScript Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'technician' | 'manager';
  phone: string;
  status: 'online' | 'offline';
  activeJobs: number;
  avatar?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'assigned' | 'in-progress' | 'completed' | 'declined';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId: string | null;
  assigneeName: string | null;
  location: string;
  customerName: string;
  customerPhone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  action: string;
  timestamp: Date;
  type: 'assignment' | 'status' | 'creation' | 'completion';
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  currentUser: { name: string; email: string; role: string } | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  // Technicians
  technicians: User[];
  addTechnician: (tech: Omit<User, 'id' | 'status' | 'activeJobs'>) => void;
  updateTechnician: (id: string, updates: Partial<User>) => void;
  deleteTechnician: (id: string) => void;

  // Tickets
  tickets: Ticket[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  assignTicket: (ticketId: string, technicianId: string) => void;
  deleteTicket: (id: string) => void;

  // Activities
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
}

// Mock Data
const mockTechnicians: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@technobright.com',
    role: 'technician',
    phone: '+1 (555) 123-4567',
    status: 'online',
    activeJobs: 3,
  },
  {
    id: '2',
    name: 'Sarah Martinez',
    email: 'sarah.m@technobright.com',
    role: 'technician',
    phone: '+1 (555) 234-5678',
    status: 'online',
    activeJobs: 2,
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.j@technobright.com',
    role: 'manager',
    phone: '+1 (555) 345-6789',
    status: 'online',
    activeJobs: 0,
  },
  {
    id: '4',
    name: 'Emily Chen',
    email: 'emily.c@technobright.com',
    role: 'technician',
    phone: '+1 (555) 456-7890',
    status: 'offline',
    activeJobs: 0,
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.w@technobright.com',
    role: 'technician',
    phone: '+1 (555) 567-8901',
    status: 'online',
    activeJobs: 1,
  },
];

const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    title: 'AC Repair at Block C',
    description: 'Central air conditioning unit not cooling properly. Customer reports warm air.',
    status: 'new',
    priority: 'high',
    assigneeId: null,
    assigneeName: null,
    location: 'Block C, Unit 405, Marina Heights',
    customerName: 'Robert Smith',
    customerPhone: '+1 (555) 111-2222',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'TKT-002',
    title: 'Electrical Panel Inspection',
    description: 'Annual safety inspection required for commercial building.',
    status: 'assigned',
    priority: 'medium',
    assigneeId: '1',
    assigneeName: 'John Doe',
    location: 'Tower A, Downtown Business Center',
    customerName: 'ABC Corporation',
    customerPhone: '+1 (555) 222-3333',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'TKT-003',
    title: 'Plumbing Emergency - Water Leak',
    description: 'Severe water leak in bathroom. Water spreading to adjacent rooms.',
    status: 'in-progress',
    priority: 'urgent',
    assigneeId: '2',
    assigneeName: 'Sarah Martinez',
    location: '234 Oak Street, Apt 12',
    customerName: 'Jennifer Lee',
    customerPhone: '+1 (555) 333-4444',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 'TKT-004',
    title: 'HVAC Maintenance',
    description: 'Routine quarterly maintenance for office building HVAC system.',
    status: 'completed',
    priority: 'low',
    assigneeId: '5',
    assigneeName: 'David Wilson',
    location: 'Sunrise Office Park, Building 3',
    customerName: 'Tech Solutions Inc',
    customerPhone: '+1 (555) 444-5555',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 'TKT-005',
    title: 'Generator Installation',
    description: 'Install backup generator for residential property.',
    status: 'declined',
    priority: 'medium',
    assigneeId: '4',
    assigneeName: 'Emily Chen',
    location: '567 Pine Avenue',
    customerName: 'Michael Brown',
    customerPhone: '+1 (555) 555-6666',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: 'TKT-006',
    title: 'Fire Alarm System Check',
    description: 'Monthly fire alarm system testing and certification.',
    status: 'new',
    priority: 'high',
    assigneeId: null,
    assigneeName: null,
    location: 'Grand Hotel, 100 Central Blvd',
    customerName: 'Grand Hotel Management',
    customerPhone: '+1 (555) 666-7777',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'TKT-007',
    title: 'Security Camera Repair',
    description: 'Three outdoor cameras not recording. Need immediate repair.',
    status: 'assigned',
    priority: 'high',
    assigneeId: '1',
    assigneeName: 'John Doe',
    location: 'Warehouse District, Unit 45',
    customerName: 'Secure Storage LLC',
    customerPhone: '+1 (555) 777-8888',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

const mockActivities: Activity[] = [
  {
    id: '1',
    action: 'John Doe accepted Ticket #TKT-002',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    type: 'assignment',
  },
  {
    id: '2',
    action: 'Sarah Martinez started work on Ticket #TKT-003',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    type: 'status',
  },
  {
    id: '3',
    action: 'David Wilson completed Ticket #TKT-004',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    type: 'completion',
  },
  {
    id: '4',
    action: 'New ticket created: AC Repair at Block C',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'creation',
  },
  {
    id: '5',
    action: 'Emily Chen declined Ticket #TKT-005',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    type: 'status',
  },
];

export const useStore = create<AppState>((set, get) => ({
  // Auth State
  isAuthenticated: false,
  currentUser: null,

  login: (email: string, password: string) => {
    // Mock login - in production, this would validate against backend
    if (email && password) {
      set({
        isAuthenticated: true,
        currentUser: {
          name: 'Admin User',
          email: email,
          role: 'Super Admin',
        },
      });
      return true;
    }
    return false;
  },

  logout: () => {
    set({
      isAuthenticated: false,
      currentUser: null,
    });
  },

  // Technicians State
  technicians: mockTechnicians,

  addTechnician: (tech) => {
    const newTech: User = {
      ...tech,
      id: `${Date.now()}`,
      status: 'offline',
      activeJobs: 0,
    };
    set((state) => ({
      technicians: [...state.technicians, newTech],
    }));
    get().addActivity({
      action: `New technician added: ${tech.name}`,
      type: 'creation',
    });
  },

  updateTechnician: (id, updates) => {
    set((state) => ({
      technicians: state.technicians.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  },

  deleteTechnician: (id) => {
    const tech = get().technicians.find((t) => t.id === id);
    set((state) => ({
      technicians: state.technicians.filter((t) => t.id !== id),
    }));
    if (tech) {
      get().addActivity({
        action: `Technician removed: ${tech.name}`,
        type: 'status',
      });
    }
  },

  // Tickets State
  tickets: mockTickets,

  addTicket: (ticket) => {
    const newTicket: Ticket = {
      ...ticket,
      id: `TKT-${String(get().tickets.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      tickets: [...state.tickets, newTicket],
    }));
    get().addActivity({
      action: `New ticket created: ${ticket.title}`,
      type: 'creation',
    });
  },

  updateTicket: (id, updates) => {
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
      ),
    }));
  },

  assignTicket: (ticketId, technicianId) => {
    const technician = get().technicians.find((t) => t.id === technicianId);
    if (technician) {
      set((state) => ({
        tickets: state.tickets.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                status: 'assigned',
                assigneeId: technicianId,
                assigneeName: technician.name,
                updatedAt: new Date(),
              }
            : t
        ),
        technicians: state.technicians.map((t) =>
          t.id === technicianId
            ? { ...t, activeJobs: t.activeJobs + 1 }
            : t
        ),
      }));
      get().addActivity({
        action: `Ticket #${ticketId} assigned to ${technician.name}`,
        type: 'assignment',
      });
    }
  },

  deleteTicket: (id) => {
    set((state) => ({
      tickets: state.tickets.filter((t) => t.id !== id),
    }));
  },

  // Activities State
  activities: mockActivities,

  addActivity: (activity) => {
    const newActivity: Activity = {
      ...activity,
      id: `${Date.now()}`,
      timestamp: new Date(),
    };
    set((state) => ({
      activities: [newActivity, ...state.activities].slice(0, 20),
    }));
  },
}));
