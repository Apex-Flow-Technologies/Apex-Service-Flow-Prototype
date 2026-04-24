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

export interface InternalNote {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
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
  internalNotes?: InternalNote[];
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

function mapPriority(data: any): Ticket["priority"] {
  if (data.priority && ["low", "medium", "high", "urgent"].includes(data.priority)) {
    return data.priority as Ticket["priority"];
  }
  if (data.status === "open") return "high";
  if (data.status === "closed") return "low";
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

  const internalNotes = 
    Array.isArray(data.internalNotes)
      ? data.internalNotes.map((note: any) => ({
          ...note,
          timestamp: note.timestamp?.toDate() || new Date(note.timestamp),
        }))
      : [];

  return {
    id: docSnap.id,
    displayId: `TICKET #${String(data.ticketId).padStart(4, "0")}`,
    title,
    description: data.description || "",
    status: mapStatus(data.status),
    priority: mapPriority(data),
    assignedToId: data.assignedToId || null,
    assignedToName: data.assignedToName || null,
    location: data.location || "N/A",
    customerName: data.userName || "Unknown",
    customerPhone: data.phone || "",
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    assignedAt: data.assignedAt?.toDate(),
    machineCode: data.machineCode,
    attachments,
    internalNotes,
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
  listenToTechnicians: () => () => void;
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
  listenToTickets: () => () => void;
  fetchTickets: () => Promise<void>;

  updateTicket: (
    id: string,
    updates: Partial<Ticket>
  ) => Promise<void>;

  assignTicket: (
    ticketId: string,
    technicianId: string
  ) => Promise<void>;

  deleteTickets: (ids: string[]) => Promise<void>;

  addInternalNote: (ticketId: string, note: string) => Promise<void>;

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

/* ===============================
   Cloudinary Helpers
================================ */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dyfysuctk";
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;

function getPublicIdFromUrl(url: string) {
  const parts = url.split("/");
  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex === -1) return null;

  let publicIdWithExt = parts[parts.length - 1];
  let startIndex = uploadIndex + 1;
  if (parts[startIndex].startsWith('v') && !isNaN(parseInt(parts[startIndex].substring(1)))) {
      startIndex++;
  }
  const publicId = publicIdWithExt.split(".")[0];
  return publicId;
}

async function generateSignature(publicId: string, timestamp: number) {
  const str = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  const msgUint8 = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0") )
    .join("");
  return hashHex;
}

async function deleteFromCloudinary(url: string, type: "image" | "video" | "audio") {
  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      console.warn("Cloudinary credentials missing. Skipping media deletion.");
      return;
  }

  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = await generateSignature(publicId, timestamp);
  const resourceType = type === "audio" ? "video" : "image";

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", CLOUDINARY_API_KEY);
  formData.append("signature", signature);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/destroy`,
      {
        method: "POST",
        body: formData,
      }
    );
    const result = await res.json();
    console.log(`Cloudinary delete result for ${publicId}:`, result);
  } catch (err) {
    console.error("Cloudinary delete error:", err);
  }
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

  listenToTechnicians: () => {
    const q = query(
      collection(db, "user"),
      where("role", "==", "technician")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const tickets = get().tickets;
      const users: User[] = snap.docs.map((d) => {
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
    });

    return unsubscribe;
  },

  fetchTechnicians: async () => {
    try {
      const userSnap = await getDocs(
        query(
          collection(db, "user"),
          where("role", "==", "technician")
        )
      );
      const tickets = get().tickets;

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
      await addDoc(collection(db, "user"), {
        ...tech,
        status: "offline",
        activeJobs: 0,
      });

      const roleLabel = tech.role.charAt(0).toUpperCase() + tech.role.slice(1);
      await logActivity("creation", `${roleLabel} ${tech.name} was added`);
    } catch (err) {
      console.error("Add technician error:", err);
    }
  },

  deleteTechnician: async (id) => {
    try {
      const tech = get().technicians.find((t) => t.id === id);
      await deleteDoc(doc(db, "user", id));

      if (tech) {
        const roleLabel = tech.role.charAt(0).toUpperCase() + tech.role.slice(1);
        await logActivity("status", `${roleLabel} ${tech.name} was removed`);
      }
    } catch (err) {
      console.error("Delete technician error:", err);
    }
  },

  updateTechnician: async (id, updates) => {
    try {
      await updateDoc(doc(db, "user", id), updates);
    } catch (err) {
      console.error("Update technician error:", err);
    }
  },

  /* ===============================
     Tickets
  ================================ */

  tickets: [],

  listenToTickets: () => {
    const unsubscribe = onSnapshot(collection(db, "tickets"), (snap) => {
      const tickets: Ticket[] = snap.docs.map(formatTicket);
      set({ tickets });

      // Update technician active jobs when tickets change
      const technicians = get().technicians;
      if (technicians.length > 0) {
        const updatedTechnicians = technicians.map(tech => {
          const activeJobs = tickets.filter(t => 
            t.assignedToId === tech.id && 
            t.status !== "completed" && 
            t.status !== "declined"
          ).length;
          return { ...tech, activeJobs };
        });
        set({ technicians: updatedTechnicians });
      }
    });

    return unsubscribe;
  },

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
        updatedAt: serverTimestamp(),
      });

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
    } catch (err) {
      console.error("Update ticket error:", err);
    }
  },

  assignTicket: async (ticketId, technicianUsername) => {
    try {
      const tech = get().technicians.find((t) => t.username === technicianUsername);
      if (!tech) return;

      const ticket = get().tickets.find((t) => t.id === ticketId);
      const ticketNo = ticket?.displayId || ticketId;

      await updateDoc(doc(db, "tickets", ticketId), {
        status: "assigned",
        assignedToId: tech.id,
        assignedToName: tech.name,
        assignedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await logActivity("assignment", `${tech.name} assigned ${ticketNo}`);
    } catch (err) {
      console.error("Assign ticket error:", err);
    }
  },

  deleteTickets: async (ids) => {
    try {
      const { tickets } = get();
      const ticketsToDelete = tickets.filter((t) => ids.includes(t.id));

      for (const ticket of ticketsToDelete) {
        if (ticket.attachments && ticket.attachments.length > 0) {
          await Promise.all(
            ticket.attachments.map((att) => deleteFromCloudinary(att.url, att.type))
          );
        }
        await deleteDoc(doc(db, "tickets", ticket.id));
      }

      if (ids.length === 1) {
        await logActivity("status", `Ticket ${ticketsToDelete[0].displayId} was deleted`);
      } else {
        await logActivity("status", `${ids.length} tickets were deleted`);
      }
    } catch (err) {
      console.error("Delete tickets error:", err);
      throw err;
    }
  },

  addInternalNote: async (ticketId, note) => {
    try {
      const { currentUser } = get();
      const ticket = get().tickets.find(t => t.id === ticketId);
      if (!ticket) return;

      const newNote: InternalNote = {
        id: crypto.randomUUID(),
        text: note,
        author: currentUser?.name || "Admin",
        timestamp: new Date(),
      };

      const updatedNotes = [...(ticket.internalNotes || []), newNote];

      await updateDoc(doc(db, "tickets", ticketId), {
        internalNotes: updatedNotes,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Add internal note error:", err);
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
      const q = query(collection(db, "activities"), orderBy("timestamp", "desc"), limit(20));
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
