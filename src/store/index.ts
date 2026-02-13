import { create } from "zustand";

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

import { db } from "@/firebase";

/* ===============================
   Interfaces
================================ */

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "technician" | "manager";
  phone: string;
  address?: string;
  status: "online" | "offline";
  activeJobs: number;
}

export interface Attachment {
  type: "image" | "video" | "audio";
  url: string;
}

export interface Ticket {
  id: string;
  displayId: string;
  title: string;
  description: string;

  status: "new" | "assigned" | "in-progress" | "completed" | "declined";
  priority: "low" | "medium" | "high" | "urgent";

  assignedToId: string | null;
  assignedToName: string | null;

  location: string;

  customerName: string;
  customerPhone: string;

  createdAt: Date;
  updatedAt: Date;
  assignedAt?: Date;

  machineCode?: string;

  attachments?: Attachment[];
}

export interface Activity {
  id: string;
  action: string;
  timestamp: Date;
  type: "assignment" | "status" | "creation" | "completion";
}

/* ===============================
   Helpers
================================ */

function mapStatus(status: string): Ticket["status"] {
  switch (status) {
    case "open":
      return "new";
    case "assigned":
      return "assigned";
    case "in progress":
    case "waiting_for_confirmation":
      return "in-progress";
    case "denied":
      return "declined";
    case "closed":
      return "completed";
    default:
      return "new";
  }
}

function mapPriority(status: string): Ticket["priority"] {
  if (status === "open") return "high";
  if (status === "closed") return "low";
  return "medium";
}

function formatTicket(docSnap: any): Ticket {
  const data = docSnap.data();

  const title =
    data.description?.split(" ").slice(0, 3).join(" ") || "No Title";

  const attachments =
    Array.isArray(data.attachments)
      ? data.attachments.map((item: any) => ({
          type: item.type,
          url: item.url || item.uri,
        }))
      : [];

  return {
    id: docSnap.id,

    displayId: `TICKET #${String(data.ticketId).padStart(4, "0")}`,

    title,

    description: data.description || "",

    status: mapStatus(data.status),

    priority: mapPriority(data.status),

    assignedToId: data.assignedToId || null,

    assignedToName: data.assignedToName || null,

    location: "xxxx",

    customerName: data.userName || "Unknown",

    customerPhone: data.phone || "",

    createdAt: data.createdAt?.toDate() || new Date(),

    updatedAt: data.updatedAt?.toDate() || new Date(),

    machineCode: data.machineCode,

    attachments,
  };
}

/* ===============================
   Store Interface
================================ */

interface AppState {
  // Auth
  isAuthenticated: boolean;
  currentUser: { name: string; email: string; role: string } | null;

  login: (email: string, password: string) => boolean;
  logout: () => void;

  // Technicians
  technicians: User[];

  fetchTechnicians: () => Promise<void>;

  addTechnician: (
    tech: Omit<User, "id" | "status" | "activeJobs">
  ) => Promise<void>;

  deleteTechnician: (id: string) => Promise<void>;

  updateTechnician: (
    id: string,
    updates: Partial<User>
  ) => Promise<void>;

  // Tickets
  tickets: Ticket[];

  fetchTickets: () => Promise<void>;

  updateTicket: (
    id: string,
    updates: Partial<Ticket>
  ) => Promise<void>;

  assignTicket: (
    ticketId: string,
    technicianId: string
  ) => Promise<void>;

  // Activities
  activities: Activity[];
  fetchActivities: () => Promise<void>;


  listenToActivities: () => () => void;
}

/* ===============================
   Store
================================ */

async function logActivity(
  type: "assignment" | "status" | "creation" | "completion",
  action: string
) {
  await addDoc(collection(db, "activities"), {
    type,
    action,
    timestamp: serverTimestamp(),
    status: "active",
  });
}


export const useStore = create<AppState>((set, get) => ({
  /* ===============================
     Auth
  ================================ */

  isAuthenticated: false,

  currentUser: null,

  login: (email, password) => {
    if (email && password) {
      set({
        isAuthenticated: true,
        currentUser: {
          name: "Admin",
          email,
          role: "Super Admin",
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

  /* ===============================
     Technicians
  ================================ */

  technicians: [],
fetchTechnicians: async () => {
  try {
    // Get users
    const userSnap = await getDocs(
      query(
        collection(db, "user"),
        where("role", "in", ["technician", "manager"])
      )
    );

    // Get tickets and format them
    const ticketSnap = await getDocs(collection(db, "tickets"));
    const tickets: Ticket[] = ticketSnap.docs.map(formatTicket);

    const users: User[] = userSnap.docs.map((d) => {
      const data = d.data() as any;
      const userId = d.id;

      const activeJobs = tickets.filter((t) => {
        return (
          t.assignedToId === userId &&
          t.status !== "completed" &&
          t.status !== "declined"
        );
      }).length;

      return {
        id: userId,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone || "",
        address: data.address || "",
        status: data.status || "offline",
        username: data.username || "",
        activeJobs,
      };
    });

    set({ technicians: users });

  } catch (err) {
    console.error("Fetch technicians error:", err);
  }
},


  addTechnician: async (tech) => {
  try {
    const ref = await addDoc(collection(db, "user"), {
      ...tech,
      status: "offline",
      activeJobs: 0,
    });

    const roleLabel =
      tech.role.charAt(0).toUpperCase() + tech.role.slice(1);

    await logActivity(
      "creation",
      `${roleLabel} ${tech.name} was added`
    );

    const newTech: User = {
      ...tech,
      id: ref.id,
      status: "offline",
      activeJobs: 0,
    };

    set((state) => ({
      technicians: [...state.technicians, newTech],
    }));
  } catch (err) {
    console.error("Add technician error:", err);
  }
},


  deleteTechnician: async (id) => {
  try {
    const tech = get().technicians.find((t) => t.id === id);

    await deleteDoc(doc(db, "user", id));

    if (tech) {
      const roleLabel =
        tech.role.charAt(0).toUpperCase() + tech.role.slice(1);

      await logActivity(
        "status",
        `${roleLabel} ${tech.name} was removed`
      );
    }

    set((state) => ({
      technicians: state.technicians.filter((t) => t.id !== id),
    }));
  } catch (err) {
    console.error("Delete technician error:", err);
  }
},


  updateTechnician: async (id, updates) => {
    try {
      await updateDoc(doc(db, "user", id), updates);

      set((state) => ({
        technicians: state.technicians.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      }));
    } catch (err) {
      console.error("Update technician error:", err);
    }
  },

  /* ===============================
     Tickets
  ================================ */

  tickets: [],

  fetchTickets: async () => {
    try {
      const snap = await getDocs(collection(db, "tickets"));

      const tickets: Ticket[] = snap.docs.map(formatTicket);

      set({ tickets });
    } catch (err) {
      console.error("Fetch tickets error:", err);
    }
  },

updateTicket: async (id, updates) => {
  try {
    await updateDoc(doc(db, "tickets", id), {
      ...updates,
      updatedAt: new Date(),
    });

    // ✅ If status changed, log activity
    if (updates.status) {
      let activityType: "assignment" | "status" | "creation" | "completion" = "status";
      let actionText = `Ticket ${id} marked as ${updates.status}`;

      if (updates.status === "completed") {
        activityType = "completion";
      } else if (updates.status === "declined") {
        activityType = "status";
        actionText = `Ticket ${id} was declined`;
      } else if (updates.status === "in-progress") {
        activityType = "status";
        actionText = `Ticket ${id} is now in progress`;
      }

      await logActivity(activityType, actionText);
    }

    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  } catch (err) {
    console.error("Update ticket error:", err);
  }
},

  assignTicket: async (ticketId, technicianUsername) => {
  try {
    const tech = get().technicians.find(
      (t) => t.username === technicianUsername
    );

    if (!tech) return;

    const ticket = get().tickets.find(
      (t) => t.id === ticketId
    );

    const ticketNo = ticket?.displayId || ticketId;

    await updateDoc(doc(db, "tickets", ticketId), {
      status: "assigned",
      assignedToId: tech.id,          // always store doc id
      assignedToName: tech.name,
      updatedAt: new Date(),
    });

    await logActivity(
      "assignment",
      `${tech.name} assigned ${ticketNo}`
    );

    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: "assigned",
              assignedToId: tech.id,
              assignedToName: tech.name,
            }
          : t
      ),

      technicians: state.technicians.map((t) =>
        t.id === tech.id
          ? { ...t, activeJobs: t.activeJobs + 1 }
          : t
      ),
    }));
  } catch (err) {
    console.error("Assign ticket error:", err);
  }
},


  /* ===============================
     Activities (Realtime)
  ================================ */
  

  activities: [],

  listenToActivities: () => {
    const q = query(
      collection(db, "activities"),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const activities: Activity[] = snap.docs.map((d) => {
        const data = d.data() as any;

        return {
          id: d.id,
          action: data.action,
          type: data.type,
          timestamp: data.timestamp?.toDate() || new Date(),
        };
      });

      set({ activities });
    });

    return unsubscribe;
  },
  fetchActivities: async () => {
  try {
    const q = query(
      collection(db, "activities"),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const snap = await getDocs(q);

    const activities: Activity[] = snap.docs.map((d) => {
      const data = d.data() as any;

      return {
        id: d.id,
        action: data.action,
        type: data.type,
        timestamp: data.timestamp?.toDate() || new Date(),
      };
    });

    set({ activities });

  } catch (err) {
    console.error("Fetch activities error:", err);
  }
},

}));
