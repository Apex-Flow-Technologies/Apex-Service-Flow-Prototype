import { useEffect, useState } from "react";
import { 
  Upload, 
  FileSpreadsheet, 
  User, 
  Phone, 
  MapPin, 
  Lock, 
  AtSign,
  Plus, 
  MoreHorizontal, 
  Wrench, 
  Search, 
  ChevronsUpDown, 
  Trash2, 
  Save, 
  Loader2 
} from "lucide-react";

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  doc,
  serverTimestamp,
  deleteDoc,
  orderBy
} from "firebase/firestore";
import { db } from "@/firebase";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { useToast } from "@/hooks/use-toast";

export default function Customers() {
  const { toast } = useToast();

  // ---------------- STATE ----------------
  const [customers, setCustomers] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Add Dialog State
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    username: "",
    password: "",
  });

  // Edit Dialog State
  const [editCustomer, setEditCustomer] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    address: "",
    username: "",
  });

  // Bulk Upload State
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);

  // ---------------- INITIAL FETCH ----------------
  const fetchCustomers = async () => {
    try {
      const q = query(
        collection(db, "user"),
        where("role", "==", "user"),
        orderBy("name", "asc")
      );
      const snap = await getDocs(q);
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchMachines = async () => {
    try {
      const snap = await getDocs(collection(db, "machines"));
      setMachines(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error fetching machines:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchMachines();
  }, []);

  // ---------------- HELPERS ----------------
  const getMachineLabel = (m: any) => m?.machineCode || "Unnamed Machine";

  const assignedMachines = (customerId: string) =>
    machines.filter((m) => m.assignedTo === customerId);

  const availableMachines = (customerId: string) =>
    machines.filter((m) => !m.assignedTo || m.assignedTo === customerId);

  // ---------------- HANDLERS ----------------

  // 1. Handle Edit Click - ROBUST MAPPING
  const handleEditClick = (customer: any) => {
    setEditCustomer(customer);
    // Explicitly map fields, default to empty string if undefined (fixes "older customer" issue)
    setEditForm({
      name: customer.name || "",
      phone: customer.phone || "",
      address: customer.address || "",
      username: customer.username || "", // Ensures username is grabbed
    });
  };

  // 2. Save Edit - OPTIMISTIC UPDATE
  const saveCustomerEdits = async () => {
    if (!editCustomer?.id) return;
    setIsSaving(true);

    try {
      // Update Backend
      const docRef = doc(db, "user", editCustomer.id);
      await updateDoc(docRef, {
        name: editForm.name,
        phone: editForm.phone,
        address: editForm.address,
        username: editForm.username,
      });

      // Update Local State (Immediate UI change)
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editCustomer.id ? { ...c, ...editForm } : c
        )
      );

      toast({ title: "Customer updated successfully" });
      setEditCustomer(null);
    } catch (error) {
      console.error("Update failed:", error);
      toast({ title: "Failed to update", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Create Customer
  const createCustomer = async () => {
    if (!form.name || !form.username || !form.password) {
      toast({
        title: "Missing fields",
        description: "Name, Username, and Password are required.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);

    try {
      const newDoc = await addDoc(collection(db, "user"), {
        ...form,
        role: "user",
        createdAt: serverTimestamp(),
      });

      // Add to local list immediately
      setCustomers((prev) => [
        ...prev,
        { id: newDoc.id, ...form, role: "user" },
      ]);

      toast({ title: "Customer created" });
      setForm({ name: "", phone: "", address: "", username: "", password: "" });
      setAddOpen(false);
    } catch (error) {
      console.error("Create failed:", error);
      toast({ title: "Failed to create", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Machine Assignment Handlers
  const assignMachine = async (machineId: string) => {
    if (!editCustomer?.id) return;
    // Optimistic UI Update for Machines
    setMachines(prev => prev.map(m => m.id === machineId ? { ...m, assignedTo: editCustomer.id } : m));
    
    await updateDoc(doc(db, "machines", machineId), {
      assignedTo: editCustomer.id,
    });
  };

  const unassignMachine = async (machineId: string) => {
    // Optimistic UI Update
    setMachines(prev => prev.map(m => m.id === machineId ? { ...m, assignedTo: null } : m));

    await updateDoc(doc(db, "machines", machineId), {
      assignedTo: null,
    });
  };

  const deleteCustomer = async (customer: any) => {
    // REMOVED CONFIRMATION POPUP HERE
    
    // Unassign all machines locally first
    setMachines(prev => prev.map(m => m.assignedTo === customer.id ? { ...m, assignedTo: null } : m));
    
    // Remove customer locally
    setCustomers(prev => prev.filter(c => c.id !== customer.id));

    try {
        // Backend Cleanup
        const related = machines.filter((m) => m.assignedTo === customer.id);
        for (const m of related) {
          await updateDoc(doc(db, "machines", m.id), { assignedTo: null });
        }
        await deleteDoc(doc(db, "user", customer.id));
        
        toast({ title: "Customer deleted" });
    } catch (error) {
        console.error("Delete failed", error);
        toast({ title: "Error deleting customer", variant: "destructive" });
    }
  };

  const filteredCustomers = customers.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage customers and assign machines</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-green-600 text-green-600" onClick={() => setBulkOpen(true)}>
            <Upload className="h-4 w-4 mr-2" /> Bulk Upload
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Customer
          </Button>
        </div>
      </div>

      {/* CUSTOMER TABLE */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Customer List</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or username..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Full Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Machines</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        No customers found.
                    </TableCell>
                 </TableRow>
              ) : (
                filteredCustomers.map((c) => (
                  <TableRow key={c.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{c.name}</TableCell>
                    {/* CHANGED: Removed dim styling to make it visible like phone number */}
                    <TableCell>{c.username || "-"}</TableCell>
                    <TableCell>{c.phone || "-"}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center justify-center bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
                        {assignedMachines(c.id).length}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(c)}>
                            <Wrench className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => deleteCustomer(c)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ---------------- ADD DIALOG ---------------- */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>Create a new customer account.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name <span className="text-red-500">*</span></Label>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="John Doe" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="+1 234..." value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
                <Label>Address</Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="City, State" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>App Username <span className="text-red-500">*</span></Label>
                    <div className="relative">
                        <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" placeholder="user123" value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Password <span className="text-red-500">*</span></Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" type="password" placeholder="••••••" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
                    </div>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={createCustomer} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- EDIT DIALOG (Fixed & Labeled) ---------------- */}
      <Dialog open={!!editCustomer} onOpenChange={() => setEditCustomer(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update details and manage machine assignments.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {/* 1. Name & Phone */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-name">Full Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="edit-name" className="pl-9" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone Number</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="edit-phone" className="pl-9" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} />
                    </div>
                </div>
            </div>

            {/* 2. Address */}
            <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="edit-address" className="pl-9" value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})} />
                </div>
            </div>

            {/* 3. Username */}
            <div className="space-y-2">
                <Label htmlFor="edit-username">App Username</Label>
                <div className="relative">
                    <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="edit-username" className="pl-9" value={editForm.username} onChange={(e) => setEditForm({...editForm, username: e.target.value})} />
                </div>
            </div>

            {/* Machine Assignment Section */}
            {editCustomer?.id && (
                <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Assigned Machines</h4>
                        
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 border-dashed gap-2">
                                    <Plus className="h-3 w-3" /> Assign New
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0" align="end">
                                <Command>
                                    <CommandInput placeholder="Search machine..." />
                                    <CommandGroup className="max-h-[200px] overflow-y-auto">
                                        {availableMachines(editCustomer.id).length === 0 ? (
                                            <div className="p-3 text-xs text-center text-muted-foreground">No unassigned machines found.</div>
                                        ) : (
                                            availableMachines(editCustomer.id).map((m) => (
                                                <CommandItem key={m.id} onSelect={() => assignMachine(m.id)}>
                                                    <Wrench className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    {getMachineLabel(m)}
                                                </CommandItem>
                                            ))
                                        )}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        {assignedMachines(editCustomer.id).length === 0 ? (
                            <div className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-md text-center">
                                No machines currently assigned.
                            </div>
                        ) : (
                            assignedMachines(editCustomer.id).map((m) => (
                                <div key={m.id} className="flex justify-between items-center bg-card border rounded-md p-2 pl-3 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                                            <Wrench className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="text-sm font-medium">{getMachineLabel(m)}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => unassignMachine(m.id)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditCustomer(null)}>Cancel</Button>
            <Button onClick={saveCustomerEdits} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BULK UPLOAD DIALOG - Unchanged */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Bulk Upload Customers</DialogTitle>
          </DialogHeader>
          {!bulkPreview.length ? (
            <div className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-muted/50 transition" onClick={() => document.getElementById("bulkFile")?.click()}>
              <FileSpreadsheet className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Click to select .xlsx file</p>
              <input id="bulkFile" type="file" accept=".xlsx" hidden onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const buffer = await file.arrayBuffer();
                  const wb = XLSX.read(buffer);
                  const ws = wb.Sheets[wb.SheetNames[0]];
                  setBulkPreview(XLSX.utils.sheet_to_json(ws) as any[]);
                }} />
            </div>
          ) : (
            <DialogFooter>
              <Button disabled={bulkUploading} onClick={async () => {
                  setBulkUploading(true);
                  for (const r of bulkPreview) await addDoc(collection(db, "user"), { ...r, role: "user", createdAt: serverTimestamp() });
                  setBulkUploading(false); setBulkOpen(false); setBulkPreview([]); fetchCustomers();
                }}>
                {bulkUploading ? "Uploading..." : "Confirm Upload"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}